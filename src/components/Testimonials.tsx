import { FaStar, FaQuoteLeft } from 'react-icons/fa';
import './Testimonials.css';

const reviews = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    role: 'Business Owner, Vijayawada',
    rating: 5,
    text: 'Assure Technologies set up our entire office network and CCTV. Their technicians are punctual, professional, and knowledgeable. Highly recommend!',
    avatar: 'RK',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    role: 'Homeowner, Amaravathi',
    rating: 5,
    text: 'Got a 5kVA solar system installed. The team explained everything clearly and the installation was flawless. My electricity bills dropped by 75%!',
    avatar: 'PS',
  },
  {
    id: 3,
    name: 'Venkat Reddy',
    role: 'Factory Manager, Guntur',
    rating: 4,
    text: 'We use their automation and IoT solutions for our manufacturing unit. Excellent products and the AMC support is top-notch. Great value for money.',
    avatar: 'VR',
  },
];

export function Testimonials() {
  return (
    <section className="tm-section">
      <div className="tm-container">
        <div className="tm-header">
          <h2 className="tm-title">What Our Customers Say</h2>
          <p className="tm-subtitle">Trusted by 500+ businesses and homeowners across Andhra Pradesh</p>
        </div>

        <div className="tm-grid">
          {reviews.map(review => (
            <div key={review.id} className="tm-card">
              <FaQuoteLeft className="tm-quote-icon" />
              <p className="tm-text">{review.text}</p>
              <div className="tm-stars">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <FaStar key={i} className="tm-star" />
                ))}
              </div>
              <div className="tm-author">
                <div className="tm-avatar">{review.avatar}</div>
                <div>
                  <h5 className="tm-name">{review.name}</h5>
                  <span className="tm-role">{review.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
