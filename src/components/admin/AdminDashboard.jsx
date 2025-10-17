import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/apiClient';
import './AdminDashboard.css';
import OrderNotification from './OrderNotification';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const productsRes = await api.get('/products');
      const products = productsRes.data;
      
      // Fetch all orders (admin only)
      const ordersRes = await api.get('/orders/all');
      const orders = ordersRes.data;

      // Calculate stats
      const totalRevenue = orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.total, 0);
      
      const pendingOrders = orders.filter(o => o.status === 'pending').length;

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingOrders,
        totalRevenue
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      {/* Real-time Order Notifications */}
      <OrderNotification />
      
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back! Here's what's happening today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-products">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{stats.totalProducts}</h3>
            <p>Total Products</p>
          </div>
        </div>

        <div className="stat-card stat-orders">
          <div className="stat-icon">🛒</div>
          <div className="stat-content">
            <h3>{stats.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="stat-card stat-pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingOrders}</h3>
            <p>Pending Orders</p>
          </div>
        </div>

        <div className="stat-card stat-revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      <div className="admin-actions">
        <div className="action-section">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button 
              className="action-btn btn-primary"
              onClick={() => navigate('/admin/products/new')}
            >
              <span className="btn-icon">➕</span>
              Add New Product
            </button>
            
            <button 
              className="action-btn btn-secondary"
              onClick={() => navigate('/admin/products')}
            >
              <span className="btn-icon">📦</span>
              Manage Products
            </button>
            
            <button 
              className="action-btn btn-secondary"
              onClick={() => navigate('/admin/orders')}
            >
              <span className="btn-icon">📋</span>
              Manage Orders
            </button>
          </div>
        </div>

        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">🛒</span>
              <div className="activity-content">
                <p><strong>New Order</strong></p>
                <p className="activity-time">2 minutes ago</p>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">📦</span>
              <div className="activity-content">
                <p><strong>Product Updated</strong></p>
                <p className="activity-time">15 minutes ago</p>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">✅</span>
              <div className="activity-content">
                <p><strong>Order Completed</strong></p>
                <p className="activity-time">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
