import { useState, useCallback } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'info' 
  });

  const showNotification = useCallback((message, severity = 'info') => {
    setNotification({ open: true, message, severity });
    
    setTimeout(() => {
      setNotification(prev => ({ ...prev, open: false }));
    }, 5000);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  return {
    notification,
    showNotification,
    hideNotification
  };
};