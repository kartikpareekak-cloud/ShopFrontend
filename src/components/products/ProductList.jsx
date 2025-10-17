import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import ProductCard from './ProductCard';
import { loadProducts } from '../../redux/productSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import './ProductList.css';

export default function ProductList() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((s) => s.products);
  const [searchParams, setSearchParams] = useSearchParams();

  // Local state for filters
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', 'Engine', 'Brakes', 'Electrical', 'Accessories', 'Body Parts', 'Mirrors', 'Lights'];

  useEffect(() => {
    dispatch(loadProducts());
  }, [dispatch]);

  // Update selected category from URL params
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...items];

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(
        (product) => product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return filtered;
  }, [items, selectedCategory, sortBy, searchTerm]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  if (status === 'loading') {
    return (
      <div className="products-page">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="products-page">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Failed to load products</h2>
          <p>Please check if the backend server is running.</p>
          <button
            onClick={() => dispatch(loadProducts())}
            style={{
              padding: '0.75rem 2rem',
              background: '#00796B',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '1rem',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <h1 className="products-title">Our Products</h1>
        <p className="products-subtitle">
          Discover premium automotive parts for all your needs
        </p>
      </div>

      {/* Filters and Search Bar */}
      <div className="products-controls">
        {/* Category Filter */}
        <div className="category-filter">
          <div className="category-pills">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-pill ${
                  selectedCategory === category ? 'active' : ''
                }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Sort Row */}
        <div className="search-sort-row">
          {/* Search Bar */}
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="sort-box">
            <label htmlFor="sort-select" className="sort-label">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest</option>
              <option value="name">Name (A-Z)</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count">
        Showing <strong>{filteredAndSortedProducts.length}</strong> of{' '}
        <strong>{items.length}</strong> products
      </div>

      {/* Product Grid */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="no-products">
          <div className="no-products-icon">🔍</div>
          <h2>No products found</h2>
          <p>
            {searchTerm
              ? `No results for "${searchTerm}". Try a different search term.`
              : selectedCategory !== 'All'
              ? `No products available in "${selectedCategory}" category.`
              : 'No products available. Please check back later or add some products from the admin panel.'}
          </p>
          {(searchTerm || selectedCategory !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                handleCategoryChange('All');
              }}
              className="clear-filters-btn"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="product-grid">
          {filteredAndSortedProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
