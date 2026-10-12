import React from 'react';
import { ActiveView } from '../types.ts';

interface FooterProps {
  onNavigate: (view: ActiveView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <>
      <footer className="footer" id="contact">
        <div className="row container">
          <div className="col">
            <div className="logo d-flex" style={{ color: '#fff' }}>
              <div className="logo-badge">
                <i className="bx bxs-dish"></i>
              </div>
              <span style={{ marginLeft: '0.5rem', fontWeight: 700, fontSize: '1.4rem' }}>FDelivery</span>
            </div>
            <p>
              Retail food delivery that brings chef-crafted meals directly to your door in record time.
              Freshness guaranteed with contactless handling and real-time tracking.
            </p>
            <div className="icons d-flex">
              <div className="icon d-flex" aria-label="Facebook">
                <i className="bx bxl-facebook"></i>
              </div>
              <div className="icon d-flex" aria-label="Twitter">
                <i className="bx bxl-twitter"></i>
              </div>
              <div className="icon d-flex" aria-label="Instagram">
                <i className="bx bxl-instagram"></i>
              </div>
              <div className="icon d-flex" aria-label="LinkedIn">
                <i className="bx bxl-linkedin"></i>
              </div>
            </div>
          </div>

          <div className="col">
            <div>
              <h4>Company</h4>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('storefront');
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                About Us
              </a>
              <a
                href="#services"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('storefront');
                  document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Our Services
              </a>
              <a
                href="#recipes"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('storefront');
                  document.getElementById('recipes')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                All Products
              </a>
            </div>

            <div>
              <h4>Services</h4>
              <a
                href="#tracking"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('tracking');
                }}
              >
                Order Tracking
              </a>
              <a
                href="#checkout"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('checkout');
                }}
              >
                Fast Checkout
              </a>
              <a
                href="#recipes"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('storefront');
                  document.getElementById('recipes')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Daily Specials
              </a>
            </div>

            <div>
              <h4>Support</h4>
              <a href="#faq">FAQ</a>
              <a href="#policy">Privacy Policy</a>
              <a href="#terms">Terms & Conditions</a>
              <a href="#support">24/7 Support Desk</a>
            </div>

            <div>
              <h4>Admin & Operations</h4>
              <button
                type="button"
                onClick={() => onNavigate('admin')}
                style={{
                  background: '#f94a3d',
                  color: '#fff',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  marginBottom: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <i className="bx bx-shield-quarter"></i> Admin Dashboard
              </button>
              <a
                href="#demo-credentials"
                style={{ fontSize: '0.8rem', color: '#aaa', display: 'block' }}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('admin');
                }}
              >
                Manage Menu & Orders
              </a>
            </div>
          </div>
        </div>
      </footer>

      <div className="footer-bottom">
        <div className="row container d-flex">
          <p>© {new Date().getFullYear()} FDelivery - LC26 Food Delivery Platform. All rights reserved.</p>
          <p>Built with Node.js, Express & Supabase PostgreSQL</p>
        </div>
      </div>
    </>
  );
};
