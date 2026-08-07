import { useState, useRef, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SERVICES } from '../data/services';
import './BookServicePage.css';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon issue in Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function DraggableMarker({ position, setPosition }: { position: L.LatLngTuple, setPosition: (pos: L.LatLngTuple) => void }) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          setPosition([latLng.lat, latLng.lng]);
        }
      },
    }),
    [setPosition],
  );

  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    }
  });

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}>
    </Marker>
  )
}

function MapUpdater({ center, zoom }: { center: L.LatLngTuple, zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export function BookServicePage() {
  const [searchParams] = useSearchParams();
  const serviceQuery = searchParams.get('service');

  const autoOpen = searchParams.get('autoOpen') === 'true';

  const filteredServices = serviceQuery
    ? SERVICES.filter(s => s.label.toLowerCase() === serviceQuery.toLowerCase())
    : SERVICES;

  const initialModalOpen = autoOpen && filteredServices.length > 0;
  const initialSelectedService = initialModalOpen ? filteredServices[0].title : null;

  const [isModalOpen, setIsModalOpen] = useState(initialModalOpen);
  const [selectedService, setSelectedService] = useState<string | null>(initialSelectedService);

  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [stateName, setStateName] = useState('');

  const [surveyNumber, setSurveyNumber] = useState('');
  const [district, setDistrict] = useState('');
  const [mandal, setMandal] = useState('');
  const [village, setVillage] = useState('');
  const [droneType, setDroneType] = useState('');
  const [tractorType, setTractorType] = useState('');

  const [geolocation, setGeolocation] = useState('');
  const [mapPosition, setMapPosition] = useState<L.LatLngTuple | null>(null);
  const [mapZoom, setMapZoom] = useState(13);

  const [customResponses, setCustomResponses] = useState<Record<string, string>>({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [bookingQuantity, setBookingQuantity] = useState<number | ''>('');

  const selectedServiceObj = useMemo(() => SERVICES.find(s => s.title === selectedService), [selectedService]);

  const bookingTotal = useMemo(() => {
    if (!selectedServiceObj?.rate || !bookingQuantity) return 0;
    return selectedServiceObj.rate * Number(bookingQuantity);
  }, [selectedServiceObj, bookingQuantity]);

  const isDroneService = selectedService?.toLowerCase().includes('drone');
  const isTractorService = selectedService?.toLowerCase().includes('tractor');
  const isAgriService = isDroneService || isTractorService;

  // Default fallback position (India roughly)
  const defaultPosition: L.LatLngTuple = [20.5937, 78.9629];

  useEffect(() => {
    if (mapPosition) {
      setGeolocation(`${mapPosition[0].toFixed(6)}, ${mapPosition[1].toFixed(6)}`);
    }
  }, [mapPosition]);

  const handleBookNow = (serviceName: string) => {
    setSelectedService(serviceName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
    setDate('');
    setTimeSlot('');
    setPincode('');
    setCity('');
    setAddressLine1('');
    setAddressLine2('');
    setLandmark('');
    setStateName('');
    setSurveyNumber('');
    setDistrict('');
    setMandal('');
    setVillage('');
    setDroneType('');
    setTractorType('');
    setGeolocation('');
    setMapPosition(null);
    setCustomResponses({});
    setIsProcessingPayment(false);
    setBookingQuantity('');
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos: L.LatLngTuple = [position.coords.latitude, position.coords.longitude];
          setMapPosition(newPos);
          setMapZoom(16);
        },
        () => {
          alert('Unable to retrieve your location. Please check browser permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleConfirmBooking = () => {
    if (!date || !timeSlot) {
      alert('Please select a date and time slot.');
      return;
    }

    if (isAgriService) {
      if (!surveyNumber.trim() || !district.trim() || !mandal.trim() || !village.trim() || !pincode.trim()) {
        alert('Please enter all farm land details, including pincode.');
        return;
      }
      if (isDroneService && !droneType) {
        alert('Please select a drone type.');
        return;
      }
      if (isTractorService && !tractorType) {
        alert('Please select a tractor type.');
        return;
      }
    } else {
      if (!pincode.trim() || !city.trim() || !addressLine1.trim() || !addressLine2.trim() || !stateName.trim()) {
        alert('Please enter your complete address details (excluding optional landmark).');
        return;
      }
    }

    if (selectedServiceObj?.customFields) {
      for (const field of selectedServiceObj.customFields) {
        if (field.required && !customResponses[field.id]?.trim()) {
          alert(`Please fill out the required field: ${field.label}`);
          return;
        }
      }
    }

    // Validate quantity for priced services
    if (selectedServiceObj?.pricingUnitName && selectedServiceObj?.rate) {
      if (!bookingQuantity || Number(bookingQuantity) <= 0) {
        alert(`Please enter the number of ${selectedServiceObj.pricingUnitName.toLowerCase()}.`);
        return;
      }
    }

    if (bookingTotal > 0) {
      setIsProcessingPayment(true);
      setTimeout(() => {
        setIsProcessingPayment(false);
        alert(`Payment of ₹${bookingTotal.toLocaleString('en-IN')} Successful!\n\nYour booking for ${selectedService} is confirmed.`);
        handleCloseModal();
      }, 1500);
    } else {
      alert(`Success! Your booking for ${selectedService} is confirmed.`);
      handleCloseModal();
    }
  };

  return (
    <section id="book-service">
      {/* Header */}
      <div className="bs-header">
        <h2>Our Services</h2>
        <div className="bs-underline" />
        <p>Comprehensive technology and infrastructure solutions for every need</p>
      </div>

      {/* Grid */}
      <div className="bs-grid">
        {filteredServices.length > 0 ? (
          filteredServices.map(service => (
            <div key={service.id} className="bs-card">
              {/* Image or Icon */}
              {service.img
                ? <img src={service.img} alt={service.label} className="bs-card-img" />
                : <div className="bs-card-icon">{service.icon}</div>
              }

              {/* Body */}
              <div className="bs-card-body">
                <span className="bs-card-label">{service.label}</span>
                <h3 className="bs-card-title">{service.title}</h3>
                <button
                  className="bs-book-btn"
                  onClick={() => handleBookNow(service.title)}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bs-no-results">
            <p>No services found for "{serviceQuery}".</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="booking-modal-overlay" onClick={handleCloseModal}>
          <div className="booking-modal" onClick={e => e.stopPropagation()}>
            <div className="booking-modal-header">
              <h3>Book Service: {selectedService}</h3>
            </div>

            <div className="booking-modal-body">
              <div className="form-group">
                <label>Preferred Installation Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Preferred Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={e => setTimeSlot(e.target.value)}
                >
                  <option value="" disabled>Select time slot</option>
                  <option value="9 AM - 11 AM">9 AM - 11 AM</option>
                  <option value="11 AM - 1 PM">11 AM - 1 PM</option>
                  <option value="2 PM - 4 PM">2 PM - 4 PM</option>
                  <option value="4 PM - 6 PM">4 PM - 6 PM</option>
                </select>
              </div>

              {!isAgriService ? (
                <div className="booking-address-section">
                  <div className="booking-section-title">Installation Address</div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Pincode</label>
                      <input required type="text" value={pincode} onChange={e => setPincode(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Town/City</label>
                      <input required type="text" value={city} onChange={e => setCity(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Flat, House no., Building, Company, Apartment</label>
                    <input required type="text" value={addressLine1} onChange={e => setAddressLine1(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label>Area, Street, Sector, Village</label>
                    <input required type="text" value={addressLine2} onChange={e => setAddressLine2(e.target.value)} />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Landmark</label>
                      <input type="text" value={landmark} onChange={e => setLandmark(e.target.value)} placeholder="E.g. near apollo hospital" />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <select required value={stateName} onChange={e => setStateName(e.target.value)}>
                        <option value="" disabled>Select State</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Telangana">Telangana</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="booking-address-section drone-details-section">
                  <div className="booking-section-title">Farm Land Details</div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Survey Number</label>
                      <input required type="text" value={surveyNumber} onChange={e => setSurveyNumber(e.target.value)} placeholder="e.g. 123/A" />
                    </div>
                    <div className="form-group">
                      {isDroneService ? (
                        <>
                          <label>Drone Type</label>
                          <select required value={droneType} onChange={e => setDroneType(e.target.value)}>
                            <option value="" disabled>Select Drone Type</option>
                            <option value="Standard Spray Drone (10L)">Standard Spray Drone (10L)</option>
                            <option value="High-Capacity Drone (20L)">High-Capacity Drone (20L)</option>
                            <option value="Granule Spreader Drone">Granule Spreader Drone</option>
                          </select>
                        </>
                      ) : (
                        <>
                          <label>Tractor Type / Attachment</label>
                          <select required value={tractorType} onChange={e => setTractorType(e.target.value)}>
                            <option value="" disabled>Select Tractor / Attachment</option>
                            <option value="Mini Tractor (Below 20 HP)">Mini Tractor (Below 20 HP)</option>
                            <option value="Utility Tractor (20-40 HP)">Utility Tractor (20-40 HP)</option>
                            <option value="Heavy Duty Tractor (40+ HP)">Heavy Duty Tractor (40+ HP)</option>
                            <option value="Tractor with Rotavator">Tractor with Rotavator</option>
                            <option value="Tractor with Trailer">Tractor with Trailer</option>
                          </select>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>District</label>
                      <input required type="text" value={district} onChange={e => setDistrict(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Mandal</label>
                      <input required type="text" value={mandal} onChange={e => setMandal(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Village</label>
                      <input required type="text" value={village} onChange={e => setVillage(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Pincode</label>
                      <input required type="text" value={pincode} onChange={e => setPincode(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {selectedServiceObj?.customFields && selectedServiceObj.customFields.length > 0 && (
                <div className="booking-address-section">
                  <div className="booking-section-title">Additional Requirements</div>
                  <div className="form-row" style={{ flexWrap: 'wrap' }}>
                    {selectedServiceObj.customFields.map(field => (
                      <div className="form-group" key={field.id} style={{ minWidth: '200px', flex: 1 }}>
                        <label>{field.label} {field.required && '*'}</label>
                        {field.type === 'dropdown' ? (
                          <select
                            required={field.required}
                            value={customResponses[field.id] || ''}
                            onChange={e => setCustomResponses(prev => ({ ...prev, [field.id]: e.target.value }))}
                          >
                            <option value="" disabled>Select {field.label}</option>
                            {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            required={field.required}
                            value={customResponses[field.id] || ''}
                            onChange={e => setCustomResponses(prev => ({ ...prev, [field.id]: e.target.value }))}
                            placeholder={`Enter ${field.label}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Geolocation</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Latitude, Longitude"
                    value={geolocation}
                    readOnly
                    style={{ flex: 1, backgroundColor: '#f8fafc', color: '#64748b' }}
                  />
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#e2e8f0',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      color: '#475569',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Get Location
                  </button>
                </div>

                {/* Map Display */}
                <div style={{ height: '220px', marginTop: '10px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', position: 'relative', zIndex: 1 }}>
                  <MapContainer
                    center={mapPosition || defaultPosition}
                    zoom={mapPosition ? mapZoom : 4}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {mapPosition && (
                      <>
                        <MapUpdater center={mapPosition} zoom={mapZoom} />
                        <DraggableMarker position={mapPosition} setPosition={setMapPosition} />
                      </>
                    )}
                  </MapContainer>
                </div>
                <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  *Click "Get Location" to drop a pin, then drag it to your exact location.
                </p>

              </div>

              {selectedServiceObj?.pricingUnitName && selectedServiceObj?.rate && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>Service Pricing</h4>
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'block' }}>
                        Number of {selectedServiceObj.pricingUnitName} (₹{selectedServiceObj.rate}/{selectedServiceObj.pricingUnitName.toLowerCase()})
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="0.5"
                        value={bookingQuantity}
                        onChange={e => setBookingQuantity(e.target.value ? Number(e.target.value) : '')}
                        placeholder={`e.g. 8`}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                      />
                    </div>
                  </div>
                  {bookingTotal > 0 && (
                    <div style={{ padding: '15px', background: '#e0e7ff', borderRadius: '8px', border: '1px solid #c7d2fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ color: '#3730a3', fontWeight: 600 }}>Estimated Total</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#4338ca' }}>₹{bookingTotal.toLocaleString('en-IN')}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="booking-modal-actions">
              <button className="btn-modal-cancel" onClick={handleCloseModal} disabled={isProcessingPayment}>Cancel</button>
              <button className="btn-modal-confirm" onClick={handleConfirmBooking} disabled={isProcessingPayment}>
                {isProcessingPayment ? 'Processing...' : (bookingTotal > 0 ? `Pay ₹${bookingTotal.toLocaleString('en-IN')} & Book` : 'Confirm Booking')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
