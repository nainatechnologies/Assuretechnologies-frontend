import { Link } from 'react-router-dom';
import './BookTechnician.css';

const technicians = [
  { 
    label: 'Networking',   
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&h=350&fit=crop', 
    desc: 'LAN wiring, Wi-Fi setup, server rack installation', 
    slug: 'Networking' 
  },
  { 
    label: 'Automation',   
    image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=500&h=350&fit=crop',        
    desc: 'Gate motors, boom barriers, smart home setup', 
    slug: 'Automation' 
  },
  { 
    label: 'Surveillance', 
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=500&h=350&fit=crop',        
    desc: 'CCTV installation, NVR setup, camera maintenance', 
    slug: 'Surveillance' 
  },
  { 
    label: 'Solar',        
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=350&fit=crop',          
    desc: 'Solar panel installation, inverter setup, AMC', 
    slug: 'Solar' 
  },
  { 
    label: 'Security',     
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=350&fit=crop',    
    desc: 'Fire alarms, biometrics, access control systems', 
    slug: 'Security' 
  },
  { 
    label: 'IT Support',   
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=350&fit=crop',       
    desc: 'Computer repair, printer service, OS installation', 
    slug: 'IT Support' 
  },
  { 
    label: 'Intercom',     
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500&h=350&fit=crop',      
    desc: 'Video door phone, multi-apartment intercom setup', 
    slug: 'Intercom' 
  },
  { 
    label: 'Fiber Optics', 
    image: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=500&h=350&fit=crop',         
    desc: 'OFC laying, splicing, OTDR testing', 
    slug: 'Fiber Optics' 
  },
];

export function BookTechnician() {
  return (
    <section className="bt-section">
      <div className="bt-container">
        <div className="bt-header">
          <h2 className="bt-title">Book a Technician</h2>
          <p className="bt-subtitle">Expert professionals at your doorstep — fast, reliable, and background-verified.</p>
        </div>

        <div className="bt-grid">
          {technicians.map(t => (
            <Link
              key={t.slug}
              to={`/book-service?service=${encodeURIComponent(t.slug)}`}
              className="bt-card"
            >
              <div className="bt-card-img-wrapper">
                <img src={t.image} alt={t.label} className="bt-card-img" loading="lazy" />
              </div>
              <div className="bt-card-content">
                <h4 className="bt-card-label">{t.label}</h4>
                <p className="bt-card-desc">{t.desc}</p>
                <div className="bt-card-footer">
                  <span className="bt-card-btn">Book Now</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
