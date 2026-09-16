import { BASE_URL } from '../services/api';
import type { Product } from '../data/products';

/**
 * Normalizes raw backend product data into consistent frontend Product representation.
 */
export const mapRawProduct = (p: any): Product => {
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
};
