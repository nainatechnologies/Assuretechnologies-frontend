import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaPlus, FaMinus, FaStar, FaStarHalfAlt, FaSortAmountDown, FaThLarge, FaListUl } from 'react-icons/fa';
import { PRODUCTS, CATEGORIES } from '../data/products';
import './OrderProductsPage.css';

interface OrderProductsProps {
  cart: Record<string, number>;
  setCart: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

function StarRating({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) stars.push(<FaStar key={i} className="op-star filled" />);
    else if (i - 0.5 <= rating) stars.push(<FaStarHalfAlt key={i} className="op-star filled" />);
    else stars.push(<FaStar key={i} className="op-star" />);
  }
  return <div className="op-star-row">{stars}</div>;
}

export function OrderProductsPage({ cart, setCart }: OrderProductsProps) {
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

        {/* ─── Sidebar Filters ──────────────────────────── */}
        <aside className="op-sidebar">
          <h3 className="op-sidebar-title">Filters</h3>

          {/* Search */}
          <div className="op-filter-group">
            <div className="op-sidebar-search">
              <FaSearch className="op-sidebar-search-icon" />
              <input
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="op-filter-group">
            <h4 className="op-filter-label">Category</h4>
            {CATEGORIES.filter(c => c !== 'All').map(cat => (
              <label key={cat} className="op-filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedCats.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>

          {/* Rating Filter */}
          <div className="op-filter-group">
            <h4 className="op-filter-label">Customer Rating</h4>
            {[4, 3, 2].map(r => (
              <label key={r} className="op-filter-checkbox">
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === r}
                  onChange={() => setMinRating(r)}
                />
                <span>{r}★ & above</span>
              </label>
            ))}
            <label className="op-filter-checkbox">
              <input
                type="radio"
                name="rating"
                checked={minRating === 0}
                onChange={() => setMinRating(0)}
              />
              <span>All Ratings</span>
            </label>
          </div>
        </aside>

        {/* ─── Main Content ─────────────────────────────── */}
        <main className="op-main">
          {/* Toolbar */}
          <div className="op-toolbar">
            <span className="op-result-count">
              Showing <strong>{filtered.length}</strong> products
              {selectedCats.length > 0 && ` in ${selectedCats.join(', ')}`}
            </span>
            <div className="op-toolbar-right">
              <div className="op-sort">
                <FaSortAmountDown className="op-sort-icon" />
                <select value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="popular">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                  <option value="discount">Discount</option>
                </select>
              </div>
              <div className="op-view-toggle">
                <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} aria-label="Grid view">
                  <FaThLarge />
                </button>
                <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} aria-label="List view">
                  <FaListUl />
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid/List */}
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
                    <div className="op-card-rating">
                      <span className="op-rating-badge">{product.rating}★</span>
                      <span className="op-review-count">{product.reviewCount.toLocaleString()} ratings</span>
                    </div>
                    <div className="op-card-price-row">
                      <span className="op-price">₹{product.price.toLocaleString('en-IN')}</span>
                      {product.originalPrice > product.price && (
                        <>
                          <span className="op-original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                          <span className="op-discount-text">{product.discount}% off</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="op-card-footer">
                    {!cart[product.id] ? (
                      <button className="op-add-btn" onClick={() => updateQty(product.id, 1)}>
                        Add to Cart
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
