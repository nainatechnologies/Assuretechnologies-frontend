import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaStarHalfAlt, FaChevronLeft, FaChevronRight, FaPlus, FaMinus } from 'react-icons/fa';
import { PRODUCTS } from '../data/products';
import './TopProducts.css';

function StarRating({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<FaStar key={i} className="star filled" />);
    } else if (i - 0.5 <= rating) {
      stars.push(<FaStarHalfAlt key={i} className="star filled" />);
    } else {
      stars.push(<FaStar key={i} className="star" />);
    }
  }
  return <div className="star-rating">{stars}</div>;
}

// Pick top-rated products
const topProducts = [...PRODUCTS]
  .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
  .slice(0, 10);

export function TopProducts({ cart, setCart }: {
  cart: Record<string, number>;
  setCart: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
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
          {topProducts.map(product => (
            <div key={product.id} className="tp-card">
              {product.discount > 0 && (
                <span className="tp-discount-badge">{product.discount}% OFF</span>
              )}
              <div className="tp-card-img">
                <img src={product.image} alt={product.name} loading="lazy" />
              </div>
              <div className="tp-card-body">
                <span className="tp-card-cat">{product.service}</span>
                <h4 className="tp-card-name">{product.name}</h4>
                <div className="tp-card-rating">
                  <StarRating rating={product.rating} />
                  <span className="tp-review-count">({product.reviewCount})</span>
                </div>
                <div className="tp-card-price">
                  <span className="tp-price">₹{product.price.toLocaleString('en-IN')}</span>
                  {product.originalPrice > product.price && (
                    <span className="tp-original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                  )}
                </div>
                {cart[product.id] ? (
                  <div className="tp-qty-controls">
                    <button className="tp-qty-btn" onClick={() => updateQuantity(product.id, -1)} aria-label="Decrease quantity">
                      <FaMinus />
                    </button>
                    <span className="tp-qty-val">{cart[product.id]}</span>
                    <button className="tp-qty-btn" onClick={() => updateQuantity(product.id, 1)} aria-label="Increase quantity">
                      <FaPlus />
                    </button>
                  </div>
                ) : (
                  <button className="tp-add-btn" onClick={() => updateQuantity(product.id, 1)}>
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="tp-arrow tp-arrow-right" onClick={() => scroll('right')} aria-label="Scroll right">
          <FaChevronRight />
        </button>
      </div>
    </section>
  );
}
