import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus, FaShieldAlt } from 'react-icons/fa';
import { PRODUCTS } from '../data/products';
import './CartPage.css';

interface CartPageProps {
  cart: Record<string, number>;
  setCart: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export function CartPage({ cart, setCart }: CartPageProps) {
  const cartItems = useMemo(() => {
    return Object.entries(cart).map(([productId, quantity]) => {
      const product = PRODUCTS.find(p => p.id === productId);
      return { product, quantity };
    }).filter(item => item.product !== undefined);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.product!.price * item.quantity), 0);
  }, [cartItems]);

  const totalSavings = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + ((item.product!.originalPrice - item.product!.price) * item.quantity), 0);
  }, [cartItems]);

  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const updateQty = (id: string, delta: number) => {
    setCart(prev => {
      const next = (prev[id] || 0) + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const removeItem = (id: string) => {
    setCart(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-state">
        <div className="cart-empty-icon">🛒</div>
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added any products to your cart yet.</p>
        <Link to="/order-products" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Step Indicator */}
      <div className="cart-steps">
        <div className="cart-step active">
          <span className="step-number">1</span>
          <span className="step-label">Cart</span>
        </div>
        <div className="step-connector" />
        <div className="cart-step">
          <span className="step-number">2</span>
          <span className="step-label">Address</span>
        </div>
        <div className="step-connector" />
        <div className="cart-step">
          <span className="step-number">3</span>
          <span className="step-label">Payment</span>
        </div>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          <div className="cart-items-header">
            <h2>My Cart ({cartItems.length})</h2>
          </div>

          {cartItems.map(({ product, quantity }) => (
            <div key={product!.id} className="cart-item">
              <div className="cart-item-img">
                <img src={product!.image} alt={product!.name} />
              </div>
              <div className="cart-item-info">
                <span className="cart-item-cat">{product!.service}</span>
                <h3 className="cart-item-name">{product!.name}</h3>
                <div className="cart-item-price-row">
                  <span className="cart-item-price">₹{product!.price.toLocaleString('en-IN')}</span>
                  {product!.originalPrice > product!.price && (
                    <>
                      <span className="cart-item-original">₹{product!.originalPrice.toLocaleString('en-IN')}</span>
                      <span className="cart-item-discount">{product!.discount}% off</span>
                    </>
                  )}
                </div>

                <div className="cart-item-controls">
                  <div className="cart-qty-controls">
                    <button onClick={() => updateQty(product!.id, -1)} aria-label="Decrease quantity">
                      <FaMinus size={10} />
                    </button>
                    <span className="cart-qty-value">{quantity}</span>
                    <button onClick={() => updateQty(product!.id, 1)} aria-label="Increase quantity">
                      <FaPlus size={10} />
                    </button>
                  </div>

                  <button
                    className="cart-item-remove"
                    onClick={() => removeItem(product!.id)}
                    aria-label="Remove item"
                  >
                    <FaTrash size={12} /> Remove
                  </button>
                </div>
              </div>
              <div className="cart-item-total">
                ₹{(product!.price * quantity).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3 className="cart-summary-title">Price Details</h3>
          <div className="summary-divider" />

          <div className="summary-row">
            <span>Price ({cartItems.length} items)</span>
            <span>₹{(subtotal + totalSavings).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="summary-row discount">
            <span>Discount</span>
            <span>−₹{totalSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="summary-row">
            <span>Tax (18% GST)</span>
            <span>₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="summary-row">
            <span>Delivery</span>
            <span className="free-delivery">FREE</span>
          </div>

          <div className="summary-divider" />

          <div className="summary-row total-row">
            <span>Total Amount</span>
            <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          {totalSavings > 0 && (
            <div className="savings-banner">
              You will save ₹{totalSavings.toLocaleString('en-IN')} on this order
            </div>
          )}

          <button className="btn-checkout">
            Place Order
          </button>

          <div className="cart-trust">
            <FaShieldAlt className="cart-trust-icon" />
            <span>Safe and Secure Payments. Easy returns. 100% Authentic products.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
