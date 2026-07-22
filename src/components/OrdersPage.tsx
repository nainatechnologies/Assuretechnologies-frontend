import { Link } from 'react-router-dom';
import { FaSyncAlt } from 'react-icons/fa';
import './OrdersPage.css';

export function OrdersPage() {
  const handleInvoiceDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('Invoice download started...');
  };

  const orders = [
    {
      id: 'ORD-2023-0891',
      date: 'July 15, 2026',
      total: '₹16,500',
      shipTo: 'Shyam Matam',
      type: 'product',
      items: [
        {
          name: '4K Security Camera',
          qty: 2,
          image: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=300&q=80',
          returnStatus: 'Warranty valid until 15 July 2027',
        },
        {
          name: 'Smart Video Doorbell',
          qty: 1,
          image: 'https://images.unsplash.com/photo-1555861496-faa66cb20c27?w=300&q=80',
          returnStatus: 'Warranty valid until 15 July 2027',
        }
      ]
    },
    {
      id: 'SRV-2023-0442',
      date: 'July 20, 2026',
      total: '₹2,300',
      shipTo: 'Shyam Matam',
      type: 'service',
      items: [
        {
          name: 'CCTV Installation Service',
          qty: 1,
          image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=300&q=80',
          returnStatus: 'Service scheduled for 25 July 2026',
        },
        {
          name: 'Network Cabling',
          qty: 1,
          image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=300&q=80',
          returnStatus: 'Service scheduled for 25 July 2026',
        }
      ]
    },
    {
      id: 'ORD-2023-0102',
      date: 'June 05, 2026',
      total: '₹8,999',
      shipTo: 'Shyam Matam',
      type: 'product',
      items: [
        {
          name: 'Biometric Access Control System',
          qty: 1,
          image: 'https://images.unsplash.com/photo-1555861496-faa66cb20c27?w=300&q=80',
          returnStatus: 'Warranty valid until 05 June 2027',
        }
      ]
    }
  ];

  return (
    <div className="orders-page-container">
      <h1 className="orders-page-title">Your Orders</h1>
      
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-header-left">
                <div className="order-header-col">
                  <span className="order-header-label">Order Placed</span>
                  <span className="order-header-value">{order.date}</span>
                </div>
                <div className="order-header-col">
                  <span className="order-header-label">Total</span>
                  <span className="order-header-value">{order.total}</span>
                </div>
                <div className="order-header-col">
                  <span className="order-header-label">Ship To</span>
                  <span className="order-header-value" style={{color: '#007185', cursor: 'pointer'}}>{order.shipTo} ⌄</span>
                </div>
              </div>
              <div className="order-header-right">
                <div className="order-header-col">
                  <span className="order-header-label" style={{color: '#565959', fontWeight: '400'}}>ORDER # {order.id}</span>
                  <div className="order-header-links">
                    <Link to={`/orders/${order.id}`} className="order-link">View order details</Link>
                    <span style={{ color: '#d5d9d9' }}>|</span>
                    <button className="order-link" onClick={handleInvoiceDownload}>Invoice ⌄</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-body">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="order-item-left">
                    <img src={item.image} alt={item.name} className="order-item-image" style={{ objectFit: 'cover' }} />
                    <div className="order-item-details">
                      <Link to={`/orders/${order.id}`} className="order-item-name">{item.name} {item.qty > 1 ? `x${item.qty}` : ''}</Link>
                      <span className="order-item-return" style={{ whiteSpace: 'pre-line' }}>{item.returnStatus}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
