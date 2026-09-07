import React from 'react';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import type { CartItemEntry } from './CartTypes';

interface CartItemListProps {
  cartItems: CartItemEntry[];
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
}

export const CartItemList: React.FC<CartItemListProps> = ({
  cartItems,
  onUpdateQty,
  onRemoveItem
}) => {
  return (
    <>
      <div className="cart-items-header">
        <h2>My Cart ({cartItems.length})</h2>
      </div>

      {cartItems.map(({ product, quantity }) => (
        <div key={product.id} className="cart-item">
          <div className="cart-item-img">
            <img src={product.image} alt={product.name} />
          </div>
          <div className="cart-item-info">
            <span className="cart-item-cat">{product.service}</span>
            <h3 className="cart-item-name">{product.name}</h3>
            <div className="cart-item-price-row">
              <span className="cart-item-price">₹{product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="cart-item-original">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                  <span className="cart-item-discount">{Number(product.discount)}% off</span>
                </>
              )}
            </div>

            <div className="cart-item-controls">
              <div className="cart-qty-controls">
                <button onClick={() => onUpdateQty(product.id, -1)} aria-label="Decrease quantity">
                  <FaMinus size={10} />
                </button>
                <span className="cart-qty-value">{quantity}</span>
                <button onClick={() => onUpdateQty(product.id, 1)} aria-label="Increase quantity">
                  <FaPlus size={10} />
                </button>
              </div>

              <button
                className="cart-item-remove"
                onClick={() => onRemoveItem(product.id)}
                aria-label="Remove item"
              >
                <FaTrash size={12} /> Remove
              </button>
            </div>
          </div>
          <div className="cart-item-total">
            ₹{(product.price * quantity).toLocaleString('en-IN')}
          </div>
        </div>
      ))}
    </>
  );
};
