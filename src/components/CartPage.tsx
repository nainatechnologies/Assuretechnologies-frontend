import { BASE_URL, RAZORPAY_KEY_ID } from '../services/api';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productsApi } from '../api/productsApi';
import { ordersApi } from '../api/ordersApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../api/axiosConfig';
import { SEOHead } from './SEOHead';
import { Toast } from '../utils/errorHandler';
import { type Address, type CartItemEntry } from './cart/CartTypes';
import { CartItemList } from './cart/CartItemList';
import { CartAddressSection } from './cart/CartAddressSection';
import { CartPaymentSection } from './cart/CartPaymentSection';
import { CartOrderSummary } from './cart/CartOrderSummary';
import './CartPage.css';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function CartPage() {
  const { cart, setCart, updateCartItem, removeFromCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [paymentMethod, setPaymentMethod] = useState<'Online'>('Online');
  const [needsGstInvoice, setNeedsGstInvoice] = useState(false);
  const [orderCompanyName, setOrderCompanyName] = useState('');
  const [orderGstNumber, setOrderGstNumber] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  const [products, setProducts] = useState<any[]>([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = useCallback(async (newSelectedId?: string) => {
    if (!isLoggedIn) return;
    try {
      const res = await API.get('/auth/customer/addresses');
      if (res.data.success) {
        const mapped: Address[] = res.data.data.map((a: any) => ({
          id: a.id,
          fullName: a.full_name,
          mobileNumber: a.mobile_number,
          pincode: a.pincode,
          addressLine1: a.address_line1,
          addressLine2: a.address_line2 || '',
          landmark: a.landmark || '',
          city: a.city || '',
          state: a.state,
          isDefault: Boolean(a.is_default ?? a.isDefault)
        }));
        setAddresses(mapped);
        if (newSelectedId) {
          setSelectedAddressId(newSelectedId);
        } else if (mapped.length > 0) {
          const defaultAddr = mapped.find(a => a.isDefault);
          setSelectedAddressId(prev => (mapped.some(a => a.id === prev) ? prev : (defaultAddr ? defaultAddr.id : mapped[0].id)));
        }
      }
    } catch (err) {
      console.error('Failed to load addresses', err);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await productsApi.fetchProducts();
        const formattedProducts = res.data.data.map((p: any) => {
           const base = parseFloat(p.base_price) || 0;
           const disc = parseFloat(p.discount) || 0;
           return {
             ...p,
             originalPrice: base,
             price: base - (base * (disc / 100)),
             service: p.category || 'General',
             image: p.banner ? (p.banner.startsWith('http') || p.banner.startsWith('blob:') ? p.banner : `${BASE_URL}${p.banner.startsWith('/') ? '' : '/'}${p.banner}`) : 'https://placehold.co/300x200?text=No+Image'
           };
        });
        setProducts(formattedProducts);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      let hasInvalid = false;
      const validCart = { ...cart };
      Object.keys(validCart).forEach(id => {
        if (!products.find(p => p.id === id)) {
          delete validCart[id];
          hasInvalid = true;
        }
      });
      if (hasInvalid) {
        setCart(validCart);
      }
    }
  }, [products, cart, setCart]);

  const cartItems: CartItemEntry[] = useMemo(() => {
    return Object.entries(cart).map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return { product, quantity };
    }).filter(item => item.product !== undefined);
  }, [cart, products]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cartItems]);

  const totalSavings = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + ((item.product.originalPrice - item.product.price) * item.quantity), 0);
  }, [cartItems]);

  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const updateQty = (id: string, delta: number) => {
    const next = (cart[id] || 0) + delta;
    updateCartItem(id, next);
  };

  const removeItem = (id: string) => {
    removeFromCart(id);
  };

  const handlePlaceOrderClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      setCurrentStep(2);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const submitOrder = async () => {
    try {
      setIsPlacingOrder(true);
      const selectedAddr = addresses.find(a => a.id === selectedAddressId);
      const addressString = selectedAddr ? `${selectedAddr.addressLine1}, ${selectedAddr.addressLine2}, ${selectedAddr.city}, ${selectedAddr.state} - ${selectedAddr.pincode}` : '';
      const orderPayload = {
        customer_name: selectedAddr ? selectedAddr.fullName : 'Guest',
        customer_contact: selectedAddr ? selectedAddr.mobileNumber : '',
        customer_address: addressString,
        company_name: needsGstInvoice ? orderCompanyName : undefined,
        gst_number: needsGstInvoice ? orderGstNumber : undefined,
        items: cartItems.map(ci => ({
          product_id: ci.product.id,
          qty: ci.quantity
        }))
      };
      const res = await ordersApi.createOrder(orderPayload);
      
      if (res.data && res.data.razorpayOrderId) {
        const resLoaded = await loadRazorpay();
        if (!resLoaded) {
          Toast.fire({ icon: 'error', title: 'Razorpay SDK failed to load. Please check your internet connection.' });
          setIsPlacingOrder(false);
          return;
        }

        const razorpayKey = res.data.razorpayKeyId || RAZORPAY_KEY_ID;

        const options = {
          key: razorpayKey,
          amount: Math.round(res.data.order.total_amount * 100),
          currency: 'INR',
          name: 'Assure Technologies',
          description: 'Order #' + res.data.order.order_number,
          order_id: res.data.razorpayOrderId,
          handler: async function (response: any) {
            try {
              setIsVerifyingPayment(true);
              const verifyRes = await API.post('/orders/verify-payment', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                receipt_order_number: res.data.order.order_number
              });
              if (verifyRes.data.success) {
                Toast.fire({ icon: 'success', title: 'Payment verified and order placed successfully!' });
                setCart({});
                navigate('/orders');
              }
            } catch (err: any) {
              Toast.fire({ icon: 'error', title: err?.response?.data?.message || 'Payment verification failed.' });
            } finally {
              setIsVerifyingPayment(false);
              setIsPlacingOrder(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsPlacingOrder(false);
              setIsVerifyingPayment(false);
              Toast.fire({ icon: 'warning', title: 'Payment cancelled. You can retry anytime.' });
            }
          },
          prefill: {
            name: orderPayload.customer_name,
            contact: orderPayload.customer_contact
          },
          theme: {
            color: '#4F46E5'
          }
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.on('payment.failed', function (response: any) {
          setIsPlacingOrder(false);
          setIsVerifyingPayment(false);
          Toast.fire({ icon: 'error', title: response.error?.description || 'Payment failed. Please retry.' });
        });
        paymentObject.open();
      } else {
        Toast.fire({ icon: 'error', title: 'Unable to initialize online payment. Please try again.' });
        setIsPlacingOrder(false);
      }
    } catch (err: any) {
      console.error('Failed to place order', err);
      Toast.fire({ icon: 'error', title: err.response?.data?.message || 'Failed to place order.' });
      setIsPlacingOrder(false);
      setIsVerifyingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="cart-empty-state">
        <div className="cart-empty-icon">⏳</div>
        <h2>Loading Cart...</h2>
      </div>
    );
  }

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
    <>
      <SEOHead 
        title="Shopping Cart & Secure Checkout"
        noindex={true}
      />
      <div className="cart-page">
        {/* Fullscreen Blur Overlay during Payment Verification */}
        {isVerifyingPayment && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            textAlign: 'center',
            padding: '20px'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              border: '5px solid #e0e7ff',
              borderTop: '5px solid #4F46E5',
              borderRadius: '50%',
              animation: 'cartSpin 0.9s linear infinite',
              marginBottom: '20px'
            }} />
            <h2 style={{ color: '#1e293b', fontSize: '1.4rem', fontWeight: '700', margin: '0 0 8px 0' }}>
              Verifying Your Payment...
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0, maxWidth: '400px', lineHeight: '1.5' }}>
              Please wait while we securely confirm your payment with the bank. Do not refresh or close this window.
            </p>
            <style>{`
              @keyframes cartSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

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
            {currentStep === 1 && (
              <CartItemList
                cartItems={cartItems}
                onUpdateQty={updateQty}
                onRemoveItem={removeItem}
              />
            )}

            {currentStep === 2 && (
              <CartAddressSection
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                onSelectAddressId={setSelectedAddressId}
                onDeliverHere={() => setCurrentStep(3)}
                onAddressesUpdated={fetchAddresses}
              />
            )}

            {currentStep === 3 && (
              <CartPaymentSection
                needsGstInvoice={needsGstInvoice}
                onToggleGstInvoice={setNeedsGstInvoice}
                orderCompanyName={orderCompanyName}
                onChangeCompanyName={setOrderCompanyName}
                orderGstNumber={orderGstNumber}
                onChangeGstNumber={setOrderGstNumber}
                paymentMethod={paymentMethod}
                onChangePaymentMethod={setPaymentMethod}
                onSubmitOrder={submitOrder}
                isPlacingOrder={isPlacingOrder}
                isVerifyingPayment={isVerifyingPayment}
                total={total}
              />
            )}
          </div>

          <CartOrderSummary
            itemCount={cartItems.length}
            subtotal={subtotal}
            tax={tax}
            total={total}
            totalSavings={totalSavings}
            currentStep={currentStep}
            onPlaceOrderClick={handlePlaceOrderClick}
          />
        </div>
      </div>
    </>
  );
}
