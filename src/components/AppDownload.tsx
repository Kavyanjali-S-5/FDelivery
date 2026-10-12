import React from 'react';

export const AppDownload: React.FC = () => {
  return (
    <section className="section app">
      <div className="row container">
        <div className="col phone-mockup-wrap">
          <div className="circle">
            <div className="inner-circle"></div>
            <img
              src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=500&q=80"
              alt="FDelivery mobile app mockup"
            />
          </div>
        </div>

        <div className="col">
          <h2>Never Feel Hungry! Download Our Mobile App Order Delicious Food</h2>
          <p>
            Online ordering has enabled thousands of happy food lovers to manage their cravings
            swiftly. Get customized discounts, live rider GPS tracking, and instant reordering.
          </p>
          <div className="badges">
            <div className="store-btn">
              <i className="bx bxl-apple" style={{ fontSize: '1.8rem' }}></i>
              <div>
                <small style={{ fontSize: '0.7rem', display: 'block', opacity: 0.8 }}>Download on the</small>
                <strong>App Store</strong>
              </div>
            </div>
            <div className="store-btn">
              <i className="bx bxl-play-store" style={{ fontSize: '1.8rem' }}></i>
              <div>
                <small style={{ fontSize: '0.7rem', display: 'block', opacity: 0.8 }}>GET IT ON</small>
                <strong>Google Play</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
