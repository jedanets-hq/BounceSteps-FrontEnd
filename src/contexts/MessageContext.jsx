import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { messagesAPI } from '../utils/api';

const MessageContext = createContext();

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};

export const MessageProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs to prevent infinite loops
  const isLoadingRef = useRef(false);
  const lastLoadTimeRef = useRef(0);
  const MIN_LOAD_INTERVAL = 5000; // 5 seconds between loads

  const loadUnreadCount = useCallback(async (forceLoad = false) => {
    // Prevent concurrent loads
    if (isLoadingRef.current) {
      return;
    }
    
    // Prevent too frequent loads (unless forced)
    const now = Date.now();
    if (!forceLoad && (now - lastLoadTimeRef.current) < MIN_LOAD_INTERVAL) {
      return;
    }

    try {
      isLoadingRef.current = true;
      lastLoadTimeRef.current = now;
      
      setLoading(true);
      setError(null);
      
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        setUnreadCount(0);
        return;
      }

      const response = await messagesAPI.getUnreadCount();
      
      if (response && response.success) {
        setUnreadCount(response.count || 0);
        setError(null);
      } else {
        setError(response?.message || 'Failed to load unread count');
      }
    } catch (error) {
      console.error('Error loading unread message count:', error);
      setError(error.message || 'Failed to load unread count');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  // Load unread count on mount and set up polling
  useEffect(() => {
    loadUnreadCount();
    
    // Poll every 30 seconds for new messages
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  const value = {
    unreadCount,
    loading,
    error,
    loadUnreadCount
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};

export default MessageContext;
