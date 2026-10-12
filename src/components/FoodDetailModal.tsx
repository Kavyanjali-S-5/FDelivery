import React, { useState } from 'react';
import { FoodItem } from '../api.ts';

interface FoodDetailModalProps {
  item: FoodItem | null;
  onClose: () => void;
  onAddToCart: (item: FoodItem, quantity: number) => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({ item, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  if (!item) return null;

  return (
    <div className="wrapper" onClick={onClose}>
      <div
        className="form auth-form"
        style={{ maxWidth: '520px', padding: '2rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="close-form" onClick={onClose}>
          <i className="bx bx-x"></i>
        </div>

        <div style={{ borderRadius: '16px', overflow: 'hidden', height: '240px', marginBottom: '1.25rem' }}>
          <img
            src={item.image_url}
            alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{item.name}</h2>
          <span style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-color)' }}>
            ${item.price.toFixed(2)}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--star-yellow)', marginBottom: '1rem' }}>
          {[...Array(5)].map((_, i) => (
            <i key={i} className={`bx ${i < Math.floor(item.rating) ? 'bxs-star' : 'bx-star'}`}></i>
          ))}
          <span style={{ color: '#666', fontSize: '0.85rem', marginLeft: '0.3rem' }}>
            {item.rating.toFixed(1)} / 5.0 Rating
          </span>
          <span style={{ margin: '0 0.5rem', color: '#ccc' }}>•</span>
          <span style={{ color: item.is_available ? '#16a34a' : '#dc2626', fontSize: '0.85rem', fontWeight: 600 }}>
            {item.is_available ? 'In Stock' : 'Currently Unavailable'}
          </span>
        </div>

        <p style={{ color: '#555', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {item.description}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>Quantity:</span>
            <div className="quantity-controls">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            className="btn"
            disabled={!item.is_available}
            onClick={() => {
              onAddToCart(item, quantity);
              onClose();
            }}
          >
            <i className="bx bx-cart-add"></i>
            Add ${ (item.price * quantity).toFixed(2) }
          </button>
        </div>
      </div>
    </div>
  );
};
