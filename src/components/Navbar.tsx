import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaShoppingCart, FaBars, FaTimes, FaDownload, FaSearch, FaHome, FaTools, FaBoxOpen, FaChartLine, FaHandshake, FaArrowRight, FaPlus, FaMinus } from 'react-icons/fa';
import { Logo } from './Logo';
import { useServices } from '../hooks/useServices';
import { useClickOutside } from '../hooks/useClickOutside';
import type { BackendService } from '../api/servicesApi';
import { productsApi } from '../api/productsApi';
import { BASE_URL } from '../services/api';
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

interface SearchSuggestion {
  type: 'product' | 'service';
  id: string;
  name: string;
  category?: string;
  price?: number;
  rate?: string;
  image?: string;
  url: string;
}

function SearchBar({ isMobile }: { isMobile?: boolean }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [liveProducts, setLiveProducts] = useState<any[]>([]);
  const [productSuggestions, setProductSuggestions] = useState<SearchSuggestion[]>([]);
  const [serviceSuggestions, setServiceSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { services } = useServices();
  const { cart, addToCart, updateCartItem, removeFromCart } = useCart();

  useClickOutside(wrapperRef, useCallback(() => setShowSuggestions(false), []));

  // Debounce search query (200ms) for snappy, non-blocking autocomplete
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch live products from backend database on mount
  useEffect(() => {
    let isMounted = true;
    productsApi.fetchProducts({ limit: 100 })
      .then(res => {
        if (!isMounted) return;
        const raw = res?.data?.data || [];
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map((p: any) => {
            const base = parseFloat(p.base_price) || 0;
            const disc = parseFloat(p.discount) || 0;
            const img = p.banner
              ? (p.banner.startsWith('http') || p.banner.startsWith('blob:')
                ? p.banner
                : `${BASE_URL}${p.banner.startsWith('/') ? '' : '/'}${p.banner}`)
              : 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=100&h=100&fit=crop';
            return {
              id: p.id || p.product_id,
              name: p.name,
              category: p.category || 'General',
              price: disc > 0 ? base - (base * (disc / 100)) : base,
              image: img
            };
          });
          setLiveProducts(mapped);
        } else {
          setLiveProducts([]);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setLiveProducts([]);
      });

    return () => { isMounted = false; };
  }, []);

  // Flattened list for keyboard navigation: products + services + "view all" row
  const allSuggestions = useMemo(() => {
    return [...productSuggestions, ...serviceSuggestions];
  }, [productSuggestions, serviceSuggestions]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setProductSuggestions([]);
      setServiceSuggestions([]);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      return;
    }

    const q = debouncedQuery.toLowerCase().trim();

    // 1. Filter Live Products from backend
    const productPool = liveProducts;

    const matchedProducts: SearchSuggestion[] = productPool.filter((p: any) =>
      p.name.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q))
    ).slice(0, 5).map((p: any) => ({
      type: 'product',
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      image: p.image,
      url: `/order-products?q=${encodeURIComponent(p.name)}`
    }));

    // 2. Filter Services & Navigate to Category Landing View
    const matchedServices: SearchSuggestion[] = (services || []).filter((s: BackendService) =>
      s.name.toLowerCase().includes(q) ||
      (s.category?.name && s.category.name.toLowerCase().includes(q))
    ).slice(0, 4).map((s: BackendService) => {
      const catName = s.category?.name || s.name;
      return {
        type: 'service',
        id: s.id,
        name: s.name,
        category: catName,
        rate: s.price ? `₹${parseFloat(s.price).toLocaleString('en-IN')}` : s.prebooking_charge ? `From ₹${parseFloat(s.prebooking_charge).toLocaleString('en-IN')}` : undefined,
        url: `/book-service?category=${encodeURIComponent(catName)}`
      };
    });

    setProductSuggestions(matchedProducts);
    setServiceSuggestions(matchedServices);
    setShowSuggestions(matchedProducts.length > 0 || matchedServices.length > 0);
    setHighlightedIndex(-1);
  }, [query, liveProducts, services]);

  const handleSearch = (e?: React.FormEvent, submitQuery = query) => {
    if (e) e.preventDefault();
    if (submitQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(submitQuery.trim())}`);
    }
  };

  const handleSelectSuggestion = (item: SearchSuggestion) => {
    setShowSuggestions(false);
    navigate(item.url);
  };

  const totalNavigable = allSuggestions.length + 1; // +1 for "View all results" option

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || allSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < totalNavigable - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : totalNavigable - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < allSuggestions.length) {
        handleSelectSuggestion(allSuggestions[highlightedIndex]);
      } else {
        handleSearch(undefined, query);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={`nav-search-wrapper ${isMobile ? 'mobile' : ''}`} ref={wrapperRef}>
      <form onSubmit={handleSearch} className={isMobile ? 'nav-search-bar-mobile' : 'nav-search-bar'}>
        <input
          type="text"
          placeholder="Search products or services..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            if (query.trim() && (productSuggestions.length > 0 || serviceSuggestions.length > 0)) {
              setShowSuggestions(true);
            }
          }}
          onKeyDown={handleKeyDown}
          className="nav-search-input"
          aria-label="Search products and services"
        />
        <button type="submit" className="nav-search-btn" aria-label="Submit search">
          <FaSearch />
        </button>
      </form>

      {showSuggestions && (productSuggestions.length > 0 || serviceSuggestions.length > 0) && (
        <div className="search-autocomplete-dropdown" role="listbox">
          {productSuggestions.length > 0 && (
            <div className="search-dropdown-group">
              <div className="search-dropdown-group-title">
                <FaBoxOpen /> Products
              </div>
              {productSuggestions.map((item, idx) => {
                const globalIndex = idx;
                const qtyInCart = cart[item.id] || 0;

                return (
                  <div
                    key={`prod-${item.id}`}
                    className={`search-suggestion-item product-row ${globalIndex === highlightedIndex ? 'highlighted' : ''}`}
                    onClick={() => handleSelectSuggestion(item)}
                    onMouseEnter={() => setHighlightedIndex(globalIndex)}
                    role="option"
                    aria-selected={globalIndex === highlightedIndex}
                  >
                    <div className="suggestion-item-main">
                      <div className="suggestion-product-thumb">
                        <img src={item.image} alt={item.name} loading="lazy" />
                      </div>
                      <div className="suggestion-text-group">
                        <span className="suggestion-title">{item.name}</span>
                        {item.price !== undefined && (
                          <span className="suggestion-price-green">₹{item.price.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>

                    {/* GowMithra In-Place Cart Stepper */}
                    <div className="suggestion-cart-action" onClick={(e) => e.stopPropagation()}>
                      {qtyInCart > 0 ? (
                        <div className="dropdown-stepper">
                          <button
                            type="button"
                            className="dropdown-stepper-btn minus"
                            onClick={() => {
                              if (qtyInCart <= 1) {
                                removeFromCart(item.id);
                              } else {
                                updateCartItem(item.id, qtyInCart - 1);
                              }
                            }}
                            aria-label="Decrease quantity"
                          >
                            <FaMinus />
                          </button>
                          <span className="dropdown-stepper-qty">{qtyInCart}</span>
                          <button
                            type="button"
                            className="dropdown-stepper-btn plus"
                            onClick={() => updateCartItem(item.id, qtyInCart + 1)}
                            aria-label="Increase quantity"
                          >
                            <FaPlus />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="dropdown-add-cart-btn"
                          onClick={() => addToCart(item.id, 1)}
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {serviceSuggestions.length > 0 && (
            <div className="search-dropdown-group">
              <div className="search-dropdown-group-title">
                <FaTools /> Services & Categories
              </div>
              {serviceSuggestions.map((item, idx) => {
                const globalIndex = productSuggestions.length + idx;
                return (
                  <div
                    key={`svc-${item.id}`}
                    className={`search-suggestion-item service-row ${globalIndex === highlightedIndex ? 'highlighted' : ''}`}
                    onClick={() => handleSelectSuggestion(item)}
                    onMouseEnter={() => setHighlightedIndex(globalIndex)}
                    role="option"
                    aria-selected={globalIndex === highlightedIndex}
                  >
                    <div className="suggestion-item-main">
                      <span className="suggestion-type-badge service">
                        <FaTools />
                      </span>
                      <div className="suggestion-text-group">
                        <span className="suggestion-title">{item.name}</span>
                        {item.category && <span className="suggestion-category-tag">{item.category} Category ➔</span>}
                      </div>
                    </div>
                    {item.rate && <span className="suggestion-rate">{item.rate}</span>}
                  </div>
                );
              })}
            </div>
          )}

          <div
            className={`search-dropdown-footer ${highlightedIndex === allSuggestions.length ? 'highlighted' : ''}`}
            onClick={() => handleSearch(undefined, query)}
            onMouseEnter={() => setHighlightedIndex(allSuggestions.length)}
          >
            <span>View all results for "<strong>{query}</strong>"</span>
            <FaArrowRight className="footer-arrow" />
          </div>
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

          {/* Profile / Login */}
          {isLoggedIn ? (
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
                <span className="action-text">{userName ? userName.split(' ')[0] : 'Account'}</span>
              </button>

              {isDropdownOpen && (
                <div className="nav-dropdown-menu">
                  <Link to="/profile" className="nav-dropdown-item" onClick={() => { setIsDropdownOpen(false); setIsMobileMenuOpen(false); }}>
                    My Profile
                  </Link>
                  <Link to="/orders" className="nav-dropdown-item" onClick={() => { setIsDropdownOpen(false); setIsMobileMenuOpen(false); }}>
                    My Orders
                  </Link>
                  <div className="nav-dropdown-divider" />
                  <button 
                    className="nav-dropdown-item logout-btn" 
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsMobileMenuOpen(false);
                      logout();
                      navigate('/');
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login" 
              className="nav-action-item" 
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsDropdownOpen(false);
              }}
              aria-label="Login"
            >
              <FaUserCircle className="action-icon" />
              <span className="action-text">Login</span>
            </Link>
          )}

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

      <SearchBar isMobile />

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
