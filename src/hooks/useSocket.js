import { useCallback, useRef } from 'react';
import socketService from '../services/socketService';

export const useSocket = (userProfile, showNotification, updateActivity) => {
  const reconnectTimeoutRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const maxRetries = 3;

  const setupEventListeners = useCallback((handlers) => {
    const {
      setUserId, setPartnerId, setState, setMessages, setIsPartnerTyping,
      setConnectionStatus, setRetryCount, setSessionTimeoutOpen,
      retryCount, handleConnectWithProfile, STATES
    } = handlers;

    socketService.onUserCreated((data) => {
      setUserId(data.userId);
      setConnectionStatus('connected');
      setRetryCount(0);
      updateActivity();
    });

    socketService.onMatched((data) => {
      setState(STATES.CHATTING);
      setPartnerId(data.partnerId);
      setConnectionStatus('matched');
      updateActivity();
      
      const sessionData = {
        userId: data.userId,
        partnerId: data.partnerId,
        sessionId: data.sessionId,
        timestamp: Date.now(),
        userProfile,
        matchedAt: new Date().toISOString()
      };
      localStorage.setItem('activeSession', JSON.stringify(sessionData));
      
      showNotification('🎉 Connected with a stranger! Say hello!', 'success');
      
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    });

    socketService.onWaiting((data) => {
      setState(STATES.WAITING);
      showNotification(data.message, 'info');
    });

    socketService.onNewMessage((message) => {
      updateActivity();
      
      setMessages(prev => {
        if (prev.some(msg => msg.id === message.id)) return prev;
        
        const newMessages = [...prev, {
          ...message,
          timestamp: message.timestamp || Date.now(),
          status: 'delivered'
        }];
        
        const messagesToSave = newMessages.slice(-100);
        localStorage.setItem('chatMessages', JSON.stringify(messagesToSave));
        
        return newMessages;
      });
      
      setTimeout(() => {
        socketService.markMessageSeen(message.id);
      }, 1500);
    });

    socketService.onMessageSent((message) => {
      updateActivity();
      
      setMessages(prev => {
        const existingIndex = prev.findIndex(msg => msg.tempId === message.tempId);
        let newMessages;
        
        if (existingIndex !== -1) {
          newMessages = [...prev];
          newMessages[existingIndex] = {
            ...newMessages[existingIndex],
            ...message,
            status: 'sent'
          };
        } else {
          newMessages = [...prev, {
            ...message,
            timestamp: message.timestamp || Date.now(),
            status: 'sent'
          }];
        }
        
        const messagesToSave = newMessages.slice(-100);
        localStorage.setItem('chatMessages', JSON.stringify(messagesToSave));
        
        return newMessages;
      });
    });

    socketService.onChatEnded((data) => {
      showNotification(`💔 ${data.reason}`, 'warning');
      setState(STATES.WAITING);
      setMessages([]);
      setPartnerId(null);
      setIsPartnerTyping(false);
      setConnectionStatus('waiting');
      
      localStorage.removeItem('activeSession');
      localStorage.removeItem('chatMessages');
    });

    socketService.onPartnerTyping((data) => {
      setIsPartnerTyping(data.typing);
      
      if (data.typing) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setIsPartnerTyping(false);
        }, 5000);
      } else {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    });

    socketService.onError((error) => {
      setConnectionStatus('error');
      
      if (retryCount < maxRetries) {
        showNotification(`Connection error. Retrying... (${retryCount + 1}/${maxRetries})`, 'warning');
        setRetryCount(prev => prev + 1);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          if (userProfile) {
            handleConnectWithProfile(userProfile);
          }
        }, 2000 * (retryCount + 1));
      } else {
        showNotification('Connection failed. Please refresh the page.', 'error');
        setState(STATES.DISCONNECTED);
      }
    });

    socketService.onSessionTimeout((data) => {
      setSessionTimeoutOpen(true);
      setState(STATES.DISCONNECTED);
      setMessages([]);
      setPartnerId(null);
      setIsPartnerTyping(false);
      setConnectionStatus('timeout');
      
      localStorage.removeItem('activeSession');
      localStorage.removeItem('chatMessages');
      
      showNotification(`⏰ ${data.reason}`, 'warning');
    });

    socketService.onConnect(() => {
      setConnectionStatus('connected');
      setRetryCount(0);
    });
    
    socketService.onDisconnect(() => {
      setConnectionStatus('disconnected');
    });
  }, [userProfile, showNotification, updateActivity, maxRetries]);

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, []);

  return { setupEventListeners, cleanup };
};