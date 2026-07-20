import { Link } from 'react-router-dom';
import {
  FaNetworkWired, FaRobot, FaLeaf, FaVideo, FaPhone,
  FaHeadset, FaFingerprint, FaSatelliteDish, FaServer,
  FaLaptop, FaSun, FaIndustry, FaShieldAlt, FaMicrochip,
  FaSeedling, FaBolt
} from 'react-icons/fa';
import './CategoryStrip.css';

const categories = [
  { label: 'Networking',     icon: <FaNetworkWired />,  slug: 'Networking' },
  { label: 'Automation',     icon: <FaRobot />,         slug: 'Automation' },
  { label: 'AgriTech',       icon: <FaLeaf />,          slug: 'AgriTech' },
  { label: 'Surveillance',   icon: <FaVideo />,         slug: 'Surveillance' },
  { label: 'Telephony',      icon: <FaPhone />,         slug: 'Telephony' },
  { label: 'Intercom',       icon: <FaHeadset />,       slug: 'Intercom' },
  { label: 'Biometrics',     icon: <FaFingerprint />,   slug: 'Biometrics' },
  { label: 'Communication',  icon: <FaSatelliteDish />, slug: 'Communication' },
  { label: 'Infrastructure', icon: <FaServer />,        slug: 'Infrastructure' },
  { label: 'IT Support',     icon: <FaLaptop />,        slug: 'IT Support' },
  { label: 'Solar',          icon: <FaSun />,           slug: 'Solar' },
  { label: 'IIoT',           icon: <FaIndustry />,      slug: 'IIoT' },
  { label: 'Security',       icon: <FaShieldAlt />,     slug: 'Security' },
  { label: 'Sensors',        icon: <FaMicrochip />,     slug: 'Sensors' },
  { label: 'Agriculture',    icon: <FaSeedling />,      slug: 'Agriculture' },
  { label: 'Fiber Optics',   icon: <FaBolt />,          slug: 'Fiber Optics' },
];

export function CategoryStrip() {
  return (
    <div className="cat-strip">
      <div className="cat-strip-inner">
        {categories.map(cat => (
          <Link
            key={cat.slug}
            to={`/order-products?category=${encodeURIComponent(cat.slug)}`}
            className="cat-strip-item"
          >
            <div className="cat-strip-icon">{cat.icon}</div>
            <span className="cat-strip-label">{cat.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
