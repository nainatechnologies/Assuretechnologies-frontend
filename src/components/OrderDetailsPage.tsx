import { BASE_URL } from '../services/api';
import { useState, useEffect } from "react";
import { ordersApi } from "../api/ordersApi";
import { useParams } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { FaTruck } from "react-icons/fa";
import "./OrderDetailsPage.css";
import { Toast } from '../utils/errorHandler';

const MOCK_SERVICE_DETAILS: Record<string, any> = {
  'SRV-2026-0004': {
    id: 'SRV-2026-0004',
    date: '20 Jul 2026',
    scheduledDate: '25 Jul 2026',
    scheduledTime: '10:00 AM - 12:00 PM',
    address: 'H.No 45, Gachibowli, Hyderabad, Telangana - 500032',
    technician: {
      name: 'Ramesh Kumar',
      mobile: '+91 98765 43210',
      experience: '5+ years experience'
    },
    total: '₹2,300',
    shipTo: 'Shyam Matam',
    paymentMethod: 'Online Payment',
    paymentStatus: 'PAID',
    status: 'IN_PROGRESS',
    type: 'service',
    isDroneService: false,
    summary: {
      itemsSubtotal: '₹2,300',
      shipping: 'Free',
      grandTotal: '₹2,300'
    },
    items: [
      {
        name: 'CCTV Installation & Setup Service',
        qty: 1,
        seller: 'Assure Technologies Services',
        price: '₹1,500',
        image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=300&q=80',
        returnStatus: 'Technician is currently working on site',
        type: 'service'
      },
      {
        name: 'Network Cabling & Router Configuration',
        qty: 1,
        seller: 'Assure Technologies Services',
        price: '₹800',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&q=80',
        returnStatus: 'Scheduled along with installation',
        type: 'service'
      }
    ],
    progress: {
      startDescription: 'Arrived on site, inspecting the wall structure before drilling.',
      startPhotos: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&q=80'],
      dailyUpdates: [
        { date: '25 July 2026, 11:30 AM', text: 'Arrived at location. Evaluated mounting points and started drilling.' },
        { date: '25 July 2026, 04:15 PM', text: 'Completed wiring for front yard and backyard cameras.' }
      ],
      completedPhotos: ['https://images.unsplash.com/photo-1557862921-37829c790f19?w=300&q=80']
    },
    extraItems: [
      { description: 'Additional wiring (10m)', qty: 1, status: 'pending' },
      { description: 'Extra weatherproof camera mount', qty: 2, status: 'pending' }
    ]
  },
  'DRN-2026-0810': {
    id: 'DRN-2026-0810',
    date: '24 Jul 2026',
    scheduledDate: '28 Jul 2026',
    scheduledTime: '02:00 PM - 05:00 PM',
    address: 'Plot 12, Financial District, Hyderabad, Telangana - 500075',
    technician: {
      name: 'Vikram Reddy (Licensed Drone Pilot)',
      mobile: '+91 91234 56780',
      experience: 'DGCA Certified Drone Pilot'
    },
    total: '₹14,500',
    shipTo: 'Shyam Matam',
    paymentMethod: 'Online Payment',
    paymentStatus: 'PAID',
    status: 'ACCEPTED',
    type: 'service',
    isDroneService: true,
    summary: {
      itemsSubtotal: '₹14,500',
      shipping: 'Free',
      grandTotal: '₹14,500'
    },
    items: [
      {
        name: 'Aerial Drone Site Mapping & Inspection',
        qty: 1,
        seller: 'Assure Drone Services',
        price: '₹14,500',
        image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=300&q=80',
        returnStatus: 'Accepted by admin, pending drone pilot deployment',
        type: 'service'
      }
    ],
    progress: {
      startDescription: 'Flight plan filed and drone airspace cleared.',
      startPhotos: ['https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=300&q=80'],
      dailyUpdates: [
        { date: '28 July 2026, 02:30 PM', text: 'Completed calibration flights and perimeter scanning.' }
      ],
      completedPhotos: []
    },
    extraItems: []
  },
  'SRV-2026-0002': {
    id: 'SRV-2026-0002',
    date: '18 Jul 2026',
    scheduledDate: '22 Jul 2026',
    scheduledTime: '11:00 AM - 01:00 PM',
    address: 'Flat 302, Madhapur, Hyderabad, Telangana - 500081',
    technician: {
      name: 'Anil Sharma',
      mobile: '+91 97890 12345',
      experience: 'IoT & Smart Lock Specialist'
    },
    total: '₹3,200',
    shipTo: 'Shyam Matam',
    paymentMethod: 'Online Payment',
    paymentStatus: 'PAID',
    status: 'PENDING_APPROVAL',
    type: 'service',
    isDroneService: false,
    summary: {
      itemsSubtotal: '₹3,200',
      shipping: 'Free',
      grandTotal: '₹3,200'
    },
    items: [
      {
        name: 'Smart Door Lock & Security Wiring',
        qty: 1,
        seller: 'Assure Technologies Services',
        price: '₹3,200',
        image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=300&q=80',
        returnStatus: 'Work completed, awaiting your approval',
        type: 'service'
      }
    ],
    progress: {
      startDescription: 'Tested smart lock unit and began mortise installation.',
      startPhotos: ['https://images.unsplash.com/photo-1558002038-1055907df827?w=300&q=80'],
      dailyUpdates: [
        { date: '22 July 2026, 12:45 PM', text: 'Installed smart lock, synced mobile app and biometrics successfully.' }
      ],
      completedPhotos: ['https://images.unsplash.com/photo-1558002038-1055907df827?w=300&q=80']
    },
    extraItems: [
      { description: 'Emergency Backup Battery Pack', qty: 1, status: 'pending' }
    ]
  }
};

export function OrderDetailsPage() {
  const { id } = useParams();
  const { userName } = useAuth();

  const handleInvoiceDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    Toast.fire({ icon: 'success', title: "Invoice download started..." });
  };

  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [extraItems, setExtraItems] = useState<any[]>([]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    // Check mock service order first
    if (MOCK_SERVICE_DETAILS[id] || id.startsWith('SRV-') || id.startsWith('DRN-')) {
      const mockOrder = MOCK_SERVICE_DETAILS[id] || MOCK_SERVICE_DETAILS['SRV-2026-0004'];
      setOrderDetails(mockOrder);
      setExtraItems(mockOrder.extraItems || []);
      setLoading(false);
      return;
    }

    ordersApi.fetchOrderById(id).then(res => {
      const o = res.data;
      const mapped = {
        id: o.order_number || o.id,
        date: new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        total: `₹${parseFloat(o.total_amount || 0).toLocaleString("en-IN")}`,
        shipTo: o.customer_name || (o.customer ? o.customer.full_name : "Guest"),
        address: o.customer_address || "No address provided",
        paymentMethod: "Online Payment",
        paymentStatus: o.payment_status || "PENDING",
        razorpayPaymentId: o.razorpay_payment_id || null,
        razorpayOrderId: o.razorpay_order_id || null,
        status: o.status,
        companyName: o.company_name || null,
        gstNumber: o.gst_number || null,
        summary: {
          itemsSubtotal: `₹${parseFloat(o.subtotal_amount || o.total_amount || 0).toLocaleString("en-IN")}`,
          tax: o.tax_amount ? `₹${parseFloat(o.tax_amount).toLocaleString("en-IN")}` : null,
          shipping: "Charges Applicable",
          grandTotal: `₹${parseFloat(o.total_amount || 0).toLocaleString("en-IN")}`
        },
        items: o.items ? o.items.map((i: any) => ({
          name: i.product ? i.product.name : "Unknown Product",
          qty: i.qty,
          seller: i.vendor ? i.vendor.business_name : "Assure Technologies",
          price: `₹${parseFloat(i.price || 0).toLocaleString("en-IN")}`,
          image: i.product?.banner ? (i.product.banner.startsWith('http') || i.product.banner.startsWith('blob:') ? i.product.banner : `${BASE_URL.replace(/\/api$/, "")}${i.product.banner.startsWith('/') ? '' : '/'}${i.product.banner}`) : 'https://placehold.co/300x200?text=Product',
          type: "product",
          trackingId: i.tracking_id,
          transportName: i.transport_name,
          trackingUrl: i.tracking_url
        })) : []
      };
      setOrderDetails(mapped);
      setExtraItems((mapped as any).extraItems || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      if (MOCK_SERVICE_DETAILS['SRV-2026-0004']) {
        setOrderDetails(MOCK_SERVICE_DETAILS['SRV-2026-0004']);
      }
      setLoading(false);
    });
  }, [id, userName]);

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;
  if (!orderDetails) return <div style={{ padding: "40px", textAlign: "center" }}>Order not found.</div>;

  const isService = orderDetails.type === "service" || orderDetails.id.startsWith("SRV") || orderDetails.id.startsWith("DRN") || orderDetails.id.startsWith("SBK");
  const isDroneService = orderDetails.isDroneService || orderDetails.id.startsWith("DRN");

  const handleApproveExtra = () => {
    setExtraItems(extraItems.map((item: any) => ({ ...item, status: 'approved' })));
    Toast.fire({ icon: 'success', title: 'Extra items approved and will be added to the final invoice.' });
  };

  const handleDeclineExtra = () => {
    setExtraItems(extraItems.map((item: any) => ({ ...item, status: 'declined' })));
    Toast.fire({ icon: 'info', title: 'Extra items declined.' });
  };

  const pendingExtraItems = extraItems.filter((i: any) => i.status === 'pending');
  const approvedExtraItems = extraItems.filter((i: any) => i.status === 'approved');

  return (
    <div className="order-details-container">
      <div className="order-details-header">
        <div>
          <h1 className="order-details-title">
            Order Details
            {isDroneService && <span style={{ marginLeft: '12px', background: '#dc2626', color: '#ffffff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>DRONE SERVICE</span>}
          </h1>
          <p className="order-meta">
            Ordered on {orderDetails.date} <span className="meta-separator">|</span> Order# {orderDetails.id}
          </p>
        </div>
        <button className="invoice-btn" onClick={handleInvoiceDownload}>
          Download Invoice
        </button>
      </div>

      <div className="info-card">
        <div className="info-grid">
          <div className="info-col">
            <h3>{isService ? "Service Location" : "Shipping Address"}</h3>
            <p className="info-text">{orderDetails.shipTo}</p>
            <p className="info-text" style={{ whiteSpace: "pre-line" }}>{orderDetails.address}</p>
          </div>
          {orderDetails.companyName && (
            <div className="info-col">
              <h3>Billing Info</h3>
              <p className="info-text"><strong>Company:</strong> {orderDetails.companyName}</p>
              {orderDetails.gstNumber && <p className="info-text"><strong>GST:</strong> {orderDetails.gstNumber}</p>}
            </div>
          )}
          <div className="info-col">
            <h3>Payment Method</h3>
            <p className="info-text">{orderDetails.paymentMethod || 'Online Payment'}</p>
            {orderDetails.razorpayPaymentId && (
              <p className="info-text" style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Txn ID: <strong>{orderDetails.razorpayPaymentId}</strong>
              </p>
            )}
          </div>
          <div className="info-col">
            <h3>Payment Status</h3>
            <p className="info-text">
              <span className={`badge ${orderDetails.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`} style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                backgroundColor: orderDetails.paymentStatus === 'PAID' ? '#dcfce7' : '#fef9c3',
                color: orderDetails.paymentStatus === 'PAID' ? '#15803d' : '#a16207'
              }}>
                {orderDetails.paymentStatus}
              </span>
            </p>
          </div>
          <div className="info-col">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Item(s) Subtotal:</span>
              <span>{orderDetails.summary?.itemsSubtotal}</span>
            </div>
            {orderDetails.summary?.tax && (
              <div className="summary-row">
                <span>Tax:</span>
                <span>{orderDetails.summary?.tax}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping:</span>
              <span>{orderDetails.summary?.shipping || 'Free'}</span>
            </div>
            <div className="summary-row grand-total">
              <span>Grand Total:</span>
              <span>{orderDetails.summary?.grandTotal}</span>
            </div>
          </div>
        </div>
      </div>

      {isService && orderDetails.technician && (
        <div className="service-details-card" style={{ marginBottom: "20px", padding: "20px", border: "1px solid #e5e7eb", borderRadius: "8px", background: "#f9fafb" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "12px", color: "#111827" }}>
            {isDroneService ? "Assigned Drone Pilot" : "Assigned Technician"}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: isDroneService ? "#fee2e2" : "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: isDroneService ? "#dc2626" : "#4f46e5" }}>
              {isDroneService ? "🚁" : "🔧"}
            </div>
            <div>
              <p style={{ fontWeight: "600", margin: "0 0 4px 0", color: "#1f2937" }}>{orderDetails.technician.name}</p>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 2px 0" }}>Mobile: {orderDetails.technician.mobile}</p>
              <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}>{orderDetails.technician.experience}</p>
            </div>
          </div>
        </div>
      )}

      {isService && orderDetails.progress && (
        <div className="service-progress-card" style={{ marginBottom: "20px", padding: "20px", border: "1px solid #e5e7eb", borderRadius: "8px", background: "#ffffff" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "16px", color: "#111827" }}>Service Live Progress</h2>
          
          {orderDetails.progress.startDescription && (
            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", margin: "0 0 6px 0" }}>Start of Work Note</h4>
              <p style={{ fontSize: "14px", color: "#4b5563", margin: "0 0 8px 0" }}>{orderDetails.progress.startDescription}</p>
              {orderDetails.progress.startPhotos && orderDetails.progress.startPhotos.length > 0 && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {orderDetails.progress.startPhotos.map((photo: string, idx: number) => (
                    <img key={idx} src={photo} alt="Start photo" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px", border: "1px solid #e5e7eb" }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {orderDetails.progress.dailyUpdates && orderDetails.progress.dailyUpdates.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", margin: "0 0 8px 0" }}>Updates Timeline</h4>
              <div style={{ borderLeft: "2px solid #e5e7eb", paddingLeft: "12px", marginLeft: "4px" }}>
                {orderDetails.progress.dailyUpdates.map((update: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: "10px", position: "relative" }}>
                    <div style={{ position: "absolute", left: "-17px", top: "4px", width: "8px", height: "8px", borderRadius: "50%", background: "#4f46e5" }}></div>
                    <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>{update.date}</span>
                    <p style={{ fontSize: "13px", color: "#374151", margin: "2px 0 0 0" }}>{update.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {orderDetails.progress.completedPhotos && orderDetails.progress.completedPhotos.length > 0 && (
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", margin: "0 0 6px 0" }}>Completed Work Photos</h4>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {orderDetails.progress.completedPhotos.map((photo: string, idx: number) => (
                  <img key={idx} src={photo} alt="Completed photo" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px", border: "1px solid #e5e7eb" }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {isService && extraItems && extraItems.length > 0 && (
        <div className="extra-items-card" style={{ marginBottom: "20px", padding: "20px", border: "1px solid #fde68a", borderRadius: "8px", background: "#fffbeb" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "8px", color: "#92400e" }}>
            Additional Materials / Work Requested
          </h2>
          <p style={{ fontSize: "13px", color: "#78350f", marginBottom: "16px" }}>
            The technician identified the following additional requirements on site:
          </p>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #fcd34d", textAlign: "left", fontSize: "13px", color: "#92400e" }}>
                <th style={{ padding: "8px" }}>Item Description</th>
                <th style={{ padding: "8px" }}>Qty</th>
                <th style={{ padding: "8px" }}>Approval Status</th>
              </tr>
            </thead>
            <tbody>
              {extraItems.map((item: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: "1px solid #fef3c7", fontSize: "13px", color: "#78350f" }}>
                  <td style={{ padding: "8px" }}>{item.description}</td>
                  <td style={{ padding: "8px" }}>{item.qty}</td>
                  <td style={{ padding: "8px" }}>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "600",
                      background: item.status === 'approved' ? '#dcfce7' : item.status === 'declined' ? '#fee2e2' : '#fef08a',
                      color: item.status === 'approved' ? '#15803d' : item.status === 'declined' ? '#b91c1c' : '#854d0e'
                    }}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pendingExtraItems.length > 0 && (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button 
                onClick={handleApproveExtra}
                style={{ padding: "8px 16px", background: "#10b981", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}
              >
                Approve Extra Items
              </button>
              <button 
                onClick={handleDeclineExtra}
                style={{ padding: "8px 16px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}
              >
                Decline
              </button>
            </div>
          )}
          {approvedExtraItems.length > 0 && pendingExtraItems.length === 0 && (
            <p style={{ margin: 0, fontSize: "12px", color: "#15803d", fontWeight: "500" }}>
              ✓ All extra items have been approved and added to your work order.
            </p>
          )}
        </div>
      )}

      <div className="item-details-card">
        <h2 className="item-title">{orderDetails.items.length} item{orderDetails.items.length !== 1 ? 's' : ''}</h2>
        {orderDetails.items.map((item: any, index: number) => (
          <div className="item-flex" key={index} style={{ marginBottom: index !== orderDetails.items.length - 1 ? '30px' : '0' }}>
            <img src={item.image} alt={item.name} className="item-img" />
            <div className="item-info">
              <div className="item-name">{item.name}</div>
              <div className="item-seller">Sold by: {item.seller}</div>
              {!isService && <div className="item-price">{item.price}</div>}
              {item.returnStatus && <div className="item-return-status" style={{ fontSize: '12px', color: '#565959', marginTop: '4px' }}>{item.returnStatus}</div>}
              {(item as any).trackingId && (
                <div style={{ fontSize: '12px', color: '#007185', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <FaTruck style={{ fontSize: '10px' }} /> {(item as any).transportName} - Tracking: {(item as any).trackingId}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
