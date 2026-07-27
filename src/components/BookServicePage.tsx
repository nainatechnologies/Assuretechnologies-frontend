import { useState, useRef, useMemo, useEffect } from 'react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [stateName, setStateName] = useState('');
  
  const [geolocation, setGeolocation] = useState('');
  const [mapPosition, setMapPosition] = useState<L.LatLngTuple | null>(null);
  const [mapZoom, setMapZoom] = useState(13);

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
    setGeolocation('');
    setMapPosition(null);
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
    if (!pincode.trim() || !city.trim() || !addressLine1.trim() || !addressLine2.trim() || !stateName.trim()) {
      alert('Please enter your complete address details (excluding optional landmark).');
      return;
    }
    alert(`Success! Your booking for ${selectedService} is confirmed.`);
    handleCloseModal();
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
        {SERVICES.map(service => (
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
        ))}
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
            </div>

            <div className="booking-modal-actions">
              <button className="btn-modal-cancel" onClick={handleCloseModal}>Cancel</button>
              <button className="btn-modal-confirm" onClick={handleConfirmBooking}>Confirm Booking</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
