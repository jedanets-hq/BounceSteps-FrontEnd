import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
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
  const [error, setError] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Refs to prevent infinite loops and duplicate calls
  const isLoadingRef = useRef(false);
  const lastLoadTimeRef = useRef(0);
  const loadAttemptRef = useRef(0);
  const MAX_LOAD_ATTEMPTS = 3;
  const MIN_LOAD_INTERVAL = 5000; // 5 seconds between loads

  // Load cart from database on mount only ONCE
  useEffect(() => {
    const initializeCart = async () => {
      console.log('🔄 [CartContext] Initializing...');
      await loadCartFromDatabase();
      setIsInitialized(true);
      console.log('✅ [CartContext] Initialization complete');
    };
    
    initializeCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  const loadCartFromDatabase = useCallback(async (forceLoad = false) => {
    // Prevent concurrent loads
    if (isLoadingRef.current) {
      console.log('⏳ [CartContext] Load already in progress, skipping...');
      return;
    }
    
    // Prevent too frequent loads (unless forced)
    const now = Date.now();
    if (!forceLoad && (now - lastLoadTimeRef.current) < MIN_LOAD_INTERVAL) {
      console.log('⏳ [CartContext] Too soon since last load, skipping...');
      return;
    }
    
    // Prevent infinite retry loops
    if (!forceLoad && loadAttemptRef.current >= MAX_LOAD_ATTEMPTS) {
      console.log('⚠️  [CartContext] Max load attempts reached, stopping retries');
      return;
    }

    try {
      isLoadingRef.current = true;
      loadAttemptRef.current += 1;
      lastLoadTimeRef.current = now;
      
      setLoading(true);
      setError(null);
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.warn('⚠️  [CartContext] User not logged in - cannot load cart from database');
        setCartItems([]);
        loadAttemptRef.current = 0;
        return;
      }

      console.log('📥 [CartContext] Loading cart from PostgreSQL database...');
      const response = await cartAPI.getCart();
      
      console.log('📦 [CartContext] Cart response received');
      console.log('   Success:', response?.success);
      console.log('   Items count:', response?.data?.length || 0);
      
      if (!response || typeof response !== 'object') {
        const errorMsg = 'Invalid response format from server';
        console.warn('⚠️  [CartContext]', errorMsg);
        setError(errorMsg);
        // DON'T clear cart items on error - keep existing items
        return;
      }

      if (response.success === false) {
        const errorMsg = response.message || response.error || 'Failed to load cart';
        console.warn('⚠️  [CartContext] Cart API returned error:', errorMsg);
        setError(errorMsg);
        // DON'T clear cart items on error - keep existing items
        return;
      }

      if (response.success === true && response.data) {
        if (!Array.isArray(response.data)) {
          const errorMsg = 'Cart data is not in expected format';
          console.warn('⚠️  [CartContext]', errorMsg, '- got:', typeof response.data);
          setError(errorMsg);
          // DON'T clear cart items on error - keep existing items
          return;
        }

        console.log('✅ [CartContext] Cart loaded successfully from PostgreSQL database');
        console.log('   Items:', response.data.map(i => ({ id: i.id, title: i.title, qty: i.quantity })));
        setCartItems(response.data);
        setError(null);
        loadAttemptRef.current = 0;
      } else {
        const errorMsg = 'Response missing required fields';
        console.warn('⚠️  [CartContext]', errorMsg);
        setError(errorMsg);
        // DON'T clear cart items on error - keep existing items
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to load cart';
      console.error('❌ [CartContext] Error loading cart from PostgreSQL database:', error);
      console.error('   Error type:', error.name);
      console.error('   Error message:', error.message);
      setError(errorMsg);
      // DON'T clear cart items on error - keep existing items
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  const addToCart = async (service) => {
    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.warn('❌ User not logged in - cannot save to database');
        return { 
          success: false, 
          message: 'Please login to add items to cart' 
        };
      }

      // Extract service ID - handle multiple field name variations
      // Priority: id > serviceId > service_id
      const serviceId = service.id || service.serviceId || service.service_id;
      
      if (!serviceId) {
        console.error('❌ No service ID found in:', service);
        return { 
          success: false, 
          message: 'Invalid service - missing ID' 
        };
      }

      // Extract quantity - default to 1
      const quantity = service.quantity || 1;

      console.log('📤 [CartContext] Adding to PRODUCTION cart');
      console.log('   Service ID:', serviceId);
      console.log('   Service Title:', service.title || service.name);
      console.log('   Quantity:', quantity);
      console.log('   Backend: https://bouncesteps-backend-git-392429231515.europe-west1.run.app/api');
      console.log('   Database: Production PostgreSQL on Google Cloud SQL');

      // ALWAYS save to PRODUCTION database - never use localStorage fallback
      console.log('📡 Calling cartAPI.addToCart (PRODUCTION)...');
      const response = await cartAPI.addToCart(parseInt(serviceId), quantity);
      
      console.log('📥 [CartContext] Cart API response received from PRODUCTION');
      console.log('   Success:', response.success);
      console.log('   Message:', response.message);
      
      if (response && response.success) {
        console.log('✅ [CartContext] Item added to PRODUCTION cart successfully');
        console.log('🔄 [CartContext] Reloading cart from PRODUCTION database...');
        await loadCartFromDatabase(true); // Force reload
        console.log('✅ [CartContext] Cart reloaded from PRODUCTION. Current items:', cartItems.length);
        return { success: true, message: 'Item added to cart successfully' };
      } else {
        const errorMsg = response?.message || 'Failed to add to cart';
        console.error('❌ [CartContext] Failed to add to PRODUCTION cart:', errorMsg);
        // Return error instead of throwing to prevent crashes
        return { 
          success: false, 
          message: errorMsg 
        };
      }
    } catch (error) {
      console.error('❌ [CartContext] Error adding to PRODUCTION cart:', error.message);
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
    cartItems: cartItems || [], // Always provide array, never undefined
    loading,
    error,
    isInitialized,
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
