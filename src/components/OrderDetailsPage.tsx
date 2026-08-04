import { useState } from 'react';
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
        shipping: 'Applicable',
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
      },
      extraItems: [
        { description: 'Additional wiring (10m)', qty: 1, status: 'pending' },
        { description: 'Extra camera mount', qty: 2, status: 'pending' }
      ]
    },
    {
      id: 'ORD-2026-0001',
      date: 'July 25, 2026',
      total: '₹1,50,000',
      shipTo: 'Shyam Matam\nSame Address...',
      paymentMethod: 'Net Banking',
      summary: {
        itemsSubtotal: '₹1,50,000',
        shipping: 'Applicable',
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
        prebookingPaid: '₹500',
        grandTotal: '₹4,500',
        balanceDue: '₹4,000'
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

  let orderDetails = allOrders.find(o => o.id === id);
  if (!orderDetails) {
    const isServiceType = id?.startsWith('SRV') || id?.startsWith('DRN');
    orderDetails = isServiceType ? { ...allOrders[1], id: id || 'SRV-0000' } : { ...allOrders[0], id: id || 'ORD-0000' };
  }

  const isService = orderDetails.id.startsWith('SRV') || orderDetails.id.startsWith('DRN');
  const isDroneService = orderDetails.id.startsWith('DRN');

  // Add local state to handle extra items approval
  const [extraItems, setExtraItems] = useState((orderDetails as any).extraItems || []);

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
          <button className="invoice-btn" onClick={handleInvoiceDownload}>Invoice ⌄</button>
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
            <p className="info-text" style={{ whiteSpace: 'pre-wrap' }}>{isService && (orderDetails as any).address ? (orderDetails as any).address : orderDetails.shipTo}</p>
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
