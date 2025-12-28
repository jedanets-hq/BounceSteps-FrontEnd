import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Load favorites from database on mount
  useEffect(() => {
    loadFavoritesFromDatabase();
  }, []);

  const loadFavoritesFromDatabase = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.warn('User not logged in - cannot load favorites from database');
        setFavorites([]);
        return;
      }

      const response = await favoritesAPI.getFavorites();
      if (response.success && response.favorites) {
        setFavorites(response.favorites);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error loading favorites from database:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (providerId) => {
    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.error('User not logged in - cannot save to database');
        return false;
      }

      // ALWAYS save to database
      const response = await favoritesAPI.addToFavorites(providerId);
      if (response.success) {
        await loadFavoritesFromDatabase();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  };

  const removeFromFavorites = async (providerId) => {
    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.error('User not logged in - cannot remove from database');
        return false;
      }

      // ALWAYS remove from database
      const response = await favoritesAPI.removeFromFavorites(providerId);
      if (response.success) {
        await loadFavoritesFromDatabase();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  };

  const checkFavorite = async (providerId) => {
    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        // Check in localStorage
        return favorites.some(fav => fav.id === providerId || fav.provider_id === providerId);
      }

      const response = await favoritesAPI.checkFavorite(providerId);
      return response.success && response.isFavorite;
    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  };

  const clearFavorites = async () => {
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
  };

  const isFavorite = (providerId) => {
    return favorites.some(fav => fav.provider_id === providerId || fav.id === providerId);
  };

  const getFavoriteCount = () => {
    return favorites.length;
  };

  const value = {
    favorites,
    loading,
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
