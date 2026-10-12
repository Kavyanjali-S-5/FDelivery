import React from 'react';

export const Services: React.FC = () => {
  return (
    <section className="section services" id="services">
      <div className="row container">
        <div className="col">
          <h2>Why we are Best in our Town</h2>
          <p>
            Whole grains, fresh produce, and premium meats. We partner with the
            finest local kitchens to deliver mouth-watering quality right to your doorstep.
          </p>
        </div>
        <div className="col">
          <div className="card">
            <div className="icon-box">
              <i className="bx bxs-food-menu"></i>
            </div>
            <h3>
              Choose <br />
              your favorite <br />
              food
            </h3>
          </div>
        </div>
        <div className="col">
          <div className="card">
            <div className="icon-box">
              <i className="bx bxs-truck"></i>
            </div>
            <h3>
              Get delivery <br />
              at your door <br />
              step
            </h3>
          </div>
        </div>
        <div className="col">
          <div className="card">
            <div className="icon-box">
              <i className="bx bxs-star"></i>
            </div>
            <h3>
              We have <br />
              400+ Reviews <br />
              On our app
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
};
