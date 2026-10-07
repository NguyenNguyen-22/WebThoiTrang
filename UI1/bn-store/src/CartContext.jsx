import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState(1); // Default fallback user string or 1

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user && user.id) setUserId(user.id);
      } catch (e) {}
    }
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch(`/identity/api/cart/${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.items) {
          const items = data.items.map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.salePrice > 0 ? item.product.salePrice : item.product.price,
            rawPrice: item.product.salePrice > 0 ? item.product.salePrice : item.product.price,
            quantity: item.quantity,
            images: item.product.images || [],
            image: (() => {
              if (item.product.images && item.product.images.length > 0) {
                if (item.color) {
                   const matchedImg = item.product.images.find(img => img.color === item.color);
                   if (matchedImg) return matchedImg.imageUrl;
                }
                const mainImg = item.product.images.find(img => img.isMain);
                return mainImg ? mainImg.imageUrl : item.product.images[0].imageUrl;
              }
              return '';
            })(),
            size: item.size || 'M',
            color: item.color || '',
            slug: item.product.slug
          }));
          setCartItems(items);
        }
      }
    } catch (e) {
      console.error('Error loading cart', e);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [userId]);

  const addToCart = async (product, quantity = 1, size = 'M', color = '') => {
    try {
      const payload = { productId: product.id, quantity, size, color };
      const res = await fetch(`/identity/api/cart/${userId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchCart();
        return { success: true };
      } else {
        const textErr = await res.text();
        alert(textErr || "Không thể thêm vào giỏ hàng!");
        return { success: false, error: textErr };
      }
    } catch (e) {
      console.error('Add to cart failed', e);
      alert("Đã xảy ra lỗi khi thêm vào giỏ hàng!");
      return { success: false, error: e.message };
    }
  };

  const removeFromCart = async (id, size, color = '') => {
     try {
       const res = await fetch(`/identity/api/cart/${userId}/remove/${id}?size=${size || 'M'}&color=${color || ''}`, {
         method: 'DELETE'
       });
       if (res.ok) {
         fetchCart();
       }
     } catch (e) {
       console.error('Remove from cart failed', e);
     }
  };

  const updateQuantity = async (id, size, color = '', delta) => {
     const item = cartItems.find(i => i.id === id && i.size === size && i.color === color);
     if (!item) return;
     const newQuantity = Math.max(1, item.quantity + delta);
     
     try {
       const payload = { productId: id, quantity: newQuantity, size, color };
       const res = await fetch(`/identity/api/cart/${userId}/update`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload)
       });
       if (res.ok) {
         fetchCart();
       } else {
         const textErr = await res.text();
         alert(textErr || "Không thể cập nhật số lượng!");
       }
     } catch (e) {
       console.error('Update quantity failed', e);
       alert("Đã xảy ra lỗi khi cập nhật số lượng!");
     }
  };

  const clearCart = async () => {
    try {
       const res = await fetch(`/identity/api/cart/${userId}/clear`, {
         method: 'DELETE'
       });
       if (res.ok) {
         setCartItems([]);
       }
     } catch (e) {
       console.error('Clear cart failed', e);
     }
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.rawPrice * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};
