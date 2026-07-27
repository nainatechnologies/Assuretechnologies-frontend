import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaPlus, FaMinus, FaStar, FaStarHalfAlt, FaSortAmountDown, FaThLarge, FaListUl, FaCartPlus, FaShoppingBag, FaShoppingCart } from 'react-icons/fa';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { SERVICES } from '../data/services';
import { useCart } from '../context/CartContext';
import './OrderProductsPage.css';

function StarRating({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) stars.push(<FaStar key={i} className="op-star filled" />);
    else if (i - 0.5 <= rating) stars.push(<FaStarHalfAlt key={i} className="op-star filled" />);
    else stars.push(<FaStar key={i} className="op-star" />);
  }
  return <div className="op-star-row">{stars}</div>;
}

export function OrderProductsPage() {
  const { cart, setCart } = useCart();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('q') || '';

  const [search, setSearch] = useState(initialSearch);
  const [selectedCats, setSelectedCats] = useState<string[]>(initialCategory !== 'All' ? [initialCategory] : []);
  const [sort, setSort] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [minRating, setMinRating] = useState(0);

  const toggleCategory = (cat: string) => {
    setSelectedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filteredServices = useMemo(() => {
    const q = search.toLowerCase();
    return SERVICES.filter(s => {
      const matchCat = selectedCats.length === 0 || selectedCats.includes(s.label);
      const matchSearch = s.label.toLowerCase().includes(q) || s.title.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [search, selectedCats]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = PRODUCTS.filter(p => {
      const matchCat = selectedCats.length === 0 || selectedCats.includes(p.service);
      const matchSearch = p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      const matchRating = p.rating >= minRating;
      return matchCat && matchSearch && matchRating;
    });

    switch (sort) {
      case 'price-low':  result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating':     result.sort((a, b) => b.rating - a.rating); break;
      case 'discount':   result.sort((a, b) => b.discount - a.discount); break;
      default:           result.sort((a, b) => b.reviewCount - a.reviewCount); break;
    }

    return result;
  }, [search, selectedCats, sort, minRating]);

  const updateQty = (id: string, delta: number) => {
    setCart(prev => {
      const next = (prev[id] || 0) + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  return (
    <div className="op-page">
      <div className="op-layout">


        {/* ─── Main Content ─────────────────────────────── */}
        <main className="op-main">


          {/* Services Section */}
          {(search || selectedCats.length > 0) && filteredServices.length > 0 && (
            <div className="op-services-section">
              <h3 className="op-section-title">Matching Services</h3>
              <div className="op-services-list">
                {filteredServices.map(service => (
                  <div key={service.id} className="op-service-item">
                    {service.img ? (
                      <img src={service.img} alt={service.label} className="op-service-img" />
                    ) : (
                      <div className="op-service-icon">{service.icon}</div>
                    )}
                    <div className="op-service-info">
                      <span className="op-service-label">{service.label}</span>
                      <h4 className="op-service-title">{service.title}</h4>
                    </div>
                    <a href="/book-service" className="op-service-btn">Book Now</a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Grid/List */}
          <h3 className="op-section-title" style={{ marginTop: (search || selectedCats.length > 0) && filteredServices.length > 0 ? '24px' : '0' }}>
            Products
          </h3>
          <div className={`op-grid ${viewMode === 'list' ? 'op-list-view' : ''}`}>
            {filtered.length > 0 ? (
              filtered.map(product => (
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
                          {/* <FaCartPlus size={16} title="FaCartPlus" />
                          <FaShoppingBag size={16} title="FaShoppingBag" /> */}
                          <FaShoppingCart size={16} title="FaShoppingCart" />
                          {/* <FaPlus size={16} title="FaPlus" /> */}
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
              ))
            ) : (
              <div className="op-empty">
                <h3>No products found</h3>
                <p>Try a different search term or category.</p>
              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  );
}
