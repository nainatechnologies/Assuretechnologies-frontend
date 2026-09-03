import { BASE_URL } from '../services/api';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus, FaShieldAlt, FaEdit, FaCheckCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { productsApi } from '../api/productsApi';
import { ordersApi } from '../api/ordersApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../api/axiosConfig';
import { SEOHead } from './SEOHead';
import './CartPage.css';
import { Toast } from '../utils/errorHandler';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StateSelect } from './StateSelect';


declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  isDefault?: boolean;
}

const addressFormSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Full name must be at least 3 characters')
    .max(100, 'Full name is too long'),
  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  pincode: z
    .string()
    .regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City name is too long'),
  addressLine1: z
    .string()
    .min(5, 'Flat/House No. must be at least 5 characters')
    .max(150, 'Address is too long'),
  addressLine2: z
    .string()
    .max(150, 'Address line 2 is too long')
    .optional(),
  landmark: z
    .string()
    .max(100, 'Landmark is too long')
    .optional(),
  state: z
    .string()
    .min(2, 'Please select a state')
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

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
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const {
    register: registerAddress,
    handleSubmit: handleAddressFormSubmit,
    reset: resetAddressForm,
    setValue: setAddressValue,
    watch: watchAddress,
    clearErrors: clearAddressErrors,
    formState: { errors: addressErrors, isSubmitting: isSavingAddress }
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      fullName: '',
      mobileNumber: '',
      pincode: '',
      city: '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      state: ''
    }
  });

  const selectedCartState = watchAddress('state');

  const [products, setProducts] = useState<any[]>([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = useCallback(async () => {
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
        if (mapped.length > 0) {
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

  const cartItems = useMemo(() => {
    return Object.entries(cart).map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return { product, quantity };
    }).filter(item => item.product !== undefined);
  }, [cart, products]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.product!.price * item.quantity), 0);
  }, [cartItems]);

  const totalSavings = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + ((item.product!.originalPrice - item.product!.price) * item.quantity), 0);
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

  const onSaveAddress = async (data: AddressFormValues) => {
    try {
      const payload = {
        full_name: data.fullName,
        mobile_number: data.mobileNumber,
        pincode: data.pincode,
        address_line1: data.addressLine1,
        address_line2: data.addressLine2 || '',
        landmark: data.landmark || '',
        city: data.city,
        state: data.state
      };

      if (editingAddressId) {
        // Edit existing address
        const res = await API.put(`/auth/customer/addresses/${editingAddressId}`, payload);
        if (res.data.success) {
          setEditingAddressId(null);
          resetAddressForm();
          Toast.fire({ icon: 'success', title: 'Address updated successfully!' });
          await fetchAddresses();
        }
      } else {
        // Add new address
        const res = await API.post('/auth/customer/addresses', {
          ...payload,
          is_default: addresses.length === 0
        });
        if (res.data.success) {
          setShowNewAddressForm(false);
          resetAddressForm();
          Toast.fire({ icon: 'success', title: 'Address saved successfully!' });
          await fetchAddresses();
          if (res.data.data?.id) setSelectedAddressId(res.data.data.id);
        }
      }
    } catch (err: any) {
      console.error('Failed to save address', err);
      Toast.fire({ icon: 'error', title: err.response?.data?.message || 'Failed to save address.' });
    }
  };

  const handleStartEditAddress = (addr: Address) => {
    setShowNewAddressForm(false);
    setEditingAddressId(addr.id);
    resetAddressForm({
      fullName: addr.fullName,
      mobileNumber: addr.mobileNumber,
      pincode: addr.pincode,
      city: addr.city,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      landmark: addr.landmark || '',
      state: addr.state
    });
  };

  const handleCancelEditAddress = () => {
    setEditingAddressId(null);
    resetAddressForm();
  };

  const handleDeleteAddress = async (addressId: string) => {
    const result = await Swal.fire({
      title: 'Delete Address?',
      text: 'Are you sure you want to remove this delivery address?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it'
    });

    if (result.isConfirmed) {
      try {
        const res = await API.delete(`/auth/customer/addresses/${addressId}`);
        if (res.data.success) {
          Toast.fire({ icon: 'success', title: 'Address deleted successfully!' });
          if (editingAddressId === addressId) {
            setEditingAddressId(null);
            resetAddressForm();
          }
          await fetchAddresses();
        }
      } catch (err: any) {
        console.error('Failed to delete address', err);
        Toast.fire({ icon: 'error', title: err.response?.data?.message || 'Failed to delete address.' });
      }
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const res = await API.patch(`/auth/customer/addresses/${addressId}/default`);
      if (res.data.success) {
        Toast.fire({ icon: 'success', title: 'Default address updated!' });
        setSelectedAddressId(addressId);
        await fetchAddresses();
      }
    } catch (err: any) {
      console.error('Failed to set default address', err);
      Toast.fire({ icon: 'error', title: err.response?.data?.message || 'Failed to update default address.' });
    }
  };

  const handleCancelAddress = () => {
    setShowNewAddressForm(false);
    resetAddressForm();
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

        const razorpayKey = res.data.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TUJt0fwUv206Vf';

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
            } catch (err) {
              Toast.fire({ icon: 'error', title: 'Payment verification failed.' });
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

  const handleDeliverHere = () => {
    setCurrentStep(3); // Proceed to payment
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
                {addresses.map(addr => {
                  const isEditingThis = editingAddressId === addr.id;
                  const isSelected = selectedAddressId === addr.id;

                  return (
                    <div key={addr.id} className={`address-card ${isSelected ? 'selected' : ''} ${isEditingThis ? 'is-editing' : ''}`}>
                      {isEditingThis ? (
                        <div className="edit-address-form-container">
                          <div className="address-form-header">
                            <h3>Edit Address</h3>
                            <button type="button" className="btn-close-edit" onClick={handleCancelEditAddress} aria-label="Cancel editing">
                              ✕
                            </button>
                          </div>
                          <form className="new-address-form" onSubmit={handleAddressFormSubmit(onSaveAddress)} noValidate>
                            <div className="form-row">
                              <div className="form-group">
                                <label>Full Name</label>
                                <input
                                  type="text"
                                  className={addressErrors.fullName ? 'input-error' : ''}
                                  placeholder="Full Name"
                                  maxLength={100}
                                  {...registerAddress('fullName')}
                                />
                                {addressErrors.fullName && <span className="error-text">{addressErrors.fullName.message}</span>}
                              </div>
                              <div className="form-group">
                                <label>Mobile Number</label>
                                <input
                                  type="tel"
                                  className={addressErrors.mobileNumber ? 'input-error' : ''}
                                  placeholder="10-digit Mobile Number"
                                  maxLength={10}
                                  {...registerAddress('mobileNumber')}
                                />
                                {addressErrors.mobileNumber && <span className="error-text">{addressErrors.mobileNumber.message}</span>}
                              </div>
                            </div>

                            <div className="form-row">
                              <div className="form-group">
                                <label>Pincode</label>
                                <input
                                  type="text"
                                  className={addressErrors.pincode ? 'input-error' : ''}
                                  placeholder="6-digit Pincode"
                                  maxLength={6}
                                  {...registerAddress('pincode')}
                                />
                                {addressErrors.pincode && <span className="error-text">{addressErrors.pincode.message}</span>}
                              </div>
                              <div className="form-group">
                                <label>Town/City</label>
                                <input
                                  type="text"
                                  className={addressErrors.city ? 'input-error' : ''}
                                  placeholder="City / Town"
                                  maxLength={50}
                                  {...registerAddress('city')}
                                />
                                {addressErrors.city && <span className="error-text">{addressErrors.city.message}</span>}
                              </div>
                            </div>

                            <div className="form-group">
                              <label>Flat, House no., Building, Company, Apartment</label>
                              <input
                                type="text"
                                className={addressErrors.addressLine1 ? 'input-error' : ''}
                                placeholder="Flat / House No. / Building"
                                maxLength={150}
                                {...registerAddress('addressLine1')}
                              />
                              {addressErrors.addressLine1 && <span className="error-text">{addressErrors.addressLine1.message}</span>}
                            </div>

                            <div className="form-group">
                              <label>Area, Street, Sector, Village</label>
                              <input
                                type="text"
                                className={addressErrors.addressLine2 ? 'input-error' : ''}
                                placeholder="Area / Street / Sector"
                                maxLength={150}
                                {...registerAddress('addressLine2')}
                              />
                              {addressErrors.addressLine2 && <span className="error-text">{addressErrors.addressLine2.message}</span>}
                            </div>

                            <div className="form-row">
                              <div className="form-group">
                                <label>Landmark (Optional)</label>
                                <input
                                  type="text"
                                  className={addressErrors.landmark ? 'input-error' : ''}
                                  placeholder="E.g. near Apollo Hospital"
                                  maxLength={100}
                                  {...registerAddress('landmark')}
                                />
                                {addressErrors.landmark && <span className="error-text">{addressErrors.landmark.message}</span>}
                              </div>
                              <div className="form-group">
                                <label>State</label>
                                <StateSelect
                                  value={selectedCartState}
                                  onChange={(val) => {
                                    setAddressValue('state', val, { shouldValidate: true });
                                    if (val) clearAddressErrors('state');
                                  }}
                                  error={Boolean(addressErrors.state)}
                                  placeholder="Select State"
                                />
                                {addressErrors.state && <span className="error-text">{addressErrors.state.message}</span>}
                              </div>
                            </div>

                            <div className="form-actions">
                              <button type="submit" className="btn-save-address" disabled={isSavingAddress}>
                                {isSavingAddress ? 'Saving...' : 'Save Changes'}
                              </button>
                              <button type="button" className="btn-cancel-address" onClick={handleCancelEditAddress}>
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      ) : (
                        <div className="address-card-inner">
                          <label className="address-radio-label">
                            <input
                              type="radio"
                              name="delivery_address"
                              checked={isSelected}
                              onChange={() => setSelectedAddressId(addr.id)}
                            />
                            <div className="address-details">
                              <div className="address-title-row">
                                <span className="address-name">{addr.fullName}</span>
                                {addr.isDefault && <span className="address-type-tag is-default">DEFAULT</span>}
                              </div>

                              <span className="address-phone">{addr.mobileNumber}</span>
                              <span className="address-full">
                                {[addr.addressLine1, addr.addressLine2, addr.landmark, addr.city, addr.state].filter(Boolean).join(', ')} - <span className="address-pin">{addr.pincode}</span>
                              </span>

                              <div className="address-card-footer">
                                <div className="address-actions-bar">
                                  <button
                                    type="button"
                                    className="btn-address-action btn-edit-address"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleStartEditAddress(addr);
                                    }}
                                  >
                                    <FaEdit size={13} /> Edit
                                  </button>

                                  <button
                                    type="button"
                                    className="btn-address-action btn-delete-address"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDeleteAddress(addr.id);
                                    }}
                                  >
                                    <FaTrash size={12} /> Delete
                                  </button>

                                  {!addr.isDefault && (
                                    <button
                                      type="button"
                                      className="btn-address-action btn-default-address"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSetDefaultAddress(addr.id);
                                      }}
                                    >
                                      <FaCheckCircle size={13} /> Set as Default
                                    </button>
                                  )}
                                </div>

                                {isSelected && (
                                  <button
                                    type="button"
                                    className="btn-deliver-here"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDeliverHere();
                                    }}
                                  >
                                    Deliver Here
                                  </button>
                                )}
                              </div>
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}

                {!showNewAddressForm ? (
                  <div className="add-new-address-btn" onClick={() => setShowNewAddressForm(true)}>
                    <FaPlus className="add-icon" /> Add a new address
                  </div>
                ) : (
                  <div className="new-address-form-container">
                    <h3>Add a New Address</h3>
                    <form className="new-address-form" onSubmit={handleAddressFormSubmit(onSaveAddress)} noValidate>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Full Name</label>
                          <input
                            type="text"
                            className={addressErrors.fullName ? 'input-error' : ''}
                            placeholder="Full Name"
                            maxLength={100}
                            {...registerAddress('fullName')}
                          />
                          {addressErrors.fullName && <span className="error-text">{addressErrors.fullName.message}</span>}
                        </div>
                        <div className="form-group">
                          <label>Mobile Number</label>
                          <input
                            type="tel"
                            className={addressErrors.mobileNumber ? 'input-error' : ''}
                            placeholder="10-digit Mobile Number"
                            maxLength={10}
                            {...registerAddress('mobileNumber')}
                          />
                          {addressErrors.mobileNumber && <span className="error-text">{addressErrors.mobileNumber.message}</span>}
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Pincode</label>
                          <input
                            type="text"
                            className={addressErrors.pincode ? 'input-error' : ''}
                            placeholder="6-digit Pincode"
                            maxLength={6}
                            {...registerAddress('pincode')}
                          />
                          {addressErrors.pincode && <span className="error-text">{addressErrors.pincode.message}</span>}
                        </div>
                        <div className="form-group">
                          <label>Town/City</label>
                          <input
                            type="text"
                            className={addressErrors.city ? 'input-error' : ''}
                            placeholder="City / Town"
                            maxLength={50}
                            {...registerAddress('city')}
                          />
                          {addressErrors.city && <span className="error-text">{addressErrors.city.message}</span>}
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Flat, House no., Building, Company, Apartment</label>
                        <input
                          type="text"
                          className={addressErrors.addressLine1 ? 'input-error' : ''}
                          placeholder="Flat / House No. / Building"
                          maxLength={150}
                          {...registerAddress('addressLine1')}
                        />
                        {addressErrors.addressLine1 && <span className="error-text">{addressErrors.addressLine1.message}</span>}
                      </div>

                      <div className="form-group">
                        <label>Area, Street, Sector, Village</label>
                        <input
                          type="text"
                          className={addressErrors.addressLine2 ? 'input-error' : ''}
                          placeholder="Area / Street / Sector"
                          maxLength={150}
                          {...registerAddress('addressLine2')}
                        />
                        {addressErrors.addressLine2 && <span className="error-text">{addressErrors.addressLine2.message}</span>}
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Landmark (Optional)</label>
                          <input
                            type="text"
                            className={addressErrors.landmark ? 'input-error' : ''}
                            placeholder="E.g. near Apollo Hospital"
                            maxLength={100}
                            {...registerAddress('landmark')}
                          />
                          {addressErrors.landmark && <span className="error-text">{addressErrors.landmark.message}</span>}
                        </div>
                        <div className="form-group">
                          <label>State</label>
                          <StateSelect
                            value={selectedCartState}
                            onChange={(val) => {
                              setAddressValue('state', val, { shouldValidate: true });
                              if (val) clearAddressErrors('state');
                            }}
                            error={Boolean(addressErrors.state)}
                            placeholder="Select State"
                          />
                          {addressErrors.state && <span className="error-text">{addressErrors.state.message}</span>}
                        </div>
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="btn-save-address" disabled={isSavingAddress}>
                          {isSavingAddress ? 'Saving...' : 'Save and Deliver Here'}
                        </button>
                        <button type="button" className="btn-cancel-address" onClick={handleCancelAddress}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="payment-step-container">
              <div className="cart-items-header" style={{ marginBottom: '16px' }}>
                <h2>Billing Details</h2>
              </div>
              <div style={{ padding: '0 24px 24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: needsGstInvoice ? '16px' : '0' }}>
                  <input 
                    type="checkbox" 
                    checked={needsGstInvoice}
                    onChange={(e) => setNeedsGstInvoice(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <strong>I am a business and require a GST Invoice</strong>
                </label>

                {needsGstInvoice && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Company Name</label>
                      <input 
                        type="text" 
                        required={needsGstInvoice}
                        minLength={2}
                        maxLength={100}
                        value={orderCompanyName} 
                        onChange={e => setOrderCompanyName(e.target.value)} 
                        placeholder="Enter your registered company name" 
                      />
                    </div>
                    <div className="form-group">
                      <label>GST Number</label>
                      <input 
                        type="text" 
                        required={needsGstInvoice}
                        maxLength={15}
                        value={orderGstNumber} 
                        onChange={e => setOrderGstNumber(e.target.value)} 
                        placeholder="Enter 15-digit GSTIN" 
                      />
                    </div>
                  </div>
                )}
              </div>

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
                      <button className="btn-confirm-order" onClick={submitOrder} disabled={isPlacingOrder || isVerifyingPayment}>
                        {isVerifyingPayment ? 'Verifying Payment...' : isPlacingOrder ? 'Processing...' : `Pay ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })} & Place Order`}
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
            <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="summary-row">
            <span>Tax (18% GST)</span>
            <span>₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="summary-row">
            <span>Delivery</span>
            <span className="charges-applicable" style={{ color: "#b45309", fontWeight: "500", fontSize: "14px" }}>Charges Applicable</span>
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
    </>
  );
}


