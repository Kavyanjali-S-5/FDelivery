import React, { useState, useEffect } from 'react';
import { UserProfile, Order, api } from '../api.ts';
import { ActiveView } from '../types.ts';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onLogout: () => void;
  onTrackOrder: (orderNumber: string) => void;
  onNavigate: (view: ActiveView) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
  onTrackOrder,
  onNavigate,
}) => {
  const [fullName, setFullName] = useState(user.full_name);
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [city, setCity] = useState(user.city || '');
  const [zip, setZip] = useState(user.zip || '');

  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFullName(user.full_name);
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setCity(user.city || '');
      setZip(user.zip || '');

      setIsLoadingOrders(true);
      api.getMyOrders()
        .then((res) => setOrders(res.orders || []))
        .catch(() => {})
        .finally(() => setIsLoadingOrders(false));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotice(null);
    try {
      const res = await api.updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        zip: zip.trim(),
      });
      onUpdateUser(res.user);
      setNotice('Profile updated successfully!');
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      setNotice(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="wrapper" onClick={onClose}>
      <div
        className="form auth-form"
        style={{ maxWidth: '600px', padding: '2rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="close-form" onClick={onClose}>
          <i className="bx bx-x"></i>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--primary-color)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
            }}
          >
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{user.full_name}</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{user.email}</p>
            <span
              style={{
                display: 'inline-block',
                marginTop: '0.25rem',
                fontSize: '0.75rem',
                background: user.role === 'admin' ? '#fee2e2' : '#f1f5f9',
                color: user.role === 'admin' ? '#b91c1c' : '#475569',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              {user.role}
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              borderBottom: activeTab === 'profile' ? '2px solid var(--primary-color)' : 'none',
              color: activeTab === 'profile' ? 'var(--primary-color)' : '#64748b',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Delivery Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              borderBottom: activeTab === 'orders' ? '2px solid var(--primary-color)' : 'none',
              color: activeTab === 'orders' ? 'var(--primary-color)' : '#64748b',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            My Orders ({orders.length})
          </button>
        </div>

        {notice && (
          <div style={{ padding: '0.6rem 1rem', background: '#ecfdf5', color: '#047857', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {notice}
          </div>
        )}

        {activeTab === 'profile' ? (
          <form onSubmit={handleSaveProfile}>
            <div className="control">
              <label>Full Name:</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="control">
              <label>Phone Number:</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 234 5678"
              />
            </div>
            <div className="control">
              <label>Default Street Address:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Food Street, Apt 4"
              />
            </div>
            <div className="form-grid">
              <div className="control">
                <label>City:</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="control">
                <label>ZIP Code:</label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="ZIP"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn" style={{ flex: 1 }} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="btn outline"
                onClick={onLogout}
                style={{ color: '#ef4444', borderColor: '#ef4444' }}
              >
                Sign Out
              </button>
            </div>
          </form>
        ) : (
          <div>
            {isLoadingOrders ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>Loading orders...</p>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8' }}>
                <i className="bx bx-package" style={{ fontSize: '2.5rem' }}></i>
                <p style={{ marginTop: '0.5rem' }}>You haven't placed any orders yet.</p>
                <button
                  type="button"
                  className="btn small"
                  style={{ marginTop: '1rem' }}
                  onClick={() => {
                    onClose();
                    onNavigate('storefront');
                  }}
                >
                  Order Now
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '350px', overflowY: 'auto' }}>
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--primary-color)' }}>{ord.order_number}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {new Date(ord.created_at).toLocaleDateString()} • {ord.items?.length || 0} items
                      </div>
                      <span className={`badge-status badge-${ord.status}`} style={{ marginTop: '0.35rem' }}>
                        {ord.status}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ display: 'block', fontSize: '1.05rem' }}>${ord.total_amount.toFixed(2)}</strong>
                      <button
                        type="button"
                        className="btn outline small"
                        style={{ marginTop: '0.35rem' }}
                        onClick={() => {
                          onClose();
                          onTrackOrder(ord.order_number);
                        }}
                      >
                        Track Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
