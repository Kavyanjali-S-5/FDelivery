import React, { useState, useEffect } from 'react';
import { CartItem, ActiveView } from '../types.ts';
import { UserProfile, Order, api } from '../api.ts';

interface CheckoutViewProps {
  cart: CartItem[];
  user: UserProfile | null;
  onOrderPlaced: (order: Order) => void;
  onNavigate: (view: ActiveView) => void;
  onClearCart: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  user,
  onOrderPlaced,
  onNavigate,
  onClearCart,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('ASAP');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Pre-fill user data if available
  useEffect(() => {
    if (user) {
      const parts = user.full_name ? user.full_name.split(' ') : [''];
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      if (user.phone) setPhone(user.phone);
      if (user.address) setAddress(user.address);
      if (user.city) setCity(user.city);
      if (user.zip) setZip(user.zip);
    }
  }, [user]);

  // Compute subtotal and delivery
  const subtotal = cart.reduce((sum, item) => sum + item.foodItem.price * item.quantity, 0);
  const isFreeDelivery = subtotal >= 50.0;
  const deliveryFee = cart.length === 0 ? 0 : isFreeDelivery ? 0 : 4.99;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (cart.length === 0) {
      setErrorMsg('Your cart is empty. Please add items before placing an order.');
      return;
    }

    if (!firstName.trim() || !phone.trim() || !address.trim() || !city.trim() || !zip.trim()) {
      setErrorMsg('Please complete all required delivery details.');
      return;
    }

    setIsLoading(true);

    try {
      const itemsPayload = cart.map((item) => ({
        food_item_id: item.foodItem.id,
        quantity: item.quantity,
      }));

      const res = await api.createOrder({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        customer_name: `${firstName} ${lastName}`.trim(),
        customer_email: user ? user.email : 'guest@fdelivery.com',
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        zip: zip.trim(),
        deliveryTime,
        notes: notes.trim(),
        items: itemsPayload,
      });

      setPlacedOrder(res.order);
      onClearCart();
      onOrderPlaced(res.order);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMsg(err.message || 'An error occurred while placing your order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (placedOrder) {
    return (
      <main className="order-page">
        <div className="order-shell">
          <div
            className="order-card"
            style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center', padding: '3.5rem 2rem' }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                margin: '0 auto 1.5rem',
              }}
            >
              <i className="bx bx-check"></i>
            </div>

            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#111827' }}>
              Order Placed Successfully!
            </h2>
            <p style={{ color: '#4b5563', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
              Thank you for ordering with FDelivery. Your chef is already preparing your feast.
            </p>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '2rem',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#64748b' }}>Order Number:</span>
                <strong style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}>
                  {placedOrder.order_number}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#64748b' }}>Status:</span>
                <span className={`badge-status badge-${placedOrder.status}`}>{placedOrder.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#64748b' }}>Payment Method:</span>
                <strong>Cash on Delivery (${placedOrder.total_amount.toFixed(2)})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#64748b' }}>Delivery Address:</span>
                <span style={{ textAlign: 'right', maxWidth: '60%' }}>
                  {placedOrder.delivery_address}, {placedOrder.city} {placedOrder.zip}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Estimated Arrival:</span>
                <strong>25 - 35 mins</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn"
                onClick={() => onNavigate('tracking')}
              >
                <i className="bx bx-radar"></i> Track Live Status
              </button>
              <button
                type="button"
                className="btn outline"
                onClick={() => onNavigate('storefront')}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="order-page">
      <div className="order-shell">
        <div style={{ marginBottom: '2rem' }}>
          <button
            type="button"
            onClick={() => onNavigate('storefront')}
            style={{
              background: 'none',
              color: '#64748b',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <i className="bx bx-arrow-back"></i> Back to Storefront
          </button>
        </div>

        <div className="order-layout">
          <section className="order-card">
            <h2>Delivery Details</h2>

            {errorMsg && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem',
                }}
              >
                <i className="bx bx-error-circle" style={{ marginRight: '6px' }}></i>
                {errorMsg}
              </div>
            )}

            <form className="checkout-form" id="checkout-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div>
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone">Phone Number *</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="address">Delivery Address *</label>
                <textarea
                  id="address"
                  name="address"
                  placeholder="Street address, building, apartment or suite number"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="form-grid">
                <div>
                  <label htmlFor="city">City *</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="zip">ZIP / Postal Code *</label>
                  <input
                    id="zip"
                    name="zip"
                    type="text"
                    placeholder="ZIP code"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="deliveryTime">Preferred Delivery Time</label>
                <select
                  id="deliveryTime"
                  name="deliveryTime"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                >
                  <option value="ASAP">ASAP (Estimated 25-35 min)</option>
                  <option value="Within 30 min">Within 30 min</option>
                  <option value="Within 1 hour">Within 1 hour</option>
                  <option value="Schedule later">Schedule later today</option>
                </select>
              </div>

              <div>
                <label htmlFor="notes">Delivery Instructions (Optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  placeholder="Apartment gate code, landmark, drop off at front door, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>

              <div className="payment-method-badge">
                <i className="bx bx-money" style={{ fontSize: '1.25rem' }}></i>
                <span>Payment Method: <strong>Cash on Delivery (COD)</strong> upon receipt.</span>
              </div>

              <button
                type="submit"
                className="btn order-submit"
                disabled={isLoading || cart.length === 0}
              >
                {isLoading ? (
                  <span>
                    <i className="bx bx-loader-alt bx-spin"></i> Processing Order...
                  </span>
                ) : (
                  <span>
                    Place Order (${total.toFixed(2)})
                  </span>
                )}
              </button>
            </form>
          </section>

          <aside className="order-summary">
            <h3>Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)})</h3>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8' }}>
                <i className="bx bx-shopping-bag" style={{ fontSize: '2.5rem' }}></i>
                <p style={{ marginTop: '0.5rem' }}>No items in cart</p>
                <button
                  type="button"
                  className="btn small"
                  style={{ marginTop: '1rem' }}
                  onClick={() => onNavigate('storefront')}
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                <ul id="summary-items" className="summary-list">
                  {cart.map((item) => (
                    <li key={item.foodItem.id} className="summary-item-row">
                      <div>
                        <div className="summary-item-name">{item.foodItem.name}</div>
                        <small style={{ color: '#64748b' }}>
                          Qty: {item.quantity} × ${item.foodItem.price.toFixed(2)}
                        </small>
                      </div>
                      <span className="summary-item-price">
                        ${(item.foodItem.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="summary-breakdown">
                  <div className="row-between">
                    <span>Food Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="row-between">
                    <span>Delivery Fee</span>
                    <span>{isFreeDelivery ? <strong style={{ color: '#16a34a' }}>FREE</strong> : `$${deliveryFee.toFixed(2)}`}</span>
                  </div>
                </div>

                <div className="summary-total">
                  <span>Grand Total</span>
                  <span id="summary-total" style={{ color: 'var(--primary-color)' }}>
                    ${total.toFixed(2)}
                  </span>
                </div>
              </>
            )}

            <button
              type="button"
              className="btn outline"
              style={{ width: '100%', marginTop: '1.5rem', borderRadius: '12px' }}
              onClick={() => onNavigate('storefront')}
            >
              Continue Shopping
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
};
