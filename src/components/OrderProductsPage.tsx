import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaPlus, FaMinus, FaShoppingCart } from 'react-icons/fa';
import { productsApi } from '../api/productsApi';
import { useCart } from '../context/CartContext';
import './OrderProductsPage.css';

export function OrderProductsPage() {
  const { cart, setCart } = useCart();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('q') || '';
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState('popular');
  const [viewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearch(q);
  }, [searchParams]);

  const loadProducts = async (isLoadMore = false) => {
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
        search,
        sort
      });

      let fetchedProducts = response.data.data || [];
      


      if (isLoadMore) {
        setProducts(prev => [...prev, ...fetchedProducts]);
      } else {
        setProducts(fetchedProducts);
      }

      setPage(currentPage);
      setHasMore(currentPage < response.data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    // Delay slightly to allow typing
    const timeoutId = setTimeout(() => {
      loadProducts(false);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [search, sort]);

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
    <div className="op-page">
      <div className="op-layout">
        <main className="op-main">
          
          <div className="op-header-container">
            <h3 className="op-section-title" style={{ margin: 0 }}>Products</h3>
            
            <div className="op-header-actions">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                    {product.discount > 0 && (
                      <span className="op-discount-tag">{product.discount}% OFF</span>
                    )}
                    <div className="op-card-img">
                      <img src={product.image} alt={product.name} loading="lazy" />
                    </div>
                    <div className="op-card-body">
                      <span className="op-card-cat">{product.service}</span>
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
  );
}