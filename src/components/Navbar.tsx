import React, { useState } from 'react';
import { UserProfile } from '../api.ts';
import { ActiveView } from '../types.ts';

interface NavbarProps {
  cartCount: number;
  user: UserProfile | null;
  activeView: ActiveView;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onNavigate: (view: ActiveView) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  user,
  activeView,
  onOpenCart,
  onOpenAuth,
  onOpenProfile,
  onNavigate,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="header">
      <nav className="navbar">
        <div className="row d-flex container">
          <a
            href="#home"
            className="logo d-flex"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('storefront');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="logo-badge">
              <i className="bx bxs-dish"></i>
            </div>
            <span>FDelivery</span>
          </a>

          <ul className={`nav-list d-flex ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <li>
              <a
                href="#home"
                className={activeView === 'storefront' ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('storefront');
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#recipes"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('storefront');
                  setMobileMenuOpen(false);
                  const el = document.getElementById('recipes');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Menu
              </a>
            </li>
            <li>
              <a
                href="#services"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('storefront');
                  setMobileMenuOpen(false);
                  const el = document.getElementById('services');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Services
              </a>
            </li>
            <li>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('storefront');
                  setMobileMenuOpen(false);
                  const el = document.getElementById('about');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#tracking"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('tracking');
                  setMobileMenuOpen(false);
                }}
              >
                Track Order
              </a>
            </li>
            {user?.role === 'admin' && (
              <li>
                <a
                  href="#admin"
                  style={{ color: 'var(--primary-color)', fontWeight: 600 }}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('admin');
                    setMobileMenuOpen(false);
                  }}
                >
                  Admin Panel
                </a>
              </li>
            )}
            <span className="close d-flex" onClick={() => setMobileMenuOpen(false)}>
              <i className="bx bx-x"></i>
            </span>
          </ul>

          <div className="col d-flex">
            <form className="search-form" onSubmit={onSearchSubmit}>
              <input
                id="product-search"
                type="search"
                placeholder="Search food item..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              <button type="submit" className="d-flex" aria-label="Search">
                <i className="bx bx-search"></i>
              </button>
            </form>

            <div
              className="cart-icon d-flex"
              aria-label="Shopping cart"
              onClick={onOpenCart}
              role="button"
              tabIndex={0}
            >
              <i className="bx bx-shopping-bag"></i>
              <span id="cart-count">{cartCount}</span>
            </div>

            {user ? (
              <button
                type="button"
                className="btn signin"
                onClick={onOpenProfile}
                style={{ backgroundColor: '#1a1a1a' }}
              >
                <i className="bx bx-user" style={{ marginRight: '4px' }}></i>
                {user.full_name.split(' ')[0]}
              </button>
            ) : (
              <button type="button" className="btn signin" onClick={onOpenAuth}>
                Sign In
              </button>
            )}
          </div>

          <div
            className="hamburger d-flex"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            role="button"
            tabIndex={0}
          >
            <i className={`bx ${mobileMenuOpen ? 'bx-x' : 'bx-menu'}`}></i>
          </div>
        </div>
      </nav>
    </header>
  );
};
