import Swal from 'sweetalert2';
import { BASE_URL } from '../services/api';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSyncAlt, FaCheckCircle, FaTruck, FaClock, FaTimesCircle, FaBoxOpen, FaUndo, FaSpinner } from 'react-icons/fa';
import { ordersApi } from '../api/ordersApi';
import { getCustomerServiceBookings, cancelServiceBooking, acceptServiceBookingWork } from '../api/serviceBookingApi';
import { useAuth } from '../context/AuthContext';
import './OrdersPage.css';
import Pagination from './Pagination';
import { Toast } from '../utils/errorHandler';

import { getProductOrderStatus, getServiceBookingStatus, getPaymentMethodLabel } from '../utils/orderStatus';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Delivered': return <FaCheckCircle />;
    case 'Completed': return <FaCheckCircle />;
    case 'Out for Delivery': return <FaTruck />;
    case 'Processing': return <FaClock />;
    case 'Pending': return <FaClock />;
    case 'Payment Pending': return <FaClock />;
    case 'Accepted': return <FaClock />;
    case 'Assigned': return <FaClock />;
    case 'In Progress': return <FaSyncAlt className="spin" />;
    case 'Awaiting Approval': return <FaClock />;
    case 'Cancelled': return <FaTimesCircle />;
    case 'Rejected': return <FaTimesCircle />;
    case 'Shipped': return <FaBoxOpen />;
    case 'Refunded': return <FaUndo />;
    default: return null;
  }
};

const getItemStatusText = (orderStatus: string, paymentStatus: string) => {
  if (paymentStatus && paymentStatus !== 'PAID') {
    return 'Payment Pending • Awaiting payment completion';
  }
  switch (orderStatus) {
    case 'NEW':
    case 'Pending':
      return 'Order Placed • Awaiting Confirmation';
    case 'ACCEPTED':
    case 'Accepted':
      return 'Order Accepted • Packing Item';
    case 'OUT_FOR_DELIVERY':
    case 'Out for Delivery':
      return 'Dispatched • Out for Delivery';
    case 'COMPLETED':
    case 'Delivered':
      return 'Delivered Successfully';
    case 'CANCELLED':
    case 'Cancelled':
      return 'Order Cancelled';
    case 'REJECTED':
    case 'Rejected':
      return 'Order Rejected';
    default:
      return orderStatus ? `Status: ${orderStatus}` : 'Order Placed';
  }
};

const getServiceDateLabel = (status: string) => {
  if (status === 'Pending' || status === 'Awaiting Approval') return 'Requested For';
  if (status === 'Cancelled' || status === 'Rejected') return 'Originally Requested';
  return 'Scheduled For';
};

export function OrdersPage() {
  const { userName } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productFilter, setProductFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');
  const [productPage, setProductPage] = useState(1);
  const [servicePage, setServicePage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    // Check if redirected from Razorpay payment or Service booking
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'services' || tab === 'service') {
      setActiveTab('services');
    }

    const booking = urlParams.get('booking');
    if (booking === 'success') {
      Toast.fire({ icon: 'success', title: 'Service booking placed and confirmed successfully!' });
      window.history.replaceState({}, document.title, window.location.pathname + (tab ? `?tab=${tab}` : ''));
    }

    const payment = urlParams.get('payment');
    if (payment === 'success') {
      Toast.fire({ icon: 'success', title: 'Payment successful and order placed!' });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (payment === 'failed') {
      Toast.fire({ icon: 'error', title: 'Payment was cancelled or could not be completed.' });
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    Promise.allSettled([
      ordersApi.fetchOrders(),
      getCustomerServiceBookings()
    ]).then(([ordersResult, servicesResult]) => {
      let mappedProducts: any[] = [];
      if (ordersResult.status === 'fulfilled') {
        const res = ordersResult.value;
        const rawList = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
        mappedProducts = rawList
          .filter((o: any) => !o.order_number?.startsWith('SBK'))
          .map((o: any) => {
          return {
            id: o.order_number || o.id,
            rawId: o.id,
            date: new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            total: `₹${parseFloat(o.total_amount || 0).toLocaleString('en-IN')}`,
            subtotalAmount: o.subtotal_amount ? Number(o.subtotal_amount) : undefined,
            taxAmount: o.tax_amount ? Number(o.tax_amount) : undefined,
            totalAmount: o.total_amount ? Number(o.total_amount) : undefined,
            customerContact: o.customer_contact || (o.customer ? o.customer.contact_number : undefined),
            customerEmail: o.customer_email || (o.customer ? o.customer.email : undefined),
            companyName: o.company_name || undefined,
            gstNumber: o.gst_number || undefined,
            paymentStatus: o.payment_status || 'PENDING',
            paymentMethod: getPaymentMethodLabel(o.payment_method, undefined, o.payment_status === 'PAID'),
            razorpayPaymentId: o.razorpay_payment_id || undefined,
            paidAt: o.paid_at ? new Date(o.paid_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : undefined,
            shipTo: o.customer_name || (o.customer ? o.customer.full_name : 'Guest'),
            address: o.customer_address || 'No address provided',
            type: 'product',
            status: getProductOrderStatus(o.status, o.payment_status),
            refundStatus: o.refund_status,
            refundAmount: o.refund_amount,
            refundReason: o.refund_reason,
            refundRejectionReason: o.refund_rejection_reason,
            refundId: o.refund_id,
            transportName: o.transport_name,
            trackingId: o.tracking_id,
            trackingUrl: o.tracking_url,
            items: o.items ? o.items.map((i: any) => ({
              name: i.product ? i.product.name : 'Unknown Product',
              qty: i.qty,
              price: i.price != null ? Number(i.price) : undefined,
              subtotal: i.subtotal != null ? Number(i.subtotal) : undefined,
              image: i.product?.banner ? (i.product.banner.startsWith('http') || i.product.banner.startsWith('blob:') ? i.product.banner : `${BASE_URL.replace(/\/api$/, '')}${i.product.banner.startsWith('/') ? '' : '/'}${i.product.banner}`) : 'https://placehold.co/300x200?text=Product',
              returnStatus: getItemStatusText(o.status, o.payment_status),
              transportName: i.transport_name,
              trackingId: i.tracking_id,
              trackingUrl: i.tracking_url
            })) : []
          };
        });
      }

      let mappedServices: any[] = [];
      if (servicesResult.status === 'fulfilled') {
        const servicesRes = servicesResult.value;
        const sData = servicesRes.data?.data || servicesRes.data || [];
        if (Array.isArray(sData)) {
          mappedServices = sData.map((s: any) => {
            const isPaid = s.Order?.payment_status === 'PAID' || s.prebooking_paid;
            const rawAddress = s.address;
            const formattedAddr = typeof rawAddress === 'string'
              ? rawAddress
              : rawAddress && typeof rawAddress === 'object'
                ? [rawAddress.line1, rawAddress.line2, rawAddress.city, rawAddress.state, rawAddress.pincode].filter(Boolean).join(', ')
                : 'No address provided';

            const formattedTotal = (s.Order?.total_amount || s.total_amount) 
              ? `₹${parseFloat(s.Order?.total_amount || s.total_amount).toLocaleString('en-IN')}` 
              : undefined;

            return {
              id: s.display_id || s.order_number || s.id,
              rawId: s.id,
              type: 'service',
              hasInvoice: !!s.has_invoice,
              remainingBalance: s.Order?.remaining_balance ? parseFloat(s.Order.remaining_balance) : 0,
              remainingBalancePaid: s.Order?.remaining_balance_paid !== undefined ? Boolean(s.Order.remaining_balance_paid) : true,
              status: getServiceBookingStatus(s.status),
              refundStatus: s.Order?.refund_status,
              refundAmount: s.Order?.refund_amount,
              refundReason: s.Order?.refund_reason,
              refundRejectionReason: s.Order?.refund_rejection_reason,
              refundId: s.Order?.refund_id,
              paymentStatus: isPaid ? 'PAID' : 'PENDING',
              paymentMethod: getPaymentMethodLabel(s.Order?.payment_method, s.Order?.payment_details, isPaid),
              isPartnerService: (s.Service || s.service)?.service_owner_type === 'PARTNER',
              date: new Date(s.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              scheduledDate: s.scheduled_date ? new Date(s.scheduled_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
              scheduledTime: s.scheduled_time_slot || '',
              shipTo: (typeof rawAddress === 'object' && rawAddress?.line1) || userName || 'Guest',
              address: formattedAddr,
              total: formattedTotal,
              subtotalAmount: s.Order?.subtotal_amount ? Number(s.Order.subtotal_amount) : (s.Order?.total_amount ? Number(s.Order.total_amount) : undefined),
              taxAmount: s.Order?.tax_amount ? Number(s.Order.tax_amount) : undefined,
              totalAmount: s.Order?.total_amount ? Number(s.Order.total_amount) : (s.total_amount ? Number(s.total_amount) : undefined),
              customerContact: s.Order?.customer_contact || undefined,
              customerEmail: s.Order?.customer?.email || undefined,
              razorpayPaymentId: s.Order?.razorpay_payment_id || undefined,
              paidAt: s.Order?.paid_at ? new Date(s.Order.paid_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : undefined,
              items: [{
                name: (s.Service || s.service)?.name || 'Service Booking',
                qty: s.quantity != null ? Number(s.quantity) : 1,
                image: (s.Service || s.service)?.image ? ((s.Service || s.service).image.startsWith('http') || (s.Service || s.service).image.startsWith('blob:') ? (s.Service || s.service).image : `${BASE_URL.replace(/\/api$/, '')}${(s.Service || s.service).image.startsWith('/') ? '' : '/'}${(s.Service || s.service).image}`) : 'https://via.placeholder.com/150?text=Service',
                returnStatus: (() => {
                  switch(s.status) {
                    case 'NEW': return 'Awaiting confirmation';
                    case 'ACCEPTED': return 'Accepted, pending technician assignment';
                    case 'ASSIGNED': return 'Technician assigned';
                    case 'IN_PROGRESS': return 'Technician is currently working';
                    case 'PENDING_APPROVAL':
                    case 'AWAITING_APPROVAL': return 'Work completed, awaiting your approval';
                    case 'COMPLETED': return 'Service completed successfully';
                    case 'CANCELLED': {
                      const r = (s.cancellation_reason || '').trim();
                      const isGeneric = !r || ['cancelled by admin', 'cancelled by administrator', 'rejected by admin', 'unable to fulfill booking at scheduled time'].includes(r.toLowerCase());
                      return s.cancelled_by === 'ADMIN' ? (isGeneric ? 'Cancelled by Assure Team' : `Cancelled by Assure Team (${r})`) : 'Cancelled by You';
                    }
                    default: return s.status;
                  }
                })()
              }]
            };
          });
        }
      }

      setOrders([...mappedProducts, ...mappedServices]);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [userName]);

  const handleInvoiceDownload = (e: React.MouseEvent, order: any) => {
    e.preventDefault();
    Toast.fire({ icon: 'info', title: 'Downloading invoice...' });
    const token = localStorage.getItem('authToken');
    const orderId = order.rawId || order.id;
    const isService = order.type === 'service' || (order.id && (order.id.startsWith('SRV') || order.id.startsWith('DRN') || order.id.startsWith('SBK') || order.id.startsWith('BKG')));
    const endpoint = isService ? `service/${orderId}` : `orders/${orderId}`;
    fetch(`${BASE_URL.replace(/\/api$/, '')}/api/invoices/${endpoint}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include'
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to download invoice');
      return res.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${order.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      Toast.fire({ icon: 'success', title: 'Invoice downloaded successfully' });
    })
    .catch(err => {
      console.error(err);
      Toast.fire({ icon: 'error', title: 'Failed to download invoice' });
    });
  };

    const handleCancelOrder = async (order: any) => {
    const isService = order.type === 'service';
    const isPrepaid = order.paymentStatus === 'PAID' || order.paymentStatus === 'Paid' || order.paymentStatus === 'Completed';

    const { value: reason } = await Swal.fire({
      title: `Cancel ${isService ? 'Service' : 'Order'} #${order.id}?`,
      html: isPrepaid 
        ? '<p style="color: #475569; font-size: 0.92rem; margin-bottom: 8px;">As this order was prepaid, cancelling will submit a <strong>Refund Request</strong> to our store administrators for review.</p>'
        : '<p style="color: #475569; font-size: 0.92rem; margin-bottom: 8px;">Are you sure you want to cancel this order?</p>',
      input: 'select',
      inputOptions: {
        'Changed my mind': 'Changed my mind',
        'Ordered by mistake': 'Ordered by mistake',
        'Schedule / delivery conflict': 'Schedule / delivery conflict',
        'Found a better alternative': 'Found a better alternative',
        'Other': 'Other reason'
      },
      inputPlaceholder: 'Select a reason for cancellation',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Cancel Order',
      inputValidator: (value: string) => {
        if (!value) {
          return 'Please select a reason for cancellation';
        }
      }
    });

    if (!reason) return;

    let finalReason = reason;
    if (reason === 'Other') {
      const { value: customReason } = await Swal.fire({
        title: 'Specify Reason',
        input: 'textarea',
        inputPlaceholder: 'Please describe the reason for cancellation...',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Submit Cancellation',
        inputValidator: (val: string) => {
          if (!val || !val.trim()) {
            return 'Please describe the reason for cancellation';
          }
        }
      });
      if (!customReason) return;
      finalReason = customReason.trim();
    }

    try {
      if (isService) {
        await cancelServiceBooking(order.rawId || order.id, finalReason);
      } else {
        await ordersApi.cancelOrder(order.id, { reason: finalReason });
      }

      Swal.fire({
        icon: 'success',
        title: 'Order Cancelled',
        text: isPrepaid 
          ? 'Your cancellation and refund request has been submitted for administrator review.'
          : 'Your order has been cancelled successfully.',
        confirmButtonColor: '#4f46e5'
      });

      setOrders(orders.map(o => o.id === order.id ? { 
        ...o, 
        status: 'Cancelled',
        paymentStatus: isPrepaid ? 'REFUND_PENDING' : o.paymentStatus,
        refundStatus: isPrepaid ? 'REQUESTED' : 'NONE',
        refundReason: reason
      } : o));
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Cancellation Failed',
        text: err.response?.data?.message || err.message,
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleAcceptWork = (order: any) => {
    const bookingId = order.rawId || order.id;
    acceptServiceBookingWork(bookingId).then(() => {
      Toast.fire({ icon: 'success', title: `Service ${order.id} work accepted successfully!` });
      setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'Completed' } : o));
    }).catch(err => {
      console.error(err);
      Toast.fire({ icon: 'error', title: 'Failed to accept work: ' + (err.response?.data?.message || err.message) });
    });
  };

  const renderOrder = (order: any, index: number) => {
    const isService = order.type === 'service';
    const canCancel = isService
      ? ['Pending', 'Accepted'].includes(order.status)
      : !['Out for Delivery', 'Delivered', 'Cancelled', 'Rejected'].includes(order.status);

    const canAcceptWork = isService && order.status === 'Awaiting Approval';

    return (
      <div key={`${order.id}-${index}`} className="order-card">
        <div className={`order-header header-solid status-solid-${(order.status || 'pending').replace(/\s+/g, '-').toLowerCase()}`}>
          <div className="order-header-left">
            <div className="order-header-col">
              <span className="order-header-label">{isService ? getServiceDateLabel(order.status) : 'Order Placed'}</span>
              <span className="order-header-value">{isService && order.scheduledDate ? `${order.scheduledDate}, ${order.scheduledTime}` : order.date}</span>
            </div>
            <div className="order-header-col">
              <span className="order-header-label">Total</span>
              <span className="order-header-value">{order.total || '—'}</span>
            </div>
            <div className="order-header-col">
              <span className="order-header-label">Payment</span>
              <span className="order-header-value">
                {(order.paymentStatus === 'PAID' || order.paymentStatus === 'Paid' || order.paymentStatus === 'Completed') ? (
                  <span style={{ color: '#166534', fontWeight: 'bold', fontSize: '12px' }}>
                    Paid {order.paymentMethod ? `(${order.paymentMethod})` : ''}
                  </span>
                ) : (
                  <span style={{ color: '#b45309', fontWeight: 'bold', fontSize: '12px' }}>
                    ● Pending
                  </span>
                )}
              </span>
            </div>
            {!isService && (
              <div className="order-header-col ship-to-container">
                <span className="order-header-label">Ship To</span>
                <span className="order-header-value" style={{ color: '#007185', cursor: 'pointer' }}>{userName || order.shipTo} ⌄</span>
                <div className="ship-to-tooltip">
                  <p className="tooltip-name">{userName || order.shipTo}</p>
                  <p className="tooltip-address">{order.address}</p>
                </div>
              </div>
            )}
          </div>
          <div className="order-header-right">
            <div className="order-header-col">
              <span className="order-header-label" style={{ color: '#565959', fontWeight: '400', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                ORDER # {order.id}
                {order.isPartnerService && <span style={{ background: 'rgba(255, 255, 255, 0.25)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.5)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>{(order.items?.[0]?.name || 'PARTNER SERVICE').toUpperCase()}</span>}
              </span>
              <div className="order-header-links">
                <Link to={`/orders/${order.id}`} className="order-link">View order details</Link>
                {order.hasInvoice && (order.type !== 'service' || ((order.remainingBalance === 0 || order.remainingBalancePaid) && (order.status === 'Completed' || order.status === 'COMPLETED'))) && (
                  <>
                    <span style={{ color: '#d5d9d9', margin: '0 8px' }}>|</span>
                    <button className="order-link" onClick={(e) => handleInvoiceDownload(e, order)}>Invoice</button>
                  </>
                )}
                
                {canCancel && (
                  <>
                    <span style={{ color: '#d5d9d9', margin: '0 8px' }}>|</span>
                    <button
                      className="order-link"
                      style={{ color: '#c5221f' }}
                      onClick={() => handleCancelOrder(order)}
                    >
                      Cancel {isService ? 'service' : 'order'}
                    </button>
                  </>
                )}
                {canAcceptWork && (
                  <>
                    <span style={{ color: '#d5d9d9', margin: '0 8px' }}>|</span>
                    <button
                      className="order-link"
                      style={{ color: '#10b981', fontWeight: 'bold' }}
                      onClick={() => handleAcceptWork(order)}
                    >
                      Accept Work
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="order-body order-body-flex">
          <div className="order-body-items">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="order-item" style={{ marginBottom: idx === order.items.length - 1 ? 0 : '20px' }}>
                <div className="order-item-left">
                  <img src={item.image} alt={item.name} className="order-item-image" style={{ objectFit: 'cover' }} />
                  <div className="order-item-details">
                    <Link to={`/orders/${order.id}`} className="order-item-name">{item.name} {Number(item.qty) > 1 ? `x${Number(item.qty)}` : ''}</Link>
                    {item.returnStatus && (
                      <div style={{ fontSize: '13px', color: '#565959', marginTop: '4px' }}>{item.returnStatus}</div>
                    )}
                    {item.trackingId && (
                      <span style={{ fontSize: '12px', color: '#007185', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <FaTruck style={{ fontSize: '10px' }} /> {item.transportName} - Tracking: {item.trackingId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="order-body-status">
            <span className={`order-status-badge status-solid-${(order.status || 'pending').replace(/\s+/g, '-').toLowerCase()}`}>
              {getStatusIcon(order.status)}
              <span>{order.status}</span>
            </span>
            {isService && (
              <div style={{ marginTop: '12px', fontSize: '13px' }}>
                <strong style={{ color: '#565959' }}>Payment: </strong>
                {(order.paymentStatus === 'PAID' || order.paymentStatus === 'Paid' || order.paymentStatus === 'Completed') ? (
                  <span style={{ color: '#166534', fontWeight: 'bold' }}>Paid {order.paymentMethod ? `(${order.paymentMethod})` : ''}</span>
                ) : (
                  <span style={{ color: '#b45309', fontWeight: 'bold' }}>● Pending</span>
                )}
              </div>
            )}
            {order.transportName && order.trackingId && (
              <div style={{ fontSize: '13px', color: '#565959', display: 'flex', flexDirection: 'column', gap: '6px', background: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaTruck style={{ color: '#007185' }} />
                  {order.trackingUrl ? (
                    <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" style={{ fontWeight: '500', color: '#007185', textDecoration: 'underline' }}>
                      {order.transportName}
                    </a>
                  ) : (
                    <span style={{ fontWeight: '500', color: '#0f1111' }}>{order.transportName}</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Track ID: <span style={{ fontWeight: '600', color: '#0f1111' }}>{order.trackingId}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const productOrders = orders.filter(o => o.type === 'product' && (productFilter === 'All' || o.status === productFilter));
  const totalProductPages = Math.ceil(productOrders.length / itemsPerPage) || 1;
  const paginatedProductOrders = productOrders.slice((productPage - 1) * itemsPerPage, productPage * itemsPerPage);

  const serviceOrders = orders.filter(o => o.type === 'service' && (serviceFilter === 'All' || o.status === serviceFilter));
  const totalServicePages = Math.ceil(serviceOrders.length / itemsPerPage) || 1;
  const paginatedServiceOrders = serviceOrders.slice((servicePage - 1) * itemsPerPage, servicePage * itemsPerPage);

  return (
    <div className="orders-page-container">
      <h1 className="orders-page-title">Your Orders</h1>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          <FaSpinner className="spin" style={{ fontSize: '24px', marginBottom: '16px' }} />
          <p>Loading your orders...</p>
        </div>
      ) : (
        <>
          <div className="mobile-order-tabs">
            <button
              className={`mobile-order-tab ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              Product Orders
            </button>
            <button
              className={`mobile-order-tab ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              Service Orders
            </button>
          </div>
          <div className={`orders-split-layout mobile-view-${activeTab}`}>
            <div className="orders-column">
              <div className="orders-column-header">
                <h2>Product Orders</h2>
                <select value={productFilter} onChange={(e) => { setProductFilter(e.target.value); setProductPage(1); }} className="orders-filter">
                  <option value="All">All Statuses</option>
                  <option value="Payment Pending">Payment Pending</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="orders-list">
                {paginatedProductOrders.length > 0 ? paginatedProductOrders.map(renderOrder) : <p className="no-orders-msg">No product orders found.</p>}
              </div>
              <Pagination
                currentPage={productPage}
                totalPages={totalProductPages}
                onPageChange={setProductPage}
              />
            </div>

            <div className="orders-column">
              <div className="orders-column-header">
                <h2>Service Orders</h2>
                <select value={serviceFilter} onChange={(e) => { setServiceFilter(e.target.value); setServicePage(1); }} className="orders-filter">
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Awaiting Approval">Awaiting Approval</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="orders-list">
                {paginatedServiceOrders.length > 0 ? paginatedServiceOrders.map(renderOrder) : <p className="no-orders-msg">No service orders found.</p>}
              </div>
              <Pagination
                currentPage={servicePage}
                totalPages={totalServicePages}
                onPageChange={setServicePage}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}






