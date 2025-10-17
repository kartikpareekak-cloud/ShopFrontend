import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import InputField from '../common/InputField';
import Button from '../common/Button';
import OrderSummary from './OrderSummary';
import api from '../../api/apiClient';
import { clearCart, fetchCart } from '../../redux/cartSlice';
import useToast from '../../hooks/useToast';
import './CheckoutForm.css';

const CheckoutForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch cart on component mount
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Calculate totals using sellingPrice
  const subtotal = items.reduce((sum, item) => {
    if (!item.product_id) return sum;
    const price = item.product_id.sellingPrice || item.product_id.price || 0;
    return sum + (price * item.quantity);
  }, 0);
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fill all required fields correctly', 'error');
      return;
    }

    if (items.length === 0) {
      showToast('Your cart is empty! Please add items first.', 'error');
      navigate('/products');
      return;
    }

    try {
      setLoading(true);
      console.log('📦 Placing order with shipping info:', formData);
      console.log('📦 Cart items:', items.length, 'items');
      
      // Place order (backend will use cart items)
      const response = await api.post('/orders', {
        shippingInfo: formData,
      });
      
      console.log('✅ Order response:', response.data);
      
      // Clear cart in Redux store
      dispatch(clearCart());
      
      showToast('Order placed successfully! 🎉', 'success');
      
      // Navigate to home page
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('❌ Order error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      // Show both message and error from backend
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to place order. Please try again.';
      showToast(errorMsg, 'error');
      
      // If cart is empty, redirect to products
      if (errorMsg.includes('Cart is empty') || errorMsg.includes('cart')) {
        setTimeout(() => {
          navigate('/products');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty</h2>
        <p>Add some products to checkout</p>
        <Button onClick={() => navigate('/products')}>
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-content">
        <div className="checkout-form-section">
          <h1 className="checkout-title">Checkout</h1>
          
          <form onSubmit={handleSubmit} className="checkout-form">
            <h3>Shipping Information</h3>
            
            <InputField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Enter your full name"
              required
            />

            <InputField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="your@email.com"
              required
            />

            <InputField
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="10-digit mobile number"
              required
            />

            <InputField
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              placeholder="Street address, apartment, etc."
              required
            />

            <div className="checkout-form-row">
              <InputField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={errors.city}
                placeholder="City"
                required
              />

              <InputField
                label="Pincode"
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                error={errors.pincode}
                placeholder="6-digit pincode"
                required
              />
            </div>

            <div className="checkout-payment-info">
              <h3>Payment Method</h3>
              <div className="payment-method">
                <input type="radio" id="cod" name="payment" checked readOnly />
                <label htmlFor="cod">Cash on Delivery</label>
              </div>
              <p className="payment-note">
                Pay when you receive your order
              </p>
            </div>

            <div className="checkout-form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/cart')}
              >
                Back to Cart
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="large"
                loading={loading}
              >
                Place Order
              </Button>
            </div>
          </form>
        </div>

        <div className="checkout-summary-section">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            tax={tax}
            total={total}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
