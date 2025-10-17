import React from 'react';
import './OrderSummary.css';

/**
 * Order Summary Component
 * Shows cart items summary with totals
 */
const OrderSummary = ({ items = [], subtotal = 0, tax = 0, total = 0 }) => {
  return (
    <div className="order-summary">
      <h2 className="order-summary-title">Order Summary</h2>
      
      <div className="order-summary-items">
        {items.map((item) => (
          <div key={item.product_id._id || item.product_id} className="order-summary-item">
            <div className="order-summary-item-info">
              <img 
                src={item.product_id.image_url || 'https://via.placeholder.com/60'} 
                alt={item.product_id.name}
                className="order-summary-item-image"
              />
              <div>
                <p className="order-summary-item-name">{item.product_id.name}</p>
                <p className="order-summary-item-quantity">Qty: {item.quantity}</p>
              </div>
            </div>
            <p className="order-summary-item-price">
              ₹{(item.product_id.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="order-summary-totals">
        <div className="order-summary-row">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="order-summary-row">
          <span>Tax (0%)</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        <div className="order-summary-row">
          <span>Shipping</span>
          <span className="order-summary-free">FREE</span>
        </div>
        <div className="order-summary-row order-summary-total">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
