import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './InventoryPage.css';

const InventoryPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [restockModal, setRestockModal] = useState({ show: false, product: null, quantity: 0 });
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'critical', 'low', 'medium'

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Sort by stock (lowest first)
      const sortedProducts = response.data.sort((a, b) => a.stock - b.stock);
      setProducts(sortedProducts);
      setLoading(false);
    } catch (err) {
      console.error('Fetch inventory error:', err);
      setError('Failed to fetch inventory');
      setLoading(false);
    }
  };

  const handleRestock = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const { product, quantity } = restockModal;

      if (!quantity || quantity < 1) {
        setError('Please enter a valid quantity');
        return;
      }

      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/products/${product._id}/restock`,
        { quantity: parseInt(quantity) },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Update local state
        setProducts(prev => prev.map(p => 
          p._id === product._id 
            ? { ...p, stock: p.stock + parseInt(quantity) }
            : p
        ));
        setRestockModal({ show: false, product: null, quantity: 0 });
        setError('');
      }
    } catch (err) {
      console.error('Restock error:', err);
      setError(err.response?.data?.message || 'Failed to restock product');
    }
  };

  const getStockStatus = (stock) => {
    if (stock < 5) return 'critical';
    if (stock < 10) return 'low';
    if (stock < 20) return 'medium';
    return 'healthy';
  };

  const getStockLabel = (stock) => {
    if (stock < 5) return '🔴 Critical';
    if (stock < 10) return '🟡 Low Stock';
    if (stock < 20) return '🟠 Medium';
    return '🟢 Healthy';
  };

  const filteredProducts = filterStatus === 'all' 
    ? products
    : products.filter(p => getStockStatus(p.stock) === filterStatus);

  const stats = {
    total: products.length,
    critical: products.filter(p => p.stock < 5).length,
    low: products.filter(p => p.stock < 10).length,
    medium: products.filter(p => p.stock >= 10 && p.stock < 20).length,
    healthy: products.filter(p => p.stock >= 20).length
  };

  if (loading) {
    return (
      <div className="inventory-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <div>
          <h1>📊 Inventory Management</h1>
          <p>Monitor stock levels and restock products</p>
        </div>
        <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>❌ {error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* Stock Stats */}
      <div className="stock-stats">
        <div className="stat-card critical">
          <div className="stat-icon">🔴</div>
          <div className="stat-content">
            <h3>Critical</h3>
            <p className="stat-value">{stats.critical}</p>
            <span className="stat-detail">Below 5 units</span>
          </div>
        </div>
        <div className="stat-card low">
          <div className="stat-icon">🟡</div>
          <div className="stat-content">
            <h3>Low Stock</h3>
            <p className="stat-value">{stats.low}</p>
            <span className="stat-detail">Below 10 units</span>
          </div>
        </div>
        <div className="stat-card medium">
          <div className="stat-icon">🟠</div>
          <div className="stat-content">
            <h3>Medium</h3>
            <p className="stat-value">{stats.medium}</p>
            <span className="stat-detail">10-19 units</span>
          </div>
        </div>
        <div className="stat-card healthy">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <h3>Healthy</h3>
            <p className="stat-value">{stats.healthy}</p>
            <span className="stat-detail">20+ units</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <button 
          className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All Products ({products.length})
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'critical' ? 'active' : ''}`}
          onClick={() => setFilterStatus('critical')}
        >
          🔴 Critical ({stats.critical})
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'low' ? 'active' : ''}`}
          onClick={() => setFilterStatus('low')}
        >
          🟡 Low Stock ({stats.low})
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'medium' ? 'active' : ''}`}
          onClick={() => setFilterStatus('medium')}
        >
          🟠 Medium ({stats.medium})
        </button>
      </div>

      {/* Inventory Grid */}
      <div className="inventory-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const status = getStockStatus(product.stock);
            return (
              <div key={product._id} className={`inventory-card ${status}`}>
                <div className="card-image">
                  <img 
                    src={product.image_url || '/placeholder-product.png'} 
                    alt={product.name}
                    onError={(e) => e.target.src = '/placeholder-product.png'}
                  />
                  <span className={`stock-badge ${status}`}>
                    {getStockLabel(product.stock)}
                  </span>
                </div>
                <div className="card-content">
                  <h3>{product.name}</h3>
                  <p className="category">{product.category}</p>
                  <div className="stock-info">
                    <div className="stock-count">
                      <span className="label">Current Stock:</span>
                      <span className={`value ${status}`}>{product.stock} units</span>
                    </div>
                    <div className="stock-bar">
                      <div 
                        className={`stock-fill ${status}`}
                        style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <button 
                    className="restock-btn"
                    onClick={() => setRestockModal({ show: true, product, quantity: 10 })}
                  >
                    📦 Restock
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-data">
            <p>No products found in this category</p>
          </div>
        )}
      </div>

      {/* Restock Modal */}
      {restockModal.show && (
        <div className="modal-overlay" onClick={() => setRestockModal({ show: false, product: null, quantity: 0 })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>📦 Restock Product</h3>
            <div className="product-summary">
              <img 
                src={restockModal.product.image_url || '/placeholder-product.png'} 
                alt={restockModal.product.name}
                onError={(e) => e.target.src = '/placeholder-product.png'}
              />
              <div>
                <h4>{restockModal.product.name}</h4>
                <p>Current Stock: <strong>{restockModal.product.stock} units</strong></p>
              </div>
            </div>
            <div className="input-group">
              <label>Quantity to Add:</label>
              <input 
                type="number"
                min="1"
                value={restockModal.quantity}
                onChange={(e) => setRestockModal(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="Enter quantity"
              />
              <p className="new-stock">
                New Stock: <strong>{restockModal.product.stock + parseInt(restockModal.quantity || 0)} units</strong>
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="modal-btn cancel"
                onClick={() => setRestockModal({ show: false, product: null, quantity: 0 })}
              >
                Cancel
              </button>
              <button
                className="modal-btn confirm"
                onClick={handleRestock}
              >
                ✅ Restock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
