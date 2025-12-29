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
        console.warn('⚠️  [CartContext] User not logged in - cannot load cart from database');
        setCartItems([]);
        return;
      }

      console.log('📥 [CartContext] Loading cart from database...');
      const response = await cartAPI.getCart();
      
      console.log('📦 [CartContext] Cart response received');
      console.log('   Success:', response.success);
      console.log('   Items count:', response.cartItems?.length || 0);
      
      if (response.success && response.cartItems) {
        console.log('✅ [CartContext] Cart loaded successfully');
        console.log('   Items:', response.cartItems.map(i => ({ id: i.id, title: i.title, qty: i.quantity })));
        setCartItems(response.cartItems);
      } else {
        console.warn('⚠️  [CartContext] No items in cart or error loading');
        setCartItems([]);
      }
    } catch (error) {
      console.error('❌ [CartContext] Error loading cart from database:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (service) => {
    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.warn('❌ User not logged in - cannot save to database');
        throw new Error('Please login to add items to cart');
      }

      // Extract service ID - handle both direct service objects and booking items
      const serviceId = service.id || service.serviceId;
      
      if (!serviceId) {
        console.error('❌ No service ID found in:', service);
        throw new Error('Invalid service - missing ID');
      }

      console.log('📤 [CartContext] Adding to cart');
      console.log('   Service ID:', serviceId);
      console.log('   Service Title:', service.title || service.name);
      console.log('   User Token:', user.token ? '✅ Present' : '❌ Missing');

      // ALWAYS save to database - never use localStorage fallback
      console.log('📡 Calling cartAPI.addToCart...');
      const response = await cartAPI.addToCart(serviceId, 1);
      
      console.log('📥 [CartContext] Cart API response received');
      console.log('   Success:', response.success);
      console.log('   Message:', response.message);
      console.log('   Full response:', response);
      
      if (response.success) {
        console.log('✅ [CartContext] Item added to cart successfully');
        console.log('🔄 [CartContext] Reloading cart from database...');
        await loadCartFromDatabase();
        console.log('✅ [CartContext] Cart reloaded. Current items:', cartItems.length);
        return { success: true, message: 'Item added to cart' };
      } else {
        const errorMsg = response.message || 'Failed to add to cart';
        console.error('❌ [CartContext] Failed to add to cart:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('❌ [CartContext] Error adding to cart:', error.message);
      console.error('   Stack:', error.stack);
      // Return error object instead of throwing to allow UI to handle it
      return { 
        success: false, 
        message: error.message || 'Error adding to cart. Please try again.' 
      };
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

  const removeFromCart = async (cartItemId) => {
    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.warn('User not logged in - cannot remove from database');
        return;
      }

      // ALWAYS remove from database - cartItemId is the cart item's ID, not service ID
      console.log('🗑️  [CartContext] Removing cart item:', cartItemId);
      const response = await cartAPI.removeFromCart(cartItemId);
      if (response.success) {
        console.log('✅ [CartContext] Item removed, reloading cart...');
        await loadCartFromDatabase();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        await removeFromCart(cartItemId);
        return;
      }

      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.warn('User not logged in - cannot update in database');
        return;
      }

      // ALWAYS update in database - cartItemId is the cart item's ID
      console.log('📝 [CartContext] Updating cart item:', cartItemId, 'to quantity:', newQuantity);
      const response = await cartAPI.updateCartItem(cartItemId, newQuantity);
      if (response.success) {
        console.log('✅ [CartContext] Item updated, reloading cart...');
        await loadCartFromDatabase();
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
    return cartItems.some(item => item.service_id === serviceId);
  };

  const getItemQuantity = (serviceId) => {
    const item = cartItems.find(item => item.service_id === serviceId);
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
