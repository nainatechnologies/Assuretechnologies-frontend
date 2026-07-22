import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaShoppingCart, FaBars, FaTimes, FaDownload, FaSearch, FaHome, FaTools, FaBoxOpen, FaChartLine, FaHandshake } from 'react-icons/fa';
import { Logo } from './Logo';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { SERVICES } from '../data/services';
import './Navbar.css';

function SearchBar({ isMobile }: { isMobile?: boolean }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim()) {
      const q = query.toLowerCase();
      let phrases: string[] = [];
      
      SERVICES.forEach(s => {
        phrases.push(s.title.toLowerCase());
        phrases.push(`${s.label.toLowerCase()} services`);
      });
      
      PRODUCTS.forEach(p => {
        phrases.push(p.name.toLowerCase());
        const words = p.name.toLowerCase().split(' ');
        if (words.length >= 2) {
          phrases.push(`${words[0]} ${words[1]}`);
        }
      });

      const uniquePhrases = Array.from(new Set(phrases));
      const matches = uniquePhrases.filter(p => p.includes(q));
      matches.sort((a, b) => {
        const aStarts = a.startsWith(q) ? -1 : 1;
        const bStarts = b.startsWith(q) ? -1 : 1;
        return aStarts - bStarts || a.length - b.length;
      });

      setSuggestions(matches.slice(0, 10));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setHighlightedIndex(-1);
  }, [query]);

  const handleSearch = (e?: React.FormEvent, submitQuery = query) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (submitQuery.trim()) params.set('q', submitQuery.trim());
    navigate(`/order-products?${params.toString()}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0) {
        e.preventDefault();
        setQuery(suggestions[highlightedIndex]);
        handleSearch(undefined, suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={`nav-search-wrapper ${isMobile ? 'mobile' : ''}`} ref={wrapperRef}>
      <form className={isMobile ? "nav-search-bar-mobile" : "nav-search-bar"} onSubmit={handleSearch}>

        <input
          className="nav-search-input"
          type="text"
          placeholder={isMobile ? "Search for products, services..." : "Search for products, services and more..."}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { if (query) setShowSuggestions(true); }}
          onKeyDown={onKeyDown}
        />
        <button className="nav-search-btn" type="submit" aria-label="Search">
          <FaSearch />
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="search-autocomplete-dropdown">
          {suggestions.map((suggestion, index) => {
            const matchIndex = suggestion.indexOf(query.toLowerCase());
            const before = suggestion.substring(0, matchIndex);
            const match = suggestion.substring(matchIndex, matchIndex + query.length);
            const after = suggestion.substring(matchIndex + query.length);

            return (
              <div 
                key={suggestion} 
                className={`search-suggestion-item ${index === highlightedIndex ? 'highlighted' : ''}`}
                onClick={() => {
                  setQuery(suggestion);
                  handleSearch(undefined, suggestion);
                }}
              >
                <FaSearch className="suggestion-search-icon" />
                <span className="suggestion-text">
                  {before && <strong>{before}</strong>}
                  {match}
                  {after && <strong>{after}</strong>}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Navbar({ 
  cartCount = 0, 
  isLoggedIn = false, 
  setIsLoggedIn 
}: { 
  cartCount?: number;
  isLoggedIn?: boolean;
  setIsLoggedIn?: (value: boolean) => void;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  return (
    <nav className="nav-container">
      <div className="nav-content">
        
        {/* Brand */}
        <Link className="nav-brand" to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Logo />
        </Link>

        {/* Search Bar */}
        <SearchBar />

        {/* Mobile Cart Button */}
        <Link className="nav-mobile-cart" to="/cart" aria-label="Cart">
          <div className="cart-icon-wrapper">
            <FaShoppingCart className="action-icon" />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>
        </Link>

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
                {isLoggedIn ? (
                  <>
                    <Link to="/profile" className="nav-dropdown-item" onClick={() => setIsDropdownOpen(false)}>My Profile</Link>
                    <Link to="/orders" className="nav-dropdown-item" onClick={() => setIsDropdownOpen(false)}>My Orders</Link>
                    <div style={{ borderTop: '1px solid #e2e8f0', margin: '5px 0' }} />
                    <button 
                      className="nav-dropdown-item" 
                      style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        if (setIsLoggedIn) setIsLoggedIn(false);
                        navigate('/');
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="nav-dropdown-item" onClick={() => setIsDropdownOpen(false)}>Login</Link>
                    <Link to="/register" className="nav-dropdown-item" onClick={() => setIsDropdownOpen(false)}>Register</Link>
                  </>
                )}
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
      <SearchBar isMobile={true} />

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
