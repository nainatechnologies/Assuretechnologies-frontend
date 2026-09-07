import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaTools, FaCheck, FaBoxOpen, FaSlidersH, FaArrowRight } from 'react-icons/fa';
import { productsApi } from '../api/productsApi';
import { BASE_URL } from '../services/api';
import type { Product } from '../data/products';
import { fetchAllServices, type BackendService } from '../api/servicesApi';
import { useServices } from '../hooks/useServices';
import { useCart } from '../context/CartContext';
import { SEOHead } from './SEOHead';
import './SearchPage.css';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const initialTab = (searchParams.get('tab') as 'all' | 'products' | 'services') || 'all';

  const [inputQuery, setInputQuery] = useState(query);
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'services'>(initialTab);
  const [sortBy, setSortBy] = useState<string>('relevance');

  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<BackendService[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  const { addToCart } = useCart();
  const { services: fallbackServices } = useServices();

  useEffect(() => {
    setInputQuery(query);
  }, [query]);

  // Debounce live typing in SearchPage's refine bar (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = inputQuery.trim();
      if (trimmed !== query) {
        setSearchParams({ q: trimmed, tab: activeTab });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [inputQuery, activeTab, query, setSearchParams]);

  // Debounce API search execution (200ms) with request cancellation
  useEffect(() => {
    let isCancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);
      const q = query.trim().toLowerCase();

      try {
        // 1. Fetch live products from backend API
        let fetchedProducts: Product[] = [];
        try {
          const prodRes = await productsApi.fetchProducts({ search: q, limit: 50 });
          const backendData = prodRes?.data?.data;
          if (Array.isArray(backendData) && backendData.length > 0) {
            fetchedProducts = backendData.map((p: any) => {
              const base = parseFloat(p.base_price) || 0;
              const disc = parseFloat(p.discount) || 0;
              const img = p.banner
                ? (p.banner.startsWith('http') || p.banner.startsWith('blob:')
                  ? p.banner
                  : `${BASE_URL}${p.banner.startsWith('/') ? '' : '/'}${p.banner}`)
                : 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop';
              return {
                id: p.id || p.product_id,
                name: p.name,
                service: p.category || p.service || 'General',
                price: disc > 0 ? base - (base * (disc / 100)) : base,
                originalPrice: base,
                discount: disc,
                description: p.description || '',
                image: img,
                rating: Number(p.rating) || 4.5,
                reviewCount: Number(p.reviewCount) || 20,
                inStock: p.stock > 0
              };
            });
          }
        } catch (apiErr) {
          console.warn('Backend product search failed:', apiErr);
        }

        // 2. Fetch services from API & fallback
        let fetchedServices: BackendService[] = [];
        try {
          fetchedServices = await fetchAllServices(q);
        } catch {
          // Fallback to hook data
          fetchedServices = fallbackServices;
        }

        if (q && fetchedServices.length === 0 && fallbackServices.length > 0) {
          fetchedServices = fallbackServices.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.category?.name?.toLowerCase().includes(q)
          );
        }

        if (!isCancelled) {
          setProducts(fetchedProducts);
          setServices(fetchedServices);
        }
      } catch (err) {
        console.error('Error executing search:', err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query, fallbackServices]);

  const handleRefineSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      setSearchParams({ q: inputQuery.trim(), tab: activeTab });
    }
  };

  const handleTabChange = (tab: 'all' | 'products' | 'services') => {
    setActiveTab(tab);
    setSearchParams({ q: query, tab });
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id, 1);
      setAddedItemIds(prev => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setAddedItemIds(prev => ({ ...prev, [product.id]: false }));
      }, 2000);
    } catch (e) {
      console.error('Failed to add product to cart:', e);
    }
  };

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sortBy === 'price-asc') {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return list.sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'name') {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [products, sortBy]);

  const totalResults = products.length + services.length;

  return (
    <div className="search-page">
      <SEOHead
        title={query ? `Search: "${query}" | Assure Technologies` : 'Search Products & Services | Assure Technologies'}
        description={`Explore our wide selection of enterprise networking, solar, and surveillance products, and on-demand professional technician services.`}
      />

      <div className="search-container">
        {/* ── Header & Search Input ──────────────────────── */}
        <div className="search-header">
          <div className="search-header-top">
            <div className="search-title-area">
              <h1 className="search-title">
                {query ? (
                  <>Search results for: <span>"{query}"</span></>
                ) : (
                  'Search Products & Services'
                )}
              </h1>
              <p className="search-subtitle">
                {loading ? 'Searching catalog...' : `${totalResults} total ${totalResults === 1 ? 'item' : 'items'} found`}
              </p>
            </div>

            <form onSubmit={handleRefineSubmit} className="search-refine-form">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Search products or services..."
                className="search-refine-input"
              />
              <button type="submit" className="search-refine-btn">
                <FaSearch /> Search
              </button>
            </form>
          </div>

          {/* ── Tabs and Sorting Controls ─────────────────── */}
          <div className="search-controls">
            <div className="search-tabs">
              <button
                className={`search-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => handleTabChange('all')}
              >
                All Results <span className="search-tab-count">{totalResults}</span>
              </button>
              <button
                className={`search-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => handleTabChange('products')}
              >
                <FaBoxOpen /> Products <span className="search-tab-count">{products.length}</span>
              </button>
              <button
                className={`search-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => handleTabChange('services')}
              >
                <FaTools /> Services <span className="search-tab-count">{services.length}</span>
              </button>
            </div>

            {(activeTab === 'all' || activeTab === 'products') && products.length > 0 && (
              <div className="search-sort-wrapper">
                <FaSlidersH />
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="search-sort-select"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* ── Content Area ──────────────────────────────── */}
        {loading ? (
          <div className="search-loading">
            <div className="search-spinner" />
            <p>Finding matching products and services...</p>
          </div>
        ) : totalResults === 0 ? (
          <div className="search-empty-state">
            <div className="search-empty-icon">
              <FaSearch />
            </div>
            <h2 className="search-empty-title">No matches found for "{query}"</h2>
            <p className="search-empty-desc">
              We couldn't find any products or services matching your keywords. Please try adjusting your terms or explore our popular categories below.
            </p>

            <div className="search-empty-suggestions">
              <h4>Popular Searches & Categories:</h4>
              <div className="search-category-chips">
                {['Solar', 'CCTV', 'Networking', 'Gate Motor', 'Switch', 'Smart Home', 'Fiber Optic', 'Technician'].map(chip => (
                  <button
                    key={chip}
                    onClick={() => {
                      setInputQuery(chip);
                      setSearchParams({ q: chip, tab: 'all' });
                    }}
                    className="search-chip"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ── Products Section ──────────────────────── */}
            {(activeTab === 'all' || activeTab === 'products') && sortedProducts.length > 0 && (
              <div className="search-section">
                <div className="search-section-header">
                  <h2 className="search-section-title">
                    <FaBoxOpen /> Products
                    <span className="search-section-badge">{sortedProducts.length}</span>
                  </h2>
                  {activeTab === 'all' && sortedProducts.length > 6 && (
                    <button
                      className="search-chip"
                      onClick={() => handleTabChange('products')}
                    >
                      View all {sortedProducts.length} products ➔
                    </button>
                  )}
                </div>

                <div className="search-grid">
                  {(activeTab === 'all' ? sortedProducts.slice(0, 8) : sortedProducts).map(product => (
                    <div key={product.id} className="search-product-card">
                      <div className="search-product-image-wrap">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="search-product-image"
                          loading="lazy"
                        />
                        {product.discount > 0 && (
                          <span className="search-discount-tag">{product.discount}% OFF</span>
                        )}
                      </div>

                      <div className="search-product-body">
                        <span className="search-product-category">{product.service}</span>
                        <h3 className="search-product-name" title={product.name}>
                          {product.name}
                        </h3>
                        <p className="search-product-desc">
                          {product.description}
                        </p>

                        <div className="search-product-footer">
                          <div className="search-price-block">
                            <span className="search-current-price">₹{product.price.toLocaleString('en-IN')}</span>
                            {product.originalPrice > product.price && (
                              <span className="search-original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                            )}
                          </div>

                          <button
                            onClick={() => handleAddToCart(product)}
                            className={`search-add-btn ${addedItemIds[product.id] ? 'added' : ''}`}
                          >
                            {addedItemIds[product.id] ? (
                              <>
                                <FaCheck /> Added
                              </>
                            ) : (
                              <>
                                <FaShoppingCart /> Add to Cart
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Services Section ──────────────────────── */}
            {(activeTab === 'all' || activeTab === 'services') && services.length > 0 && (
              <div className="search-section">
                <div className="search-section-header">
                  <h2 className="search-section-title">
                    <FaTools /> Services & Technicians
                    <span className="search-section-badge">{services.length}</span>
                  </h2>
                  {activeTab === 'all' && services.length > 6 && (
                    <button
                      className="search-chip"
                      onClick={() => handleTabChange('services')}
                    >
                      View all {services.length} services ➔
                    </button>
                  )}
                </div>

                <div className="search-grid">
                  {(activeTab === 'all' ? services.slice(0, 8) : services).map(service => {
                    const priceDisplay = service.price
                      ? `₹${parseFloat(service.price).toLocaleString('en-IN')}`
                      : service.prebooking_charge
                      ? `From ₹${parseFloat(service.prebooking_charge).toLocaleString('en-IN')}`
                      : 'Fixed Quote';

                    return (
                      <div key={service.id} className="search-service-card">
                        <div className="search-service-header">
                          <div className="search-service-icon">
                            <FaTools />
                          </div>
                          <div className="search-service-title-area">
                            <span className="search-service-category">
                              {service.category?.name || 'On-Demand Service'}
                            </span>
                            <h3 className="search-service-name">{service.name}</h3>
                          </div>
                        </div>

                        <div className="search-service-body">
                          <p className="search-service-desc">
                            Verified professional technician support, same-day site visit, and genuine equipment warranty.
                          </p>
                        </div>

                        <div className="search-service-footer">
                          <div className="search-service-rate">
                            {priceDisplay} {service.pricingUnitName && <span>/ {service.pricingUnitName}</span>}
                          </div>

                          <Link
                            to={`/book-service?category=${encodeURIComponent(service.category?.name || service.name)}`}
                            className="search-book-btn"
                          >
                            View Category <FaArrowRight />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'products' && sortedProducts.length === 0 && (
              <div className="search-empty-state" style={{ padding: '3rem 1rem' }}>
                <div className="search-empty-icon"><FaBoxOpen /></div>
                <h3 className="search-empty-title">No products found matching "{query}"</h3>
                <p className="search-empty-desc">Try checking the Services tab or adjusting your search keywords.</p>
              </div>
            )}

            {activeTab === 'services' && services.length === 0 && (
              <div className="search-empty-state" style={{ padding: '3rem 1rem' }}>
                <div className="search-empty-icon"><FaTools /></div>
                <h3 className="search-empty-title">No services found matching "{query}"</h3>
                <p className="search-empty-desc">Try checking the Products tab or adjusting your search keywords.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
