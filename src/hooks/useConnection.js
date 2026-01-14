import { useState, useCallback, useRef, useEffect } from 'react';
import socketService from '../services/socketService';

export const useConnection = (userProfile, showNotification, setupEventListeners) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const reconnectTimeoutRef = useRef(null);
  const maxRetries = 3;

  const handleConnectWithProfile = useCallback((profileData) => {
    if (!profileData) {
      showNotification('Invalid profile data', 'error');
      return;
    }
    
    setIsLoading(true);
    setConnectionStatus('connecting');
    
    // Check for existing session
    const savedSession = localStorage.getItem('activeSession');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const sessionAge = Date.now() - session.timestamp;
        
        if (sessionAge < 30 * 60 * 1000) {
          console.log('🔄 Restoring session:', session.sessionId);
          // Session restoration logic will be handled by the calling component
        } else {
          localStorage.removeItem('activeSession');
          localStorage.removeItem('chatMessages');
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        localStorage.removeItem('activeSession');
      }
    }
    
    // Clean up existing connection
    socketService.disconnect();
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    try {
      const socket = socketService.connect();
      setupEventListeners();

      const connectionTimeout = setTimeout(() => {
        showNotification('Connection timeout. Please try again.', 'error');
        setIsLoading(false);
        setConnectionStatus('error');
      }, 10000);

      socket.on('connect', () => {
        clearTimeout(connectionTimeout);
        console.log('🔗 Socket connected, joining chat with profile:', profileData?.id);
        socketService.joinChat(profileData?.id);
        setIsLoading(false);
      });
      
      socket.on('connect_error', (error) => {
        clearTimeout(connectionTimeout);
        console.error('Connection error:', error);
        setIsLoading(false);
        setConnectionStatus('error');
      });
      
    } catch (error) {
      console.error('Failed to connect:', error);
      showNotification('Failed to connect. Please try again.', 'error');
      setIsLoading(false);
      setConnectionStatus('error');
    }
  }, [setupEventListeners, showNotification]);

  const handleRetry = useCallback(() => {
    setRetryCount(0);
    if (userProfile) {
      handleConnectWithProfile(userProfile);
    }
  }, [userProfile, handleConnectWithProfile]);

  // Auto-reconnect on page focus
  useEffect(() => {
    const handleFocus = () => {
      if (connectionStatus === 'disconnected' && userProfile) {
        console.log('🔄 Page focused, attempting reconnection');
        handleConnectWithProfile(userProfile);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [connectionStatus, userProfile, handleConnectWithProfile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      socketService.disconnect();
    };
  }, []);

  return {
    connectionStatus,
    setConnectionStatus,
    retryCount,
    setRetryCount,
    isLoading,
    setIsLoading,
    maxRetries,
    handleConnectWithProfile,
    handleRetry
  };
};