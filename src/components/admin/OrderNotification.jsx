import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './OrderNotification.css';

const OrderNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to Socket.io
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    setSocket(newSocket);

    // Listen for new orders
    newSocket.on('new_order', (orderData) => {
      console.log('🔔 New order notification:', orderData);
      
      // Add notification
      const notification = {
        id: Date.now(),
        ...orderData,
        timestamp: new Date(),
        read: false
      };

      setNotifications(prev => [notification, ...prev].slice(0, 10)); // Keep last 10

      // Play notification sound
      playNotificationSound();

      // Show browser notification
      showBrowserNotification(orderData);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3'); // Add a notification sound file
      audio.play().catch(err => console.log('Sound play failed:', err));
    } catch (err) {
      console.log('Sound error:', err);
    }
  };

  const showBrowserNotification = (orderData) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🎉 New Order Received!', {
        body: `${orderData.customerName} - ₹${orderData.total} (${orderData.totalQuantity} items)`,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: orderData.orderId
      });
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (notifications.length === 0) return null;

  return (
    <div className="order-notifications-container">
      <div className="notifications-header">
        <h3>
          🔔 New Orders 
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </h3>
      </div>
      
      <div className="notifications-list">
        {notifications.map((notif) => (
          <div 
            key={notif.id} 
            className={`notification-card ${notif.read ? 'read' : 'unread'}`}
            onClick={() => markAsRead(notif.id)}
          >
            <div className="notification-header">
              <span className="notification-icon">🎉</span>
              <span className="notification-time">
                {new Date(notif.timestamp).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <button 
                className="notification-close"
                onClick={(e) => {
                  e.stopPropagation();
                  clearNotification(notif.id);
                }}
              >
                ✕
              </button>
            </div>

            <div className="notification-content">
              <p className="notification-message">
                <strong>{notif.customerName}</strong> placed a new order
              </p>
              
              <div className="notification-details">
                <div className="detail-row">
                  <span className="label">Order ID:</span>
                  <span className="value">#{notif.orderId.slice(-8)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Amount:</span>
                  <span className="value amount">₹{notif.total}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Items:</span>
                  <span className="value">{notif.totalQuantity} qty ({notif.itemCount} items)</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone:</span>
                  <span className="value">{notif.customerPhone}</span>
                </div>
              </div>

              <div className="notification-items">
                {notif.items.map((item, index) => (
                  <div key={index} className="item-mini">
                    • {item.productName} × {item.quantity}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderNotification;
