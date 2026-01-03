import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { favoritesAPI } from '../utils/api';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Prevent duplicate API calls and re-renders
  const isLoadingRef = useRef(false);
  const lastLoadTimeRef = useRef(0);
  const hasInitializedRef = useRef(false);
  const MIN_LOAD_INTERVAL = 5000; // Minimum 5 seconds between API calls

  // Load favorites from database - stable function that won't cause re-renders
  const loadFavoritesFromDatabase = useCallback(async (force = false) => {
    // Prevent duplicate calls
    const now = Date.now();
    if (!force && (isLoadingRef.current || (now - lastLoadTimeRef.current) < MIN_LOAD_INTERVAL)) {
      return; // Silent skip - no log spam
    }

    const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
    
    if (!user.token) {
      // User not logged in - set empty favorites silently
      if (!isInitialized) {
        setFavorites([]);
        setIsInitialized(true);
      }
      return;
    }

    try {
      isLoadingRef.current = true;
      lastLoadTimeRef.current = now;
      setLoading(true);

      const response = await favoritesAPI.getFavorites();
      
      // Handle response with accurate logging
      if (response.success && response.favorites) {
        console.log('✅ [Favorites] Loaded:', response.favorites.length, 'items');
        setFavorites(response.favorites);
      } else if (response.status === 401) {
        console.warn('⚠️ [Favorites] Auth required:', response.code || 'NO_TOKEN');
        setFavorites([]);
      } else if (response.status === 404) {
        console.warn('⚠️ [Favorites] API endpoint not found - check backend deployment');
        setFavorites([]);
      } else if (response.status === 500) {
        console.error('❌ [Favorites] Server error');
        setFavorites([]);
      } else {
        console.warn('⚠️ [Favorites] Load failed:', response.message || 'Unknown');
        setFavorites([]);
      }
    } catch (error) {
      console.error('❌ [Favorites] Error:', error.message);
      setFavorites([]);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
      setIsInitialized(true);
    }
  }, []); // Empty deps - function is stable

  // Initialize favorites ONCE on mount - prevent re-render loops
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    loadFavoritesFromDatabase(true);
  }, []); // Empty deps - runs once on mount only

  const addToFavorites = useCallback(async (providerId) => {
    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.warn('⚠️ [Favorites] Login required to add favorites');
        return false;
      }

      const response = await favoritesAPI.addToFavorites(providerId);
      
      if (response.success) {
        console.log('✅ [Favorites] Added provider:', providerId);
        // Reload favorites after successful add
        await loadFavoritesFromDatabase(true);
        return true;
      }
      
      console.warn('⚠️ [Favorites] Add failed:', response.message || response.status);
      return false;
    } catch (error) {
      console.error('❌ [Favorites] Add error:', error.message);
      return false;
    }
  }, [loadFavoritesFromDatabase]);

  const removeFromFavorites = useCallback(async (providerId) => {
    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.error('User not logged in - cannot remove from database');
        return false;
      }

      // ALWAYS remove from database
      const response = await favoritesAPI.removeFromFavorites(providerId);
      if (response.success) {
        await loadFavoritesFromDatabase(true); // Force reload after remove
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  }, [loadFavoritesFromDatabase]);

  const checkFavorite = useCallback(async (providerId) => {
    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        // Check in local state
        return favorites.some(fav => fav.id === providerId || fav.provider_id === providerId);
      }

      const response = await favoritesAPI.checkFavorite(providerId);
      return response.success && response.isFavorite;
    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  }, [favorites]);

  const clearFavorites = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.error('User not logged in - cannot clear database');
        return false;
      }

      // ALWAYS clear from database
      const response = await favoritesAPI.clearFavorites();
      if (response.success) {
        setFavorites([]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing favorites:', error);
      return false;
    }
  }, []);

  const isFavorite = useCallback((providerId) => {
    return favorites.some(fav => fav.provider_id === providerId || fav.id === providerId);
  }, [favorites]);

  const getFavoriteCount = useCallback(() => {
    return favorites.length;
  }, [favorites]);

  const value = {
    favorites,
    loading,
    isInitialized,
    addToFavorites,
    removeFromFavorites,
    checkFavorite,
    clearFavorites,
    isFavorite,
    getFavoriteCount,
    loadFavoritesFromDatabase
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesContext;
