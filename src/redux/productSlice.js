import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchProducts } from '../api/productApi';

export const loadProducts = createAsyncThunk('products/load', async (_, { rejectWithValue }) => {
  try {
    const res = await fetchProducts();
    return res.data;
  } catch (error) {
    console.error('Failed to load products:', error);
    return rejectWithValue(error.response?.data?.message || 'Failed to load products');
  }
});

const slice = createSlice({
  name: 'products',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {
    updateProductStock: (state, action) => {
      const { productId, stock } = action.payload;
      const product = state.items.find(p => p._id === productId);
      if (product) {
        product.stock = stock;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProducts.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(loadProducts.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.items = a.payload;
        s.error = null;
      })
      .addCase(loadProducts.rejected, (s, a) => {
        s.status = 'failed';
        s.error = a.payload || 'Failed to load products';
      });
  }
});

export const { updateProductStock } = slice.actions;
export default slice.reducer
