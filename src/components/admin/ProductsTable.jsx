import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import api from '../../api/apiClient';
import './ProductsTable.css';

const ProductsTable = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      showToast('Error loading products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      setDeleteLoading(id);
      await api.delete(`/products/${id}`);
      showToast('Product deleted successfully', 'success');
      fetchProducts();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error deleting product', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="products-table-loading">
        <LoadingSpinner size="large" />
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="products-table-container">
      <div className="table-header">
        <h1>Manage Products</h1>
        <Button onClick={() => navigate('/admin/products/new')}>
          ➕ Add New Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="no-products">
          <h2>No products found</h2>
          <p>Start by adding your first product</p>
          <Button onClick={() => navigate('/admin/products/new')}>
            Add Product
          </Button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>
                    <div className="product-image">
                      <img 
                        src={product.image_url || '/placeholder.png'} 
                        alt={product.name}
                      />
                    </div>
                  </td>
                  <td>
                    <div className="product-name">
                      <strong>{product.name}</strong>
                      <p className="product-description">
                        {product.description.substring(0, 60)}...
                      </p>
                    </div>
                  </td>
                  <td>
                    <span className="product-price">₹{product.sellingPrice || product.price}</span>
                  </td>
                  <td>
                    <span className={`stock-badge ${product.stock === 0 ? 'out-of-stock' : product.stock < 10 ? 'low-stock' : 'in-stock'}`}>
                      {product.stock !== undefined && product.stock !== null ? `${product.stock} units` : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${product.stock > 0 ? 'active' : 'inactive'}`}>
                      {product.stock > 0 ? 'Active' : 'Out of Stock'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(product._id, product.name)}
                        disabled={deleteLoading === product._id}
                        title="Delete"
                      >
                        {deleteLoading === product._id ? '⏳' : '🗑️'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="table-footer">
        <p>Total Products: <strong>{products.length}</strong></p>
        <p>In Stock: <strong>{products.filter(p => p.stock > 0).length}</strong></p>
        <p>Out of Stock: <strong>{products.filter(p => p.stock === 0).length}</strong></p>
      </div>
    </div>
  );
};

export default ProductsTable;
