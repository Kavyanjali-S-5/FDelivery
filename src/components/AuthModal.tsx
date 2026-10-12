import React, { useState } from 'react';
import { api, UserProfile } from '../api.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Strict validation
    if (isRegisterMode) {
      if (!fullName.trim()) {
        setMessage({ text: 'Please enter your full name.', type: 'error' });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRegex.test(email.trim())) {
        setMessage({ text: 'Please enter a valid email address.', type: 'error' });
        return;
      }

      if (!phone.trim()) {
        setMessage({ text: 'Please enter your phone number.', type: 'error' });
        return;
      }

      if (!password || password.length < 6) {
        setMessage({ text: 'Password must be at least 6 characters long.', type: 'error' });
        return;
      }

      if (password !== confirmPassword) {
        setMessage({ text: 'The Password and Re-enter Password fields must match.', type: 'error' });
        return;
      }

      if (!address.trim()) {
        setMessage({ text: 'Please enter your delivery address.', type: 'error' });
        return;
      }

      if (!city.trim()) {
        setMessage({ text: 'Please enter your city.', type: 'error' });
        return;
      }

      if (!zip.trim()) {
        setMessage({ text: 'Please enter your ZIP code.', type: 'error' });
        return;
      }
    } else {
      if (!email.trim() || !password) {
        setMessage({ text: 'Email and password are required.', type: 'error' });
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isRegisterMode) {
        const res = await api.register({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          confirmPassword,
          address: address.trim(),
          city: city.trim(),
          zip: zip.trim(),
        });
        setMessage({ text: res.message, type: 'success' });
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 600);
      } else {
        const res = await api.login(email.trim(), password);
        setMessage({ text: res.message, type: 'success' });
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 600);
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Authentication failed. Please verify credentials.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (type: 'admin' | 'customer') => {
    setIsRegisterMode(false);
    setMessage(null);
    if (type === 'admin') {
      setEmail('admin@fdelivery.com');
      setPassword('admin123');
    } else {
      setEmail('customer@fdelivery.com');
      setPassword('customer123');
    }
  };

  return (
    <div className="wrapper" onClick={onClose}>
      <form
        className="form auth-form"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="close-form" onClick={onClose}>
          <i className="bx bx-x"></i>
        </div>

        <h2 className="auth-title">{isRegisterMode ? 'CREATE ACCOUNT' : 'SIGN IN'}</h2>

        {/* Quick Demo Fill Shortcuts */}
        <div style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '10px' }}>
          <button
            type="button"
            onClick={() => handleQuickFill('customer')}
            style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', borderRadius: '6px', background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: 600 }}
          >
            👤 Demo Customer
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('admin')}
            style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', borderRadius: '6px', background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: 600, color: 'var(--primary-color)' }}
          >
            🛡️ Demo Admin
          </button>
        </div>

        {isRegisterMode ? (
          /* =======================================================
             SIGN-UP INPUT FIELDS IN EXACT REQUIRED ORDER:
             1. Name
             2. Email Address
             3. Phone Number
             4. Password
             5. Re-enter Password
             6. Delivery Address
             7. City
             8. ZIP Code
             ======================================================= */
          <div className="registration-fields">
            {/* 1. Name */}
            <div className="control">
              <label htmlFor="authFullName">Name *</label>
              <input
                id="authFullName"
                name="fullName"
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            {/* 2. Email Address */}
            <div className="control">
              <label htmlFor="authEmail">Email Address *</label>
              <input
                id="authEmail"
                name="email"
                type="email"
                placeholder="Enter Your Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            {/* 3. Phone Number */}
            <div className="control">
              <label htmlFor="authPhone">Phone Number *</label>
              <input
                id="authPhone"
                name="phone"
                type="tel"
                placeholder="Your phone number (+1 555 234 5678)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                required
              />
            </div>

            {/* 4. Password */}
            <div className="control">
              <label htmlFor="authPassword">Password *</label>
              <input
                id="authPassword"
                name="password"
                type="password"
                minLength={6}
                placeholder="Password (minimum 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            {/* 5. Re-enter Password */}
            <div className="control">
              <label htmlFor="confirmPassword">Re-enter Password *</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                minLength={6}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            {/* 6. Delivery Address */}
            <div className="control">
              <label htmlFor="authAddress">Delivery Address *</label>
              <input
                id="authAddress"
                name="address"
                type="text"
                placeholder="Street address, building, apartment/suite"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoComplete="street-address"
                required
              />
            </div>

            {/* 7. City & 8. ZIP Code */}
            <div className="form-grid">
              <div className="control">
                <label htmlFor="authCity">City *</label>
                <input
                  id="authCity"
                  name="city"
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  autoComplete="address-level2"
                  required
                />
              </div>
              <div className="control">
                <label htmlFor="authZip">ZIP Code *</label>
                <input
                  id="authZip"
                  name="zip"
                  type="text"
                  placeholder="ZIP / Postal code"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  autoComplete="postal-code"
                  required
                />
              </div>
            </div>
          </div>
        ) : (
          /* =======================================================
             SIGN-IN MODE: Email Address & Password
             ======================================================= */
          <div>
            <div className="control">
              <label htmlFor="authEmail">Email Address:</label>
              <input
                id="authEmail"
                name="email"
                type="email"
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="control">
              <label htmlFor="authPassword">Password:</label>
              <input
                id="authPassword"
                name="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>
        )}

        <button type="submit" className="btn auth-submit" disabled={isLoading}>
          {isLoading ? (
            <span><i className="bx bx-loader-alt bx-spin"></i> Processing...</span>
          ) : isRegisterMode ? (
            'Create Account'
          ) : (
            'Sign In'
          )}
        </button>

        {message && (
          <p className={`auth-message ${message.type}`}>
            {message.text}
          </p>
        )}

        <button
          type="button"
          className="auth-mode-link"
          onClick={() => {
            setIsRegisterMode(!isRegisterMode);
            setMessage(null);
          }}
        >
          {isRegisterMode
            ? 'Already have an account? Sign In'
            : 'New here? Create an account'}
        </button>
      </form>
    </div>
  );
};
