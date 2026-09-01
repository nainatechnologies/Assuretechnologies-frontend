import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaShoppingCart, FaBars, FaTimes, FaDownload, FaSearch, FaHome, FaTools, FaBoxOpen, FaChartLine, FaHandshake } from 'react-icons/fa';
import { Logo } from './Logo';
import { PRODUCTS } from '../data/products';
import { useServices } from '../hooks/useServices';
import { useClickOutside } from '../hooks/useClickOutside';
import type { BackendService } from '../api/servicesApi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const BOTTOM_NAV = [
  { to: '/', label: 'Home', icon: FaHome, exact: true },
  { to: '/book-service', label: 'Services', icon: FaTools, exact: true },
  { to: '/order-products', label: 'Products', icon: FaBoxOpen, exact: false },
  { to: '/ventures', label: 'Ventures', icon: FaChartLine, exact: true },
  { to: '/investors', label: 'Investors', icon: FaHandshake, exact: true },
];

function SearchBar({ isMobile }: { isMobile?: boolean }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { services } = useServices();

  useClickOutside(wrapperRef, useCallback(() => setShowSuggestions(false), []));

  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); setShowSuggestions(false); setHighlightedIndex(-1); return; }

    const q = query.toLowerCase();
    const phrases = new Set<string>();

    services.forEach((s: BackendService) => {
      phrases.add(s.name.toLowerCase());
      if (s.category?.name) phrases.add(`${s.category.name.toLowerCase()} services`);
    });
    PRODUCTS.forEach(p => {
      phrases.add(p.name.toLowerCase());
      const words = p.name.toLowerCase().split(' ');
      if (words.length >= 2) phrases.add(`${words[0]} ${words[1]}`);
    });

    const matches = [...phrases]
      .filter(p => p.includes(q))
      .sort((a, b) => {
        const aS = a.startsWith(q) ? -1 : 1;
        const bS = b.startsWith(q) ? -1 : 1;
        return aS - bS || a.length - b.length;
      })
      .slice(0, 10);

    setSuggestions(matches);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  }, [query, services]);

  const handleSearch = (e?: React.FormEvent, submitQuery = query) => {
    if (e) e.preventDefault();
    if (submitQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(submitQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      setQuery(suggestions[highlightedIndex]);
      handleSearch(undefined, suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={`nav-search ${isMobile ? 'mobile-search' : ''}`} ref={wrapperRef}>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search products or services..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            if (query.trim()) setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          className="search-input"
          aria-label="Search products and services"
        />
        <button type="submit" className="search-btn" aria-label="Submit search">
          <FaSearch />
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-dropdown" role="listbox">
          {suggestions.map((item, index) => (
            <li
              key={index}
              className={`suggestion-item ${index === highlightedIndex ? 'highlighted' : ''}`}
              onClick={() => {
                setQuery(item);
                handleSearch(undefined, item);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              role="option"
              aria-selected={index === highlightedIndex}
            >
              <FaSearch className="suggestion-icon" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Navbar() {
  const { isLoggedIn, userName, logout } = useAuth();
  const { cartCount } = useCart();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, useCallback(() => setIsDropdownOpen(false), []));
  useEffect(() => { setIsMobileMenuOpen(false); }, [pathname]);

  return (
    <nav className="nav-container">
      <div className="nav-content">
        <Link className="nav-brand" to="/">
          <Logo />
        </Link>

        <SearchBar />

        <Link className="nav-mobile-cart" to="/cart" aria-label="Cart">
          <div className="cart-icon-wrapper">
            <FaShoppingCart className="action-icon" />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>
        </Link>

        <button className="nav-mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle navigation">
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`nav-actions ${isMobileMenuOpen ? 'is-open' : ''}`}>

          {/* Profile Dropdown */}
          <div 
            className="nav-dropdown-wrapper" 
            ref={dropdownRef} 
            onMouseEnter={() => setIsDropdownOpen(true)} 
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button 
              className={`nav-action-item ${isDropdownOpen ? 'active' : ''}`}
              onClick={() => setIsDropdownOpen(prev => !prev)}
              aria-expanded={isDropdownOpen}
              aria-label="Profile"
            >
              <FaUserCircle className="action-icon" />
              <span className="action-text">{isLoggedIn && userName ? userName.split(' ')[0] : 'Login'}</span>
            </button>

            {isDropdownOpen && (
              <div className="nav-dropdown-menu">
                {isLoggedIn ? (
                  <>
                    <Link to="/profile" className="nav-dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      My Profile
                    </Link>
                    <Link to="/orders" className="nav-dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      My Orders
                    </Link>
                    <div className="nav-dropdown-divider" />
                    <button 
                      className="nav-dropdown-item logout-btn" 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="nav-dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      Login
                    </Link>
                    <Link to="/register" className="nav-dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Link className="nav-action-item desktop-cart" to="/cart">
            <div className="cart-icon-wrapper">
              <FaShoppingCart className="action-icon" />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>
            <span className="action-text">Cart</span>
          </Link>

          <a href="/app-download" className="nav-download-btn">
            <FaDownload />
            <span>Download App</span>
          </a>
        </div>
      </div>

      <div className="nav-mobile-search-row">
        <SearchBar isMobile />
      </div>

      <div className="mobile-bottom-nav">
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.to
            : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="mobile-bottom-nav-icon" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
