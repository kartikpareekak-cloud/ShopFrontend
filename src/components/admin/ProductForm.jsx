import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import InputField from '../common/InputField';
import Button from '../common/Button';
import { useToast } from '../../hooks/useToast';
import api from '../../api/apiClient';
import './ProductForm.css';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Accessories',
    costPrice: '',
    sellingPrice: '',
    stock: '',
  });

  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    'Engine',
    'Brakes',
    'Electrical',
    'Accessories',
    'Body Parts',
    'Mirrors',
    'Lights',
    'Suspension',
    'Transmission',
    'Exhaust'
  ];

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      const product = response.data;
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category || 'Accessories',
        costPrice: product.costPrice || '',
        sellingPrice: product.sellingPrice || product.price || '',
        stock: product.stock,
      });
      setImages(product.images || [product.image_url] || []);
    } catch (error) {
      showToast('Error loading product', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setErrors(prev => ({ ...prev, images: 'Some images exceed 5MB size limit' }));
      return;
    }

    if (images.length + newImages.length + files.length > 10) {
      setErrors(prev => ({ ...prev, images: 'Maximum 10 images allowed' }));
      return;
    }

    setNewImages(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
    setErrors(prev => ({ ...prev, images: '' }));
  };

  const removeExistingImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if (primaryImageIndex >= images.length - 1) {
      setPrimaryImageIndex(Math.max(0, images.length - 2));
    }
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (fromIndex, direction) => {
    const newImagesArray = [...images];
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= newImagesArray.length) return;
    
    [newImagesArray[fromIndex], newImagesArray[toIndex]] = [newImagesArray[toIndex], newImagesArray[fromIndex]];
    setImages(newImagesArray);
    
    if (primaryImageIndex === fromIndex) setPrimaryImageIndex(toIndex);
    else if (primaryImageIndex === toIndex) setPrimaryImageIndex(fromIndex);
  };

  const calculateProfitMargin = () => {
    const cost = parseFloat(formData.costPrice) || 0;
    const selling = parseFloat(formData.sellingPrice) || 0;
    if (cost === 0 || selling === 0) return 0;
    return (((selling - cost) / selling) * 100).toFixed(2);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';

    const costPrice = parseFloat(formData.costPrice);
    if (!formData.costPrice || costPrice < 0) newErrors.costPrice = 'Valid cost price is required';

    const sellingPrice = parseFloat(formData.sellingPrice);
    if (!formData.sellingPrice || sellingPrice <= 0) newErrors.sellingPrice = 'Valid selling price is required';
    if (costPrice && sellingPrice && costPrice > sellingPrice) {
      newErrors.sellingPrice = 'Selling price must be greater than cost price';
    }

    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Valid stock quantity is required';
    if (!isEditMode && images.length === 0 && newImages.length === 0) {
      newErrors.images = 'At least one product image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      showToast('Please fix the errors', 'error');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('costPrice', formData.costPrice);
      formDataToSend.append('sellingPrice', formData.sellingPrice);
      formDataToSend.append('price', formData.sellingPrice);
      formDataToSend.append('stock', formData.stock);

      if (images.length > 0) {
        formDataToSend.append('images', JSON.stringify(images));
        formDataToSend.append('image_url', images[primaryImageIndex] || images[0]);
      }

      newImages.forEach((file) => {
        formDataToSend.append('images', file);
      });

      if (isEditMode) {
        await api.put(`/products/${id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Product updated successfully', 'success');
      } else {
        await api.post('/products', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Product created successfully', 'success');
      }

      navigate('/admin/products');
    } catch (error) {
      showToast(error.response?.data?.message || 'Error saving product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const allImages = [...images, ...imagePreviews];
  const profitMargin = calculateProfitMargin();

  return (
    <div className="product-form-container">
      <div className="form-header">
        <h1>📦 {isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
        <Button variant="secondary" onClick={() => navigate('/admin/products')}>
          ← Back to Products
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-section">
          <h3>📝 Product Information</h3>
          
          <InputField
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="e.g., Brake Pads - Premium Quality"
            required
          />

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter detailed product description..."
              rows={5}
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={errors.category ? 'error' : ''}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>
        </div>

        <div className="form-section">
          <h3>💰 Pricing & Inventory</h3>
          
          <div className="form-row">
            <InputField
              label="Cost Price (₹)"
              name="costPrice"
              type="number"
              step="0.01"
              value={formData.costPrice}
              onChange={handleChange}
              error={errors.costPrice}
              placeholder="Your purchase cost"
              required
            />

            <InputField
              label="Selling Price (₹)"
              name="sellingPrice"
              type="number"
              step="0.01"
              value={formData.sellingPrice}
              onChange={handleChange}
              error={errors.sellingPrice}
              placeholder="Customer price"
              required
            />

            <InputField
              label="Stock Quantity"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              error={errors.stock}
              placeholder="0"
              required
            />
          </div>

          {formData.costPrice && formData.sellingPrice && (
            <div className="profit-indicator">
              <div className="profit-info">
                <span>Profit per unit:</span>
                <strong>₹{(parseFloat(formData.sellingPrice) - parseFloat(formData.costPrice)).toFixed(2)}</strong>
              </div>
              <div className="profit-info">
                <span>Profit margin:</span>
                <strong className={profitMargin > 20 ? 'profit-high' : profitMargin > 10 ? 'profit-medium' : 'profit-low'}>
                  {profitMargin}%
                </strong>
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>📷 Product Images</h3>
          
          <div className="image-upload-section">
            {allImages.length > 0 && (
              <div className="images-grid">
                {images.map((url, index) => (
                  <div key={`existing-${index}`} className={`image-card ${primaryImageIndex === index ? 'primary' : ''}`}>
                    <img src={url} alt={`Product ${index + 1}`} />
                    <div className="image-actions">
                      {index > 0 && (
                        <button type="button" onClick={() => moveImage(index, 'left')} className="move-btn">
                          ←
                        </button>
                      )}
                      {primaryImageIndex !== index && (
                        <button type="button" onClick={() => setPrimaryImageIndex(index)} className="primary-btn">
                          ⭐
                        </button>
                      )}
                      {index < images.length - 1 && (
                        <button type="button" onClick={() => moveImage(index, 'right')} className="move-btn">
                          →
                        </button>
                      )}
                      <button type="button" onClick={() => removeExistingImage(index)} className="remove-btn">
                        🗑️
                      </button>
                    </div>
                    {primaryImageIndex === index && <div className="primary-badge">PRIMARY</div>}
                  </div>
                ))}
                {imagePreviews.map((url, index) => (
                  <div key={`new-${index}`} className="image-card new">
                    <img src={url} alt={`New ${index + 1}`} />
                    <div className="image-actions">
                      <button type="button" onClick={() => removeNewImage(index)} className="remove-btn">
                        🗑️
                      </button>
                    </div>
                    <div className="new-badge">NEW</div>
                  </div>
                ))}
              </div>
            )}

            <div className="file-input-wrapper">
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="file-input"
              />
              <label htmlFor="images" className="file-input-label">
                📷 {allImages.length > 0 ? 'Add More Images' : 'Upload Images'}
              </label>
              <p className="file-input-hint">
                Max size: 5MB per image. Up to 10 images. JPG, PNG, WEBP supported.
                {allImages.length > 0 && ` (${allImages.length}/10 uploaded)`}
              </p>
              {errors.images && <span className="error-message">{errors.images}</span>}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/admin/products')}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
          >
            {loading 
              ? (isEditMode ? 'Updating...' : 'Creating...') 
              : (isEditMode ? '✅ Update Product' : '✅ Create Product')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
