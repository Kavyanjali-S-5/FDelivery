import React from 'react';

interface HeroProps {
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  return (
    <div className="home" id="home">
      <div className="row container">
        <div className="col">
          <div className="faster">
            <span>More than Faster</span>
            <div className="image d-flex">
              <i className="bx bxs-hot" style={{ color: '#f94a3d' }}></i>
            </div>
          </div>
          <h1>
            Get your cuisine <br />
            delivered right to <br />
            <span className="color">your door</span>
          </h1>
          <p>
            Food that is delivered at the right time. The trendy food delivery
            partner. Good food is what we deliver. Your hunger companion.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn explore-btn" onClick={onExploreClick}>
              Explore Food <i className="bx bx-right-arrow-alt"></i>
            </button>
            <a
              href="#services"
              className="btn outline"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Learn More
            </a>
          </div>
        </div>

        <div className="col">
          <div className="hero-art-card">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=80"
              alt="Delicious gourmet dishes"
            />
            <div className="hero-badge-float">
              <i className="bx bxs-check-shield"></i>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: '#111' }}>
                  100% Fresh & Hot
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#666' }}>
                  Delivered in &lt; 30 mins
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
