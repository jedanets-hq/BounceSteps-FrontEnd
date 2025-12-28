import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../utils/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from database on mount
  useEffect(() => {
    loadCartFromDatabase();
  }, []);

  const loadCartFromDatabase = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.warn('User not logged in - cannot load cart from database');
        setCartItems([]);
        return;
      }

      const response = await cartAPI.getCart();
      if (response.success && response.cartItems) {
        setCartItems(response.cartItems);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error loading cart from database:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (service) => {
    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.warn('User not logged in - cannot save to database');
        throw new Error('User not logged in');
      }

      // Extract service ID - handle both direct service objects and booking items
      const serviceId = service.id || service.serviceId;
      
      if (!serviceId) {
        console.error('No service ID found in:', service);
        throw new Error('Invalid service object');
      }

      console.log('📤 Adding to cart - serviceId:', serviceId, 'token:', user.token ? 'present' : 'missing');

      // ALWAYS save to database - never use localStorage fallback
      const response = await cartAPI.addToCart(serviceId, 1);
      
      console.log('📥 Cart API response:', response);
      
      if (response.success) {
        console.log('✅ Item added to cart successfully');
        await loadCartFromDatabase();
      } else {
        console.error('Failed to add to cart:', response.message);
        throw new Error(response.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const addMultipleToCart = async (services) => {
    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.warn('User not logged in - cannot save to database');
        return;
      }

      // ALWAYS save to database - never use localStorage fallback
      for (const service of services) {
        await cartAPI.addToCart(service.id, service.quantity || 1);
      }
      await loadCartFromDatabase();
    } catch (error) {
      console.error('Error adding multiple to cart:', error);
    }
  };

  const removeFromCart = async (serviceId) => {
    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.warn('User not logged in - cannot remove from database');
        return;
      }

      // ALWAYS remove from database
      const cartItem = cartItems.find(item => item.service_id === serviceId);
      if (cartItem) {
        const response = await cartAPI.removeFromCart(cartItem.id);
        if (response.success) {
          await loadCartFromDatabase();
        }
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (serviceId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        await removeFromCart(serviceId);
        return;
      }

      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.warn('User not logged in - cannot update in database');
        return;
      }

      // ALWAYS update in database
      const cartItem = cartItems.find(item => item.service_id === serviceId);
      if (cartItem) {
        const response = await cartAPI.updateCartItem(cartItem.id, newQuantity);
        if (response.success) {
          await loadCartFromDatabase();
        }
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.warn('User not logged in - cannot clear database');
        return;
      }

      // ALWAYS clear from database
      const response = await cartAPI.clearCart();
      if (response.success) {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  const isInCart = (serviceId) => {
    return cartItems.some(item => item.service_id === serviceId || item.id === serviceId);
  };

  const getItemQuantity = (serviceId) => {
    const item = cartItems.find(item => item.service_id === serviceId || item.id === serviceId);
    return item ? item.quantity : 0;
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    addMultipleToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    isInCart,
    getItemQuantity,
    isCartOpen,
    setIsCartOpen,
    setCartItems,
    loadCartFromDatabase
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
