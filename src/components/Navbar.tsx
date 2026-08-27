import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaShoppingCart, FaBars, FaTimes, FaDownload, FaSearch, FaHome, FaTools, FaBoxOpen, FaChartLine, FaHandshake } from 'react-icons/fa';
import { Logo } from './Logo';
import { PRODUCTS } from '../data/products';
import { useServices } from '../hooks/useServices';
import { useClickOutside } from '../hooks/useClickOutside';
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

    services.forEach(s => {
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
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (submitQuery.trim()) params.set('q', submitQuery.trim());
    navigate(`/order-products?${params.toString()}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightedIndex(i => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter' && highlightedIndex >= 0) { e.preventDefault(); setQuery(suggestions[highlightedIndex]); handleSearch(undefined, suggestions[highlightedIndex]); }
    else if (e.key === 'Escape') setShowSuggestions(false);
  };

  return (
    <div className={`nav-search-wrapper ${isMobile ? 'mobile' : ''}`} ref={wrapperRef}>
      <form className={isMobile ? 'nav-search-bar-mobile' : 'nav-search-bar'} onSubmit={handleSearch}>
        <input
          className="nav-search-input"
          type="text"
          placeholder={isMobile ? 'Search for products, services...' : 'Search for products, services and more...'}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { if (query) setShowSuggestions(true); }}
          onKeyDown={onKeyDown}
        />
        <button className="nav-search-btn" type="submit" aria-label="Search"><FaSearch /></button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="search-autocomplete-dropdown">
          {suggestions.map((s, i) => {
            const idx = s.indexOf(query.toLowerCase());
            return (
              <div
                key={s}
                className={`search-suggestion-item ${i === highlightedIndex ? 'highlighted' : ''}`}
                onClick={() => { setQuery(s); handleSearch(undefined, s); }}
              >
                <FaSearch className="suggestion-search-icon" />
                <span className="suggestion-text">
                  {idx > 0 && <strong>{s.slice(0, idx)}</strong>}
                  {s.slice(idx, idx + query.length)}
                  {idx + query.length < s.length && <strong>{s.slice(idx + query.length)}</strong>}
                </span>
              </div>
            );
          })}
        </div>
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

  const closeDropdown = () => setIsDropdownOpen(false);

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
          <div className="nav-dropdown-wrapper" ref={dropdownRef} onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
            <button
              className="nav-action-item"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
                    <Link to="/profile" className="nav-dropdown-item" onClick={closeDropdown}>My Profile</Link>
                    <Link to="/orders" className="nav-dropdown-item" onClick={closeDropdown}>My Orders</Link>
                    <div className="nav-dropdown-divider" />
                    <button className="nav-dropdown-item nav-dropdown-btn" onClick={() => { closeDropdown(); logout(); navigate('/'); }}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="nav-dropdown-item" onClick={closeDropdown}>Login</Link>
                    <Link to="/register" className="nav-dropdown-item" onClick={closeDropdown}>Register</Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="nav-divider" />

          <Link className="nav-action-item cart-btn" to="/cart" aria-label="Cart">
            <div className="cart-icon-wrapper">
              <FaShoppingCart className="action-icon" />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>
            <span className="action-text">My Cart</span>
          </Link>

          <Link className="nav-download-btn" to="/download-app">
            <FaDownload className="nav-download-icon" /> Download App
          </Link>
        </div>
      </div>

      <SearchBar isMobile />

      <div className="mobile-bottom-nav">
        {BOTTOM_NAV.map(({ to, label, icon: Icon, exact }) => (
          <Link
            key={to}
            to={to}
            className={`bottom-nav-item ${exact ? pathname === to ? 'active' : '' : pathname.startsWith(to) ? 'active' : ''}`}
          >
            <Icon className="bottom-nav-icon" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
