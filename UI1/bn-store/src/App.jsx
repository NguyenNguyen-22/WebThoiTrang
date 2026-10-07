import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import FlashSale from './pages/FlashSale';
import { Login, Register, ForgotPassword } from './pages/Auth';

import ShopPages from './pages/Shop';
import UserPages from './pages/User';
import AdminPages from './pages/Admin';

import './App.css';
import './add.css';

function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="flash-sale" element={<FlashSale />} />
          <Route path="products" element={<ShopPages.ProductList />} />
          <Route path="product/:id" element={<ShopPages.ProductDetail />} />
          <Route path="cart" element={<ShopPages.Cart />} />
          <Route path="checkout" element={<ShopPages.Checkout />} />
          <Route path="payment-result" element={<ShopPages.PaymentResult />} />
          <Route path="profile" element={<UserPages.Profile />} />
          <Route path="orders" element={<UserPages.Orders />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminPages.AdminLayout />}>
          <Route index element={<AdminPages.Dashboard />} />
          <Route path="products" element={<AdminPages.Products />} />
          <Route path="stock" element={<AdminPages.Stock />} />
          <Route path="orders" element={<AdminPages.Orders />} />
          <Route path="users" element={<AdminPages.Users />} />
          <Route path="logs" element={<AdminPages.Logs />} />
          <Route path="promotions" element={<AdminPages.Promotions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
