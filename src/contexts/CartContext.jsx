import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('isafari_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('isafari_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (service) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === service.id);
      
      if (existingItem) {
        // If item exists, increase quantity
        return prevItems.map(item =>
          item.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item with quantity 1
        return [...prevItems, { ...service, quantity: service.quantity || 1 }];
      }
    });
  };

  const addMultipleToCart = (services) => {
    setCartItems(prevItems => {
      const newItems = [...prevItems];
      
      services.forEach(service => {
        const existingIndex = newItems.findIndex(item => item.id === service.id);
        
        if (existingIndex >= 0) {
          // Update existing item
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: service.quantity || newItems[existingIndex].quantity
          };
        } else {
          // Add new item
          newItems.push({ ...service, quantity: service.quantity || 1 });
        }
      });
      
      return newItems;
    });
  };

  const removeFromCart = (serviceId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== serviceId));
  };

  const updateQuantity = (serviceId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(serviceId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === serviceId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const isInCart = (serviceId) => {
    return cartItems.some(item => item.id === serviceId);
  };

  const getItemQuantity = (serviceId) => {
    const item = cartItems.find(item => item.id === serviceId);
    return item ? item.quantity : 0;
  };

  const [isCartOpen, setIsCartOpen] = useState(false);

  const value = {
    cartItems,
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
    setCartItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
