import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  const navigate = useNavigate();

  const featuredCategories = [
    { name: 'Engine Parts', icon: '⚙️', category: 'Engine' },
    { name: 'Electrical', icon: '🔌', category: 'Electrical' },
    { name: 'Accessories', icon: '🎨', category: 'Accessories' },
    { name: 'Body Parts', icon: '🚗', category: 'Body Parts' },
  ];

  const handleShopNow = () => {
    navigate('/products');
  };

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${category}`);
  };

  return (
    <div className="hero-section">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title animate-fade-in">
            Welcome to Mahalaxmi Automobile
          </h1>
          <p className="hero-subtitle animate-fade-in-delay">
            Your trusted source for quality automotive parts
          </p>
          <button 
            className="hero-btn animate-fade-in-delay-2" 
            onClick={handleShopNow}
          >
            Shop Now
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="featured-categories">
        <h2 className="categories-title">Shop by Category</h2>
        <div className="categories-grid">
          {featuredCategories.map((cat, index) => (
            <div
              key={index}
              className="category-card"
              onClick={() => handleCategoryClick(cat.category)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="category-icon">{cat.icon}</div>
              <h3 className="category-name">{cat.name}</h3>
              <p className="category-link">Browse →</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
