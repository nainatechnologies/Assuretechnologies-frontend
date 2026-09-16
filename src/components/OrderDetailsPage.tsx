import { BASE_URL, RAZORPAY_KEY_ID } from '../services/api';
import { useState, useEffect } from "react";
import { ordersApi } from "../api/ordersApi";
import { getCustomerServiceBookings, updateExtraItemStatus } from '../api/serviceBookingApi';
import { Link, useParams } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { FaTruck } from "react-icons/fa";
import { getProductOrderStatus, getServiceBookingStatus, getPaymentMethodLabel, getItemStatusText, getSafeTrackingUrl } from '../utils/orderStatus';
import { Toast } from '../utils/errorHandler';
import "./OrderDetailsPage.css";

export function OrderDetailsPage() {
  const { id } = useParams();
  const { userName } = useAuth();
  const [copiedTxn, setCopiedTxn] = useState(false);

  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [extraItems, setExtraItems] = useState<any[]>([]);

  const handleInvoiceDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!orderDetails) return;
    const isServiceBooking = orderDetails.type === "service" || (orderDetails.id && (orderDetails.id.startsWith("SRV") || orderDetails.id.startsWith("DRN") || orderDetails.id.startsWith("SBK") || orderDetails.id.startsWith("BKG")));
    const orderId = orderDetails.rawId || orderDetails.id || id || '';
    const displayId = orderDetails.id || id || 'Invoice';
    Toast.fire({ icon: 'info', title: 'Downloading invoice...' });
    const token = localStorage.getItem('authToken');
    const endpoint = isServiceBooking ? `service/${orderId}` : `orders/${orderId}`;
    const downloadUrl = `${BASE_URL.replace(/\/api$/, '')}/api/invoices/${endpoint}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;

    try {
      const res = await fetch(downloadUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to download invoice');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${displayId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      Toast.fire({ icon: 'success', title: 'Invoice downloaded successfully' });
    } catch (err: any) {
      console.error(err);
      Toast.fire({ icon: 'error', title: err?.response?.data?.message || 'Failed to download invoice' });
    }
  };

  useEffect(() => {
    if (id) {
      Promise.allSettled([
        ordersApi.fetchOrderById(id),
        getCustomerServiceBookings()
      ]).then(([orderRes, serviceRes]) => {
        let sData = [];
        if (serviceRes.status === 'fulfilled') {
          const payload = serviceRes.value.data;
          sData = Array.isArray(payload) ? payload : (payload?.data || []);
        }

        const s = sData.find((x: any) => x.display_id === id || x.order_number === id || x.id === id || (x.auto_id && `BKG-${Number(x.auto_id) + 1000}` === id));

        if (s) {
          const rawAddress = s.address;
          let parsedAddress = '';
          if (typeof rawAddress === 'string') {
            try {
              const p = JSON.parse(rawAddress);
              parsedAddress = [p.line1, p.line2, p.city, p.state, p.pincode].filter(Boolean).join(', ');
            } catch (e) {
              parsedAddress = rawAddress;
            }
          } else if (rawAddress && typeof rawAddress === 'object') {
            parsedAddress = [rawAddress.line1, rawAddress.line2, rawAddress.city, rawAddress.state, rawAddress.pincode].filter(Boolean).join(', ');
          }

          const parsePhotos = (raw: any): string[] => {
            if (!raw) return [];
            if (Array.isArray(raw)) return raw;
            if (typeof raw === 'string') {
              try {
                const parsed = JSON.parse(raw);
                return Array.isArray(parsed) ? parsed : [raw];
              } catch (e) {
                return [raw];
              }
            }
            return [];
          };

          const startProgress = (s.progress_updates || []).find((p: any) => p.update_type === 'START');
          const dailyUpdates = (s.progress_updates || [])
            .filter((p: any) => p.update_type === 'PROGRESS')
            .map((p: any) => ({
              date: new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: p.description,
              photos: parsePhotos(p.photos)
            }));
          const completedProgress = (s.progress_updates || []).find((p: any) => p.update_type === 'COMPLETE');

          const linkedOrder = (orderRes.status === 'fulfilled' && orderRes.value && orderRes.value.data) ? orderRes.value.data : null;
          const isPaid = s.Order?.payment_status === 'PAID' || s.Order?.payment_status === 'REFUND_PENDING' || s.Order?.payment_status === 'REFUNDED' || s.prebooking_paid || linkedOrder?.payment_status === 'PAID';
          const serviceTotalFormatted = (s.Order?.total_amount || linkedOrder?.total_amount || s.total_amount) ? '₹' + parseFloat(s.Order?.total_amount || linkedOrder?.total_amount || s.total_amount).toLocaleString("en-IN") : '₹0';
          const isCancelled = s.status === 'CANCELLED';
          const refundAmountVal = s.Order?.refund_amount || linkedOrder?.refund_amount || (isCancelled && isPaid ? (s.Order?.total_amount || linkedOrder?.total_amount || s.total_amount) : null);
          const refundStatusVal = s.Order?.refund_status || linkedOrder?.refund_status || (isCancelled && isPaid ? 'REQUESTED' : null);
          const paymentStatusVal = (isCancelled && isPaid && (!s.Order?.payment_status || s.Order?.payment_status === 'PAID')) 
            ? 'REFUND_PENDING' 
            : (s.Order?.payment_status || linkedOrder?.payment_status || (isPaid ? 'PAID' : 'PENDING'));

          const mappedService = {
            id: s.display_id || s.order_number || s.id,
            rawId: s.id,
            type: "service",
            hasInvoice: !!s.has_invoice,
            date: new Date(s.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            total: serviceTotalFormatted,
            shipTo: parsedAddress.split(',')[0] || s.Order?.customer_name || userName || "Customer",
            address: parsedAddress || "Service address",
            paymentMethod: isPaid
              ? (getPaymentMethodLabel(s.Order?.payment_method || linkedOrder?.payment_method, s.Order?.payment_details || linkedOrder?.payment_details, isPaid) || (s.prebooking_paid ? "Online Payment (Paid)" : "Online Payment (Paid)"))
              : (s.prebooking_paid ? "Prebooking Paid" : "Pending Payment"),
            status: getServiceBookingStatus(s.status),
            cancelledBy: s.cancelled_by,
            cancellationReason: s.cancellation_reason,
            refundStatus: refundStatusVal,
            refundAmount: refundAmountVal,
            refundReason: s.Order?.refund_reason || linkedOrder?.refund_reason || s.cancellation_reason,
            refundRejectionReason: s.Order?.refund_rejection_reason || linkedOrder?.refund_rejection_reason,
            refundId: s.Order?.refund_id || linkedOrder?.refund_id,
            refundMode: s.Order?.refund_mode || linkedOrder?.refund_mode,
            refundedAt: s.Order?.refunded_at || linkedOrder?.refunded_at,
            isDroneService: (s.Service || s.service)?.service_owner_type === 'PARTNER',
            technician: s.assigned_technician ? {
              name: s.assigned_technician.full_name || s.assigned_technician.name || 'Assigned Technician',
              mobile: s.assigned_technician.mobile || 'N/A'
            } : null,
            summary: {
              itemsSubtotal: serviceTotalFormatted,
              grandTotal: serviceTotalFormatted,
              amountPaid: isPaid ? serviceTotalFormatted : '₹0',
              prebookingPaid: isPaid ? serviceTotalFormatted : null
            },
            prebookingPaid: isPaid ? serviceTotalFormatted : null,
            scheduledDate: s.scheduled_date ? new Date(s.scheduled_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : '',
            scheduledTime: s.scheduled_time_slot || (s.scheduled_date ? new Date(s.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM - 12:00 PM'),
            paymentStatus: paymentStatusVal,
            razorpayPaymentId: s.Order?.razorpay_payment_id || linkedOrder?.razorpay_payment_id || null,
            paymentDetails: s.Order?.payment_details || linkedOrder?.payment_details || null,
            paidAt: (s.Order?.paid_at || linkedOrder?.paid_at) ? new Date(s.Order?.paid_at || linkedOrder?.paid_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : (isPaid ? new Date(s.updatedAt || s.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : null),
            items: [{
              name: (s.Service || s.service)?.name || "Service Booking",
              qty: s.quantity != null ? Number(s.quantity) : 1,
              seller: (s.Service || s.service)?.service_owner_type === 'PARTNER' ? 'Partner Service' : 'Assure Services',
              price: (s.Order?.total_amount || s.total_amount) ? '₹' + parseFloat(s.Order?.total_amount || s.total_amount).toLocaleString("en-IN") : '₹0',
              image: (s.Service || s.service)?.image || 'https://via.placeholder.com/150?text=Service',
              type: "service",
              returnStatus: (() => {
                switch (s.status) {
                  case 'NEW': return 'Waiting for admin approval';
                  case 'ACCEPTED': return 'Accepted by admin, pending technician assignment';
                  case 'ASSIGNED': return 'Technician assigned';
                  case 'IN_PROGRESS': return 'Technician is currently working';
                  case 'AWAITING_APPROVAL':
                  case 'PENDING_APPROVAL': return 'Work completed, awaiting your approval';
                  case 'COMPLETED': return 'Service completed successfully';
                  case 'CANCELLED': {
                    const r = (s.cancellation_reason || '').trim();
                    const isGeneric = !r || ['cancelled by admin', 'cancelled by administrator', 'rejected by admin', 'unable to fulfill booking at scheduled time'].includes(r.toLowerCase());
                    return s.cancelled_by === 'ADMIN' ? (isGeneric ? 'Cancelled by Assure Team' : `Cancelled by Assure Team (${r})`) : 'Cancelled by You';
                  }
                  default: return s.status;
                }
              })()
            }],
            progress: (startProgress || dailyUpdates.length > 0 || completedProgress) ? {
              startDescription: startProgress?.description,
              startPhotos: parsePhotos(startProgress?.photos),
              dailyUpdates: dailyUpdates,
              completedPhotos: parsePhotos(completedProgress?.photos)
            } : null,
            remainingBalance: s.Order?.remaining_balance ? parseFloat(s.Order.remaining_balance) : 0,
            remainingBalancePaid: s.Order?.remaining_balance_paid !== undefined ? Boolean(s.Order.remaining_balance_paid) : true,
            rawOrderNumber: s.Order?.order_number
          };

          const mappedExtra = (s.extra_items || []).map((item: any) => ({
            id: item.id,
            description: item.description,
            qty: item.qty,
            status: item.status ? item.status.toLowerCase() : 'pending'
          }));

          setOrderDetails(mappedService);
          setExtraItems(mappedExtra);
          setLoading(false);
        } else if (orderRes.status === 'fulfilled' && orderRes.value && orderRes.value.data) {
          const o = orderRes.value.data;
          const mapped = {
            id: o.order_number || o.id,
            hasInvoice: o.payment_status === 'PAID' || o.status === 'COMPLETED' || o.status === 'Delivered' || !!o.has_invoice,
            date: new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
            total: '₹' + parseFloat(o.total_amount).toLocaleString("en-IN"),
            shipTo: o.customer_name || (o.customer ? o.customer.full_name : "Guest"),
            address: o.customer_address || "No address provided",
            paymentMethod: getPaymentMethodLabel(o.payment_method, o.payment_details, o.payment_status === 'PAID') || "Online Payment",
            paymentStatus: o.payment_status || "PENDING",
            refundStatus: o.refund_status,
            refundAmount: o.refund_amount,
            refundReason: o.refund_reason,
            refundRejectionReason: o.refund_rejection_reason,
            refundId: o.refund_id,
            refundMode: o.refund_mode,
            refundedAt: o.refunded_at,
            razorpayPaymentId: o.razorpay_payment_id || null,
            paymentDetails: o.payment_details || null,
            paidAt: o.paid_at ? new Date(o.paid_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : (o.payment_status === 'PAID' ? new Date(o.updatedAt || o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null),
            status: getProductOrderStatus(o.status, o.payment_status),
            customerContact: o.customer_contact || (o.customer ? o.customer.contact_number : null),
            customerEmail: o.customer_email || (o.customer ? o.customer.email : null),
            companyName: o.company_name || null,
            gstNumber: o.gst_number || null,
            rawSubtotal: o.subtotal_amount ? Number(o.subtotal_amount) : (o.total_amount ? Math.round((Number(o.total_amount) / 1.18) * 100) / 100 : 0),
            rawTax: o.tax_amount ? Number(o.tax_amount) : (o.total_amount ? Math.round((Number(o.total_amount) - (Number(o.total_amount) / 1.18)) * 100) / 100 : 0),
            summary: {
              itemsSubtotal: '₹' + parseFloat((o.subtotal_amount && Number(o.subtotal_amount) < Number(o.total_amount)) ? o.subtotal_amount : (Number(o.total_amount) / 1.18).toFixed(2)).toLocaleString("en-IN"),
              tax: (o.tax_amount && Number(o.tax_amount) > 0) ? ('₹' + parseFloat(o.tax_amount).toLocaleString("en-IN")) : ('₹' + (Number(o.total_amount) - (Number(o.total_amount) / 1.18)).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })),
              shipping: "Charges Applicable",
              grandTotal: '₹' + parseFloat(o.total_amount).toLocaleString("en-IN")
            },
            trackingId: o.tracking_id || null,
            transportName: o.transport_name || null,
            trackingUrl: o.tracking_url || null,
            items: o.items ? o.items.map((i: any) => ({
              name: i.product ? i.product.name : "Unknown Product",
              qty: i.qty,
              seller: i.vendor ? i.vendor.business_name : "Assure Technologies",
              price: '₹' + parseFloat(i.price).toLocaleString("en-IN"),
              image: i.product?.banner ? (i.product.banner.startsWith('http') || i.product.banner.startsWith('blob:') ? i.product.banner : (BASE_URL.replace(/\/api$/, "") + (i.product.banner.startsWith('/') ? '' : '/') + i.product.banner)) : 'https://placehold.co/300x200?text=Product',
              type: "product",
              status: i.status || o.status,
              returnStatus: getItemStatusText(i.status || o.status, o.payment_status),
              trackingId: i.tracking_id || o.tracking_id || undefined,
              transportName: i.transport_name || o.transport_name || undefined,
              trackingUrl: i.tracking_url || o.tracking_url || undefined
            })) : [],
            remainingBalance: o.remaining_balance ? parseFloat(o.remaining_balance) : 0,
            remainingBalancePaid: o.remaining_balance_paid !== undefined ? o.remaining_balance_paid : true,
            rawOrderNumber: o.order_number
          };
          setOrderDetails(mapped);
          setExtraItems([]);
          setLoading(false);
        } else {
          setOrderDetails(null);
          setLoading(false);
        }
      });
    }
  }, [id, userName]);

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;
  if (!orderDetails) return <div style={{ padding: "40px", textAlign: "center" }}>Order not found.</div>;

  const isService = orderDetails.type === "service" || orderDetails.id.startsWith("SRV") || orderDetails.id.startsWith("DRN") || orderDetails.id.startsWith("SBK") || orderDetails.id.startsWith("BKG");
  const isDroneService = orderDetails.isDroneService || orderDetails.id.startsWith("DRN");

  const handleApproveExtra = async (item: any) => {
    try {
      const bookingId = (orderDetails as any).rawId || orderDetails.id;
      await updateExtraItemStatus(bookingId, item.id, 'APPROVED');
      setExtraItems(prev => prev.map((i: any) => i.id === item.id ? { ...i, status: 'approved' } : i));
      Toast.fire({ icon: 'success', title: "Extra item '" + item.description + "' approved successfully!" });
    } catch (err: any) {
      console.error(err);
      Toast.fire({ icon: 'error', title: 'Failed to approve extra item: ' + (err.response?.data?.message || err.message) });
    }
  };

  const handleDeclineExtra = async (item: any) => {
    try {
      const bookingId = (orderDetails as any).rawId || orderDetails.id;
      await updateExtraItemStatus(bookingId, item.id, 'REJECTED');
      setExtraItems(prev => prev.map((i: any) => i.id === item.id ? { ...i, status: 'declined' } : i));
      Toast.fire({ icon: 'info', title: "Extra item '" + item.description + "' declined." });
    } catch (err: any) {
      console.error(err);
      Toast.fire({ icon: 'error', title: 'Failed to decline extra item: ' + (err.response?.data?.message || err.message) });
    }
  };

  const pendingExtraItems = extraItems.filter((i: any) => i.status === 'pending');
  const approvedExtraItems = extraItems.filter((i: any) => i.status === 'approved');

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayBalance = async () => {
    try {
      const resLoaded = await loadRazorpay();
      if (!resLoaded) {
        Toast.fire({ icon: 'error', title: 'Razorpay SDK failed to load.' });
        return;
      }

      const orderNumber = orderDetails.rawOrderNumber || orderDetails.id;
      const res = await ordersApi.payRemainingBalance(orderNumber);

      if (!res.data || !res.data.razorpayOrderId) {
        throw new Error('Failed to create Razorpay order');
      }

      const options = {
        key: res.data.razorpayKeyId || RAZORPAY_KEY_ID,
        amount: res.data.amount * 100,
        currency: 'INR',
        name: 'Assure Technologies',
        description: 'Remaining Balance Payment',
        order_id: res.data.razorpayOrderId,
        handler: async function (response: any) {
          try {
            await ordersApi.verifyRemainingBalancePayment(orderNumber, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            Toast.fire({ icon: 'success', title: 'Payment Successful!' });
            window.location.reload();
          } catch (err: any) {
            console.error(err);
            Toast.fire({ icon: 'error', title: err?.response?.data?.message || 'Payment verification failed' });
          }
        },
        prefill: {
          name: orderDetails.customerName,
          email: orderDetails.customerEmail,
          contact: orderDetails.customerContact
        },
        theme: {
          color: '#3399cc'
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (err: any) {
      console.error(err);
      Toast.fire({ icon: 'error', title: err.response?.data?.message || 'Failed to initiate payment' });
    }
  };

  return (
    <div className="order-details-container">
      <div className="order-details-header">
        <div>
          <h1 className="order-details-title">
            Order Details
            {(orderDetails.refundStatus === 'PROCESSED' || orderDetails.paymentStatus === 'REFUNDED') ? (
              <span style={{ marginLeft: '12px', background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', verticalAlign: 'middle' }}>
                Refunded ({orderDetails.refundAmount ? '₹' + parseFloat(orderDetails.refundAmount).toLocaleString('en-IN') : orderDetails.total})
              </span>
            ) : (orderDetails.refundStatus === 'REQUESTED' || orderDetails.paymentStatus === 'REFUND_PENDING') ? (
              <span style={{ marginLeft: '12px', background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', verticalAlign: 'middle' }}>
                Refund Requested (Under Review)
              </span>
            ) : (orderDetails.refundStatus === 'REJECTED') ? (
              <span style={{ marginLeft: '12px', background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', verticalAlign: 'middle' }}>
                Refund Declined
              </span>
            ) : (orderDetails.paymentStatus === 'PAID' || orderDetails.paymentStatus === 'Completed') ? (
              <span style={{ marginLeft: '12px', background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', verticalAlign: 'middle' }}>
                Paid ({orderDetails.total})
              </span>
            ) : null}
          </h1>
          <div className="order-details-meta">
            <span>Ordered on {orderDetails.date}</span>
            <span className="divider">|</span>
            <span>Order# {orderDetails.id}</span>
          </div>
        </div>
        <div>
          {isService ? (
            orderDetails.hasInvoice && (orderDetails.status === 'Completed' || orderDetails.status === 'COMPLETED') && (orderDetails.remainingBalance === 0 || orderDetails.remainingBalancePaid) && (
              <button className="invoice-btn" onClick={handleInvoiceDownload}>Invoice</button>
            )
          ) : (
            (orderDetails.status === 'Delivered' || orderDetails.status === 'COMPLETED' || orderDetails.hasInvoice) && (
              <button className="invoice-btn" onClick={handleInvoiceDownload}>Invoice</button>
            )
          )}
        </div>
      </div>

      {orderDetails.status === 'Cancelled' && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderLeft: '5px solid #ef4444', padding: '16px 20px', borderRadius: '8px', marginBottom: '24px' }}>
          <h3 style={{ color: '#991b1b', margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600' }}>
            {orderDetails.cancelledBy === 'ADMIN'
              ? (isService ? 'Service Cancelled by Assure Team' : 'Order Cancelled by Assure Team')
              : (isService ? 'Service Cancelled by You' : 'Order Cancelled by You')}
          </h3>
          <p style={{ margin: 0, color: '#7f1d1d', fontSize: '14px', lineHeight: '1.5' }}>
            {orderDetails.cancelledBy === 'ADMIN'
              ? (orderDetails.cancellationReason && !['cancelled by admin', 'cancelled by administrator', 'rejected by admin', 'unable to fulfill booking at scheduled time'].includes(orderDetails.cancellationReason.toLowerCase().trim())
                ? `Reason: ${orderDetails.cancellationReason}`
                : (isService ? 'We were unable to fulfill this service booking at your requested scheduled time.' : 'We were unable to fulfill this order at scheduled time.'))
              : (orderDetails.cancellationReason && orderDetails.cancellationReason.toLowerCase().trim() !== 'no reason provided'
                ? `Reason: ${orderDetails.cancellationReason}`
                : (isService ? 'This service booking was cancelled as requested.' : 'This order was cancelled as requested.'))}
          </p>

          {(orderDetails.refundStatus === 'REQUESTED' || orderDetails.paymentStatus === 'REFUND_PENDING' || orderDetails.paymentStatus === 'REFUNDED' || orderDetails.refundAmount || orderDetails.summary?.amountPaid !== '₹0') && (
            <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 14px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div>
                <strong style={{ color: '#166534', fontSize: '14px' }}>100% Refund Initiated</strong>
                <div style={{ color: '#15803d', fontSize: '13px', marginTop: '2px' }}>
                  The amount of {orderDetails.refundAmount ? ('₹' + parseFloat(orderDetails.refundAmount).toLocaleString('en-IN')) : orderDetails.total} will be credited back to your original payment source within 3–5 working days.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {pendingExtraItems.length > 0 && (
        <div style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: '#b45309', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Action Required: Extra Items Requested
            </h3>
            <p style={{ margin: '0', color: '#78350f', fontSize: '14px' }}>
              The technician has requested to add the following items to your service:
            </p>
            <ul style={{ margin: '8px 0 0 20px', padding: '0', color: '#78350f', fontSize: '14px' }}>
              {pendingExtraItems.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>
                  <strong>{item.qty}x</strong> {item.description}
                  <span style={{ marginLeft: '15px' }}>
                    <button onClick={() => handleDeclineExtra(item)} style={{ background: 'transparent', border: '1px solid #b45309', color: '#b45309', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', marginRight: '8px' }}>Decline</button>
                    <button onClick={() => handleApproveExtra(item)} style={{ background: '#f59e0b', border: 'none', color: 'white', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Approve</button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {approvedExtraItems.length > 0 && (
        <div style={{ background: '#ecfdf5', borderLeft: '4px solid #10b981', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <h3 style={{ color: '#047857', margin: '0 0 8px 0' }}>Approved Extra Items</h3>
          <p style={{ margin: '0', color: '#065f46', fontSize: '14px' }}>
            You have approved the following extra items. They will be included in the final invoice:
          </p>
          <ul style={{ margin: '8px 0 0 20px', padding: '0', color: '#065f46', fontSize: '14px' }}>
            {approvedExtraItems.map((item, idx) => (
              <li key={idx}><strong>{item.qty}x</strong> {item.description}</li>
            ))}
          </ul>
        </div>
      )}

      {orderDetails.remainingBalance > 0 && !orderDetails.remainingBalancePaid && (
        <div style={{ background: '#f0f9ff', borderLeft: '4px solid #0284c7', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: '#0369a1', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Action Required: Final Payment Pending
            </h3>
            <p style={{ margin: '0', color: '#075985', fontSize: '14px' }}>
              Additional charges have been calculated for your approved extra items. Please pay the remaining balance of <strong>₹{orderDetails.remainingBalance.toLocaleString('en-IN')}</strong> to complete this service and download your final invoice.
            </p>
          </div>
          <button onClick={handlePayBalance} style={{ background: '#0284c7', border: 'none', color: 'white', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap', marginLeft: '16px' }}>
            Pay ₹{orderDetails.remainingBalance.toLocaleString('en-IN')}
          </button>
        </div>
      )}

      {/* Refund Information Banner */}
      {orderDetails.refundStatus && orderDetails.refundStatus !== 'NONE' && (
        <div style={{
          background: orderDetails.refundStatus === 'PROCESSED' ? '#f0fdf4' : orderDetails.refundStatus === 'REJECTED' ? '#fef2f2' : '#fffbeb',
          border: `1.5px solid ${orderDetails.refundStatus === 'PROCESSED' ? '#86efac' : orderDetails.refundStatus === 'REJECTED' ? '#fca5a5' : '#fde047'}`,
          borderRadius: '10px',
          padding: '18px 22px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: orderDetails.refundStatus === 'PROCESSED' ? '#15803d' : orderDetails.refundStatus === 'REJECTED' ? '#b91c1c' : '#b45309' }}>
              {orderDetails.refundStatus === 'PROCESSED' && '✓ Refund Processed Successfully'}
              {orderDetails.refundStatus === 'REQUESTED' && '⏳ Refund Request Submitted (Under Review)'}
              {orderDetails.refundStatus === 'REJECTED' && '✕ Refund Request Declined'}
            </h3>
            {orderDetails.refundAmount && (
              <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                ₹{parseFloat(orderDetails.refundAmount).toLocaleString('en-IN')}
              </span>
            )}
          </div>
          {orderDetails.refundReason && (
            <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#334155' }}>
              <strong>Cancellation Reason:</strong> {orderDetails.refundReason}
            </p>
          )}
          {orderDetails.refundStatus === 'PROCESSED' && (
            <p style={{ margin: '0', fontSize: '0.86rem', color: '#166534' }}>
              Refund was processed via {orderDetails.refundMode === 'GATEWAY' ? 'Razorpay (funds will reflect in your source account / UPI within 5-7 business days)' : 'Direct Settlement'}.
              {orderDetails.refundId && <span> Reference: <code style={{ background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>{orderDetails.refundId}</code></span>}
            </p>
          )}
          {orderDetails.refundStatus === 'REJECTED' && orderDetails.refundRejectionReason && (
            <p style={{ margin: '0', fontSize: '0.9rem', color: '#dc2626' }}>
              <strong>Decline Reason:</strong> {orderDetails.refundRejectionReason}
            </p>
          )}
        </div>
      )}

      <div className="details-card">
        <div className="info-grid">
          <div className="info-col">
            <h3>{isDroneService ? 'Farm Land Details' : isService ? 'Service Address' : 'Shipping Address'}</h3>
            <p className="info-text" style={{ whiteSpace: 'pre-wrap' }}><strong>{orderDetails.shipTo}</strong><br />{orderDetails.address}</p>
            {orderDetails.companyName && (
              <div style={{ marginTop: '10px', fontSize: '14px', color: '#555' }}>
                <strong>GST Details:</strong><br />
                {orderDetails.companyName}<br />
                {orderDetails.gstNumber}
              </div>
            )}
          </div>
          <div className="info-col">
            <h3>{isService ? 'Scheduled Slot' : 'Order Status'}</h3>
            <p className="info-text" style={{ fontWeight: '500' }}>{isService && orderDetails.scheduledDate ? (orderDetails.scheduledDate + ' - ' + orderDetails.scheduledTime) : orderDetails.status}</p>
          </div>
          {isService && (orderDetails).technician && (
            <div className="info-col">
              <h3>Assigned Technician</h3>
              <p className="info-text" style={{ fontWeight: '500' }}>{(orderDetails).technician.name}</p>
              <p className="info-text">{(orderDetails).technician.mobile}</p>
            </div>
          )}
          <div className="info-col">
            <h3>Payment Method</h3>
            <p className="info-text" style={{ fontWeight: '500' }}>
              {orderDetails.paymentDetails?.card
                ? 'Credit / Debit Card'
                : orderDetails.paymentDetails?.vpa
                  ? 'UPI / QR Code'
                  : orderDetails.paymentDetails?.bank
                    ? 'Net Banking'
                    : orderDetails.paymentDetails?.wallet
                      ? `Wallet (${orderDetails.paymentDetails.wallet.charAt(0).toUpperCase() + orderDetails.paymentDetails.wallet.slice(1)})`
                      : orderDetails.paymentMethod === 'CARD'
                        ? 'Credit / Debit Card'
                        : orderDetails.paymentMethod === 'UPI'
                          ? 'UPI / QR Code'
                          : orderDetails.paymentMethod === 'NETBANKING'
                            ? 'Net Banking'
                            : orderDetails.paymentMethod === 'WALLET'
                              ? 'Digital Wallet'
                              : orderDetails.paymentMethod === 'ONLINE'
                                ? 'Online Payment (Razorpay)'
                                : (orderDetails.paymentMethod || 'Online Payment')}
            </p>
            {orderDetails.paymentDetails?.vpa && (
              <p className="info-text" style={{ fontSize: '13px', color: '#565959', marginTop: '2px' }}>UPI: {orderDetails.paymentDetails.vpa}</p>
            )}
            {orderDetails.paymentDetails?.card && (
              <p className="info-text" style={{ fontSize: '13px', color: '#565959', marginTop: '2px' }}>
                {orderDetails.paymentDetails.card.network && orderDetails.paymentDetails.card.network !== 'Unknown' ? orderDetails.paymentDetails.card.network : 'Card'} •••• {orderDetails.paymentDetails.card.last4 || '****'}
              </p>
            )}
            {orderDetails.paymentDetails?.bank && (
              <p className="info-text" style={{ fontSize: '13px', color: '#565959', marginTop: '2px' }}>Bank: {orderDetails.paymentDetails.bank}</p>
            )}
          </div>
          <div className="info-col">
            <h3>Payment Status</h3>
            <div className="info-text" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>
                {(orderDetails.paymentStatus === 'Completed' || orderDetails.paymentStatus === 'PAID') ? (
                  <span style={{ color: '#166534', fontWeight: 'bold', background: '#dcfce7', padding: '3px 8px', borderRadius: '4px', fontSize: '13px' }}>
                    Paid
                  </span>
                ) : (orderDetails.paymentStatus === 'REFUND_PENDING' || orderDetails.refundStatus === 'REQUESTED') ? (
                  <span style={{ color: '#b45309', fontWeight: 'bold', background: '#fef3c7', padding: '3px 8px', borderRadius: '4px', fontSize: '13px' }}>
                    Refund Pending
                  </span>
                ) : orderDetails.paymentStatus === 'REFUNDED' ? (
                  <span style={{ color: '#15803d', fontWeight: 'bold', background: '#dcfce7', padding: '3px 8px', borderRadius: '4px', fontSize: '13px' }}>
                    Refunded
                  </span>
                ) : (
                  <span style={{ color: '#b45309', fontWeight: 'bold', background: '#fef3c7', padding: '3px 8px', borderRadius: '4px', fontSize: '13px' }}>
                    ● Pending
                  </span>
                )}
              </div>
              {orderDetails.paidAt && (
                <span style={{ fontSize: '12px', color: '#565959', marginTop: '2px' }}>
                  Paid on {orderDetails.paidAt}
                </span>
              )}
              {orderDetails.razorpayPaymentId && (
                <div style={{ fontSize: '12px', color: '#007185', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', background: '#f8fafc', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', width: 'fit-content' }}>
                  <span>Txn ID: <strong>{orderDetails.razorpayPaymentId}</strong></span>
                  <button
                    onClick={() => {
                      if (orderDetails.razorpayPaymentId) {
                        navigator.clipboard.writeText(orderDetails.razorpayPaymentId);
                        setCopiedTxn(true);
                        setTimeout(() => setCopiedTxn(false), 2000);
                      }
                    }}
                    style={{
                      background: copiedTxn ? '#dcfce7' : '#fff',
                      color: copiedTxn ? '#166534' : '#334155',
                      border: '1px solid',
                      borderColor: copiedTxn ? '#86efac' : '#cbd5e1',
                      borderRadius: '3px',
                      padding: '2px 8px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: copiedTxn ? 'bold' : 'normal',
                      transition: 'all 0.2s'
                    }}
                    title="Copy Transaction ID"
                  >
                    {copiedTxn ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
          </div>
          {!isService ? (
            <div className="info-col">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Item(s) Subtotal:</span>
                <span>{orderDetails.summary?.itemsSubtotal}</span>
              </div>
              {orderDetails.summary?.tax && (
                <div className="summary-row">
                  <span>Tax (18% GST):</span>
                  <span>{orderDetails.summary?.tax}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Shipping:</span>
                <span>{orderDetails.summary?.shipping}</span>
              </div>
              <div className="summary-row summary-total">
                <span>Grand Total:</span>
                <span>{orderDetails.summary?.grandTotal}</span>
              </div>
            </div>
          ) : (
            <div className="info-col">
              <h3>Pricing Details</h3>
              <div className="summary-row">
                <span>Base Service Amount:</span>
                <span>{orderDetails.summary?.grandTotal || orderDetails.total}</span>
              </div>
              <div className="summary-row" style={{ color: '#166534', fontWeight: '500', marginTop: '6px' }}>
                <span>Base Amount Paid:</span>
                <span>{(orderDetails.paymentStatus === 'PAID' || orderDetails.paymentStatus === 'Completed' || orderDetails.paymentStatus === 'REFUND_PENDING' || orderDetails.paymentStatus === 'REFUNDED') ? (orderDetails.summary?.amountPaid || orderDetails.total) : '₹0'}</span>
              </div>

              {orderDetails.remainingBalance > 0 && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1' }}>
                  <div className="summary-row" style={{ color: '#475569', fontSize: '13px', marginTop: '4px' }}>
                    <span>Extra Items Amount:</span>
                    <span>₹{Math.round(orderDetails.remainingBalance / 1.18).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="summary-row" style={{ color: '#475569', fontSize: '13px', marginTop: '4px' }}>
                    <span>GST on Extra Items (18%):</span>
                    <span>₹{Math.round(orderDetails.remainingBalance - (orderDetails.remainingBalance / 1.18)).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="summary-row" style={{ color: orderDetails.remainingBalancePaid ? '#166534' : '#b45309', fontWeight: '600', marginTop: '6px', fontSize: '15px' }}>
                    <span>{orderDetails.remainingBalancePaid ? 'Remaining Balance:' : 'Total Remaining Balance:'}</span>
                    <span>{orderDetails.remainingBalancePaid ? '₹0 (Fully Paid)' : `₹${orderDetails.remainingBalance.toLocaleString('en-IN')}`}</span>
                  </div>

                  {orderDetails.remainingBalancePaid && (
                    <div className="summary-row" style={{ color: '#166534', fontWeight: '500', fontSize: '13px', marginTop: '4px' }}>
                      <span>Extra Items Paid:</span>
                      <span>₹{orderDetails.remainingBalance.toLocaleString('en-IN')} ✓</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="item-details-card">
        <h2 className="item-title">{orderDetails.items.length} item{orderDetails.items.length !== 1 ? 's' : ''}</h2>
        {orderDetails.items.map((item: any, index: number) => (
          <div className="item-flex" key={index} style={{ marginBottom: index !== orderDetails.items.length - 1 ? '30px' : '0' }}>
            <img src={item.image} alt={item.name} className="item-img" />
            <div className="item-info">
              <Link to="#" className="item-name">{item.name} {Number(item.qty) > 1 ? `x${Number(item.qty)}` : ''}</Link>
              {!isService && <div className="item-price">{item.price}</div>}
              {item.returnStatus && <div className="item-return-status" style={{ fontSize: '12px', color: '#565959', marginTop: '4px' }}>{item.returnStatus}</div>}
              {item.trackingId && (
                <div style={{ fontSize: '13px', color: '#007185', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', background: '#f8fafc', padding: '6px 10px', borderRadius: '4px', border: '1px solid #e2e8f0', width: 'fit-content' }}>
                  <FaTruck style={{ fontSize: '12px', color: '#007185' }} />
                  <span>{item.transportName || 'Courier'}: <strong>{item.trackingId}</strong></span>
                  {getSafeTrackingUrl(item.trackingUrl) && (
                    <a href={getSafeTrackingUrl(item.trackingUrl)} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline', marginLeft: '6px', fontWeight: '500' }}>
                      Track ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isService && (orderDetails as any).progress && (
        <div className="details-card" style={{ marginTop: '20px' }}>
          <h2 className="item-title" style={{ padding: '0 20px', paddingTop: '20px' }}>Technician Progress</h2>
          <div className="info-grid">

            {(orderDetails as any).progress.startPhotos?.length > 0 && (
              <div className="info-col" style={{ gridColumn: '1 / -1' }}>
                <h3>Start Work Info</h3>
                {(orderDetails as any).progress.startDescription && (
                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '4px', borderLeft: '4px solid #3b82f6', marginTop: '10px' }}>
                    <div style={{ fontSize: '14px', color: '#334155' }}>{(orderDetails as any).progress.startDescription}</div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {(orderDetails as any).progress.startPhotos.map((img: string, i: number) => (
                    <img key={i} src={img} alt={'Start work ' + i} style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: '1px solid #e2e8f0' }} onClick={() => window.open(img, '_blank')} />
                  ))}
                </div>
              </div>
            )}

            {(orderDetails as any).progress.dailyUpdates?.length > 0 && (
              <div className="info-col" style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                <h3>Work Updates</h3>
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(orderDetails as any).progress.dailyUpdates.map((update: any, i: number) => (
                    <div key={i} style={{ padding: '12px', background: '#f8fafc', borderRadius: '4px', borderLeft: '4px solid #10b981' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{update.date}</div>
                      <div style={{ fontSize: '14px', color: '#334155' }}>{update.text}</div>
                      {update.photos && update.photos.length > 0 && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                          {update.photos.map((img: string, photoIdx: number) => (
                            <img
                              key={photoIdx}
                              src={img}
                              alt={`Progress photo ${photoIdx + 1}`}
                              style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: '1px solid #e2e8f0' }}
                              onClick={() => window.open(img, '_blank')}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(orderDetails as any).progress.completedPhotos?.length > 0 && (
              <div className="info-col" style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                <h3>Completed Photos</h3>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {(orderDetails as any).progress.completedPhotos.map((img: string, i: number) => (
                    <img key={i} src={img} alt={'Completed work ' + i} style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: '1px solid #e2e8f0' }} onClick={() => window.open(img, '_blank')} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
