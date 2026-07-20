import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaShoppingCart, FaBars, FaTimes, FaDownload, FaSearch, FaHome, FaTools, FaBoxOpen, FaChartLine, FaHandshake } from 'react-icons/fa';
import { Logo } from './Logo';
import { CATEGORIES } from '../data/products';
import './Navbar.css';

export function Navbar({ cartCount = 0 }: { cartCount?: number }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (searchCategory !== 'All') params.set('category', searchCategory);
    navigate(`/order-products?${params.toString()}`);
  };

  return (
    <nav className="nav-container">
      <div className="nav-content">
        
        {/* Brand */}
        <Link className="nav-brand" to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Logo />
        </Link>

        {/* Search Bar */}
        <form className="nav-search-bar" onSubmit={handleSearch}>
          <select
            className="nav-search-category"
            value={searchCategory}
            onChange={e => setSearchCategory(e.target.value)}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            className="nav-search-input"
            type="text"
            placeholder="Search for products, services and more..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button className="nav-search-btn" type="submit" aria-label="Search">
            <FaSearch />
          </button>
        </form>

        {/* Mobile Toggle Button */}
        <button 
          className="nav-mobile-toggle" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Right Actions (always visible on desktop) */}
        <div className={`nav-actions ${isMobileMenuOpen ? 'is-open' : ''}`}>
          
          {/* Profile Dropdown */}
          <div className="nav-dropdown-wrapper" ref={dropdownRef}>
            <button 
              className="nav-action-item" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-expanded={isDropdownOpen}
              aria-label="Profile"
            >
              <FaUserCircle className="action-icon" />
              <span className="action-text">Login</span>
            </button>
            
            {isDropdownOpen && (
              <div className="nav-dropdown-menu">
                <a href="#login" className="nav-dropdown-item">Login</a>
                <a href="#register" className="nav-dropdown-item">Register</a>
              </div>
            )}
          </div>

          <div className="nav-divider" />

          {/* Cart */}
          <Link className="nav-action-item cart-btn" to="/cart" aria-label="Cart">
            <div className="cart-icon-wrapper">
              <FaShoppingCart className="action-icon" />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>
            <span className="action-text">My Cart</span>
          </Link>

          <Link className="nav-download-btn" to="/download-app">
            <FaDownload style={{ marginRight: '8px' }} /> Download App
          </Link>

        </div>
      </div>

      {/* Mobile Search Bar */}
      <form className="nav-search-bar-mobile" onSubmit={handleSearch}>
        <input
          className="nav-search-input"
          type="text"
          placeholder="Search for products, services..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button className="nav-search-btn" type="submit" aria-label="Search">
          <FaSearch />
        </button>
      </form>

      {/* Mobile Bottom Navbar */}
      <div className="mobile-bottom-nav">
        <Link to="/" className={`bottom-nav-item ${pathname === '/' ? 'active' : ''}`}>
          <FaHome className="bottom-nav-icon" />
          <span>Home</span>
        </Link>
        <Link to="/book-service" className={`bottom-nav-item ${pathname === '/book-service' ? 'active' : ''}`}>
          <FaTools className="bottom-nav-icon" />
          <span>Services</span>
        </Link>
        <Link to="/order-products" className={`bottom-nav-item ${pathname.startsWith('/order-products') ? 'active' : ''}`}>
          <FaBoxOpen className="bottom-nav-icon" />
          <span>Products</span>
        </Link>
        <Link to="/ventures" className={`bottom-nav-item ${pathname === '/ventures' ? 'active' : ''}`}>
          <FaChartLine className="bottom-nav-icon" />
          <span>Ventures</span>
        </Link>
        <Link to="/investors" className={`bottom-nav-item ${pathname === '/investors' ? 'active' : ''}`}>
          <FaHandshake className="bottom-nav-icon" />
          <span>Investors</span>
        </Link>
      </div>
    </nav>
  );
}
