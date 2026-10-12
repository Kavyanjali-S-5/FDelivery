import React from 'react';
import { CartItem } from '../types.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (foodId: string, delta: number) => void;
  onRemoveItem: (foodId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const subtotal = cart.reduce((sum, item) => sum + item.foodItem.price * item.quantity, 0);
  const isFreeDelivery = subtotal >= 50.0;
  const deliveryFee = cart.length === 0 ? 0 : isFreeDelivery ? 0 : 4.99;
  const total = subtotal + deliveryFee;
  const freeThresholdRemaining = Math.max(0, 50 - subtotal);

  return (
    <>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
          }}
          onClick={onClose}
        />
      )}
      <aside className={`cart-panel ${isOpen ? 'open' : ''}`} aria-live="polite">
        <div className="cart-header d-flex">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="bx bx-shopping-bag" style={{ color: 'var(--primary-color)', fontSize: '1.4rem' }}></i>
            <h3>Your Cart ({cart.reduce((s, i) => s + i.quantity, 0)})</h3>
          </div>
          <button type="button" className="close-cart" aria-label="Close cart" onClick={onClose}>
            <i className="bx bx-x"></i>
          </button>
        </div>

        {cart.length > 0 && (
          <div style={{ padding: '0.75rem 1.5rem', background: '#fff5f4', borderBottom: '1px solid #ffe4e0', fontSize: '0.85rem' }}>
            {isFreeDelivery ? (
              <span style={{ color: '#16a34a', fontWeight: 600 }}>
                🎉 You qualified for FREE Home Delivery!
              </span>
            ) : (
              <span style={{ color: '#666' }}>
                Add <strong style={{ color: 'var(--primary-color)' }}>${freeThresholdRemaining.toFixed(2)}</strong> more for <strong>FREE Delivery</strong>
              </span>
            )}
          </div>
        )}

        <div className="cart-items" id="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <i className="bx bx-cart" style={{ fontSize: '3.5rem', color: '#d1d5db', display: 'block', marginBottom: '1rem' }}></i>
              <p style={{ fontWeight: 600, color: '#4b5563' }}>Your cart is empty.</p>
              <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                Explore delicious recipes from our kitchen to get started.
              </p>
              <button
                type="button"
                className="btn small"
                style={{ marginTop: '1.5rem' }}
                onClick={onClose}
              >
                Browse Menu
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.foodItem.id} className="cart-item-row">
                <img src={item.foodItem.image_url} alt={item.foodItem.name} />
                <div className="cart-item-info">
                  <h5>{item.foodItem.name}</h5>
                  <div className="cart-item-price">${(item.foodItem.price * item.quantity).toFixed(2)}</div>
                </div>
                <div className="quantity-controls">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.foodItem.id, -1)}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.foodItem.id, 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => onRemoveItem(item.foodItem.id)}
                  title="Remove item"
                  aria-label="Remove item"
                >
                  <i className="bx bx-trash"></i>
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="total-row d-flex">
              <span>Subtotal</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
            <div className="delivery-row d-flex">
              <span>Delivery Fee</span>
              <span>{isFreeDelivery ? <strong style={{ color: '#16a34a' }}>FREE</strong> : `$${deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="grand-total-row d-flex">
              <span>Estimated Total</span>
              <strong id="cart-total" style={{ color: 'var(--primary-color)' }}>
                ${total.toFixed(2)}
              </strong>
            </div>
            <button
              type="button"
              className="btn checkout-btn"
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
            >
              <span>Proceed to Checkout</span>
              <i className="bx bx-right-arrow-alt"></i>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
