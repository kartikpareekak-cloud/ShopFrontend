import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';
import { useToast } from '../../hooks/useToast';
import api from '../../api/apiClient';
import './OrdersTable.css';

const OrdersTable = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updateLoading, setUpdateLoading] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/all');
      setOrders(response.data);
    } catch (error) {
      showToast('Error loading orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdateLoading(orderId);
      await api.patch(`/orders/${orderId}`, { status: newStatus });
      showToast(`Order status updated to ${newStatus}`, 'success');
      fetchOrders();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error updating order', 'error');
    } finally {
      setUpdateLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'status-pending', text: 'Pending' },
      completed: { class: 'status-completed', text: 'Completed' },
      cancelled: { class: 'status-cancelled', text: 'Cancelled' }
    };
    return badges[status] || badges.pending;
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (loading) {
    return (
      <div className="orders-table-loading">
        <LoadingSpinner size="large" />
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-table-container">
      <div className="table-header">
        <h1>Manage Orders</h1>
        <div className="order-filters">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All ({orders.length})
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''} 
            onClick={() => setFilter('pending')}
          >
            Pending ({orders.filter(o => o.status === 'pending').length})
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''} 
            onClick={() => setFilter('completed')}
          >
            Completed ({orders.filter(o => o.status === 'completed').length})
          </button>
          <button 
            className={filter === 'cancelled' ? 'active' : ''} 
            onClick={() => setFilter('cancelled')}
          >
            Cancelled ({orders.filter(o => o.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <h2>No orders found</h2>
          <p>{filter === 'all' ? 'No orders yet' : `No ${filter} orders`}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const statusBadge = getStatusBadge(order.status);
                return (
                  <tr key={order._id}>
                    <td>
                      <span className="order-id">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="customer-info">
                        <strong>{order.user_id?.name || 'Unknown'}</strong>
                        <p>{order.user_id?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td>
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td>
                      <span className="item-count">
                        {order.items?.reduce((total, item) => total + item.quantity, 0) || 0} qty
                        {order.items?.length > 0 && ` (${order.items.length} ${order.items.length === 1 ? 'item' : 'items'})`}
                      </span>
                    </td>
                    <td>
                      <span className="order-total">₹{order.total}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${statusBadge.class}`}>
                        {statusBadge.text}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {order.status === 'pending' && (
                          <>
                            <button
                              className="btn-complete"
                              onClick={() => handleStatusUpdate(order._id, 'completed')}
                              disabled={updateLoading === order._id}
                              title="Mark as Completed"
                            >
                              {updateLoading === order._id ? '⏳' : '✓'}
                            </button>
                            <button
                              className="btn-cancel"
                              onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                              disabled={updateLoading === order._id}
                              title="Cancel Order"
                            >
                              {updateLoading === order._id ? '⏳' : '✕'}
                            </button>
                          </>
                        )}
                        {order.status !== 'pending' && (
                          <span className="no-actions">No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="table-footer">
        <div className="footer-stat">
          <span>Total Orders:</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="footer-stat">
          <span>Total Revenue:</span>
          <strong>₹{orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0).toLocaleString()}</strong>
        </div>
        <div className="footer-stat">
          <span>Pending:</span>
          <strong>{orders.filter(o => o.status === 'pending').length}</strong>
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;
