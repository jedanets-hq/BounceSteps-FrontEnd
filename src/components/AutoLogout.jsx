import React, { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AutoLogout = () => {
  const { user, logout } = useAuth();
  const timeoutRef = useRef(null);

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (user) {
      // 10 minutes of inactivity
      timeoutRef.current = setTimeout(() => {
        console.log('User inactive for 10 minutes. Logging out...');
        alert('You have been logged out due to 10 minutes of inactivity.');
        logout();
      }, 600000);
    }
  };

  useEffect(() => {
    if (!user) return;

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart'
    ];

    const handleActivity = () => {
      resetTimeout();
    };

    resetTimeout();

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [user, logout]);

  return null;
};

export default AutoLogout;
