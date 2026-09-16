import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaNetworkWired, FaRobot, FaLeaf, FaVideo, FaPhone,
  FaHeadset, FaFingerprint, FaSatelliteDish, FaServer,
  FaLaptop, FaSun, FaIndustry, FaShieldAlt, FaMicrochip,
  FaSeedling, FaBolt
} from 'react-icons/fa';
import './CategoryStrip.css';

const categories = [
  { label: 'Networking', icon: <FaNetworkWired />, slug: 'Networking' },
  { label: 'Automation', icon: <FaRobot />, slug: 'Automation' },
  { label: 'AgriTech', icon: <FaLeaf />, slug: 'AgriTech' },
  { label: 'Surveillance', icon: <FaVideo />, slug: 'Surveillance' },
  { label: 'Telephony', icon: <FaPhone />, slug: 'Telephony' },
  { label: 'Intercom', icon: <FaHeadset />, slug: 'Intercom' },
  { label: 'Biometrics', icon: <FaFingerprint />, slug: 'Biometrics' },
  { label: 'Communication', icon: <FaSatelliteDish />, slug: 'Communication' },
  { label: 'Infrastructure', icon: <FaServer />, slug: 'Infrastructure' },
  { label: 'IT Support', icon: <FaLaptop />, slug: 'IT Support' },
  { label: 'Solar', icon: <FaSun />, slug: 'Solar' },
  { label: 'IIoT', icon: <FaIndustry />, slug: 'IIoT' },
  { label: 'Security', icon: <FaShieldAlt />, slug: 'Security' },
  { label: 'Sensors', icon: <FaMicrochip />, slug: 'Sensors' },
  { label: 'Agriculture', icon: <FaSeedling />, slug: 'Agriculture' },
  { label: 'Fiber Optics', icon: <FaBolt />, slug: 'Fiber Optics' },
];

export function CategoryStrip() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  if (location.pathname.startsWith('/career')) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 100) {
        setIsScrolled(true);
      } else if (currentScrollY < 20) {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeRef = useRef<HTMLAnchorElement | null>(null);

  const currentCat = location.pathname === '/order-products'
    ? new URLSearchParams(location.search).get('category')
    : null;

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentCat]);

  return (
    <div className={`cat-strip ${isScrolled ? 'cat-strip-scrolled' : ''}`}>
      <div className="cat-strip-inner">
        {categories.map(cat => {
          const isActive = currentCat === cat.slug;
          return (
            <Link
              key={cat.slug}
              ref={isActive ? activeRef : undefined}
              to={`/order-products?category=${encodeURIComponent(cat.slug)}`}
              className={`cat-strip-item ${isActive ? 'cat-strip-item-active' : ''}`}
            >
              <div className="cat-strip-icon">{cat.icon}</div>
              <span className="cat-strip-label">{cat.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}


