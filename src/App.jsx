import React, { useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import socketService from './utils/socket';
import { logout } from './redux/authSlice';
import { updateProductStock } from './redux/productSlice';
import ToastNotification from './components/common/ToastNotification';
import Footer from './components/common/Footer';
import useToast from './hooks/useToast';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Components
import ProductList from './components/products/ProductList';
import ProductDetail from './components/products/ProductDetail';
import Cart from './components/cart/Cart';
import CheckoutForm from './components/checkout/CheckoutForm';
import OrderHistory from './components/orders/OrderHistory';
import ProtectedRoute from './components/common/ProtectedRoute';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import Dashboard from './components/admin/Dashboard';
import ProductForm from './components/admin/ProductForm';
import ProductsTable from './components/admin/ProductsTable';
import OrdersTable from './components/admin/OrdersTable';
import UsersTable from './components/admin/UsersTable';
import InventoryPage from './components/admin/InventoryPage';

export default function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { toasts, removeToast } = useToast();
  const cartItemsCount = useSelector((state) => 
    state.cart.items.reduce((total, item) => total + item.quantity, 0)
  );

  // Initialize Socket.io connection and listen for stock updates
  useEffect(() => {
    socketService.connect();

    // Listen for real-time stock updates
    socketService.on('stock-update', (data) => {
      console.log('📦 Stock update received:', data);
      dispatch(updateProductStock({ 
        productId: data.productId, 
        stock: data.stock 
      }));
    });

    return () => {
      socketService.off('stock-update');
    };
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-container">
          <Link to="/" className="logo">
            <h1>🚗 Mahalaxmi Automobile</h1>
          </Link>
          
          <nav className="nav">
            <Link to="/products" className="nav-link">Products</Link>
            
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="nav-link admin-link">Admin Panel</Link>
                )}
                <Link to="/orders" className="nav-link">My Orders</Link>
                <Link to="/cart" className="nav-link cart-link">
                  Cart {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
                </Link>
                <div className="user-menu">
                  <span className="user-name">👤 {user?.name}</span>
                  <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/signup" className="nav-link signup-link">Sign Up</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Customer Routes */}
          <Route 
            path="/cart" 
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <CheckoutForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute adminOnly>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/products" 
            element={
              <ProtectedRoute adminOnly>
                <ProductsTable />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/products/new" 
            element={
              <ProtectedRoute adminOnly>
                <ProductForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/products/edit/:id" 
            element={
              <ProtectedRoute adminOnly>
                <ProductForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/orders" 
            element={
              <ProtectedRoute adminOnly>
                <OrdersTable />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute adminOnly>
                <UsersTable />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/inventory" 
            element={
              <ProtectedRoute adminOnly>
                <InventoryPage />
              </ProtectedRoute>
            } 
          />

          {/* 404 Route */}
          <Route path="*" element={
            <div className="not-found">
              <h1>404 - Page Not Found</h1>
              <Link to="/">Go Home</Link>
            </div>
          } />
        </Routes>
      </main>

      <Footer />

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            duration={toast.duration}
          />
        ))}
      </div>
    </div>
  );
}
