import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';
import api from '../../api/apiClient';
import './OrderHistory.css';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      case 'pending':
      default:
        return 'status-pending';
    }
  };

  if (loading) {
    return (
      <div className="order-history-loading">
        <LoadingSpinner size="large" text="Loading your orders..." />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="order-history-empty">
        <h2>No orders yet</h2>
        <p>Start shopping to see your orders here</p>
        <Button onClick={() => navigate('/products')}>
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <h1 className="order-history-title">Order History</h1>
      
      <div className="order-history-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-card-header">
              <div className="order-card-info">
                <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                <p className="order-card-date">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <span className={`order-status ${getStatusClass(order.status)}`}>
                {order.status.toUpperCase()}
              </span>
            </div>

            <div className="order-card-items">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <img 
                      src={item.product_id?.image_url || 'https://via.placeholder.com/60'} 
                      alt={item.product_id?.name || 'Product'}
                      className="order-item-image"
                    />
                    <div className="order-item-details">
                      <p className="order-item-name">
                        {item.product_id?.name || 'Product'}
                      </p>
                      <p className="order-item-quantity">Quantity: {item.quantity}</p>
                    </div>
                    <p className="order-item-price">₹{item.price?.toFixed(2) || '0.00'}</p>
                  </div>
                ))
              ) : (
                <p className="order-no-items">Order details loading...</p>
              )}
            </div>

            <div className="order-card-footer">
              <div className="order-card-total">
                <span>Total:</span>
                <span className="order-total-amount">₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
