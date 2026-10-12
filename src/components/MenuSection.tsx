import React from 'react';
import { FoodItem, Category } from '../api.ts';

interface MenuSectionProps {
  categories: Category[];
  items: FoodItem[];
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
  onAddToCart: (item: FoodItem) => void;
  onSelectItem: (item: FoodItem) => void;
  searchQuery: string;
  onClearSearch: () => void;
  isLoading: boolean;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  categories,
  items,
  selectedCategory,
  onSelectCategory,
  onAddToCart,
  onSelectItem,
  searchQuery,
  onClearSearch,
  isLoading,
}) => {
  return (
    <section className="section recipes" id="recipes">
      <div className="container">
        <h2>Try Our Special Recipes</h2>

        <div className="filters d-flex">
          <span
            className={selectedCategory === 'All Product' ? 'active' : ''}
            onClick={() => onSelectCategory('All Product')}
          >
            See All Product
          </span>
          {categories.map((cat) => (
            <span
              key={cat.id}
              className={selectedCategory === cat.name ? 'active' : ''}
              onClick={() => onSelectCategory(cat.name)}
            >
              {cat.name}
            </span>
          ))}
        </div>

        {searchQuery && (
          <div
            style={{
              marginBottom: '2rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#f1f5f9',
              padding: '0.4rem 1rem',
              borderRadius: '50px',
              fontSize: '0.9rem',
            }}
          >
            <span>
              Searching for: <strong>"{searchQuery}"</strong>
            </span>
            <button
              onClick={onClearSearch}
              style={{ background: 'none', color: '#ef4444', fontWeight: 'bold' }}
              title="Clear search"
            >
              ✕
            </button>
          </div>
        )}

        {isLoading ? (
          <div style={{ padding: '4rem 0', color: '#666' }}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: '2rem', color: 'var(--primary-color)' }}></i>
            <p style={{ marginTop: '0.5rem' }}>Loading menu items from database...</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '4rem 0', color: '#666' }}>
            <i className="bx bx-dish" style={{ fontSize: '3rem', color: '#ccc' }}></i>
            <p style={{ marginTop: '0.75rem', fontSize: '1.1rem' }}>No dishes found matching your criteria.</p>
            <button
              type="button"
              className="btn small"
              style={{ marginTop: '1rem' }}
              onClick={() => {
                onClearSearch();
                onSelectCategory('All Product');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {items.map((item) => (
              <div key={item.id} className="product-card">
                <div
                  className="image"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectItem(item)}
                >
                  <img src={item.image_url} alt={item.name} loading="lazy" />
                </div>
                <div className="rating">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`bx ${i < Math.floor(item.rating) ? 'bxs-star' : 'bx-star'}`}
                    ></i>
                  ))}
                  <span className="rating-score">{item.rating.toFixed(1)}</span>
                </div>
                <h4
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectItem(item)}
                >
                  {item.name}
                </h4>
                <p className="desc">{item.description}</p>
                <div className="bottom-row">
                  <div className="price">
                    <span>Price</span>
                    <span className="color">${item.price.toFixed(2)}</span>
                  </div>
                  <button
                    type="button"
                    className="button"
                    onClick={() => onAddToCart(item)}
                    aria-label={`Add ${item.name} to cart`}
                  >
                    <span>Add To Cart</span>
                    <i className="bx bx-plus"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
