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
    case 'Rejected': return <FaTimesCircle />;
    case 'Shipped': return <FaBoxOpen />;
    case 'Refunded': return <FaUndo />;
    default: return null;
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

  
  useEffect(() => {
    ordersApi.fetchOrders().then(res => {
      const mappedOrders = res.data.map((o: any) => ({
        id: o.order_number,
        rawId: o.id,
        date: new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        total: `₹${parseFloat(o.total_amount).toLocaleString('en-IN')}`,
        shipTo: o.customer_name || (o.customer ? o.customer.full_name : 'Guest'),
        address: o.customer_address || 'No address provided',
        type: 'product', // we assume product for now
        status: o.status === 'NEW' ? 'Pending' : o.status === 'ACCEPTED' ? 'Accepted' : o.status === 'OUT_FOR_DELIVERY' ? 'Out for Delivery' : o.status === 'COMPLETED' ? 'Delivered' : o.status === 'CANCELLED' ? 'Cancelled' : o.status,
        transportName: o.transport_name,
        trackingId: o.tracking_id,
        trackingUrl: o.tracking_url,
        items: o.items ? o.items.map((i: any) => ({
          name: i.product ? i.product.name : 'Unknown Product',
          qty: i.qty,
          image: 'https://placehold.co/300x200?text=Product',
          returnStatus: 'Processing',
          transportName: i.transport_name,
          trackingId: i.tracking_id,
          trackingUrl: i.tracking_url
        })) : []
      }));
      setOrders(mappedOrders);
      setLoading(false);
    }).catch(err => {
      console.error(err);
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
    }).catch(err => {
      console.error(err);
      alert('Failed to cancel order: ' + (err.response?.data?.message || err.message));
    });
  };

  const handleAcceptWork = (orderId: string) => {
    alert(`Service ${orderId} work accepted!`);
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Completed' } : o));
  };

  const renderOrder = (order: any, index: number) => {
    const isService = order.type === 'service';
    const canCancel = isService
      ? ['Pending', 'Accepted'].includes(order.status)
      : !['Out for Delivery', 'Delivered', 'Cancelled', 'Rejected'].includes(order.status);

    const canAcceptWork = isService && order.status === 'Awaiting Approval';

    return (
      <div key={`${order.id}-${index}`} className="order-card">
        <div className={`order-header header-solid status-solid-${order.status.replace(/\s+/g, '-').toLowerCase()}`}>
          <div className="order-header-left">
            <div className="order-header-col">
              <span className="order-header-label">{isService ? getServiceDateLabel(order.status) : 'Order Placed'}</span>
              <span className="order-header-value">{isService && order.scheduledDate ? `${order.scheduledDate}, ${order.scheduledTime}` : order.date}</span>
            </div>
            {!isService && (
              <div className="order-header-col">
                <span className="order-header-label">Total</span>
                <span className="order-header-value">{order.total}</span>
              </div>
            )}
            <div className="order-header-col ship-to-container">
              <span className="order-header-label">Ship To</span>
              <span className="order-header-value" style={{ color: '#007185', cursor: 'pointer' }}>{userName || order.shipTo} ⌄</span>
              <div className="ship-to-tooltip">
                <span className="ship-to-tooltip-name">{userName || order.shipTo}</span>
                {order.address}
              </div>
            </div>
          </div>
          <div className="order-header-right">
            <div className="order-header-col">
              <span className="order-header-label" style={{ color: '#565959', fontWeight: '400', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                ORDER # {order.id}
                {order.isDroneService && <span style={{ background: 'rgba(255, 255, 255, 0.25)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.5)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>DRONE SERVICE</span>}
              </span>
              <div className="order-header-links">
                <Link to={`/orders/${order.id}`} className="order-link">View order details</Link>
                
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
                    {item.trackingId && (
                      <span style={{ fontSize: '12px', color: '#007185', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <FaTruck style={{fontSize: '10px'}} /> {item.transportName} - Tracking: {item.trackingId}
                      </span>
                    )}
                    <span className="order-item-return" style={{ whiteSpace: 'pre-line', marginTop: '2px' }}>{item.returnStatus}</span>
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
            {isService && (
              <div style={{ marginTop: '12px', fontSize: '13px' }}>
                <strong style={{ color: '#565959' }}>Payment Status: </strong>
                {order.paymentStatus === 'Completed' ? (
                  <span style={{ color: '#166534', fontWeight: 'bold' }}>Completed</span>
                ) : (
                  <span style={{ color: '#b45309', fontWeight: 'bold' }}>Pending</span>
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
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Cancelled">Cancelled</option>
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
