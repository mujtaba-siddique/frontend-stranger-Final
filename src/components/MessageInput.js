import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Fade,
  Popover
} from '@mui/material';
import { Send, WifiOff, Mic, EmojiEmotions } from '@mui/icons-material';
import EmojiPicker from 'emoji-picker-react';

const MessageInput = ({ onSendMessage, onTypingStart, onTypingStop, disabled, isConnected = true, darkMode = true, onVoiceRecord }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [emojiAnchor, setEmojiAnchor] = useState(null);
  const typingTimeoutRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled && isConnected) {
      console.log('📤 MESSAGE INPUT: Submitting message:', message);
      onSendMessage(message);
      setMessage('');
      if (isTyping && onTypingStop) {
        setIsTyping(false);
        onTypingStop();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
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
      if (isTyping && onTypingStop) {
        console.log('✋ MESSAGE INPUT: User stopped typing');
        setIsTyping(false);
        onTypingStop();
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }, 1000);
  }, [isTyping, onTypingStart, onTypingStop, isConnected]);



  const handleChange = (e) => {
    const newValue = e.target.value;
    setMessage(newValue);

    // Trigger typing on any text change
    if (isConnected) {
      if (newValue.length > 0) {
        handleStartTyping();
      } else {
        if (isTyping && onTypingStop) {
          setIsTyping(false);
          onTypingStop();
        }
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
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
    if (isTyping && onTypingStop) {
      setIsTyping(false);
      onTypingStop();
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
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

  const hasText = message.trim().length > 0;

  const handleEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    handleStartTyping();
  };

  return (
    <Box>
      {/* Connection Status */}
      <Fade in={!isConnected}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 0.8,
          px: 2,
          background: darkMode ? 'rgba(255,65,108,0.2)' : '#fee2e2',
          gap: 1
        }}>
          <WifiOff sx={{ fontSize: 16, color: '#ef4444' }} />
          <Typography sx={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>
            Connection lost. Reconnecting...
          </Typography>
        </Box>
      </Fade>

      <Box
        sx={{
          px: { xs: 1, sm: 1.5 },
          py: { xs: 0.8, sm: 1 },
          display: 'flex',
          alignItems: 'flex-end',
          gap: { xs: 0.8, sm: 1 },
          background: 'transparent',
          pb: { xs: 'max(0.8rem, env(safe-area-inset-bottom))', sm: '1rem' }
        }}
      >
        {/* Input Container */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-end',
          background: darkMode
            ? 'linear-gradient(135deg, #2a2d3e 0%, #252838 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          borderRadius: '28px',
          border: darkMode
            ? '1.5px solid rgba(255,255,255,0.08)'
            : '1.5px solid rgba(0,0,0,0.1)',
          boxShadow: darkMode
            ? '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.05)'
            : '0 2px 8px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255,255,255,0.8)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:focus-within': {
            borderColor: darkMode ? 'rgba(102,126,234,0.5)' : 'rgba(0,168,132,0.4)',
            boxShadow: darkMode
              ? '0 4px 16px rgba(102,126,234,0.2), inset 0 1px 2px rgba(255,255,255,0.05)'
              : '0 4px 16px rgba(0,168,132,0.15), inset 0 1px 2px rgba(255,255,255,0.8)',
            transform: 'translateY(-1px)'
          }
        }}>
          {/* Emoji button */}
          <IconButton
            size="small"
            onClick={(e) => setEmojiAnchor(e.currentTarget)}
            sx={{
              alignSelf: 'flex-end',
              color: darkMode ? 'rgba(255,255,255,0.5)' : '#54656f',
              width: 40,
              height: 40,
              ml: 0.6,
              mb: 0.4,
              transition: 'all 0.2s',
              '&:hover': {
                color: darkMode ? 'rgba(255,255,255,0.8)' : '#00a884',
                background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,168,132,0.08)',
                transform: 'scale(1.1)'
              }
            }}
          >
            <EmojiEmotions sx={{ fontSize: 23 }} />
          </IconButton>

          <Popover
            open={Boolean(emojiAnchor)}
            anchorEl={emojiAnchor}
            onClose={() => setEmojiAnchor(null)}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={darkMode ? 'dark' : 'light'}
              width={320}
              height={400}
            />
          </Popover>

          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder={isConnected ? "Message" : "Reconnecting..."}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            disabled={disabled || !isConnected}
            variant="standard"
            inputProps={{
              style: { fontSize: window.innerWidth < 600 ? '16px' : '15px' },
              autoComplete: 'off',
              autoCorrect: 'off',
              autoCapitalize: 'sentences'
            }}
            sx={{
              flex: 1,
              '& .MuiInput-root': {
                '&:before, &:after': { display: 'none' },
                padding: 0
              },
              '& .MuiInputBase-input': {
                fontSize: { xs: '0.92rem', sm: '0.95rem' },
                py: { xs: '10px', sm: '11px' },
                pr: 1,
                color: darkMode ? '#e4e6eb' : '#111b21',
                lineHeight: 1.4,
                '&::placeholder': {
                  color: darkMode ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)',
                  fontSize: { xs: '0.88rem', sm: '0.92rem' },
                  opacity: 1
                }
              }
            }}
          />
        </Box>

        {/* Voice / Send Button */}
        {hasText ? (
          <IconButton
            onClick={handleSubmit}
            disabled={!message.trim() || disabled || !isConnected}
            sx={{
              width: { xs: 46, sm: 50 },
              height: { xs: 46, sm: 50 },
              minWidth: { xs: 46, sm: 50 },
              background: darkMode
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #00a884 0%, #008069 100%)',
              color: 'white',
              boxShadow: darkMode
                ? '0 4px 16px rgba(102,126,234,0.4)'
                : '0 4px 16px rgba(0,168,132,0.35)',
              '&:hover': {
                background: darkMode
                  ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                  : 'linear-gradient(135deg, #008f6f 0%, #007055 100%)',
                transform: 'scale(1.08)',
                boxShadow: darkMode
                  ? '0 6px 20px rgba(102,126,234,0.5)'
                  : '0 6px 20px rgba(0,168,132,0.45)'
              },
              '&:active': {
                transform: 'scale(0.95)'
              },
              '&:disabled': {
                background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                color: darkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
                boxShadow: 'none'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <Send sx={{ fontSize: { xs: 20, sm: 22 }, ml: '2px' }} />
          </IconButton>
        ) : (
          <IconButton
            onPointerDown={() => {
              if (onVoiceRecord && isConnected && !disabled) {
                setIsRecording(true);
                onVoiceRecord('start');
              }
            }}
            onPointerUp={() => {
              if (isRecording && onVoiceRecord) {
                setIsRecording(false);
                onVoiceRecord('stop');
              }
            }}
            onPointerCancel={() => {
              if (isRecording && onVoiceRecord) {
                setIsRecording(false);
                onVoiceRecord('stop');
              }
            }}
            disabled={disabled || !isConnected}
            sx={{
              width: { xs: 46, sm: 50 },
              height: { xs: 46, sm: 50 },
              minWidth: { xs: 46, sm: 50 },
              background: isRecording
                ? 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)'
                : darkMode
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #00a884 0%, #008069 100%)',
              color: 'white',
              boxShadow: isRecording
                ? '0 4px 20px rgba(255,65,108,0.6)'
                : darkMode
                  ? '0 4px 16px rgba(102,126,234,0.4)'
                  : '0 4px 16px rgba(0,168,132,0.35)',
              animation: isRecording ? 'recPulse 1.2s infinite' : 'none',
              touchAction: 'none',
              '&:hover': {
                transform: 'scale(1.08)',
                boxShadow: isRecording
                  ? '0 6px 24px rgba(255,65,108,0.7)'
                  : darkMode
                    ? '0 6px 20px rgba(102,126,234,0.5)'
                    : '0 6px 20px rgba(0,168,132,0.45)'
              },
              '&:active': {
                transform: 'scale(0.95)'
              },
              '&:disabled': {
                background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                color: darkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
                boxShadow: 'none'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <Mic sx={{ fontSize: { xs: 21, sm: 23 } }} />
          </IconButton>
        )}

        <style>{`
          @keyframes recPulse {
            0%, 100% { 
              box-shadow: 0 4px 20px rgba(255,65,108,0.6);
              transform: scale(1);
            }
            50% { 
              box-shadow: 0 6px 28px rgba(255,65,108,0.9);
              transform: scale(1.05);
            }
          }
        `}</style>
      </Box>
    </Box>
  );
};

export default MessageInput;