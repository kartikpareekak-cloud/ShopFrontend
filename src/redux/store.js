import { configureStore } from '@reduxjs/toolkit'
import productSlice from './productSlice'
import cartSlice from './cartSlice'
import authSlice from './authSlice'
import orderSlice from './orderSlice'

export default configureStore({
  reducer: { 
    products: productSlice, 
    cart: cartSlice,
    auth: authSlice,
    order: orderSlice
  }
})

