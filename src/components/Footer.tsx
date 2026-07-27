import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';
import { Logo } from './Logo';
import './Footer.css';

export function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        {/* Column 1: Brand & Description */}
        <div className="footer-col brand-col">
          <div style={{ marginBottom: '16px' }}>
            <Logo />
          </div>
          <p className="footer-desc">
            Comprehensive technology and infrastructure solutions at your doorstep — fast, reliable, and trusted by businesses.
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook"><FaFacebook /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="YouTube"><FaYoutube /></a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="/book-service">Services</a></li>
            <li><a href="/order-products">Products</a></li>
            <li><a href="/ventures">Ventures</a></li>
            <li><a href="#investors">Investors</a></li>
            <li><a href="#careers">Careers</a></li>
          </ul>
        </div>

        {/* Column 3: Our Services */}
        <div className="footer-col">
          <h4 className="footer-heading">Our Services</h4>
          <ul className="footer-links">
            <li><a href="#">Networking</a></li>
            <li><a href="#">Automation</a></li>
            <li><a href="#">AgriTech</a></li>
            <li><a href="#">Surveillance</a></li>
            <li><a href="#">Solar Power</a></li>
            <li><a href="#">IT Support</a></li>
          </ul>
        </div>

        {/* Column 4: Contact Us */}
        <div className="footer-col contact-col">
          <h4 className="footer-heading">Contact Us</h4>
          <ul className="footer-contact-list">
            <li>
              <FaMapMarkerAlt className="contact-icon" />
              <span>Amaravathi, India</span>
            </li>
            <li>
              <FaEnvelope className="contact-icon" />
              <span>support@assuretech.com<br />sales@assuretech.com</span>
            </li>
            <li>
              <FaPhoneAlt className="contact-icon" />
              <span>+91 8639060213, +91 9505261283<br />+91 8008759767, +91 9550173443</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom copyright row */}
      <div className="footer-bottom">
        <p>© 2026 Powered by Assure Tech. All rights reserved.</p>
      </div>
    </footer>
  );
}
