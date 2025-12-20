import React, { useEffect } from 'react';

// Debug component to help track button clicks and state changes
const DebugLogger = ({ message, data }) => {
  useEffect(() => {
    console.log(`[DEBUG] ${message}:`, data);
  }, [message, data]);

  return null;
};

export default DebugLogger;
