import { useState, useEffect, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './HeroSlider.css';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?q=80&w=2072&auto=format&fit=crop',
    title: 'INNOVATIVE SOLUTIONS.',
    highlight: 'CONNECTED FUTURE.',
    subtitle: 'Empowering businesses with smart technology, automation and reliable systems.',
    cta: { text: 'Explore Services', link: '/book-service' },
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072&auto=format&fit=crop',
    title: 'SOLAR POWER',
    highlight: 'FOR EVERY HOME.',
    subtitle: 'Save up to 80% on electricity with our high-efficiency solar panel solutions.',
    cta: { text: 'Get Solar Quote', link: '/order-products?category=Solar' },
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=2072&auto=format&fit=crop',
    title: '24/7 SURVEILLANCE',
    highlight: 'SMART SECURITY.',
    subtitle: 'Enterprise-grade CCTV, biometrics, and fire safety systems for complete protection.',
    cta: { text: 'Shop Now', link: '/order-products?category=Surveillance' },
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2072&auto=format&fit=crop',
    title: 'ENTERPRISE',
    highlight: 'NETWORKING.',
    subtitle: 'Structured cabling, fiber optics, and managed switches for rock-solid connectivity.',
    cta: { text: 'View Products', link: '/order-products?category=Networking' },
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const len = slides.length;

  const next = useCallback(() => setCurrent(i => (i + 1) % len), [len]);
  const prev = useCallback(() => setCurrent(i => (i - 1 + len) % len), [len]);

  // Auto-advance every 5s
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="hero-section">
      <div className="hero-carousel">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`hero-slide ${idx === current ? 'active' : ''}`}
            style={{ backgroundImage: `url('${slide.image}')` }}
          >
            <div className="hero-overlay" />
            <div className="hero-slide-content">
              <h1 className="hero-slide-title">
                {slide.title}<br />
                <span className="hero-slide-highlight">{slide.highlight}</span>
              </h1>
              <p className="hero-slide-subtitle">{slide.subtitle}</p>
              <a href={slide.cta.link} className="hero-slide-cta">
                {slide.cta.text}
              </a>
            </div>
          </div>
        ))}

        {/* Arrows */}
        <button className="hero-arrow hero-arrow-left" onClick={prev} aria-label="Previous slide">
          <FaChevronLeft />
        </button>
        <button className="hero-arrow hero-arrow-right" onClick={next} aria-label="Next slide">
          <FaChevronRight />
        </button>

        {/* Dots */}
        <div className="hero-dots">
          {slides.map((_, idx) => (
            <button
              key={idx}
              className={`hero-dot ${idx === current ? 'active' : ''}`}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
