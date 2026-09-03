import { BASE_URL } from '../services/api';
import { useState, useEffect } from "react";
import { ordersApi } from "../api/ordersApi";
import { getCustomerServiceBookings, updateExtraItemStatus } from '../api/serviceBookingApi';
import { Link, useParams } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { FaTruck } from "react-icons/fa";
import "./OrderDetailsPage.css";

export function OrderDetailsPage() {
  const { id } = useParams();
  const { userName } = useAuth();

  const handleInvoiceDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("Invoice download started...");
  };

  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [extraItems, setExtraItems] = useState<any[]>([]);

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
        
        const s = sData.find((x: any) => x.display_id === id || x.order_number === id || x.id === id);

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

          const startProgress = (s.progress_updates || []).find((p: any) => p.update_type === 'START');
          const dailyUpdates = (s.progress_updates || [])
            .filter((p: any) => p.update_type === 'PROGRESS')
            .map((p: any) => ({
              date: new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: p.description
            }));
          const completedProgress = (s.progress_updates || []).find((p: any) => p.update_type === 'COMPLETE');

          const mappedService = {
            id: s.display_id || s.order_number || s.id,
            rawId: s.id,
            type: "service",
            date: new Date(s.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            total: (s.Order?.total_amount || s.total_amount) ? '₹' + parseFloat(s.Order?.total_amount || s.total_amount).toLocaleString("en-IN") : '₹0',
            shipTo: parsedAddress.split(',')[0] || s.Order?.customer_name || userName || "Customer",
            address: parsedAddress || "Service address",
            paymentMethod: s.Order?.payment_status === 'PAID' ? "Online Payment (Paid)" : (s.prebooking_paid ? "Prebooking Paid" : "Manual Payment"),
            status: s.status === 'NEW' ? 'Pending' : s.status === 'ACCEPTED' ? 'Accepted' : s.status === 'ASSIGNED' ? 'Assigned' : s.status === 'IN_PROGRESS' ? 'In Progress' : (s.status === 'PENDING_APPROVAL' || s.status === 'AWAITING_APPROVAL') ? 'Awaiting Approval' : s.status === 'COMPLETED' ? 'Completed' : s.status === 'CANCELLED' ? 'Cancelled' : s.status,
            cancelledBy: s.cancelled_by,
            cancellationReason: s.cancellation_reason,
            isDroneService: (s.Service || s.service)?.service_owner_type === 'PARTNER',
            technician: s.assigned_technician ? {
              name: s.assigned_technician.full_name || s.assigned_technician.name || 'Assigned Technician',
              mobile: s.assigned_technician.mobile || 'N/A'
            } : null,
            summary: {
              itemsSubtotal: (s.Order?.total_amount || s.total_amount) ? '₹' + parseFloat(s.Order?.total_amount || s.total_amount).toLocaleString("en-IN") : '₹0',
              grandTotal: (s.Order?.total_amount || s.total_amount) ? '₹' + parseFloat(s.Order?.total_amount || s.total_amount).toLocaleString("en-IN") : '₹0',
              prebookingPaid: s.prebooking_paid ? '₹' + parseFloat(s.Service?.prebooking_charge || 0).toLocaleString("en-IN") : null
            },
            scheduledDate: s.scheduled_date ? new Date(s.scheduled_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : '',
            scheduledTime: s.scheduled_time_slot || (s.scheduled_date ? new Date(s.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM - 12:00 PM'),
            paymentStatus: s.Order?.payment_status === 'PAID' ? 'Completed' : (s.prebooking_paid ? 'Prebooking Paid' : 'Pending'),
            items: [{
              name: (s.Service || s.service)?.name || "Service Booking",
              qty: s.quantity || 1,
              seller: (s.Service || s.service)?.service_owner_type === 'PARTNER' ? 'Partner Service' : 'Assure Services',
              price: (s.Order?.total_amount || s.total_amount) ? '₹' + parseFloat(s.Order?.total_amount || s.total_amount).toLocaleString("en-IN") : '₹0',
              image: (s.Service || s.service)?.image || 'https://via.placeholder.com/150?text=Service',
              type: "service",
              returnStatus: (() => {
                switch(s.status) {
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
              startPhotos: startProgress?.photos || [],
              dailyUpdates: dailyUpdates,
              completedPhotos: completedProgress?.photos || []
            } : null
          };

          const mappedExtra = (s.extra_items || []).map((item) => ({
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
            date: new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
            total: '₹' + parseFloat(o.total_amount).toLocaleString("en-IN"),
            shipTo: o.customer_name || (o.customer ? o.customer.full_name : "Guest"),
            address: o.customer_address || "No address provided",
            paymentMethod: "Online Payment", 
            status: o.status,
            companyName: o.company_name || null,
            gstNumber: o.gst_number || null,
            summary: {
              itemsSubtotal: '₹' + parseFloat(o.subtotal_amount || o.total_amount).toLocaleString("en-IN"),
              tax: o.tax_amount ? '₹' + parseFloat(o.tax_amount).toLocaleString("en-IN") : null,
              shipping: "Charges Applicable",
              grandTotal: '₹' + parseFloat(o.total_amount).toLocaleString("en-IN")
            },
            items: o.items ? o.items.map((i) => ({
              name: i.product ? i.product.name : "Unknown Product",
              qty: i.qty,
              seller: i.vendor ? i.vendor.business_name : "Assure Technologies",
              price: '₹' + parseFloat(i.price).toLocaleString("en-IN"),
              image: i.product?.banner ? (i.product.banner.startsWith('http') || i.product.banner.startsWith('blob:') ? i.product.banner : (BASE_URL.replace(/\/api$/, "") + (i.product.banner.startsWith('/') ? '' : '/') + i.product.banner)) : 'https://placehold.co/300x200?text=Product',
              type: "product",
              trackingId: i.tracking_id,
              transportName: i.transport_name,
              trackingUrl: i.tracking_url
            })) : []
          };
          setOrderDetails(mapped);
          setExtraItems(mapped.extraItems || []);
          setLoading(false);
        } else {
          setOrderDetails(null);
          setLoading(false);
        }
      });
    }
  }, [id, userName]);

  if (loading) return <div style={{padding: "40px", textAlign: "center"}}>Loading...</div>;
  if (!orderDetails) return <div style={{padding: "40px", textAlign: "center"}}>Order not found.</div>;

  const isService = orderDetails.type === "service" || orderDetails.id.startsWith("SRV") || orderDetails.id.startsWith("DRN") || orderDetails.id.startsWith("SBK");
  const isDroneService = orderDetails.isDroneService || orderDetails.id.startsWith("DRN");

  const handleApproveExtra = async (item) => {
    try {
      const bookingId = orderDetails.rawId || orderDetails.id;
      await updateExtraItemStatus(bookingId, item.id, 'APPROVED');
      setExtraItems(prev => prev.map((i) => i.id === item.id ? { ...i, status: 'approved' } : i));
      alert("Extra item '" + item.description + "' approved successfully!");
    } catch (err) {
      console.error(err);
      alert('Failed to approve extra item: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeclineExtra = async (item) => {
    try {
      const bookingId = orderDetails.rawId || orderDetails.id;
      await updateExtraItemStatus(bookingId, item.id, 'REJECTED');
      setExtraItems(prev => prev.map((i) => i.id === item.id ? { ...i, status: 'declined' } : i));
      alert("Extra item '" + item.description + "' declined.");
    } catch (err) {
      console.error(err);
      alert('Failed to decline extra item: ' + (err.response?.data?.message || err.message));
    }
  };

  const pendingExtraItems = extraItems.filter((i) => i.status === 'pending');
  const approvedExtraItems = extraItems.filter((i) => i.status === 'approved');

  return (
    <div className="order-details-container">
      <div className="order-details-header">
        <div>
          <h1 className="order-details-title">
            Order Details
            {(orderDetails).summary?.prebookingPaid && (
              <span style={{ marginLeft: '12px', background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', verticalAlign: 'middle' }}>
                Prebooking Paid ({(orderDetails).summary.prebookingPaid})
              </span>
            )}
          </h1>
          <div className="order-details-meta">
            <span>Ordered on {orderDetails.date}</span>
            <span className="divider">|</span>
            <span>Order# {orderDetails.id}</span>
          </div>
        </div>
        <div>
          {orderDetails.status === 'Completed' && <button className="invoice-btn" onClick={handleInvoiceDownload}>Invoice</button>}
        </div>
      </div>

      {orderDetails.status === 'Cancelled' && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderLeft: '5px solid #ef4444', padding: '16px 20px', borderRadius: '8px', marginBottom: '24px' }}>
          <h3 style={{ color: '#991b1b', margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600' }}>
            {orderDetails.cancelledBy === 'ADMIN' ? 'Service Cancelled by Assure Team' : 'Service Cancelled by You'}
          </h3>
          <p style={{ margin: 0, color: '#7f1d1d', fontSize: '14px', lineHeight: '1.5' }}>
            {orderDetails.cancelledBy === 'ADMIN' 
              ? (orderDetails.cancellationReason && !['cancelled by admin', 'cancelled by administrator', 'rejected by admin', 'unable to fulfill booking at scheduled time'].includes(orderDetails.cancellationReason.toLowerCase().trim())
                  ? `Reason: ${orderDetails.cancellationReason}` 
                  : 'We were unable to fulfill this service booking at your requested scheduled time.')
              : (orderDetails.cancellationReason && orderDetails.cancellationReason.toLowerCase().trim() !== 'no reason provided'
                  ? `Reason: ${orderDetails.cancellationReason}`
                  : 'This service booking was cancelled as requested.')}
          </p>

          {((orderDetails).summary?.prebookingPaid || orderDetails.prebookingPaid) && (
            <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 14px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div>
                <strong style={{ color: '#166534', fontSize: '14px' }}>100% Pre-Booking Refund Initiated</strong>
                <div style={{ color: '#15803d', fontSize: '13px', marginTop: '2px' }}>
                  The advance fee of {(orderDetails).summary?.prebookingPaid || ('?' + orderDetails.prebookingPaid)} will be credited back to your original payment source within 3�5 working days.
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
            <p className="info-text">{orderDetails.paymentMethod || 'Manual Payment'}</p>
          </div>
          {isService && (
            <div className="info-col">
              <h3>Payment Status</h3>
              <p className="info-text">
                {(orderDetails).paymentStatus === 'Completed' ? (
                  <span style={{ color: '#166534', fontWeight: 'bold' }}>Completed</span>
                ) : (
                  <span style={{ color: '#b45309', fontWeight: 'bold' }}>Pending</span>
                )}
              </p>
            </div>
          )}
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
              {(orderDetails.summary).prebookingPaid ? (
                <>
                  <div className="summary-row" style={{ color: '#166534', fontWeight: '500' }}>
                    <span>Prebooking Paid:</span>
                    <span>{(orderDetails.summary).prebookingPaid}</span>
                  </div>
                  <div className="summary-row" style={{ marginTop: '8px' }}>
                    <span>Balance Due:</span>
                    <span style={{ fontSize: '13px', color: '#565959', fontStyle: 'italic' }}>Billed manually</span>
                  </div>
                </>
              ) : (
                <p className="info-text">Cost will be billed manually after the technician completes the service.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="item-details-card">
        <h2 className="item-title">{orderDetails.items.length} item{orderDetails.items.length !== 1 ? 's' : ''}</h2>
        {orderDetails.items.map((item, index) => (
          <div className="item-flex" key={index} style={{ marginBottom: index !== orderDetails.items.length - 1 ? '30px' : '0' }}>
            <img src={item.image} alt={item.name} className="item-img" />
            <div className="item-info">
              <Link to="#" className="item-name">{item.name} {item.qty > 1 ? ('x' + item.qty) : ''}</Link>
              {!isService && <div className="item-price">{item.price}</div>}
              {item.returnStatus && <div className="item-return-status" style={{ fontSize: '12px', color: '#565959', marginTop: '4px' }}>{item.returnStatus}</div>}
              {(item).trackingId && (
                <div style={{ fontSize: '12px', color: '#007185', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <FaTruck style={{ fontSize: '10px' }} /> {(item).transportName} - Tracking: {(item).trackingId}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isService && (orderDetails).progress && (
        <div className="details-card" style={{ marginTop: '20px' }}>
          <h2 className="item-title" style={{ padding: '0 20px', paddingTop: '20px' }}>Technician Progress</h2>
          <div className="info-grid">

            {(orderDetails).progress.startPhotos?.length > 0 && (
              <div className="info-col" style={{ gridColumn: '1 / -1' }}>
                <h3>Start Work Info</h3>
                {(orderDetails).progress.startDescription && (
                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '4px', borderLeft: '4px solid #3b82f6', marginTop: '10px' }}>
                    <div style={{ fontSize: '14px', color: '#334155' }}>{(orderDetails).progress.startDescription}</div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  {(orderDetails).progress.startPhotos.map((img, i) => (
                    <img key={i} src={img} alt={'Start work ' + i} style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '4px' }} />
                  ))}
                </div>
              </div>
            )}

            {(orderDetails).progress.dailyUpdates?.length > 0 && (
              <div className="info-col" style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                <h3>Work Updates</h3>
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(orderDetails).progress.dailyUpdates.map((update, i) => (
                    <div key={i} style={{ padding: '12px', background: '#f8fafc', borderRadius: '4px', borderLeft: '4px solid #10b981' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{update.date}</div>
                      <div style={{ fontSize: '14px', color: '#334155' }}>{update.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(orderDetails).progress.completedPhotos?.length > 0 && (
              <div className="info-col" style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                <h3>Completed Photos</h3>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  {(orderDetails).progress.completedPhotos.map((img, i) => (
                    <img key={i} src={img} alt={'Completed work ' + i} style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '4px' }} />
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
