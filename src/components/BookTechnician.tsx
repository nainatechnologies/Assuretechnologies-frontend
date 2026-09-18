import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useServices } from '../hooks/useServices';
import './BookTechnician.css';

export function BookTechnician() {
  const { services } = useServices();

  // Deduplicate services by category so each category is displayed only once
  const categories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; image?: string }>();

    for (const s of services) {
      const catName = s.category?.name?.trim();
      if (!catName) continue;

      const existing = map.get(catName);
      if (!existing) {
        map.set(catName, {
          id: s.category?.id || s.id,
          name: catName,
          image: s.image,
        });
      } else if (!existing.image && s.image) {
        // Fallback to a service with a valid image if the first one had none
        existing.image = s.image;
      }
    }

    return Array.from(map.values());
  }, [services]);

  return (
    <section className="bt-section">
      <div className="bt-container">
        <div className="bt-header">
          <h2 className="bt-title">Book a Service</h2>
          <p className="bt-subtitle">Expert professionals at your doorstep — fast, reliable, and background-verified.</p>
        </div>

        <div className="bt-grid">
          {categories.map(cat => (
            <Link key={cat.id} to={`/book-service?category=${encodeURIComponent(cat.name)}`} className="bt-card">
              <div className="bt-card-img-wrapper">
                {cat.image
                  ? <img src={cat.image} alt={cat.name} className="bt-card-img" loading="lazy" />
                  : <div className="bt-card-placeholder"></div>}
              </div>
              <div className="bt-card-info">
                <span className="bt-card-label">{cat.name}</span>
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
