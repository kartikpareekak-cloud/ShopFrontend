import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { addToCart } from '../../redux/cartSlice';
import { loadProducts } from '../../redux/productSlice';
import { useToast } from '../../hooks/useToast';
import api from '../../api/apiClient';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      showToast('Failed to load product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      await dispatch(addToCart({ product_id: product._id, quantity })).unwrap();
      
      // Refetch product to get updated stock
      await fetchProduct();
      
      // Reload products list to keep it in sync
      dispatch(loadProducts());
      
      // Reset quantity to 1
      setQuantity(1);
      
      showToast(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart!`, 'success');
    } catch (error) {
      showToast(error || 'Failed to add to cart. Please login first.', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <LoadingSpinner size="large" text="Loading product..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-error">
        <h2>Product not found</h2>
        <Button onClick={() => navigate('/products')}>Back to Products</Button>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;

  return (
    <div className="product-detail-container">
      <div className="product-detail">
        <div className="product-detail-image-section">
          <img 
            src={product.image_url || 'https://via.placeholder.com/500'} 
            alt={product.name}
            className="product-detail-image"
          />
        </div>

        <div className="product-detail-info-section">
          <h1 className="product-detail-title">{product.name}</h1>
          
          <div className="product-detail-price-section">
            <span className="product-detail-price">
              ₹{((product.sellingPrice || product.price || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {isOutOfStock && (
              <span className="product-stock-badge out-of-stock">Out of Stock</span>
            )}
            {isLowStock && (
              <span className="product-stock-badge low-stock">Only {product.stock} left!</span>
            )}
            {!isOutOfStock && !isLowStock && (
              <span className="product-stock-badge in-stock">In Stock ({product.stock} available)</span>
            )}
          </div>

          <div className="product-detail-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          {!isOutOfStock && (
            <div className="product-detail-quantity">
              <label>Quantity:</label>
              <div className="quantity-selector">
                <button 
                  className="quantity-btn"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="quantity-value">{quantity}</span>
                <button 
                  className="quantity-btn"
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <span className="quantity-available">
                {product.stock} available
              </span>
            </div>
          )}

          <div className="product-detail-actions">
            <Button
              variant="primary"
              size="large"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              loading={addingToCart}
            >
              Add to Cart
            </Button>
            <Button
              variant="secondary"
              size="large"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
            >
              Buy Now
            </Button>
          </div>

          <button 
            className="product-detail-back"
            onClick={() => navigate('/products')}
          >
            ← Back to Products
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
