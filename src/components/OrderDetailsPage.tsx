import { Link, useParams } from 'react-router-dom';
import { FaSyncAlt, FaTruck } from 'react-icons/fa';
import './OrderDetailsPage.css';

export function OrderDetailsPage() {
  const { id } = useParams();

  const handleInvoiceDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('Invoice download started...');
  };

  const allOrders = [
    {
      id: 'ORD-2023-0891',
      date: 'July 15, 2026',
      total: '₹16,500',
      shipTo: 'Shyam Matam\nJMJ Sathvika Reddy Boys hostel, beside TGB Bank\nUppal Road, Laxma Reddy Colony, Road Number 2, dead-end\nHyderabad, TELANGANA 500039\nIndia',
      paymentMethod: 'BHIM UPI',
      summary: {
        itemsSubtotal: '₹16,500',
        shipping: '₹0.00',
        marketplaceFee: '₹0.00',
        totalBeforePromo: '₹16,500',
        promotionApplied: '₹0.00',
        grandTotal: '₹16,500'
      },
      items: [
        {
          name: '4K Security Camera',
          qty: 2,
          seller: 'Assure Technologies',
          price: '₹12,000',
          image: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=300&q=80',
          returnStatus: 'Warranty valid until 15 July 2027',
          type: 'product'
        },
        {
          name: 'Smart Video Doorbell',
          qty: 1,
          seller: 'Assure Technologies',
          price: '₹4,500',
          image: 'https://images.unsplash.com/photo-1555861496-faa66cb20c27?w=300&q=80',
          returnStatus: 'Warranty valid until 15 July 2027',
          type: 'product'
        }
      ]
    },
    {
      id: 'SRV-2026-0004',
      date: 'July 20, 2026',
      scheduledDate: '25 July 2026',
      scheduledTime: '10:00 AM - 12:00 PM',
      address: 'H.No 45, Gachibowli, Hyderabad, Telangana - 500032',
      technician: null,
      total: '₹2,300',
      shipTo: 'Shyam Matam\nJMJ Sathvika Reddy Boys hostel, beside TGB Bank\nUppal Road, Laxma Reddy Colony, Road Number 2, dead-end\nHyderabad, TELANGANA 500039\nIndia',
      paymentMethod: 'Credit Card',
      summary: {
        itemsSubtotal: '₹2,300',
        shipping: '₹0.00',
        marketplaceFee: '₹0.00',
        totalBeforePromo: '₹2,300',
        promotionApplied: '₹0.00',
        grandTotal: '₹2,300'
      },
      items: [
        {
          name: 'CCTV Installation Service',
          qty: 1,
          seller: 'Assure Technologies Services',
          price: '₹1,500',
          image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=300&q=80',
          returnStatus: 'Service scheduled for 25 July 2026',
          type: 'service'
        },
        {
          name: 'Network Cabling',
          qty: 1,
          seller: 'Assure Technologies Services',
          price: '₹800',
          image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=300&q=80',
          returnStatus: 'Service scheduled for 25 July 2026',
        }
      ],
      progress: {
        startDescription: 'Arrived on site, inspecting the wall structure before drilling.',
        startPhotos: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&q=80'],
        dailyUpdates: [
          { date: '25 July 2026, 11:30 AM', text: 'Arrived at the location. Evaluated camera mounting points and started drilling.' },
          { date: '25 July 2026, 04:15 PM', text: 'Completed wiring for the front yard and backyard cameras.' }
        ],
        completedPhotos: ['https://images.unsplash.com/photo-1557862921-37829c790f19?w=300&q=80', 'https://images.unsplash.com/photo-1555861496-faa66cb20c27?w=300&q=80']
      }
    },
    {
      id: 'ORD-2026-0001',
      date: 'July 25, 2026',
      total: '₹1,50,000',
      shipTo: 'Shyam Matam\nSame Address...',
      paymentMethod: 'Net Banking',
      summary: {
        itemsSubtotal: '₹1,50,000',
        shipping: '₹0.00',
        marketplaceFee: '₹0.00',
        totalBeforePromo: '₹1,50,000',
        promotionApplied: '₹0.00',
        grandTotal: '₹1,50,000'
      },
      items: [
        {
          name: 'Biometric Access Control System',
          qty: 30,
          seller: 'Vendor A',
          price: '₹50,000',
          image: 'https://images.unsplash.com/photo-1555861496-faa66cb20c27?w=300&q=80',
          returnStatus: 'Order is being packed',
          type: 'product',
          transportName: 'Blue Dart',
          trackingId: 'BD111111'
        },
        {
          name: 'Biometric Access Control System',
          qty: 30,
          seller: 'Vendor B',
          price: '₹50,000',
          image: 'https://images.unsplash.com/photo-1555861496-faa66cb20c27?w=300&q=80',
          returnStatus: 'Out for Delivery',
          type: 'product',
          transportName: 'Shiprocket',
          trackingId: 'SR222222'
        },
        {
          name: 'Biometric Access Control System',
          qty: 40,
          seller: 'Vendor C',
          price: '₹50,000',
          image: 'https://images.unsplash.com/photo-1555861496-faa66cb20c27?w=300&q=80',
          returnStatus: 'Awaiting vendor confirmation',
          type: 'product'
        }
      ]
    },
    {
      id: 'DRN-2026-0001',
      date: 'July 31, 2026',
      scheduledDate: '02 Aug 2026',
      scheduledTime: '09:00 AM - 11:00 AM',
      address: 'Survey 123/A, Guntur, AP - 500001',
      technician: null,
      total: '₹4,500',
      shipTo: 'Shyam Matam\nJMJ Sathvika Reddy Boys hostel, beside TGB Bank\nUppal Road, Laxma Reddy Colony, Road Number 2, dead-end\nHyderabad, TELANGANA 500039\nIndia',
      paymentMethod: 'UPI',
      summary: {
        itemsSubtotal: '₹4,500',
        shipping: '₹0.00',
        marketplaceFee: '₹0.00',
        totalBeforePromo: '₹4,500',
        promotionApplied: '₹0.00',
        grandTotal: '₹4,500'
      },
      items: [
        {
          name: 'Agriculture Drone Spray Services',
          qty: 1,
          seller: 'Assure Technologies Services',
          price: '₹4,500',
          image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=300&q=80',
          returnStatus: 'Waiting for admin approval',
          type: 'service'
        }
      ]
    }
  ];

  const orderDetails = allOrders.find(o => o.id === id) || allOrders[0];

  const isService = orderDetails.id.startsWith('SRV') || orderDetails.id.startsWith('DRN');
  const isDroneService = orderDetails.id.startsWith('DRN');

  return (
    <div className="order-details-container">
      <div className="order-details-header">
        <div>
          <h1 className="order-details-title">Order Details</h1>
          <div className="order-details-meta">
            <span>Ordered on {orderDetails.date}</span>
            <span className="divider">|</span>
            <span>Order# {orderDetails.id}</span>
          </div>
        </div>
        <div>
          <button className="invoice-btn" onClick={handleInvoiceDownload}>Invoice ⌄</button>
        </div>
      </div>

      <div className="details-card">
        <div className="info-grid">
          <div className="info-col">
            <h3>{isDroneService ? 'Farm Land Details' : isService ? 'Service Address' : 'Shipping Address'}</h3>
            <p className="info-text" style={{ whiteSpace: 'pre-wrap' }}>{isService && (orderDetails as any).address ? (orderDetails as any).address : orderDetails.shipTo}</p>
          </div>
          {!isService && (orderDetails as any).transportName && (
            <div className="info-col">
              <h3>Tracking Details</h3>
              <p className="info-text" style={{ fontWeight: '500' }}>{(orderDetails as any).transportName}</p>
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
            <p className="info-text">{orderDetails.paymentMethod}</p>
          </div>
          <div className="info-col">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Item(s) Subtotal:</span>
              <span>{orderDetails.summary.itemsSubtotal}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>{orderDetails.summary.shipping}</span>
            </div>
            <div className="summary-row">
              <span>Marketplace Fee:</span>
              <span>{orderDetails.summary.marketplaceFee}</span>
            </div>
            <div className="summary-row">
              <span>Total:</span>
              <span>{orderDetails.summary.totalBeforePromo}</span>
            </div>
            <div className="summary-row">
              <span>Promotion Applied:</span>
              <span>{orderDetails.summary.promotionApplied}</span>
            </div>
            <div className="summary-row summary-total">
              <span>Grand Total:</span>
              <span>{orderDetails.summary.grandTotal}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="item-details-card">
        <h2 className="item-title">{orderDetails.items.length} item{orderDetails.items.length !== 1 ? 's' : ''}</h2>
        {orderDetails.items.map((item, index) => (
          <div className="item-flex" key={index} style={{ marginBottom: index !== orderDetails.items.length - 1 ? '30px' : '0' }}>
            <img src={item.image} alt={item.name} className="item-img" />
            <div className="item-info">
              <Link to="#" className="item-name">{item.name} {item.qty > 1 ? `x${item.qty}` : ''}</Link>
              <div className="item-price">{item.price}</div>
              <div className="item-return">{item.returnStatus}</div>
              {(item as any).trackingId && (
                  <div style={{ fontSize: '12px', color: '#007185', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <FaTruck style={{fontSize: '10px'}} /> {(item as any).transportName} - Tracking: {(item as any).trackingId}
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
