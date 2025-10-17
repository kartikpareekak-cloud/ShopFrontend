import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import OrderNotification from './OrderNotification';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch stats
      const statsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/stats`, config);
      setStats(statsRes.data.stats);

      // Fetch revenue chart data
      const chartRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/revenue-chart?months=6`, config);
      setRevenueData(chartRes.data.data);

      setLoading(false);
    } catch (err) {
      console.error('Fetch dashboard error:', err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      setLoading(false);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStockColor = (stock) => {
    if (stock < 5) return 'critical';
    if (stock < 10) return 'low';
    if (stock < 20) return 'medium';
    return 'healthy';
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-container">
          <p className="error-message">❌ {error}</p>
          <button onClick={fetchDashboardData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Real-time Order Notifications */}
      <OrderNotification />

      <div className="dashboard-header">
        <h1>📊 Admin Dashboard</h1>
        <p>Welcome back! Here's what's happening with your business today.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">{stats?.totalUsers || 0}</p>
            <span className="stat-detail">
              {stats?.activeUsers || 0} active · {stats?.inactiveUsers || 0} inactive
            </span>
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats?.totalOrders || 0}</p>
            <span className="stat-detail">
              {stats?.deliveredOrders || 0} delivered · {stats?.pendingOrders || 0} pending
            </span>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">{formatCurrency(stats?.totalRevenue || 0)}</p>
            <span className="stat-detail">
              From {stats?.deliveredOrders || 0} delivered orders
            </span>
          </div>
        </div>

        <div className="stat-card profit">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Total Profit</h3>
            <p className="stat-value">{formatCurrency(stats?.totalProfit || 0)}</p>
            <span className="stat-detail">
              {stats?.profitMargin || 0}% profit margin
            </span>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Orders</h3>
            <p className="stat-value">{stats?.pendingOrders || 0}</p>
            <span className="stat-detail">
              Needs attention
            </span>
          </div>
        </div>

        <div className="stat-card low-stock">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Low Stock Items</h3>
            <p className="stat-value">{stats?.lowStockCount || 0}</p>
            <span className="stat-detail">
              Stock below 10 units
            </span>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="chart-section">
        <h2>📊 Revenue Overview (Last 6 Months)</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="month" 
                stroke="#666"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#666"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `₹${value / 1000}k`}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#00796B" 
                strokeWidth={3}
                name="Revenue"
                dot={{ fill: '#00796B', r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#FFA726" 
                strokeWidth={3}
                name="Profit"
                dot={{ fill: '#FFA726', r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="cost" 
                stroke="#F44336" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Cost"
                dot={{ fill: '#F44336', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Stock Products */}
      {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
        <div className="low-stock-section">
          <div className="section-header">
            <h2>⚠️ Low Stock Alert</h2>
            <button 
              className="view-all-btn"
              onClick={() => navigate('/admin/inventory')}
            >
              Manage Inventory →
            </button>
          </div>
          <div className="low-stock-grid">
            {stats.lowStockProducts.map((product) => (
              <div key={product._id} className="low-stock-card">
                <img 
                  src={product.image_url || '/placeholder-product.png'} 
                  alt={product.name}
                  onError={(e) => e.target.src = '/placeholder-product.png'}
                />
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p className="category">{product.category}</p>
                  <div className={`stock-badge ${getStockColor(product.stock)}`}>
                    {product.stock} units left
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>⚡ Quick Actions</h2>
        <div className="actions-grid">
          <button 
            className="action-btn products"
            onClick={() => navigate('/admin/products')}
          >
            <span className="action-icon">📦</span>
            <span>Manage Products</span>
          </button>
          <button 
            className="action-btn orders"
            onClick={() => navigate('/admin/orders')}
          >
            <span className="action-icon">📋</span>
            <span>View Orders</span>
          </button>
          <button 
            className="action-btn users"
            onClick={() => navigate('/admin/users')}
          >
            <span className="action-icon">👥</span>
            <span>Manage Users</span>
          </button>
          <button 
            className="action-btn inventory"
            onClick={() => navigate('/admin/inventory')}
          >
            <span className="action-icon">📊</span>
            <span>Check Inventory</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
