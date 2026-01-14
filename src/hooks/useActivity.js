import { useState, useCallback, useEffect } from 'react';

export const useActivity = () => {
  const [lastActivity, setLastActivity] = useState(Date.now());

  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  useEffect(() => {
    const handleActivity = () => updateActivity();
    
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [updateActivity]);

  return { lastActivity, updateActivity };
};