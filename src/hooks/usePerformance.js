import { useCallback, useMemo } from 'react';

export const useOptimizedCallbacks = (dependencies) => {
  return useMemo(() => dependencies, dependencies);
};

export const useDebounce = (callback, delay) => {
  const debouncedCallback = useCallback(
    (...args) => {
      const timeoutId = setTimeout(() => callback(...args), delay);
      return () => clearTimeout(timeoutId);
    },
    [callback, delay]
  );
  
  return debouncedCallback;
};

export const useThrottle = (callback, delay) => {
  let lastCall = 0;
  
  return useCallback((...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      callback(...args);
    }
  }, [callback, delay]);
};