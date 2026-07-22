import { FaStar } from 'react-icons/fa';
import './Testimonials.css';

const row1Reviews = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    role: 'Vijayawada',
    rating: 5,
    text: 'Assure Technologies set up our entire office network and CCTV. Their technicians are punctual, professional, and knowledgeable. Highly recommend!',
    avatar: 'RK',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    role: 'Amaravathi',
    rating: 5,
    text: 'Got a 5kVA solar system installed. The team explained everything clearly and the installation was flawless. My electricity bills dropped by 75%!',
    avatar: 'PS',
  },
  {
    id: 3,
    name: 'Venkat Reddy',
    role: 'Guntur',
    rating: 4,
    text: 'We use their automation and IoT solutions for our manufacturing unit. Excellent products and the AMC support is top-notch. Great value for money.',
    avatar: 'VR',
  },
  {
    id: 4,
    name: 'Sneha L.',
    role: 'Vizag',
    rating: 5,
    text: 'Seamless experience from booking to completion. The staff was courteous, punctual, and did a fantastic job with our smart home setup.',
    avatar: 'S',
  },
];

const row2Reviews = [
  {
    id: 5,
    name: 'Karthik Y.',
    role: 'Tirupati',
    rating: 5,
    text: 'The service was simple and effective. It met my expectations without any hassle. Good overall experience with the biometric attendance system.',
    avatar: 'K',
  },
  {
    id: 6,
    name: 'Manoj D.',
    role: 'Nellore',
    rating: 5,
    text: 'Really impressive compared to other platforms. The service was reliable and professional. Communication was clear and fast - very pleased!',
    avatar: 'MD',
  },
  {
    id: 7,
    name: 'Anjali R.',
    role: 'Rajahmundry',
    rating: 5,
    text: 'The services have definitely improved from the first time. Preferences are kept as top priority. Thank you for making our lives easier!',
    avatar: 'AR',
  },
  {
    id: 8,
    name: 'Suresh B.',
    role: 'Kakinada',
    rating: 5,
    text: 'Absolutely excellent! The technician was prompt and fixed our server rack cabling issues quickly. Would love to use your services again.',
    avatar: 'SB',
  },
];

export function Testimonials() {
  return (
    <section className="tm-section">
      <div className="tm-container">
        <div className="tm-header">
          <h2 className="tm-title">What Our Customers Say</h2>
          <p className="tm-subtitle">Trusted by 500+ businesses and homeowners</p>
        </div>
      </div>

      {/* Marquee Wrapper */}
      <div className="tm-marquee-wrapper">
        
        {/* Row 1 - Scrolls Left */}
        <div className="tm-marquee tm-scroll-left">
          <div className="tm-marquee-content">
            {row1Reviews.map(review => (
              <div key={review.id} className="tm-card">
                <div className="tm-stars">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <FaStar key={i} className="tm-star" />
                  ))}
                </div>
                <p className="tm-text">“{review.text}”</p>
                <div className="tm-author">
                  <div className="tm-avatar">{review.avatar}</div>
                  <div>
                    <h5 className="tm-name">{review.name}</h5>
                    <span className="tm-role">{review.role}</span>
                  </div>
                </div>
              </div>
            ))}
            {/* Duplicate for infinite scroll */}
            {row1Reviews.map(review => (
              <div key={`dup-${review.id}`} className="tm-card">
                <div className="tm-stars">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <FaStar key={i} className="tm-star" />
                  ))}
                </div>
                <p className="tm-text">“{review.text}”</p>
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

        {/* Row 2 - Scrolls Right */}
        <div className="tm-marquee tm-scroll-right">
          <div className="tm-marquee-content">
            {row2Reviews.map(review => (
              <div key={review.id} className="tm-card">
                <div className="tm-stars">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <FaStar key={i} className="tm-star" />
                  ))}
                </div>
                <p className="tm-text">“{review.text}”</p>
                <div className="tm-author">
                  <div className="tm-avatar">{review.avatar}</div>
                  <div>
                    <h5 className="tm-name">{review.name}</h5>
                    <span className="tm-role">{review.role}</span>
                  </div>
                </div>
              </div>
            ))}
            {/* Duplicate for infinite scroll */}
            {row2Reviews.map(review => (
              <div key={`dup-${review.id}`} className="tm-card">
                <div className="tm-stars">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <FaStar key={i} className="tm-star" />
                  ))}
                </div>
                <p className="tm-text">“{review.text}”</p>
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

      </div>
    </section>
  );
}
