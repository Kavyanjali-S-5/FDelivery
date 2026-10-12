import React, { useState } from 'react';

interface TestimonialData {
  id: string;
  name: string;
  role: string;
  image: string;
  quote: string;
  rating: number;
}

const testimonialsData: TestimonialData[] = [
  {
    id: 'rosele',
    name: 'Rosele Desoza',
    role: 'Marketing Coordinator',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    quote:
      'Having dependable food delivery is crucial with our hectic schedule. The food arrives steaming hot, beautifully packaged, and the delivery couriers are always exceptionally polite. FDelivery has become our team’s daily lunchtime ritual!',
  },
  {
    id: 'marvin',
    name: 'Marvin McKinney',
    role: 'Web Designer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    quote:
      'The speed is unreal! I ordered the Supreme Double Cheeseburger and seasoned fries, and it arrived in just 22 minutes. The flavors were restaurant-grade fresh and savory. 10/10 recommend!',
  },
  {
    id: 'guy',
    name: 'Guy Hawkins',
    role: 'President of Sales',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    quote:
      'We use FDelivery for executive lunches and client meetings. The order tracking keeps us informed step by step, and the food variety satisfies every dietary preference effortlessly.',
  },
  {
    id: 'kathryn',
    name: 'Kathryn Murphy',
    role: 'Product Specialist',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    quote:
      'The pizza crust was perfectly charred and the Spicy Pepperoni hot honey drizzle blew my mind! Best food delivery platform in town by a long shot.',
  },
];

export const Testimonials: React.FC = () => {
  const [activeId, setActiveId] = useState('rosele');
  const activeItem = testimonialsData.find((t) => t.id === activeId) || testimonialsData[0];

  return (
    <section className="section testimonials" id="testimonials">
      <div className="row container">
        <div className="col avatars-column">
          {testimonialsData.map((item) => (
            <div
              key={item.id}
              className={`card ${activeId === item.id ? 'active' : ''}`}
              onClick={() => setActiveId(item.id)}
            >
              <div className="d-flex">
                <div className="image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div>
                  <h4>{item.name}</h4>
                  <span>{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="col quote-column">
          <h2>
            What our Customers <br />
            <span>are saying</span>
          </h2>
          <div className="test-wrapper">
            <div className="d-flex" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{activeItem.name}</h4>
                <span style={{ color: '#888', fontSize: '0.9rem' }}>{activeItem.role}</span>
              </div>
              <div className="rating">
                {[...Array(activeItem.rating)].map((_, i) => (
                  <i key={i} className="bx bxs-star"></i>
                ))}
              </div>
            </div>
            <p>"{activeItem.quote}"</p>
          </div>
        </div>
      </div>
    </section>
  );
};
