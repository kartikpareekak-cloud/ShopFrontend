import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCart, updateCartItem, removeFromCart } from '../../redux/cartSlice';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import './Cart.css';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { items, loading } = useSelector(state => state.cart);
  const [updatingItems, setUpdatingItems] = useState(new Set());

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => new Set(prev).add(productId));
    
    try {
      await dispatch(updateCartItem({ product_id: productId, quantity: newQuantity })).unwrap();
      showToast('Cart updated successfully', 'success');
    } catch (error) {
      showToast(error || 'Failed to update cart', 'error');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (productId) => {
    setUpdatingItems(prev => new Set(prev).add(productId));
    
    try {
      await dispatch(removeFromCart(productId)).unwrap();
      showToast('Item removed from cart', 'success');
    } catch (error) {
      showToast(error || 'Failed to remove item', 'error');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      const price = item.product_id?.sellingPrice || item.product_id?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.18; // 18% GST
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    return subtotal + tax;
  };

  if (loading && items.length === 0) {
    return (
      <div className="cart-loading">
        <LoadingSpinner />
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-cart-icon">🛒</div>
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <Button onClick={() => navigate('/products')}>
          🛍️ Continue Shopping
        </Button>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const total = calculateTotal();

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>🛒 Shopping Cart</h1>
          <p className="cart-item-count">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
        </div>

        <div className="cart-content">
          {/* Cart Items Section */}
          <div className="cart-items-section">
            {items.map((item) => {
              const product = item.product_id;
              if (!product) return null;

              const price = product.sellingPrice || product.price || 0;
              const imageUrl = product.image_url || product.images?.[0] || '/placeholder.png';
              const isUpdating = updatingItems.has(product._id);

              return (
                <div key={product._id} className={`cart-item ${isUpdating ? 'updating' : ''}`}>
                  <div className="cart-item-image">
                    <img src={imageUrl} alt={product.name} />
                  </div>

                  <div className="cart-item-details">
                    <h3>{product.name}</h3>
                    <p className="cart-item-category">{product.category}</p>
                    <p className="cart-item-description">{product.description?.substring(0, 100)}...</p>
                    
                    <div className="cart-item-stock">
                      {product.stock > 10 ? (
                        <span className="in-stock">✓ In Stock</span>
                      ) : product.stock > 0 ? (
                        <span className="low-stock">⚠ Only {product.stock} left</span>
                      ) : (
                        <span className="out-of-stock">✗ Out of Stock</span>
                      )}
                    </div>
                  </div>

                  <div className="cart-item-price">
                    <span className="price-label">Price</span>
                    <span className="price-value">₹{price.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="cart-item-quantity">
                    <span className="quantity-label">Quantity</span>
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(product._id, item.quantity - 1)}
                        disabled={isUpdating || item.quantity <= 1}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (val > 0 && val <= product.stock) {
                            handleQuantityChange(product._id, val);
                          }
                        }}
                        min="1"
                        max={product.stock}
                        disabled={isUpdating}
                      />
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(product._id, item.quantity + 1)}
                        disabled={isUpdating || item.quantity >= product.stock}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-total">
                    <span className="total-label">Total</span>
                    <span className="total-value">₹{(price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>

                  <button
                    className="cart-item-remove"
                    onClick={() => handleRemoveItem(product._id)}
                    disabled={isUpdating}
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>

          {/* Order Summary Section */}
          <div className="cart-summary-section">
            <div className="cart-summary">
              <h2>Order Summary</h2>
              
              <div className="summary-row">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="summary-row">
                <span>GST (18%)</span>
                <span>₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="summary-row shipping">
                <span>Shipping</span>
                <span className="free">FREE</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <Button 
                className="checkout-btn"
                onClick={() => navigate('/checkout')}
                disabled={loading}
              >
                🚀 Proceed to Checkout
              </Button>

              <Button 
                variant="secondary"
                onClick={() => navigate('/products')}
                className="continue-shopping-btn"
              >
                ← Continue Shopping
              </Button>

              <div className="summary-benefits">
                <div className="benefit-item">
                  <span className="benefit-icon">🚚</span>
                  <span>Free Delivery</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">🔒</span>
                  <span>Secure Payment</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">↩️</span>
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
