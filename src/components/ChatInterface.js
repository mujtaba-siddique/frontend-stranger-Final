import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Avatar,
  Badge,
  IconButton
} from '@mui/material';
import { ExitToApp, LightMode, DarkMode, Videocam, Phone } from '@mui/icons-material';
import MessageInput from './MessageInput';
import MessageStatus from './MessageStatus';
import TypingIndicator from './TypingIndicator';
import VideoCallComponent from './VideoCallComponent';
import useCallManager from '../hooks/useCallManager';

import { validateMessage, sanitizeMessage, detectSpam } from '../utils/messageValidator';
// Simple ID generator to avoid uuid issues
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const ChatInterface = ({ 
  messages, 
  onSendMessage, 
  onEndChat, 
  partnerId, 
  userId,
  isPartnerTyping,
  onTypingStart,
  onTypingStop,
  onMessageSeen,
  isConnected = true,
  darkMode,
  onToggleDarkMode
}) => {
  const messagesEndRef = useRef(null);
  const [showTyping, setShowTyping] = useState(false);
  const [endChatEnabled, setEndChatEnabled] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const seenMessagesRef = useRef(new Set());
  
  // Initialize call manager
  const callManager = useCallManager(userId, partnerId);
  
  useEffect(() => {
    // Initialize call listeners when component mounts
    callManager.initializeCallListeners();
  }, [callManager]);
  
  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setEndChatEnabled(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showTyping]);

  useEffect(() => {
    console.log('⌨️ CHAT INTERFACE: Partner typing state changed:', isPartnerTyping);
    setShowTyping(isPartnerTyping);
  }, [isPartnerTyping]);

  // Mark messages as seen when they come into view
  useEffect(() => {
    messages.forEach(msg => {
      if (msg.senderId !== userId && onMessageSeen && !seenMessagesRef.current.has(msg.id)) {
        seenMessagesRef.current.add(msg.id);
        onMessageSeen(msg.id);
      }
    });
  }, [messages, userId, onMessageSeen]);

  const handleSendMessage = (message) => {
    // Basic validation only
    if (!message || typeof message !== 'string' || !message.trim()) {
      return;
    }

    // Sanitize and send - NO LIMITS
    const sanitizedMessage = sanitizeMessage(message.trim());
    const messageId = generateId();
    onSendMessage(sanitizedMessage, messageId);
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: darkMode 
        ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 30%, #e2e8f0 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: darkMode 
          ? 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)'
          : 'radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 107, 107, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }
    }}>
      {/* Header */}
      <Box 
        sx={{ 
          p: { xs: 1, sm: 2, md: 3 }, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: darkMode 
            ? 'rgba(15, 15, 35, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: darkMode 
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(0, 0, 0, 0.1)',
          color: darkMode ? 'white' : '#1e293b',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          minHeight: { xs: '60px', sm: '70px', md: '80px' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5, md: 2 } }}>
          <Badge 
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box sx={{ 
                width: 14, 
                height: 14, 
                borderRadius: '50%', 
                background: 'linear-gradient(45deg, #00ff88, #00cc6a)',
                border: '2px solid #0f0f23',
                boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
              }} />
            }
          >
            <Avatar sx={{ 
              width: { xs: 32, sm: 40, md: 45 }, 
              height: { xs: 32, sm: 40, md: 45 },
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
              boxShadow: '0 0 20px rgba(255, 107, 107, 0.4)'
            }}>
              <Typography sx={{ fontSize: { xs: '16px', sm: '20px', md: '24px' } }}>🎭</Typography>
            </Avatar>
          </Badge>
          <Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #ff6b6b, #feca57)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '0.75rem', sm: '0.9rem', md: '1.1rem' },
              display: { xs: 'none', sm: 'block' }
            }}>
              Anonymous Stranger
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                background: '#00ff88',
                boxShadow: '0 0 8px rgba(0, 255, 136, 0.6)',
                animation: 'pulse 2s infinite'
              }} />
              <Typography variant="caption" sx={{ 
                color: '#00ff88', 
                fontWeight: 500,
                fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                display: { xs: 'none', sm: 'block' }
              }}>
                Online • Active now
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: { xs: 0.3, sm: 0.5, md: 0.8 } }}>
          {/* Video Call Button */}
          <IconButton
            onClick={() => callManager.startCall('video')}
            disabled={!partnerId || callManager.isCallActive}
            size={window.innerWidth < 600 ? 'small' : 'medium'}
            sx={{
              color: darkMode ? 'white' : '#1e293b',
              background: darkMode 
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.1)',
              width: { xs: 36, sm: 40, md: 48 },
              height: { xs: 36, sm: 40, md: 48 },
              '&:hover': { 
                background: darkMode 
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'rgba(0, 0, 0, 0.2)',
                transform: { xs: 'none', sm: 'scale(1.05)' }
              },
              '&:disabled': {
                opacity: 0.5
              },
              transition: 'all 0.3s ease'
            }}
          >
            <Videocam />
          </IconButton>
          
          {/* Audio Call Button */}
          <IconButton
            onClick={() => callManager.startCall('audio')}
            disabled={!partnerId || callManager.isCallActive}
            size={window.innerWidth < 600 ? 'small' : 'medium'}
            sx={{
              color: darkMode ? 'white' : '#1e293b',
              background: darkMode 
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.1)',
              width: { xs: 36, sm: 40, md: 48 },
              height: { xs: 36, sm: 40, md: 48 },
              '&:hover': { 
                background: darkMode 
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'rgba(0, 0, 0, 0.2)',
                transform: { xs: 'none', sm: 'scale(1.05)' }
              },
              '&:disabled': {
                opacity: 0.5
              },
              transition: 'all 0.3s ease'
            }}
          >
            <Phone />
          </IconButton>
          
          <IconButton 
            onClick={onToggleDarkMode}
            size={window.innerWidth < 600 ? 'small' : 'medium'}
            sx={{ 
              color: darkMode ? 'white' : '#1e293b',
              background: darkMode 
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.1)',
              width: { xs: 36, sm: 40, md: 48 },
              height: { xs: 36, sm: 40, md: 48 },
              '&:hover': { 
                background: darkMode 
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'rgba(0, 0, 0, 0.2)',
                transform: { xs: 'none', sm: 'scale(1.05)' }
              },
              transition: 'all 0.3s ease'
            }}
          >
            {darkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
          <Button
            variant="contained"
            startIcon={<ExitToApp sx={{ display: { xs: 'none', sm: 'block' } }} />}
            onClick={onEndChat}
            disabled={!endChatEnabled}
            size={window.innerWidth < 600 ? 'small' : 'medium'}
            sx={{
              background: endChatEnabled 
                ? 'linear-gradient(45deg, #ff4757, #ff3742)'
                : 'linear-gradient(45deg, #666, #555)',
              '&:hover': endChatEnabled ? { 
                background: 'linear-gradient(45deg, #ff3742, #ff2f3a)',
                transform: { xs: 'none', sm: 'translateY(-2px)' },
                boxShadow: '0 8px 25px rgba(255, 71, 87, 0.4)'
              } : {},
              '&:disabled': {
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'not-allowed'
              },
              borderRadius: 3,
              px: { xs: 1.5, sm: 2, md: 2.5 },
              py: { xs: 0.8, sm: 1, md: 1.2 },
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.85rem' },
              minWidth: { xs: '50px', sm: '70px', md: '80px' },
              height: { xs: 36, sm: 40, md: 48 }
            }}
          >
            {endChatEnabled ? 'End' : `${countdown}s`}
          </Button>
        </Box>
      </Box>

      {/* Call Settings */}
      {/* Removed call settings */}
      
      {/* Messages Area */}
      <Box 
        sx={{ 
          flex: 1, 
          overflow: 'auto', 
          p: { xs: 0.5, sm: 1, md: 2 },
          background: 'transparent',
          position: 'relative',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': {
            width: { xs: '2px', sm: '4px', md: '6px' }
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.1)'
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(45deg, #ff6b6b, #feca57)',
            borderRadius: '10px'
          }
        }}
      >
        <Alert 
          sx={{ 
            mb: { xs: 1, sm: 1.5, md: 2 },
            mx: { xs: 0.5, sm: 1, md: 0 },
            borderRadius: { xs: 2, sm: 3, md: 4 },
            background: darkMode 
              ? 'rgba(15, 15, 35, 0.8)'
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: darkMode 
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(0, 0, 0, 0.1)',
            color: darkMode ? 'white' : '#1e293b',
            '& .MuiAlert-icon': {
              color: '#feca57',
              fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' }
            },
            '& .MuiAlert-message': {
              fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.85rem' }
            }
          }}
        >
          <Typography sx={{ 
            background: 'linear-gradient(45deg, #feca57, #ff9ff3)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 500
          }}>
            🎭 Anonymous chat active • Be respectful and enjoy!
          </Typography>
        </Alert>
        
        {messages.map((msg, index) => {
          const isOwn = msg.senderId === userId;
          
          return (
            <Box
              key={msg.id || index}
              sx={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                mb: { xs: 1, sm: 1.5, md: 2 },
                mx: { xs: 0.5, sm: 1, md: 0 },
                alignItems: 'flex-end',
                animation: 'slideIn 0.3s ease-out'
              }}
            >
              {!isOwn && (
                <Avatar 
                  sx={{ 
                    width: { xs: 28, sm: 32, md: 40 }, 
                    height: { xs: 28, sm: 32, md: 40 }, 
                    mr: { xs: 1, sm: 1.5, md: 2 },
                    background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                    boxShadow: '0 0 15px rgba(255, 107, 107, 0.4)',
                    fontSize: { xs: '12px', sm: '14px', md: '18px' }
                  }}
                >
                  🎭
                </Avatar>
              )}
              <Box
                sx={{
                  maxWidth: { xs: '90%', sm: '85%', md: '75%' },
                  background: isOwn 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : darkMode 
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: isOwn 
                    ? '1px solid rgba(102, 126, 234, 0.3)'
                    : darkMode 
                      ? '1px solid rgba(255, 255, 255, 0.2)'
                      : '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: { 
                    xs: isOwn ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                    sm: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    md: isOwn ? '20px 20px 6px 20px' : '20px 20px 20px 6px'
                  },
                  p: { xs: 1.5, sm: 2, md: 2.5 },
                  color: isOwn ? 'white' : darkMode ? 'white' : '#1e293b',
                  boxShadow: isOwn 
                    ? '0 8px 32px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    : '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  '&:active': {
                    transform: { xs: 'scale(0.98)', sm: 'translateY(-1px)', md: 'translateY(-2px)' }
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Typography variant="body1" sx={{ 
                  lineHeight: 1.4,
                  fontSize: { xs: '13px', sm: '14px', md: '15px' },
                  fontWeight: 400,
                  wordBreak: 'break-word'
                }}>
                  {msg.message}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mt: { xs: 0.8, sm: 1, md: 1.2 }
                }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      opacity: 0.7, 
                      fontSize: { xs: '9px', sm: '10px', md: '11px' },
                      color: isOwn ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.6)'
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </Typography>
                  <MessageStatus 
                    status={msg.status} 
                    isOwn={isOwn}
                  />
                </Box>
              </Box>
              {isOwn && (
                <Avatar 
                  sx={{ 
                    width: { xs: 28, sm: 32, md: 40 }, 
                    height: { xs: 28, sm: 32, md: 40 }, 
                    ml: { xs: 1, sm: 1.5, md: 2 },
                    background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
                    boxShadow: '0 0 15px rgba(0, 255, 136, 0.4)',
                    fontSize: { xs: '12px', sm: '14px', md: '18px' }
                  }}
                >
                  😎
                </Avatar>
              )}
            </Box>
          );
        })}
        
        <TypingIndicator show={showTyping} />
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box sx={{ 
        background: darkMode 
          ? 'rgba(15, 15, 35, 0.95)'
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: darkMode 
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(0, 0, 0, 0.1)',
        position: 'relative',
        zIndex: 10
      }}>
        <MessageInput 
          onSendMessage={handleSendMessage}
          onTypingStart={onTypingStart}
          onTypingStop={onTypingStop}
          isConnected={isConnected}
          darkMode={darkMode}
        />
      </Box>
      
      {/* Call Modals - Video Call Component */}
      <VideoCallComponent
        isCallActive={callManager.isCallActive}
        callType={callManager.callType}
        isIncoming={callManager.isIncoming}
        callerName={callManager.callerName}
        onAcceptCall={callManager.acceptCall}
        onRejectCall={callManager.rejectCall}
        onEndCall={callManager.endCall}
        onToggleVideo={callManager.toggleVideo}
        onToggleAudio={callManager.toggleAudio}
        onToggleSpeaker={callManager.toggleSpeaker}
        onSwitchCamera={callManager.switchCamera}
        isVideoEnabled={callManager.isVideoEnabled}
        isAudioEnabled={callManager.isAudioEnabled}
        isSpeakerOn={callManager.isSpeakerOn}
        isFrontCamera={callManager.isFrontCamera}
        localVideoRef={callManager.localVideoRef}
        remoteVideoRef={callManager.remoteVideoRef}
        localAudioRef={callManager.localAudioRef}
        remoteAudioRef={callManager.remoteAudioRef}
        darkMode={darkMode}
      />
      
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 8px rgba(0, 255, 136, 0.6);
          }
          50% {
            box-shadow: 0 0 15px rgba(0, 255, 136, 0.9);
          }
          100% {
            box-shadow: 0 0 8px rgba(0, 255, 136, 0.6);
          }
        }
      `}</style>
    </Box>
  );
};

export default ChatInterface;