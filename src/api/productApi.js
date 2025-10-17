import api from './apiClient'

export const fetchProducts = () => api.get('/products')
export const fetchProduct = (id) => api.get(`/products/${id}`)
