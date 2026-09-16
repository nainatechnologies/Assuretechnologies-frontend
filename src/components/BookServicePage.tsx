import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useServices } from '../hooks/useServices';
import { useAuth } from '../context/AuthContext';
import { createServiceBooking, verifyServiceBookingPayment } from '../api/serviceBookingApi';
import { Toast, showApiError } from '../utils/errorHandler';
import { CustomFieldInput } from './CustomFieldInput';
import { SEOHead } from './SEOHead';
import { StructuredData } from './StructuredData';
import { StateSelect } from './StateSelect';
import { RAZORPAY_KEY_ID } from '../services/api';
import './BookServicePage.css';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const DEFAULT_POSITION: L.LatLngTuple = [20.5937, 78.9629];

const TIME_SLOTS = [
  '9 AM - 11 AM',
  '11 AM - 1 PM',
  '2 PM - 4 PM',
  '4 PM - 6 PM',
];
const isTimeSlotPast = (slot: string, selectedDate: string) => {
  if (!selectedDate || !slot) return false;
  const now = new Date();
  const todayStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');
  
  const targetDate = String(selectedDate).split('T')[0];
  if (targetDate > todayStr) return false;
  if (targetDate < todayStr) return true;

  const match = slot.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!match) return false;
  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  let period = match[3] ? match[3].toUpperCase() : null;

  if (!period) {
    if (/PM/i.test(slot) && !/AM/i.test(slot)) period = 'PM';
    else if (hour >= 1 && hour <= 7) period = 'PM';
    else if (hour >= 8 && hour <= 11) period = 'AM';
  }

  if (period === 'PM' && hour < 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  const currentHour = now.getHours() + now.getMinutes() / 60;
  const slotHour = hour + minute / 60;

  return slotHour <= currentHour;
};


const INITIAL_FORM = {
  date: '',
  timeSlot: '',
  pincode: '',
  city: '',
  addressLine1: '',
  addressLine2: '',
  landmark: '',
  stateName: '',
};

function getServiceRate(svc: { price?: string; prebooking_charge?: string; rate?: number } | undefined) {
  if (!svc) return 0;
  const p = svc.price ? parseFloat(svc.price) : 0;
  if (p > 0) return p;
  const pb = svc.prebooking_charge ? parseFloat(svc.prebooking_charge) : 0;
  if (pb > 0) return pb;
  return svc.rate || 0;
}

// --- Map sub-components ---

function DraggableMarker({ position, setPosition }: { position: L.LatLngTuple; setPosition: (p: L.LatLngTuple) => void }) {
  const markerRef = useRef<L.Marker>(null);
  const handlers = useMemo(() => ({
    dragend() {
      const m = markerRef.current;
      if (m) { const ll = m.getLatLng(); setPosition([ll.lat, ll.lng]); }
    },
  }), [setPosition]);

  useMapEvents({ click(e) { setPosition([e.latlng.lat, e.latlng.lng]); } });

  return <Marker draggable eventHandlers={handlers} position={position} ref={markerRef} />;
}

function MapUpdater({ center, zoom }: { center: L.LatLngTuple; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, zoom); }, [center, zoom, map]);
  return null;
}


function MapClickHandler({ onLocationSelect }: { onLocationSelect: (p: L.LatLngTuple) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}
// --- Main component ---

export function BookServicePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userName } = useAuth();
  const serviceQuery = searchParams.get('service') || '';
  const categoryQuery = searchParams.get('category') || '';
  const autoOpen = searchParams.get('autoOpen') === 'true';

  const { services: allServices, loading } = useServices();

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const normalizedQuery = (serviceQuery || categoryQuery || '').trim().toLowerCase();

  const filteredServices = normalizedQuery
    ? allServices.filter(s => {
        const categoryName = s.category?.name?.toLowerCase() || '';
        const serviceName = s.name?.toLowerCase() || '';

        return (
          categoryName.includes(normalizedQuery) ||
          serviceName.includes(normalizedQuery)
        );
      })
    : allServices;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [geolocation, setGeolocation] = useState('');
  const [mapPosition, setMapPosition] = useState<L.LatLngTuple | null>(null);
  const [mapZoom, setMapZoom] = useState(13);
  const [customResponses, setCustomResponses] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingQuantity, setBookingQuantity] = useState<number | ''>('');
  const [isGeocodingPincode, setIsGeocodingPincode] = useState(false);
  const isSyncingFromPinRef = useRef(false);
  const isSyncingFromPincodeRef = useRef(false);

  const updateForm = (key: keyof typeof INITIAL_FORM, val: string) =>
    setForm(prev => {
      const next = { ...prev, [key]: val };
      if (key === 'date' && next.timeSlot && isTimeSlotPast(next.timeSlot, val)) {
        next.timeSlot = '';
      }
      return next;
    });

  const updateCustom = useCallback((id: string, val: string) =>
    setCustomResponses(prev => ({ ...prev, [id]: val })), []);

  const hasAutoOpenedRef = useRef(false);

  useEffect(() => {
    hasAutoOpenedRef.current = false;
  }, [serviceQuery]);

  // Auto-open modal from URL params
  useEffect(() => {
    if (!loading && autoOpen && !hasAutoOpenedRef.current && filteredServices.length > 0 && !isModalOpen && !selectedService) {
      hasAutoOpenedRef.current = true;
      setSelectedService(filteredServices[0].name);
      setIsModalOpen(true);
    }
  }, [loading, autoOpen, filteredServices, isModalOpen, selectedService]);

  const selectedServiceObj = useMemo(
    () => allServices.find(s => s.name === selectedService),
    [allServices, selectedService],
  );

  const serviceRate = getServiceRate(selectedServiceObj);
  const pricingUnit = selectedServiceObj?.pricingUnitName || 'Quantity';
  // Dynamically check for a tax rate from the backend service object, fallback to 18%
  const dynamicTaxRate = (selectedServiceObj as any)?.tax_rate || (selectedServiceObj as any)?.gst_rate || 18;
  const taxMultiplier = dynamicTaxRate / 100;
  
  const baseTotal = serviceRate && bookingQuantity ? serviceRate * Number(bookingQuantity) : 0;
  const gstAmount = baseTotal * taxMultiplier;
  const bookingTotal = baseTotal + gstAmount;

  useEffect(() => {
    if (mapPosition) setGeolocation(`${mapPosition[0].toFixed(6)}, ${mapPosition[1].toFixed(6)}`);
  }, [mapPosition]);

  const handleBookNow = (name: string) => { setSelectedService(name); setIsModalOpen(true); };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedService(null);
    setForm(INITIAL_FORM);
    setGeolocation('');
    setMapPosition(null);
    setCustomResponses({});
    setIsProcessing(false);
    setBookingQuantity('');

    if (autoOpen) {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('autoOpen');
        setSearchParams(newParams, { replace: true });
      }
    }
  };

  // 1. Auto-sync Map from Pincode
  useEffect(() => {
    const pincode = form.pincode?.trim();
    if (pincode && pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      if (isSyncingFromPinRef.current) {
        isSyncingFromPinRef.current = false;
        return;
      }

      const timer = setTimeout(async () => {
        try {
          setIsGeocodingPincode(true);
          isSyncingFromPincodeRef.current = true;
          const res = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(pincode)}&country=India&format=json&limit=1&addressdetails=1`, {
            headers: { 'Accept-Language': 'en' }
          });
          const data = await res.json();
          if (data && data[0]) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            const newPos: L.LatLngTuple = [lat, lon];
            setMapPosition(newPos);
            setMapZoom(15);
            setGeolocation(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);

            const addr = data[0].address;
            if (addr) {
              const detectedCity = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.state_district || '';
              const detectedState = addr.state || '';
              setForm(prev => {
                const updates: any = {};
                if (detectedCity && !prev.city) {
                  updates.city = detectedCity;
                }
                if (detectedState && !prev.stateName) {
                  updates.stateName = detectedState;
                }
                return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
              });
            }
          }
        } catch (err) {
          console.warn('Pincode geocoding error:', err);
        } finally {
          setIsGeocodingPincode(false);
          setTimeout(() => { isSyncingFromPincodeRef.current = false; }, 600);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [form.pincode]);

  // 2. When user moves the pin on the map or clicks map
  const handleMapPinChange = useCallback(async (newPos: L.LatLngTuple) => {
    setMapPosition(newPos);
    setGeolocation(`${newPos[0].toFixed(6)}, ${newPos[1].toFixed(6)}`);

    if (isSyncingFromPincodeRef.current) return;

    try {
      isSyncingFromPinRef.current = true;
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${newPos[0]}&lon=${newPos[1]}&format=json`, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const newPincode = addr.postcode ? addr.postcode.replace(/\D/g, '').slice(0, 6) : '';
        const detectedCity = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.state_district || '';
        const detectedState = addr.state || '';

        setForm(prev => {
          const updates: any = {};
          if (newPincode && newPincode.length === 6) {
            updates.pincode = newPincode;
          }
          if (detectedCity && !prev.city) {
            updates.city = detectedCity;
          }
          if (detectedState && !prev.stateName) {
            updates.stateName = detectedState;
          }
          return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
        });
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    } finally {
      setTimeout(() => { isSyncingFromPinRef.current = false; }, 600);
    }
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) { Toast.fire({ icon: 'error', title: 'Geolocation is not supported by your browser.' }); return; }
    navigator.geolocation.getCurrentPosition(
      pos => { 
        const newPos: L.LatLngTuple = [pos.coords.latitude, pos.coords.longitude];
        setMapPosition(newPos); 
        setMapZoom(16);
        handleMapPinChange(newPos);
        Toast.fire({ icon: 'success', title: 'Location detected and address updated!' });
      },
      () => Toast.fire({ icon: 'error', title: 'Unable to retrieve your location. Please check browser permissions.' }),
    );
  }

  const handleConfirm = async () => {
    if (!selectedServiceObj) {
      Toast.fire({ icon: 'warning', title: 'Please select a valid service.' });
      return;
    }

    if (!form.date || !form.timeSlot) { 
      Toast.fire({ icon: 'warning', title: 'Please select a date and time slot.' }); 
      return; 
    }

    if (isTimeSlotPast(form.timeSlot, form.date)) {
      Toast.fire({ icon: 'warning', title: 'The selected time slot has already passed for today. Please select an upcoming slot or future date.' });
      return;
    }

    const { pincode, city, addressLine1, addressLine2, stateName } = form;
    if ([pincode, city, addressLine1, addressLine2, stateName].some(v => !v.trim())) {
      Toast.fire({ icon: 'warning', title: 'Please enter complete address details.' }); 
      return;
    }

    if (selectedServiceObj.custom_fields) {
      for (const f of selectedServiceObj.custom_fields) {
        if (f.required && !customResponses[f.id]?.trim()) {
          Toast.fire({ icon: 'warning', title: `Please fill required field: ${f.label}` }); 
          return;
        }
      }
    }

    if (serviceRate && (!bookingQuantity || Number(bookingQuantity) <= 0)) {
      Toast.fire({ icon: 'warning', title: `Please enter number of ${pricingUnit.toLowerCase()}.` }); 
      return;
    }

    setIsProcessing(true);

    try {
      const bookingPayload = {
        service_id: selectedServiceObj.id,
        scheduled_date: form.date,
        scheduled_time_slot: form.timeSlot,
        address: {
          line1: form.addressLine1,
          line2: form.addressLine2,
          city: form.city,
          state: form.stateName,
          landmark: form.landmark,
          country: 'India',
        },
        pincode: form.pincode,
        lat: mapPosition?.[0] ?? null,
        lng: mapPosition?.[1] ?? null,
        quantity: bookingQuantity ? Number(bookingQuantity) : 1,
        metadata: {
          geolocation,
          custom_fields: customResponses,
          service_name: selectedService,
        },
      };

      const bookingResult = await createServiceBooking(bookingPayload);

      if (bookingResult.requires_payment && bookingResult.razorpay_order_id) {
        const sdkLoaded = await loadRazorpay();
        if (!sdkLoaded) {
          Toast.fire({ icon: 'error', title: 'Razorpay SDK failed to load. Please check your connection.' });
          setIsProcessing(false);
          return;
        }

        const razorpayKey = bookingResult.razorpay_key_id || RAZORPAY_KEY_ID;

        const options = {
          key: razorpayKey,
          amount: Math.round(Number(bookingResult.total_amount || bookingTotal) * 100),
          currency: 'INR',
          name: 'Assure Technologies',
          description: `Service Booking: ${selectedService}`,
          order_id: bookingResult.razorpay_order_id,
          handler: async function (response: any) {
            try {
              setIsProcessing(true);
              await verifyServiceBookingPayment({
                booking_payload: bookingPayload,
                booking_id: bookingResult.booking_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              handleClose();
              navigate('/orders?tab=services&booking=success');
            } catch (vErr: any) {
              const errMsg = vErr?.response?.data?.message || 'Payment verification failed. Please contact support.';
              Toast.fire({ icon: 'error', title: errMsg });
            } finally {
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              Toast.fire({ icon: 'warning', title: 'Payment cancelled. You can retry anytime.' });
            }
          },
          prefill: {
            name: userName || 'Customer',
            contact: '',
            email: ''
          },
          theme: {
            color: '#2563eb'
          }
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.on('payment.failed', function (response: any) {
          setIsProcessing(false);
          Toast.fire({ icon: 'error', title: response.error?.description || 'Payment failed. Please retry.' });
        });
        paymentObject.open();
      } else {
        handleClose();
        navigate('/orders?tab=services&booking=success');
      }
    } catch (error: any) {
      showApiError(error, 'Unable to create booking right now. Please try again.');
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <section id="book-service">
        <div className="bs-header">
          <h2>Our Services</h2>
          <div className="bs-underline" />
          <p>Loading services...</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <SEOHead 
        title="Book Professional Services & On-Demand Technicians"
        description="Book certified field engineers for AgriTech drone spraying, optical networking, solar power rooftop systems, and CCTV security installations across India."
        canonicalUrl="https://assuretechnologies.com/book-service"
      />
      <StructuredData 
        type="service" 
        data={{ category: 'Field Technical & Drone Operations' }}
      />
      <StructuredData 
        type="breadcrumb"
        data={{
          items: [
            { name: 'Home', url: 'https://assuretechnologies.com/' },
            { name: 'Book a Service', url: 'https://assuretechnologies.com/book-service' }
          ]
        }}
      />
      <section id="book-service">
        <div className="bs-header">
          <h2>Our Services</h2>
          <div className="bs-underline" />
          <p>Comprehensive technology and infrastructure solutions for every need</p>
        </div>

      <div className="bs-grid">
        {filteredServices.length > 0 ? (
          filteredServices.map(svc => (
            <div key={svc.id} className="bs-card">
              {svc.image
                ? <img src={svc.image} alt={svc.name} className="bs-card-img" />
                : <div className="bs-card-icon" />}
              <div className="bs-card-body">
                <span className="bs-card-label">{svc.category?.name || 'Service'}</span>
                <h3 className="bs-card-title">{svc.name}</h3>
                <button className="bs-book-btn" onClick={() => handleBookNow(svc.name)}>Book Now</button>
              </div>
            </div>
          ))
        ) : (
          <div className="bs-no-results"><p>No services found for "{serviceQuery}".</p></div>
        )}
      </div>

      {isModalOpen && (
        <div className="booking-modal-overlay" onClick={handleClose}>
          <div className="booking-modal" onClick={e => e.stopPropagation()}>
            <div className="booking-modal-header">
              <h3>Book Service: {selectedService}</h3>
            </div>

            <div className="booking-modal-body">
              <div className="form-group">
                <label>Preferred Installation Date</label>
                <input 
                  type="date" 
                  value={form.date} 
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => updateForm('date', e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Preferred Time Slot <span style={{ color: '#ef4444' }}>*</span></label>
                <select required value={form.timeSlot} onChange={e => updateForm('timeSlot', e.target.value)}>
                  <option value="" disabled>Select time slot</option>
                  {TIME_SLOTS.map(ts => {
                    const isPast = isTimeSlotPast(ts, form.date);
                    return (
                      <option key={ts} value={ts} disabled={isPast}>
                        {ts} {isPast ? '(Unavailable / Passed)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Installation Address */}
              <div className="booking-address-section">
                <div className="booking-section-title">Installation Address</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Pincode {isGeocodingPincode && <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'normal' }}>(Locating on map...)</span>}
                    </label>
                    <input 
                      required 
                      type="text" 
                      maxLength={6}
                      placeholder="6-digit pincode"
                      value={form.pincode} 
                      onChange={e => updateForm('pincode', e.target.value.replace(/\D/g, ''))} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Town/City</label>
                    <input required type="text" value={form.city} onChange={e => updateForm('city', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Flat, House no., Building, Company, Apartment</label>
                  <input required type="text" value={form.addressLine1} onChange={e => updateForm('addressLine1', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Area, Street, Sector, Village</label>
                  <input required type="text" value={form.addressLine2} onChange={e => updateForm('addressLine2', e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Landmark</label>
                    <input type="text" value={form.landmark} onChange={e => updateForm('landmark', e.target.value)} placeholder="E.g. near apollo hospital" />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <StateSelect
                      value={form.stateName}
                      onChange={(val) => updateForm('stateName', val)}
                      placeholder="Select State"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic service-specific fields from API */}
              {selectedServiceObj?.custom_fields && selectedServiceObj.custom_fields.length > 0 && (
                <div className="booking-address-section">
                  <div className="booking-section-title">Service Details</div>
                  <div className="form-row bs-custom-row">
                    {selectedServiceObj.custom_fields.map(field => (
                      <div className="form-group bs-custom-field" key={field.id}>
                        <label>{field.label} {field.required && '*'}</label>
                        <CustomFieldInput
                          field={field}
                          value={customResponses[field.id] || ''}
                          onChange={updateCustom}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Geolocation</label>
                <div className="bs-geolocation-container">
                  <input type="text" placeholder="Latitude, Longitude" value={geolocation} readOnly className="bs-geolocation-input" />
                  <button type="button" onClick={handleGetLocation} className="bs-geolocation-btn">Get Location</button>
                </div>
                <div className="bs-map-container">
                  <MapContainer center={mapPosition || DEFAULT_POSITION} zoom={mapPosition ? mapZoom : 4} className="bs-map">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler onLocationSelect={handleMapPinChange} />
                    {mapPosition && (
                      <>
                        <MapUpdater center={mapPosition} zoom={mapZoom} />
                        <DraggableMarker position={mapPosition} setPosition={handleMapPinChange} />
                      </>
                    )}
                  </MapContainer>
                </div>
                <p className="bs-map-note">
                    *Entering your 6-digit Pincode automatically centers the map pin. You can drag the pin for exact doorstep precision.
                    {isGeocodingPincode && <span style={{ color: '#2563eb', marginLeft: '6px' }}>Locating pincode...</span>}
                  </p>
              </div>

              {serviceRate > 0 && (
                <div className="bs-pricing-section">
                  <h4 className="bs-pricing-title">Service Pricing</h4>
                  <div className="bs-pricing-row">
                    <div className="bs-pricing-col">
                      <label className="bs-pricing-label">
                        Number of {pricingUnit} (₹{serviceRate}/{pricingUnit.toLowerCase()})
                      </label>
                      <input
                        type="number" min="1" step="0.5"
                        value={bookingQuantity}
                        onChange={e => setBookingQuantity(e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g. 8"
                      />
                    </div>
                  </div>
                  {baseTotal > 0 && (
                    <div className="bs-pricing-breakdown" style={{ marginTop: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#64748b' }}>
                        <span>Base Amount:</span>
                        <span>₹{baseTotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#64748b' }}>
                        <span>GST ({dynamicTaxRate}%):</span>
                        <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#0f172a', borderTop: '1px solid #cbd5e1', paddingTop: '8px' }}>
                        <span>Estimated Total:</span>
                        <span>₹{bookingTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="booking-modal-actions">
              <button className="btn-modal-cancel" onClick={handleClose} disabled={isProcessing}>Cancel</button>
              <button className="btn-modal-confirm" onClick={handleConfirm} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : (bookingTotal > 0 ? `Pay ₹${bookingTotal.toLocaleString('en-IN')} & Book` : 'Confirm Booking')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
    </>
  );
}
