import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaPlus, FaMinus, FaShoppingCart, FaTools } from 'react-icons/fa';
import { productsApi } from '../api/productsApi';
import { useServices } from '../hooks/useServices';
import { useCart } from '../context/CartContext';
import { SEOHead } from './SEOHead';
import { StructuredData } from './StructuredData';
import './OrderProductsPage.css';

export function OrderProductsPage() {
  const { cart, setCart } = useCart();
  const { services: allServices } = useServices();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('popular');
  const [viewMode] = useState<'grid' | 'list'>('grid');
  const searchSeqRef = useRef(0);

  const [serviceLimit, setServiceLimit] = useState(8);

  const categoryQuery = (category || '').trim().toLowerCase();
  const searchQuery = (debouncedSearch || '').trim().toLowerCase();

  const matchingServices = useMemo(() => {
    if (categoryQuery || searchQuery) {
      return allServices.filter(svc => {
        const catName = svc.category?.name?.toLowerCase() || '';
        const svcName = svc.name?.toLowerCase() || '';
        const matchesCat = !categoryQuery || catName.includes(categoryQuery) || svcName.includes(categoryQuery);
        const matchesSearch = !searchQuery || svcName.includes(searchQuery) || catName.includes(searchQuery);
        return matchesCat && matchesSearch;
      });
    }
    return allServices;
  }, [allServices, categoryQuery, searchQuery]);

  const visibleServices = useMemo(() => {
    return matchingServices.slice(0, serviceLimit);
  }, [matchingServices, serviceLimit]);

  useEffect(() => {
    setServiceLimit(8);
  }, [category, debouncedSearch]);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || '';
    setSearch(q);
    setDebouncedSearch(q);
    setCategory(cat);
  }, [searchParams]);

  // Debounce live typing in search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const loadProducts = async (isLoadMore = false) => {
    const seq = ++searchSeqRef.current;
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const currentPage = isLoadMore ? page + 1 : 1;
      const response = await productsApi.fetchProducts({
        page: currentPage,
        limit: 12,
        search: debouncedSearch.trim(),
        category,
        sort
      });

      // Ignore stale response if a newer search request was initiated
      if (seq !== searchSeqRef.current) return;

      let fetchedProducts = response.data.data || [];

      if (isLoadMore) {
        setProducts(prev => [...prev, ...fetchedProducts]);
      } else {
        setProducts(fetchedProducts);
      }

      setPage(currentPage);
      setHasMore(currentPage < (response.data.pagination?.totalPages || 1));
    } catch (error) {
      if (seq !== searchSeqRef.current) return;
      console.error("Failed to load products", error);
    } finally {
      if (seq === searchSeqRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    loadProducts(false);
  }, [debouncedSearch, category, sort]);

  const updateQty = async (id: string, delta: number) => {
    const currentQty = cart[id] || 0;
    const next = currentQty + delta;
    if (next <= 0) {
      // Assuming removeFromCart is available in useCart if we want to use it, 
      // but setCart is also fine since we exported it for backwards compat.
      // Better to use the backend API:
      try {
        await productsApi.removeFromCart(id);
      } catch (e) {}
      setCart(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } else {
      try {
        await productsApi.updateCartItem(id, next);
      } catch(e) {
        if(currentQty === 0) {
          try { await productsApi.addToCart(id, next); } catch(e){}
        }
      }
      setCart(prev => ({ ...prev, [id]: next }));
    }
  };

  return (
    <>
      <SEOHead 
        title={category ? `${category} Equipment & Hardware Store` : 'Order Certified Products & Hardware'}
        description={`Browse genuine hardware, components, networking gear, and solar systems at Assure Technologies.`}
        canonicalUrl="https://assuretechnologies.com/order-products"
      />
      <StructuredData 
        type="breadcrumb"
        data={{
          items: [
            { name: 'Home', url: 'https://assuretechnologies.com/' },
            { name: 'Order Products', url: 'https://assuretechnologies.com/order-products' }
          ]
        }}
      />
      <div className="op-page">
      <div className="op-layout">
        <main className="op-main">
          {/* Services Section */}
          {matchingServices.length > 0 && (
            <div className="op-services-section">
              <h3 className="op-section-title">
                {category ? `Matching Services in ${category}` : debouncedSearch ? `Matching Services for "${debouncedSearch}"` : 'Featured Services'}
              </h3>
              <div className="op-services-list">
                {visibleServices.map(service => (
                  <div key={service.id} className="op-service-item">
                    {service.image ? (
                      <img src={service.image} alt={service.name} className="op-service-img" />
                    ) : (
                      <div className="op-service-icon">
                        <FaTools size={24} />
                      </div>
                    )}
                    <div className="op-service-info">
                      <span className="op-service-label">{service.category?.name || category || 'Service'}</span>
                      <h4 className="op-service-title">{service.name}</h4>
                      {(service.price || service.prebooking_charge || service.rate) && (
                        <span style={{ fontSize: '0.82rem', color: '#666', marginTop: '3px', display: 'block', fontWeight: 500 }}>
                          From ₹{Number(service.price || service.prebooking_charge || service.rate).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/book-service?service=${encodeURIComponent(service.name)}&autoOpen=true`}
                      className="op-service-btn"
                    >
                      Book Now
                    </Link>
                  </div>
                ))}
              </div>
              {matchingServices.length > visibleServices.length && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                  <button
                    onClick={() => setServiceLimit(prev => prev + 8)}
                    style={{
                      padding: '8px 20px',
                      backgroundColor: '#0d47a1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={e => (e.currentTarget.style.backgroundColor = '#fb8c00')}
                    onMouseOut={e => (e.currentTarget.style.backgroundColor = '#0d47a1')}
                  >
                    Load More Services ({matchingServices.length - visibleServices.length} remaining)
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="op-header-container">
            <h3 className="op-section-title" style={{ margin: 0 }}>
              {category ? `${category} Products` : 'Products'}
            </h3>
            
            <div className="op-header-actions">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setDebouncedSearch(search);
                  }
                }}
                style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="popular">Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                
              </select>
            </div>
          </div>

          <div className={`op-grid ${viewMode === 'list' ? 'op-list-view' : ''}`}>
            {loading ? (
              <div className="op-empty"><h3>Loading products...</h3></div>
            ) : products.length > 0 ? (
              <>
                {products.map(product => (
                  <div key={product.id} className="op-card">
                    {Number(product.discount) > 0 && (
                      <span className="op-discount-tag">{Number(product.discount)}% OFF</span>
                    )}
                    <div className="op-card-img">
                      <img src={product.image} alt={product.name} loading="lazy" />
                    </div>
                    <div className="op-card-body">
                      <span className="op-card-cat">{product.category || product.service}</span>
                      <h4 className="op-card-name">{product.name}</h4>
                      <p className="op-card-desc">{product.description}</p>

                      <div className="op-card-price-row">
                        <div className="op-price-group">
                          <span className="op-price">₹{product.price.toLocaleString('en-IN')}</span>
                          {product.originalPrice > product.price && (
                            <span className="op-original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                          )}
                        </div>

                        {!cart[product.id] ? (
                          <button className="op-add-btn" onClick={() => updateQty(product.id, 1)} style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <FaShoppingCart size={16} title="FaShoppingCart" />
                          </button>
                        ) : (
                          <div className="op-qty">
                            <button onClick={() => updateQty(product.id, -1)} aria-label="Decrease">
                              <FaMinus size={11} />
                            </button>
                            <span>{cart[product.id]}</span>
                            <button onClick={() => updateQty(product.id, 1)} aria-label="Increase">
                              <FaPlus size={11} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="op-empty">
                <h3>No products found</h3>
                <p>Try a different search term.</p>
              </div>
            )}
          </div>

          {hasMore && !loading && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
              <button 
                onClick={() => loadProducts(true)}
                disabled={loadingMore}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#0056b3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loadingMore ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
    </>
  );
}
