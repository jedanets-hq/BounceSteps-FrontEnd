import React, { createContext, useContext, useState, useEffect } from 'react';
import { plansAPI } from '../utils/api';

const TripsContext = createContext();

export const useTrips = () => {
  const context = useContext(TripsContext);
  if (!context) {
    throw new Error('useTrips must be used within a TripsProvider');
  }
  return context;
};

export const TripsProvider = ({ children }) => {
  const [tripPlans, setTripPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load trip plans from database on mount
  useEffect(() => {
    const initializeTrips = async () => {
      console.log('🔄 [TripsContext] Initializing...');
      await loadTripsFromDatabase();
      setIsInitialized(true);
      console.log('✅ [TripsContext] Initialization complete');
    };
    
    initializeTrips();
  }, []);

  const loadTripsFromDatabase = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.warn('⚠️ [TripsContext] User not logged in - cannot load trips from database');
        setTripPlans([]);
        return;
      }

      console.log('📥 [TripsContext] Loading trip plans from database...');
      const response = await plansAPI.getPlans();
      
      console.log('📦 [TripsContext] Trip plans response received');
      console.log('   Success:', response.success);
      console.log('   Plans count:', response.plans?.length || 0);
      
      if (response.success && response.plans) {
        console.log('✅ [TripsContext] Trip plans loaded successfully');
        setTripPlans(response.plans);
      } else {
        console.warn('⚠️ [TripsContext] No trip plans or error loading');
        setTripPlans([]);
      }
    } catch (error) {
      console.error('❌ [TripsContext] Error loading trip plans from database:', error);
      setTripPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const addToPlan = async (serviceId, planDate = null, notes = '') => {
    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.warn('❌ User not logged in - cannot save to database');
        throw new Error('Please login to save trip plans');
      }

      console.log('📤 [TripsContext] Adding to trip plan');
      console.log('   Service ID:', serviceId);
      console.log('   Plan Date:', planDate);
      console.log('   User Token:', user.token ? '✅ Present' : '❌ Missing');

      // ALWAYS save to database
      console.log('📡 Calling plansAPI.addToPlan...');
      const response = await plansAPI.addToPlan(serviceId, planDate, notes);
      
      console.log('📥 [TripsContext] Plans API response received');
      console.log('   Success:', response.success);
      console.log('   Message:', response.message);
      
      if (response.success) {
        console.log('✅ [TripsContext] Service added to trip plan successfully');
        console.log('🔄 [TripsContext] Reloading trip plans from database...');
        await loadTripsFromDatabase();
        return { success: true, message: 'Added to your trip plan' };
      } else {
        const errorMsg = response.message || 'Failed to add to trip plan';
        console.error('❌ [TripsContext] Failed to add to trip plan:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('❌ [TripsContext] Error adding to trip plan:', error.message);
      return { 
        success: false, 
        message: error.message || 'Error adding to trip plan. Please try again.' 
      };
    }
  };

  const updatePlan = async (planId, planDate, notes) => {
    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.warn('User not logged in - cannot update in database');
        return { success: false, message: 'Please login to update trip plans' };
      }

      console.log('📝 [TripsContext] Updating trip plan:', planId);
      const response = await plansAPI.updatePlan(planId, planDate, notes);
      
      if (response.success) {
        console.log('✅ [TripsContext] Trip plan updated, reloading...');
        await loadTripsFromDatabase();
        return { success: true, message: 'Trip plan updated' };
      }
      return response;
    } catch (error) {
      console.error('Error updating trip plan:', error);
      return { success: false, message: 'Error updating trip plan' };
    }
  };

  const removeFromPlan = async (planId) => {
    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.warn('User not logged in - cannot remove from database');
        return { success: false, message: 'Please login to remove from trip plans' };
      }

      console.log('🗑️ [TripsContext] Removing from trip plan:', planId);
      const response = await plansAPI.removeFromPlan(planId);
      
      if (response.success) {
        console.log('✅ [TripsContext] Removed from trip plan, reloading...');
        await loadTripsFromDatabase();
        return { success: true, message: 'Removed from trip plan' };
      }
      return response;
    } catch (error) {
      console.error('Error removing from trip plan:', error);
      return { success: false, message: 'Error removing from trip plan' };
    }
  };

  const clearPlans = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.warn('User not logged in - cannot clear database');
        return { success: false, message: 'Please login to clear trip plans' };
      }

      const response = await plansAPI.clearPlans();
      if (response.success) {
        setTripPlans([]);
        return { success: true, message: 'All trip plans cleared' };
      }
      return response;
    } catch (error) {
      console.error('Error clearing trip plans:', error);
      return { success: false, message: 'Error clearing trip plans' };
    }
  };

  const isInPlan = (serviceId) => {
    return tripPlans.some(plan => plan.service_id === serviceId);
  };

  const getPlanCount = () => {
    return tripPlans.length;
  };

  const value = {
    tripPlans,
    loading,
    isInitialized,
    addToPlan,
    updatePlan,
    removeFromPlan,
    clearPlans,
    isInPlan,
    getPlanCount,
    loadTripsFromDatabase
  };

  return (
    <TripsContext.Provider value={value}>
      {children}
    </TripsContext.Provider>
  );
};

export default TripsContext;