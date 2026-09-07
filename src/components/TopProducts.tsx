import { BASE_URL } from '../services/api';
import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaPlus, FaMinus, FaShoppingCart } from 'react-icons/fa';
import { productsApi } from '../api/productsApi';
import { useCart } from '../context/CartContext';
import './TopProducts.css';

export function TopProducts() {
  const { cart, addToCart, updateCartItem, removeFromCart } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await productsApi.fetchProducts();
        let products = response.data.data || [];
        
        products = products.map((p: any) => {
          const base = parseFloat(p.base_price) || 0;
          const disc = parseFloat(p.discount) || 0;
          const cleanDisc = disc % 1 === 0 ? Math.round(disc) : parseFloat(disc.toFixed(2));
          return {
            ...p,
            originalPrice: base,
            price: base - (base * (disc / 100)),
            discount: cleanDisc,
            rating: p.rating || 4,
            reviewCount: p.reviewCount || 15,
            service: p.category || 'General',
            image: p.banner ? (p.banner.startsWith('http') || p.banner.startsWith('blob:') ? p.banner : `${BASE_URL}${p.banner.startsWith('/') ? '' : '/'}${p.banner}`) : 'https://placehold.co/300x200?text=No+Image'
          };
        });

        const sorted = [...products]
          .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
          .slice(0, 20);
          
        setTopProducts(sorted);
      } catch (error) {
        console.error('Failed to load products', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  const updateQuantity = async (id: string, delta: number) => {
    const current = cart[id] || 0;
    const next = current + delta;
    if (next <= 0) {
      await removeFromCart(id);
    } else if (current === 0) {
      await addToCart(id, next);
    } else {
      await updateCartItem(id, next);
    }
  };

  return (
    <section className="tp-section">
      <div className="tp-header">
        <h2 className="tp-title">Top Products</h2>
        <Link to="/order-products" className="tp-view-all">View All →</Link>
      </div>

      <div className="tp-carousel-wrapper">
        <button className="tp-arrow tp-arrow-left" onClick={() => scroll('left')} aria-label="Scroll left">
          <FaChevronLeft />
        </button>

        <div className="tp-carousel" ref={scrollRef}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', width: '100%' }}>Loading...</div>
          ) : (
            topProducts.map(product => (
              <div key={product.id} className="tp-card">
                {Number(product.discount) > 0 && (
                  <span className="tp-discount-badge">{Number(product.discount)}% OFF</span>
                )}
                <div className="tp-card-img">
                  <img src={product.image} alt={product.name} loading="lazy" />
                </div>
                <div className="tp-card-body">
                  <span className="tp-card-cat">{product.service}</span>
                  <h4 className="tp-card-name">{product.name}</h4>
                  
                  <div className="tp-card-price-row">
                    <div className="tp-price-group">
                      <span className="tp-price">₹{product.price.toLocaleString('en-IN')}</span>
                      {product.originalPrice > product.price && (
                        <span className="tp-original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                      )}
                    </div>

                    {cart[product.id] ? (
                      <div className="tp-qty-controls">
                        <button className="tp-qty-btn" onClick={() => updateQuantity(product.id, -1)} aria-label="Decrease quantity">
                          <FaMinus size={11} />
                        </button>
                        <span className="tp-qty-val">{cart[product.id]}</span>
                        <button className="tp-qty-btn" onClick={() => updateQuantity(product.id, 1)} aria-label="Increase quantity">
                          <FaPlus size={11} />
                        </button>
                      </div>
                    ) : (
                      <button className="tp-add-btn" onClick={() => updateQuantity(product.id, 1)}>
                        <FaShoppingCart size={16} title="Add to Cart" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <button className="tp-arrow tp-arrow-right" onClick={() => scroll('right')} aria-label="Scroll right">
          <FaChevronRight />
        </button>
      </div>
    </section>
  );
}
