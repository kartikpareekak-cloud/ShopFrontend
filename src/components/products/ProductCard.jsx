import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  
  const displayPrice = product.sellingPrice || product.price || 0;

  return (
    <div className="product-card" onClick={() => navigate(`/products/${product._id}`)}>
      <img
        className="product-img"
        src={product.image_url || product.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
        alt={product.name}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
        }}
      />
      <h3>{product.name}</h3>
      <p className="price">₹{displayPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>
        {product.description?.substring(0, 100)}
        {product.description?.length > 100 ? '...' : ''}
      </p>
      <div style={{ marginTop: '0.5rem', color: product.stock > 0 ? '#4CAF50' : '#F44336', fontWeight: '500' }}>
        {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
      </div>
    </div>
  );
}
