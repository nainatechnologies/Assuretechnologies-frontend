import { FaTruck, FaUserShield, FaCertificate, FaHeadset } from 'react-icons/fa';
import './TrustIndicators.css';

const indicators = [
  { icon: <FaTruck />,        title: 'Pan India Delivery',          desc: 'Secure & reliable shipping' },
  { icon: <FaUserShield />,   title: 'Certified Technicians',  desc: 'Trained & background-verified' },
  { icon: <FaCertificate />,  title: 'Warranty Assured',       desc: 'On all products & installations' },
  { icon: <FaHeadset />,      title: '24/7 Support',           desc: 'Call, chat, or email anytime' },
];

export function TrustIndicators() {
  return (
    <section className="ti-section">
      <div className="ti-container">
        {indicators.map((item, idx) => (
          <div key={idx} className="ti-card">
            <div className="ti-icon">{item.icon}</div>
            <div className="ti-body">
              <h4 className="ti-title">{item.title}</h4>
              <p className="ti-desc">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
