import React, { createContext, useContext, useState, useEffect } from 'react';
import { plansAPI } from '../utils/api';

const PlansContext = createContext();

export const usePlans = () => {
  const context = useContext(PlansContext);
  if (!context) {
    throw new Error('usePlans must be used within a PlansProvider');
  }
  return context;
};

export const PlansProvider = ({ children }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load plans from database on mount
  useEffect(() => {
    loadPlansFromDatabase();
  }, []);

  const loadPlansFromDatabase = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.warn('User not logged in - cannot load plans from database');
        setPlans([]);
        return;
      }

      const response = await plansAPI.getPlans();
      if (response.success && response.plans) {
        setPlans(response.plans);
      } else {
        setPlans([]);
      }
    } catch (error) {
      console.error('Error loading plans from database:', error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const addToPlan = async (service, planDate, notes) => {
    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.error('User not logged in - cannot save to database');
        return false;
      }

      // ALWAYS save to database
      const response = await plansAPI.addToPlan(service.id, planDate, notes);
      if (response.success) {
        await loadPlansFromDatabase();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to plan:', error);
      return false;
    }
  };

  const updatePlan = async (planId, planDate, notes) => {
    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.error('User not logged in - cannot update in database');
        return false;
      }

      // ALWAYS update in database
      const response = await plansAPI.updatePlan(planId, planDate, notes);
      if (response.success) {
        await loadPlansFromDatabase();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating plan:', error);
      return false;
    }
  };

  const removeFromPlan = async (planId) => {
    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.error('User not logged in - cannot remove from database');
        return false;
      }

      // ALWAYS remove from database
      const response = await plansAPI.removeFromPlan(planId);
      if (response.success) {
        await loadPlansFromDatabase();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing from plan:', error);
      return false;
    }
  };

  const clearPlans = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      
      if (!user.token) {
        console.error('User not logged in - cannot clear database');
        return false;
      }

      // ALWAYS clear from database
      const response = await plansAPI.clearPlans();
      if (response.success) {
        setPlans([]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing plans:', error);
      return false;
    }
  };

  const isInPlan = (serviceId) => {
    return plans.some(item => item.service_id === serviceId);
  };

  const getPlanCount = () => {
    return plans.length;
  };

  const value = {
    plans,
    loading,
    addToPlan,
    updatePlan,
    removeFromPlan,
    clearPlans,
    isInPlan,
    getPlanCount,
    loadPlansFromDatabase
  };

  return (
    <PlansContext.Provider value={value}>
      {children}
    </PlansContext.Provider>
  );
};

export default PlansContext;
