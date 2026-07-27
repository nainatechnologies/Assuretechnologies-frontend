import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus, FaShieldAlt } from 'react-icons/fa';
import { PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './CartPage.css';

interface Address {
  id: string;
  fullName: string;
  mobileNumber: string;
  pincode: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
}
export function CartPage() {
  const { cart, setCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Online'>('Online');
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 'addr-1',
      fullName: 'Sai Kumar',
      mobileNumber: '9912345678',
      pincode: '500081',
      addressLine1: '123 Tech Park, Innovation Hub',
      addressLine2: 'Madhapur',
      landmark: 'Near Cyber Towers',
      city: 'Hyderabad',
      state: 'Telangana',
    }
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('addr-1');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({});
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

  const handlePlaceOrderClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      setCurrentStep(2);
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `addr-${Date.now()}`;
    const addedAddress = { ...newAddress, id: newId } as Address;
    setAddresses(prev => [...prev, addedAddress]);
    setSelectedAddressId(newId);
    setShowNewAddressForm(false);
    setNewAddress({});
  };

  const handleDeliverHere = () => {
    setCurrentStep(3); // Proceed to payment
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
        <div className={`cart-step ${currentStep >= 1 ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Cart</span>
        </div>
        <div className="step-connector" />
        <div className={`cart-step ${currentStep >= 2 ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Address</span>
        </div>
        <div className="step-connector" />
        <div className={`cart-step ${currentStep >= 3 ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Payment</span>
        </div>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {currentStep === 1 ? (
            <>
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
            </>
          ) : currentStep === 2 ? (
            <div className="address-step-container">
              <div className="cart-items-header">
                <h2>Select Delivery Address</h2>
              </div>
              <div className="address-list">
                {addresses.map(addr => (
                  <div key={addr.id} className={`address-card ${selectedAddressId === addr.id ? 'selected' : ''}`}>
                    <label className="address-radio-label">
                      <input
                        type="radio"
                        name="delivery_address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                      />
                      <div className="address-details">
                        <span className="address-name">{addr.fullName} <span className="address-type-tag">Home</span></span>
                        <span className="address-phone">{addr.mobileNumber}</span>
                        <span className="address-full">
                          {addr.addressLine1}, {addr.addressLine2}, {addr.landmark ? `${addr.landmark}, ` : ''}
                          {addr.city}, {addr.state} - <span className="address-pin">{addr.pincode}</span>
                        </span>

                        {selectedAddressId === addr.id && (
                          <button className="btn-deliver-here" onClick={handleDeliverHere}>
                            Deliver Here
                          </button>
                        )}
                      </div>
                    </label>
                  </div>
                ))}

                {!showNewAddressForm ? (
                  <div className="add-new-address-btn" onClick={() => setShowNewAddressForm(true)}>
                    <FaPlus className="add-icon" /> Add a new address
                  </div>
                ) : (
                  <div className="new-address-form-container">
                    <h3>Add a new address</h3>
                    <form onSubmit={handleAddressSubmit} className="new-address-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Full Name</label>
                          <input required type="text" value={newAddress.fullName || ''} onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>Mobile Number</label>
                          <input required type="tel" value={newAddress.mobileNumber || ''} onChange={e => setNewAddress({ ...newAddress, mobileNumber: e.target.value })} />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Pincode</label>
                          <input required type="text" value={newAddress.pincode || ''} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>Town/City</label>
                          <input required type="text" value={newAddress.city || ''} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Flat, House no., Building, Company, Apartment</label>
                        <input required type="text" value={newAddress.addressLine1 || ''} onChange={e => setNewAddress({ ...newAddress, addressLine1: e.target.value })} />
                      </div>

                      <div className="form-group">
                        <label>Area, Street, Sector, Village</label>
                        <input required type="text" value={newAddress.addressLine2 || ''} onChange={e => setNewAddress({ ...newAddress, addressLine2: e.target.value })} />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Landmark</label>
                          <input type="text" value={newAddress.landmark || ''} onChange={e => setNewAddress({ ...newAddress, landmark: e.target.value })} placeholder="E.g. near apollo hospital" />
                        </div>
                        <div className="form-group">
                          <label>State</label>
                          <select required value={newAddress.state || ''} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}>
                            <option value="" disabled>Select State</option>
                            <option value="Andhra Pradesh">Andhra Pradesh</option>
                            <option value="Telangana">Telangana</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="btn-save-address">Save and Deliver Here</button>
                        <button type="button" className="btn-cancel-address" onClick={() => setShowNewAddressForm(false)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="payment-step-container">
              <div className="cart-items-header">
                <h2>Payment Options</h2>
              </div>
              <div className="payment-options-list">
                <label className={`payment-method-card ${paymentMethod === 'Online' ? 'selected' : ''}`}>
                  <div className="payment-method-radio">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'Online'}
                      onChange={() => setPaymentMethod('Online')}
                    />
                    <div className="payment-method-info">
                      <span className="payment-method-title">Online Payment</span>
                      <span className="payment-method-desc">Pay via UPI, Credit/Debit Card, or Netbanking</span>
                    </div>
                  </div>
                  {paymentMethod === 'Online' && (
                    <div className="payment-action-area">
                      <button className="btn-confirm-order" onClick={() => alert('Order Placed Successfully via Online Payment!')}>
                        Pay ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })} & Place Order
                      </button>
                    </div>
                  )}
                </label>

                <label className={`payment-method-card ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                  <div className="payment-method-radio">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                    />
                    <div className="payment-method-info">
                      <span className="payment-method-title">Cash on Delivery (COD)</span>
                      <span className="payment-method-desc">Pay at your doorstep when receiving the order</span>
                    </div>
                  </div>
                  {paymentMethod === 'COD' && (
                    <div className="payment-action-area">
                      <button className="btn-confirm-order" onClick={() => alert('Order Placed Successfully with COD!')}>
                        Confirm Order
                      </button>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}
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

          {currentStep === 1 && (
            <button className="btn-checkout" onClick={handlePlaceOrderClick}>
              Place Order
            </button>
          )}

          <div className="cart-trust">
            <FaShieldAlt className="cart-trust-icon" />
            <span>Safe and Secure Payments. Easy returns. 100% Authentic products.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
