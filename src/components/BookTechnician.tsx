import { Link } from 'react-router-dom';
import { SERVICES } from '../data/services';
import './BookTechnician.css';

export function BookTechnician() {
  return (
    <section className="bt-section">
      <div className="bt-container">
        <div className="bt-header">
          <h2 className="bt-title">Book a Service</h2>
          <p className="bt-subtitle">Expert professionals at your doorstep — fast, reliable, and background-verified.</p>
        </div>

        <div className="bt-grid">
          {SERVICES.map(s => (
            <Link
              key={s.id}
              to={`/book-service?service=${encodeURIComponent(s.label)}`}
              className="bt-card"
            >
              <div className="bt-card-img-wrapper">
                {s.img
                  ? <img src={s.img} alt={s.label} className="bt-card-img" loading="lazy" />
                  : <div className="bt-card-icon">{s.icon}</div>
                }
              </div>
              <div className="bt-card-info">
                <span className="bt-card-label">{s.label}</span>
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

