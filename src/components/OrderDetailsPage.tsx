import { Link, useParams } from 'react-router-dom';
import { FaSyncAlt } from 'react-icons/fa';
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
      id: 'SRV-2023-0442',
      date: 'July 20, 2026',
      total: '₹2,300',
      shipTo: 'Shyam Matam\nSame Address...',
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
          type: 'service'
        }
      ]
    },
    {
      id: 'ORD-2023-0102',
      date: 'June 05, 2026',
      total: '₹8,999',
      shipTo: 'Shyam Matam\nSame Address...',
      paymentMethod: 'Net Banking',
      summary: {
        itemsSubtotal: '₹8,999',
        shipping: '₹0.00',
        marketplaceFee: '₹0.00',
        totalBeforePromo: '₹8,999',
        promotionApplied: '₹0.00',
        grandTotal: '₹8,999'
      },
      items: [
        {
          name: 'Biometric Access Control System',
          qty: 1,
          seller: 'Assure Technologies',
          price: '₹8,999',
          image: 'https://images.unsplash.com/photo-1555861496-faa66cb20c27?w=300&q=80',
          returnStatus: 'Warranty valid until 05 June 2027',
          type: 'product'
        }
      ]
    }
  ];

  const orderDetails = allOrders.find(o => o.id === id) || allOrders[0];

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
            <h3>Shipping Address</h3>
            <p className="info-text">{orderDetails.shipTo}</p>
          </div>
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
              <div className="item-seller">Sold by: {item.seller}</div>
              <div className="item-price">{item.price}</div>
              <div className="item-return">{item.returnStatus}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
