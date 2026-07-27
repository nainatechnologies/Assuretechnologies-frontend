import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSyncAlt, FaCheckCircle, FaTruck, FaClock, FaTimesCircle, FaBoxOpen, FaUndo, FaSpinner } from 'react-icons/fa';
import { ordersApi } from '../api/ordersApi';
import { useAuth } from '../context/AuthContext';
import './OrdersPage.css';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Delivered': return <FaCheckCircle />;
    case 'Completed': return <FaCheckCircle />;
    case 'Out for Delivery': return <FaTruck />;
    case 'Processing': return <FaClock />;
    case 'Pending': return <FaClock />;
    case 'Accepted': return <FaClock />;
    case 'Assigned': return <FaClock />;
    case 'In Progress': return <FaSyncAlt className="spin" />;
    case 'Awaiting Approval': return <FaClock />;
    case 'Cancelled': return <FaTimesCircle />;
    case 'Shipped': return <FaBoxOpen />;
    case 'Refunded': return <FaUndo />;
    default: return null;
  }
};

export function OrdersPage() {
  const { userName } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productFilter, setProductFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');

  useEffect(() => {
    ordersApi.fetchOrders().then(res => {
      setOrders(res.data);
      setLoading(false);
    });
  }, []);

  const handleInvoiceDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('Invoice download started...');
  };

  const handleCancelOrder = (orderId: string) => {
    ordersApi.cancelOrder(orderId).then(() => {
      alert(`Order ${orderId} cancelled successfully!`);
      // Update local state to reflect cancellation
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
    });
  };

  const handleAcceptWork = (orderId: string) => {
    alert(`Service ${orderId} work accepted!`);
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Completed' } : o));
  };

  const renderOrder = (order: any) => {
    const isService = order.type === 'service';
    const canCancel = isService
      ? ['Pending', 'Accepted'].includes(order.status)
      : !['Out for Delivery', 'Delivered', 'Cancelled', 'Refunded'].includes(order.status);

    const canAcceptWork = isService && order.status === 'Awaiting Approval';

    return (
      <div key={order.id} className="order-card">
        <div className={`order-header header-solid status-solid-${order.status.replace(/\s+/g, '-').toLowerCase()}`}>
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
              <span className="order-header-value" style={{ color: '#007185', cursor: 'pointer' }}>{userName || order.shipTo} ⌄</span>
            </div>
          </div>
          <div className="order-header-right">
            <div className="order-header-col">
              <span className="order-header-label" style={{ color: '#565959', fontWeight: '400' }}>ORDER # {order.id}</span>
              <div className="order-header-links">
                <Link to={`/orders/${order.id}`} className="order-link">View order details</Link>
                <span style={{ color: '#d5d9d9' }}>|</span>
                <button className="order-link" onClick={handleInvoiceDownload}>Invoice ⌄</button>
                {canCancel && (
                  <>
                    <span style={{ color: '#d5d9d9' }}>|</span>
                    <button
                      className="order-link"
                      style={{ color: '#c5221f' }}
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      Cancel {isService ? 'service' : 'order'}
                    </button>
                  </>
                )}
                {canAcceptWork && (
                  <>
                    <span style={{ color: '#d5d9d9' }}>|</span>
                    <button
                      className="order-link"
                      style={{ color: '#10b981', fontWeight: 'bold' }}
                      onClick={() => handleAcceptWork(order.id)}
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
            {order.items?.map((item: any, index: number) => (
              <div key={index} className="order-item" style={{ marginBottom: index === order.items.length - 1 ? 0 : '20px' }}>
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
          <div className="order-body-status">
            <span className={`order-status-badge status-solid-${order.status.replace(/\s+/g, '-').toLowerCase()}`}>
              {getStatusIcon(order.status)}
              <span>{order.status}</span>
            </span>
          </div>
        </div>
      </div>
    );
  };

  const productOrders = orders.filter(o => o.type === 'product' && (productFilter === 'All' || o.status === productFilter));
  const serviceOrders = orders.filter(o => o.type === 'service' && (serviceFilter === 'All' || o.status === serviceFilter));

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
                <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="orders-filter">
                  <option value="All">All Statuses</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
              <div className="orders-list">
                {productOrders.length > 0 ? productOrders.map(renderOrder) : <p className="no-orders-msg">No product orders found.</p>}
              </div>
            </div>

            <div className="orders-column">
              <div className="orders-column-header">
                <h2>Service Orders</h2>
                <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} className="orders-filter">
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
                {serviceOrders.length > 0 ? serviceOrders.map(renderOrder) : <p className="no-orders-msg">No service orders found.</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
