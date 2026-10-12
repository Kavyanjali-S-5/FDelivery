import React from 'react';

export const About: React.FC = () => {
  return (
    <section className="section about" id="about">
      <div className="row container">
        <div className="col">
          <div className="about-img-box">
            <img
              src="https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=700&q=80"
              alt="Fast and courteous delivery courier"
            />
          </div>
        </div>
        <div className="col">
          <h2>Take a look at the benefits we offer for you</h2>
          <p>
            Good service means friendly, welcoming, and dependable delivery.
            We treat every order with chef-grade care from kitchen to your dining table.
          </p>
          <div className="d-grid">
            <div className="card">
              <div className="icon-circle">
                <i className="bx bxs-car"></i>
              </div>
              <h4>Free Home Delivery</h4>
              <span>For all orders over $50</span>
            </div>
            <div className="card">
              <div className="icon-circle">
                <i className="bx bx-dollar-circle"></i>
              </div>
              <h4>Return & Refund</h4>
              <span>Money Back Guarantee</span>
            </div>
            <div className="card">
              <div className="icon-circle">
                <i className="bx bxs-shield-alt-2"></i>
              </div>
              <h4>Secure Payment</h4>
              <span>Cash on Delivery</span>
            </div>
            <div className="card">
              <div className="icon-circle">
                <i className="bx bx-support"></i>
              </div>
              <h4>Quality Support</h4>
              <span>Always Online 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
