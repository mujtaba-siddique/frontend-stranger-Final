import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Fade
} from '@mui/material';
import { Send, WifiOff } from '@mui/icons-material';

const MessageInput = ({ onSendMessage, onTypingStart, onTypingStop, disabled, isConnected = true, darkMode = true }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled && isConnected) {
      console.log('📤 MESSAGE INPUT: Submitting message:', message);
      onSendMessage(message);
      setMessage('');
      handleStopTyping();
    } else {
      console.log('❌ MESSAGE INPUT: Cannot submit - disabled or not connected');
    }
  };

  const handleStartTyping = useCallback(() => {
    if (!isTyping && onTypingStart && isConnected) {
      console.log('⌨️ MESSAGE INPUT: User started typing');
      setIsTyping(true);
      onTypingStart();
    }
    
    // Reset timeout - user is actively typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Auto-stop after 1 second of no keystrokes
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  }, [isTyping, onTypingStart, isConnected]);

  const handleStopTyping = () => {
    if (isTyping && onTypingStop) {
      console.log('✋ MESSAGE INPUT: User stopped typing');
      setIsTyping(false);
      onTypingStop();
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setMessage(newValue);
    
    // Trigger typing on any text change
    if (isConnected) {
      if (newValue.length > 0) {
        handleStartTyping();
      } else {
        handleStopTyping();
      }
    }
  };
  
  // Handle keydown for real-time typing detection
  const handleKeyDown = (e) => {
    // Ignore navigation keys that don't change text
    const navigationKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab'];
    
    if (!navigationKeys.includes(e.key) && isConnected && message.length >= 0) {
      handleStartTyping();
    }
  };
  
  // Stop typing when user leaves input
  const handleBlur = () => {
    handleStopTyping();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);



  return (
    <Box>
      {/* Connection Status */}
      <Fade in={!isConnected}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 1,
          backgroundColor: 'error.light',
          color: 'error.contrastText'
        }}>
          <WifiOff sx={{ mr: 1, fontSize: 16 }} />
          <Typography variant="caption">
            Connection lost. Trying to reconnect...
          </Typography>
        </Box>
      </Fade>
      
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          p: { xs: 1.5, sm: 2.5, md: 3 }, 
          display: 'flex', 
          alignItems: 'flex-end',
          gap: { xs: 1.5, sm: 2, md: 2.5 },
          background: 'transparent',
          pb: { xs: 'env(safe-area-inset-bottom, 1.5rem)', sm: 2.5, md: 3 }
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder={isConnected ? "🚀 Type something amazing..." : "🔄 Reconnecting..."}
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={disabled || !isConnected}
          variant="outlined"
          inputProps={{
            style: { fontSize: window.innerWidth < 600 ? '16px' : '15px' },
            autoComplete: 'off',
            autoCorrect: 'off',
            autoCapitalize: 'sentences'
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: { xs: 4, sm: 5, md: 6 },
              background: darkMode 
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: darkMode 
                ? '1px solid rgba(255, 255, 255, 0.2)'
                : '1px solid rgba(0, 0, 0, 0.1)',
              color: darkMode ? 'white' : '#1e293b',
              fontSize: { xs: '16px', sm: '15px', md: '16px' },
              minHeight: { xs: '44px', sm: '48px', md: '52px' },
              '&:hover': {
                border: darkMode 
                  ? '1px solid rgba(255, 255, 255, 0.3)'
                  : '1px solid rgba(0, 0, 0, 0.2)',
                boxShadow: darkMode 
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                  : '0 8px 32px rgba(0, 0, 0, 0.1)'
              },
              '&.Mui-focused': {
                border: '1px solid rgba(102, 126, 234, 0.6)',
                boxShadow: '0 0 20px rgba(102, 126, 234, 0.3), 0 8px 32px rgba(0, 0, 0, 0.3)'
              },
              '& fieldset': {
                border: 'none'
              }
            },
            '& .MuiOutlinedInput-input': {
              fontSize: { xs: '16px', sm: '15px', md: '16px' },
              padding: { xs: '12px 16px', sm: '14px 18px', md: '16px 20px' },
              color: darkMode ? 'white' : '#1e293b',
              '&::placeholder': {
                color: darkMode 
                  ? 'rgba(255, 255, 255, 0.6)'
                  : 'rgba(30, 41, 59, 0.6)',
                fontSize: { xs: '14px', sm: '15px', md: '16px' }
              }
            }
          }}
        />
        <IconButton 
          type="submit" 
          disabled={!message.trim() || disabled || !isConnected}
          sx={{ 
            mb: { xs: 0, sm: 0.3, md: 0.5 },
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
            color: 'white',
            width: { xs: 44, sm: 50, md: 56 },
            height: { xs: 44, sm: 50, md: 56 },
            minWidth: { xs: 44, sm: 50, md: 56 },
            boxShadow: '0 8px 25px rgba(255, 107, 107, 0.4), 0 0 20px rgba(255, 107, 107, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            '&:hover': {
              background: 'linear-gradient(135deg, #ee5a24, #d63031)',
              boxShadow: '0 12px 35px rgba(255, 107, 107, 0.6), 0 0 30px rgba(255, 107, 107, 0.4)',
              transform: { xs: 'scale(1.02)', sm: 'translateY(-2px) scale(1.03)', md: 'translateY(-3px) scale(1.05)' }
            },
            '&:active': {
              transform: { xs: 'scale(0.98)', sm: 'scale(0.98)', md: 'scale(0.95)' }
            },
            '&:disabled': {
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.3)',
              boxShadow: 'none'
            },
            transition: 'all 0.2s ease'
          }}
        >
          <Send sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default MessageInput;