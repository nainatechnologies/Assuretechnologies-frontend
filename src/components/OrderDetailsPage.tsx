import { useState, useEffect } from "react";
import { ordersApi } from "../api/ordersApi";
import { Link, useParams } from "react-router-dom";
import { FaSyncAlt, FaTruck } from "react-icons/fa";
import "./OrderDetailsPage.css";

export function OrderDetailsPage() {
  const { id } = useParams();

  const handleInvoiceDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("Invoice download started...");
  };

  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [extraItems, setExtraItems] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      ordersApi.fetchOrderById(id).then(res => {
        const o = res.data;
        const mapped = {
          id: o.order_number,
          date: new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          total: `?${parseFloat(o.total_amount).toLocaleString("en-IN")}`,
          shipTo: o.customer_name || (o.customer ? o.customer.full_name : "Guest"),
          address: o.customer_address || "No address provided",
          paymentMethod: "Online Payment", // Assumed for now
          status: o.status,
          companyName: o.company_name || null,
          gstNumber: o.gst_number || null,
          summary: {
            itemsSubtotal: `?${parseFloat(o.subtotal_amount || o.total_amount).toLocaleString("en-IN")}`,
            tax: o.tax_amount ? `?${parseFloat(o.tax_amount).toLocaleString("en-IN")}` : null,
            shipping: "Charges Applicable",
            grandTotal: `?${parseFloat(o.total_amount).toLocaleString("en-IN")}`
          },
          items: o.items ? o.items.map((i: any) => ({
            name: i.product ? i.product.name : "Unknown Product",
            qty: i.qty,
            seller: i.vendor ? i.vendor.business_name : "Assure Technologies",
            price: `?${parseFloat(i.price).toLocaleString("en-IN")}`,
            image: i.product?.banner ? (i.product.banner.startsWith('http') || i.product.banner.startsWith('blob:') ? i.product.banner : `http://localhost:5000${i.product.banner.startsWith('/') ? '' : '/'}${i.product.banner}`) : 'https://placehold.co/300x200?text=Product',
            returnStatus: "Processing",
            type: "product",
            trackingId: i.tracking_id,
            transportName: i.transport_name,
            trackingUrl: i.tracking_url
          })) : []
        };
        setOrderDetails(mapped);
        setExtraItems(mapped.extraItems || []);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <div style={{padding: "40px", textAlign: "center"}}>Loading...</div>;
  if (!orderDetails) return <div style={{padding: "40px", textAlign: "center"}}>Order not found.</div>;

  const isService = orderDetails.id.startsWith("SRV") || orderDetails.id.startsWith("DRN");
  const isDroneService = orderDetails.id.startsWith("DRN");

  const handleApproveExtra = () => {
    setExtraItems(extraItems.map((item: any) => ({ ...item, status: 'approved' })));
    alert('Extra items approved and will be added to the final invoice.');
  };

  const handleDeclineExtra = () => {
    setExtraItems(extraItems.map((item: any) => ({ ...item, status: 'declined' })));
    alert('Extra items declined.');
  };

  const pendingExtraItems = extraItems.filter((i: any) => i.status === 'pending');
  const approvedExtraItems = extraItems.filter((i: any) => i.status === 'approved');

  return (
    <div className="order-details-container">
      <div className="order-details-header">
        <div>
          <h1 className="order-details-title">
            Order Details
            {(orderDetails as any).summary?.prebookingPaid && (
              <span style={{ marginLeft: '12px', background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', verticalAlign: 'middle' }}>
                Prebooking Paid ({(orderDetails as any).summary.prebookingPaid})
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
          <button className="invoice-btn" onClick={handleInvoiceDownload}>Invoice ?</button>
        </div>
      </div>

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
              {pendingExtraItems.map((item: any, idx: number) => (
                <li key={idx}><strong>{item.qty}x</strong> {item.description}</li>
              ))}
            </ul>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleDeclineExtra} style={{ background: 'transparent', border: '1px solid #b45309', color: '#b45309', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Decline</button>
            <button onClick={handleApproveExtra} style={{ background: '#f59e0b', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Approve</button>
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
            {approvedExtraItems.map((item: any, idx: number) => (
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
                GSTIN: {orderDetails.gstNumber}
              </div>
            )}
          </div>
          {!isService && (orderDetails as any).transportName && (
            <div className="info-col">
              <h3>Tracking Details</h3>
              <p className="info-text" style={{ fontWeight: '500' }}>
                {(orderDetails as any).trackingUrl ? (
                  <a href={(orderDetails as any).trackingUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#007185', textDecoration: 'underline' }}>
                    {(orderDetails as any).transportName}
                  </a>
                ) : (
                  (orderDetails as any).transportName
                )}
              </p>
              <p className="info-text">Track ID: {(orderDetails as any).trackingId}</p>
            </div>
          )}
          {isService && (orderDetails as any).scheduledDate && (
            <div className="info-col">
              <h3>Scheduled Slot</h3>
              <p className="info-text" style={{ fontWeight: '500' }}>{(orderDetails as any).scheduledDate}</p>
              <p className="info-text">{(orderDetails as any).scheduledTime}</p>
            </div>
          )}
          {isService && (orderDetails as any).technician && (
            <div className="info-col">
              <h3>Assigned Technician</h3>
              <p className="info-text" style={{ fontWeight: '500' }}>{(orderDetails as any).technician.name}</p>
              <p className="info-text">{(orderDetails as any).technician.mobile}</p>
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
                {(orderDetails as any).paymentStatus === 'Completed' ? (
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
                <span>{orderDetails.summary.itemsSubtotal}</span>
              </div>
              {orderDetails.summary.tax && (
              <div className="summary-row">
                <span>Tax (18% GST):</span>
                <span>{orderDetails.summary.tax}</span>
              </div>
              )}
              <div className="summary-row">
                <span>Shipping:</span>
                <span>{orderDetails.summary.shipping}</span>
              </div>
              <div className="summary-row summary-total">
                <span>Grand Total:</span>
                <span>{orderDetails.summary.grandTotal}</span>
              </div>
            </div>
          ) : (
            <div className="info-col">
              <h3>Pricing Details</h3>
              {(orderDetails.summary as any).prebookingPaid ? (
                <>
                  <div className="summary-row" style={{ color: '#166534', fontWeight: '500' }}>
                    <span>Prebooking Paid:</span>
                    <span>{(orderDetails.summary as any).prebookingPaid}</span>
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
              <Link to="#" className="item-name">{item.name} {item.qty > 1 ? `x${item.qty}` : ''}</Link>
              {!isService && <div className="item-price">{item.price}</div>}
              <div className="item-return">{item.returnStatus}</div>
              {(item as any).trackingId && (
                <div style={{ fontSize: '12px', color: '#007185', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <FaTruck style={{ fontSize: '10px' }} /> {(item as any).transportName} - Tracking: {(item as any).trackingId}
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
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  {(orderDetails as any).progress.startPhotos.map((img: string, i: number) => (
                    <img key={i} src={img} alt={`Start work ${i}`} style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '4px' }} />
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
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(orderDetails as any).progress.completedPhotos?.length > 0 && (
              <div className="info-col" style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                <h3>Completed Photos</h3>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  {(orderDetails as any).progress.completedPhotos.map((img: string, i: number) => (
                    <img key={i} src={img} alt={`Completed work ${i}`} style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '4px' }} />
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
