import { useState, useCallback, useEffect } from 'react';
import socketService from '../services/socketService';

export const useChat = (showNotification, updateActivity) => {
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [partnerId, setPartnerId] = useState(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const handleSendMessage = useCallback((message, messageId) => {
    if (!message.trim()) {
      showNotification('Cannot send empty message', 'warning');
      return;
    }
    
    if (message.length > 1000) {
      showNotification('Message too long. Maximum 1000 characters.', 'warning');
      return;
    }
    
    updateActivity();
    
    const tempMessage = {
      id: messageId,
      tempId: messageId,
      message: message,
      sender: userId,
      timestamp: Date.now(),
      status: 'sending'
    };
    
    setMessages(prev => [...prev, tempMessage]);
    socketService.sendMessage(message, messageId);
  }, [userId, showNotification, updateActivity]);
  
  const handleTypingStart = useCallback(() => {
    updateActivity();
    socketService.startTyping();
  }, [updateActivity]);
  
  const handleTypingStop = useCallback(() => {
    socketService.stopTyping();
  }, []);
  
  const handleMessageSeen = useCallback((messageId) => {
    socketService.markMessageSeen(messageId);
  }, []);
  
  const handleEndChat = useCallback(() => {
    if (window.confirm('Are you sure you want to end this chat?')) {
      socketService.endChat();
      setMessages([]);
      setPartnerId(null);
      setIsPartnerTyping(false);
      
      localStorage.removeItem('activeSession');
      localStorage.removeItem('chatMessages');
      
      showNotification('Chat ended. Finding new stranger...', 'info');
    }
  }, [showNotification]);

  const handleProfileSubmit = useCallback(async (profileData) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://192.168.29.73:5000';
      const response = await fetch(`${apiUrl}/api/users/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profileData,
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        }),
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUserProfile(userData);
        localStorage.setItem('userProfile', JSON.stringify(userData));
        return userData;
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create profile');
      }
    } catch (error) {
      console.error('Profile creation error:', error);
      throw error;
    }
  }, []);

  // Load saved profile on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Error loading saved profile:', error);
        localStorage.removeItem('userProfile');
      }
    }
  }, []);

  return {
    messages,
    setMessages,
    userId,
    setUserId,
    partnerId,
    setPartnerId,
    isPartnerTyping,
    setIsPartnerTyping,
    userProfile,
    setUserProfile,
    handleSendMessage,
    handleTypingStart,
    handleTypingStop,
    handleMessageSeen,
    handleEndChat,
    handleProfileSubmit
  };
};