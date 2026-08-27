import { Link } from 'react-router-dom';
import { useServices } from '../hooks/useServices';
import './BookTechnician.css';

export function BookTechnician() {
  const { services } = useServices();

  return (
    <section className="bt-section">
      <div className="bt-container">
        <div className="bt-header">
          <h2 className="bt-title">Book a Service</h2>
          <p className="bt-subtitle">Expert professionals at your doorstep — fast, reliable, and background-verified.</p>
        </div>

        <div className="bt-grid">
          {services.map(s => (
            <Link key={s.id} to={`/book-service?service=${encodeURIComponent(s.name)}`} className="bt-card">
              <div className="bt-card-img-wrapper">
                {s.image
                  ? <img src={s.image} alt={s.name} className="bt-card-img" loading="lazy" />
                  : <div className="bt-card-placeholder"></div>}
              </div>
              <div className="bt-card-info">
                <span className="bt-card-label">{s.category?.name || 'Service'}</span>
                <svg className="bt-card-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
