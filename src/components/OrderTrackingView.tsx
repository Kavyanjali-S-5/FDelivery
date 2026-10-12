import React, { useState, useEffect } from 'react';
import { Order, api, UserProfile } from '../api.ts';
import { ActiveView } from '../types.ts';

interface OrderTrackingViewProps {
  initialOrderId?: string;
  user: UserProfile | null;
  onNavigate: (view: ActiveView) => void;
}

const ORDER_STEPS = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialOrderId,
  user,
  onNavigate,
}) => {
  const [searchId, setSearchId] = useState(initialOrderId || '');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOrder = async (id: string) => {
    if (!id.trim()) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.trackOrder(id.trim());
      setCurrentOrder(res.order);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not find an order with that number. Please check and try again.');
      setCurrentOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      setSearchId(initialOrderId);
      fetchOrder(initialOrderId);
    } else if (user) {
      // Load user's recent orders
      api.getMyOrders().then((res) => {
        if (res.orders && res.orders.length > 0) {
          setUserOrders(res.orders);
          setCurrentOrder(res.orders[0]);
          setSearchId(res.orders[0].order_number);
        }
      }).catch(() => {});
    } else {
      // Default sample order
      fetchOrder('FD-202610-8402');
    }
  }, [initialOrderId, user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(searchId);
  };

  const currentStepIndex = currentOrder
    ? currentOrder.status === 'Cancelled'
      ? -1
      : ORDER_STEPS.indexOf(currentOrder.status)
    : 0;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '85vh', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827' }}>
              Track Your Food Delivery
            </h1>
            <p style={{ color: '#64748b' }}>
              Enter your Order ID (e.g. FD-202610-8401) to check live status.
            </p>
          </div>
          <button
            type="button"
            className="btn outline small"
            onClick={() => onNavigate('storefront')}
          >
            Back to Storefront
          </button>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: 'flex',
            gap: '0.75rem',
            background: '#ffffff',
            padding: '0.75rem',
            borderRadius: '16px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
            marginBottom: '2.5rem',
          }}
        >
          <input
            type="text"
            placeholder="Enter Order Number or ID..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            style={{
              flexGrow: 1,
              border: 'none',
              outline: 'none',
              padding: '0.75rem 1rem',
              fontSize: '1rem',
            }}
          />
          <button type="submit" className="btn" disabled={isLoading}>
            {isLoading ? <i className="bx bx-loader-alt bx-spin"></i> : <i className="bx bx-search"></i>}
            Track Order
          </button>
        </form>

        {errorMsg && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '2rem',
            }}
          >
            {errorMsg}
          </div>
        )}

        {currentOrder && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '2.5rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
              border: '1px solid #edf2f7',
            }}
          >
            {/* Header info */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid #f1f5f9',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>
                  Order Details
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                  {currentOrder.order_number}
                </h2>
                <small style={{ color: '#94a3b8' }}>
                  Placed on {new Date(currentOrder.created_at).toLocaleString()}
                </small>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  className={`badge-status badge-${currentOrder.status.replace(/\s+/g, '-')}`}
                  style={{ fontSize: '0.9rem', padding: '0.45rem 1rem' }}
                >
                  Status: {currentOrder.status}
                </span>
                <div style={{ marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => fetchOrder(currentOrder.order_number)}
                    style={{ background: 'none', color: '#64748b', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                  >
                    <i className="bx bx-refresh"></i> Refresh Status
                  </button>
                </div>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            {currentOrder.status === 'Cancelled' ? (
              <div
                style={{
                  background: '#fef2f2',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  color: '#991b1b',
                  margin: '2rem 0',
                  textAlign: 'center',
                }}
              >
                <i className="bx bx-x-circle" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}></i>
                <strong>This order was cancelled.</strong>
              </div>
            ) : (
              <div style={{ margin: '3rem 0' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${ORDER_STEPS.length}, 1fr)`,
                    position: 'relative',
                    textAlign: 'center',
                  }}
                >
                  {/* Connecting track line */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '20px',
                      left: '10%',
                      right: '10%',
                      height: '4px',
                      background: '#e2e8f0',
                      zIndex: 1,
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        background: 'var(--primary-color)',
                        width: `${Math.max(0, (currentStepIndex / (ORDER_STEPS.length - 1)) * 100)}%`,
                        transition: 'width 0.4s ease',
                      }}
                    ></div>
                  </div>

                  {ORDER_STEPS.map((step, idx) => {
                    const isDone = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;

                    return (
                      <div key={step} style={{ position: 'relative', zIndex: 2 }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: isDone ? 'var(--primary-color)' : '#fff',
                            color: isDone ? '#fff' : '#94a3b8',
                            border: `3px solid ${isDone ? 'var(--primary-color)' : '#e2e8f0'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.75rem',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            boxShadow: isCurrent ? '0 0 0 4px rgba(249, 74, 61, 0.2)' : 'none',
                          }}
                        >
                          {idx < currentStepIndex ? <i className="bx bx-check"></i> : idx + 1}
                        </div>
                        <span
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: isCurrent ? 700 : 500,
                            color: isCurrent ? '#111827' : '#64748b',
                          }}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order Content Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
                  Ordered Items ({currentOrder.items?.length || 0})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {currentOrder.items?.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        background: '#f8fafc',
                        borderRadius: '12px',
                      }}
                    >
                      <div>
                        <strong>{item.item_name}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Qty: {item.quantity} × ${item.unit_price.toFixed(2)}
                        </div>
                      </div>
                      <span style={{ fontWeight: 600 }}>${item.total_price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
                  Delivery Destination
                </h4>
                <p style={{ margin: '0 0 0.35rem 0', fontWeight: 600, color: '#1e293b' }}>
                  {currentOrder.customer_name}
                </p>
                <p style={{ margin: '0 0 0.35rem 0', color: '#475569', fontSize: '0.9rem' }}>
                  {currentOrder.customer_phone}
                </p>
                <p style={{ margin: '0 0 1rem 0', color: '#475569', fontSize: '0.9rem' }}>
                  {currentOrder.delivery_address}, {currentOrder.city} {currentOrder.zip}
                </p>

                {currentOrder.notes && (
                  <div style={{ fontSize: '0.85rem', color: '#64748b', background: '#fff', padding: '0.6rem 0.85rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <strong>Note:</strong> {currentOrder.notes}
                  </div>
                )}

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.9rem', color: '#64748b' }}>
                    <span>Subtotal</span>
                    <span>${currentOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', color: '#64748b' }}>
                    <span>Delivery Fee</span>
                    <span>${currentOrder.delivery_fee.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                    <span>Total (COD)</span>
                    <span style={{ color: 'var(--primary-color)' }}>${currentOrder.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
