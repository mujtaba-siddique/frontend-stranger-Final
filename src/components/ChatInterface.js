import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Badge,
  IconButton
} from '@mui/material';
import {
  ExitToApp,
  LightMode,
  DarkMode,
  Videocam,
  Phone,
  KeyboardArrowDown,
  Lock
} from '@mui/icons-material';
import MessageInput from './MessageInput';
import MessageStatus from './MessageStatus';
import TypingIndicator from './TypingIndicator';

import { VoiceRecorder, VoicePlayer, WebRTCVoice } from '../utils/voiceClasses';

import { sanitizeMessage } from '../utils/messageValidator';
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
  onToggleDarkMode,
  socket,
  callManager
}) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showTyping, setShowTyping] = useState(false);
  const [endChatEnabled, setEndChatEnabled] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const seenMessagesRef = useRef(new Set());
  const [localMessages, setLocalMessages] = useState([]);
  const voiceBlobsRef = useRef(new Map());
  const [showScrollDown, setShowScrollDown] = useState(false);

  // Voice messaging refs
  const recorderRef = useRef(null);
  const playerRef = useRef(null);
  const webrtcRef = useRef(null);



  // Initialize voice messaging
  useEffect(() => {
    if (socket && userId) {
      console.log('🎤 Initializing voice messaging...', { userId, partnerId });

      try {
        recorderRef.current = new VoiceRecorder();
        playerRef.current = new VoicePlayer();
        webrtcRef.current = new WebRTCVoice(socket, userId);

        webrtcRef.current.onVoiceReceived = (data) => {
          console.log('📥 Voice data received:', data.byteLength, 'bytes');
          if (playerRef.current) {
            playerRef.current.addChunk(data);
          }
        };

        webrtcRef.current.onChannelOpen = () => {
          console.log('📡 DataChannel opened, starting receiver...');
          if (playerRef.current) {
            playerRef.current.startReceiving();
          }
        };

        playerRef.current.onVoiceMessageReceived = (blob, messageId) => {
          console.log('🎵 Voice message received with ID:', messageId);

          // Generate fallback ID if messageId is null
          const finalMessageId = messageId || `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          const voiceMessage = {
            id: finalMessageId,
            type: 'voice',
            senderId: partnerId,
            timestamp: Date.now(),
            status: 'received',
            duration: Math.floor(blob.size / 16000)
          };
          voiceBlobsRef.current.set(voiceMessage.id, blob);
          setLocalMessages(prev => [...prev, voiceMessage]);

          // Notify sender that voice message was delivered
          if (socket && partnerId) {
            socket.emit('voice-message-delivered', { messageId: finalMessageId, to: partnerId });
          }
        };

        // Remove old listeners first
        socket.off('voice-message-delivered');
        socket.off('voice-message-played');

        // Listen for delivery confirmation
        socket.on('voice-message-delivered', (data) => {
          console.log('✓✓ [SENDER] Voice message delivered:', data.messageId);
          setLocalMessages(prev => prev.map(msg =>
            msg.id === data.messageId ? { ...msg, status: 'seen' } : msg
          ));
        });

        // Listen for playback (seen) event
        socket.on('voice-message-played', (data) => {
          console.log('🗑️ [SENDER] Partner played voice message:', data.messageId);

          setLocalMessages(prev => {
            console.log('🗑️ [SENDER] Filtering messages, current count:', prev.length);
            const filtered = prev.filter(msg => msg.id !== data.messageId);
            console.log('🗑️ [SENDER] After filter count:', filtered.length);
            return filtered;
          });

          // Just delete blob from map, no URL revocation needed
          if (voiceBlobsRef.current.has(data.messageId)) {
            console.log('🗑️ [SENDER] Cleaning up blob for:', data.messageId);
            voiceBlobsRef.current.delete(data.messageId);
          }
        });

        console.log('🎉 Voice messaging initialized successfully!');
      } catch (error) {
        console.error('❌ Voice component creation failed:', error);
      }
    }

    return () => {
      console.log('🧹 Cleaning up voice components...');

      // Remove socket listeners
      if (socket) {
        socket.off('voice-message-delivered');
        socket.off('voice-message-played');
      }

      if (recorderRef.current) {
        recorderRef.current.cleanup();
      }
      if (playerRef.current) {
        playerRef.current.stop();
      }
      if (webrtcRef.current) {
        webrtcRef.current.close();
      }
    };
  }, [socket, userId, partnerId]);



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

  // Scroll detection for scroll-to-bottom button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollDown(scrollHeight - scrollTop - clientHeight > 120);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleVoiceRecord = async (action) => {
    console.log('🎤 Voice Record:', action, {
      hasRecorder: !!recorderRef.current,
      hasWebRTC: !!webrtcRef.current,
      partnerId: partnerId
    });

    if (!recorderRef.current || !webrtcRef.current || !partnerId) {
      console.error('❌ Voice not ready:', {
        recorder: !!recorderRef.current,
        webrtc: !!webrtcRef.current,
        partner: !!partnerId
      });
      return;
    }

    if (action === 'start') {
      try {
        console.log('🎙️ Starting recording...');
        const success = await recorderRef.current.startRecording();
        if (!success) {
          console.error('❌ Failed to start recording');
        } else {
          console.log('✅ Recording started');
        }
      } catch (error) {
        console.error('❌ Recording error:', error);
      }
    } else if (action === 'stop') {
      try {
        console.log('⏹️ Stopping recording...');
        const blob = await recorderRef.current.stopRecording();
        console.log('📦 Blob received:', blob?.size, 'bytes');

        if (blob && blob.size > 0) {
          const voiceMessage = {
            id: Date.now().toString(),
            type: 'voice',
            senderId: userId,
            timestamp: Date.now(),
            status: 'sent',
            duration: Math.floor(blob.size / 16000)
          };
          voiceBlobsRef.current.set(voiceMessage.id, blob);
          setLocalMessages(prev => [...prev, voiceMessage]);

          console.log('📤 Sending voice to:', partnerId, 'with messageId:', voiceMessage.id);
          await webrtcRef.current.sendVoiceBlob(blob, partnerId, voiceMessage.id);
          console.log('✅ Voice sent successfully');
        } else {
          console.error('❌ Empty blob - not sending');
        }
      } catch (error) {
        console.error('❌ Send voice error:', error);
      }
    }
  };

  const handleVoicePlay = (messageId, senderId) => {
    const blob = voiceBlobsRef.current.get(messageId);
    if (!blob) {
      console.error('❌ No blob found for messageId:', messageId);
      return;
    }

    if (!playerRef.current) {
      console.error('❌ Player not initialized');
      return;
    }

    console.log('🔊 [PLAY] Playing voice:', messageId, 'from:', senderId, 'myId:', userId);

    const onPlaybackEnd = () => {
      console.log('🗑️ [END] Playback ended for:', messageId);

      setLocalMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== messageId);
        console.log('🗑️ [END] Deleted from UI, before:', prev.length, 'after:', filtered.length);
        return filtered;
      });

      voiceBlobsRef.current.delete(messageId);

      if (senderId !== userId && socket && partnerId) {
        console.log('📤 [END] Notifying sender:', messageId, 'to:', partnerId);
        socket.emit('voice-message-played', { messageId, to: partnerId });
      } else {
        console.log('🚫 [END] Not notifying - own message');
      }
    };

    playerRef.current.playVoice(blob, onPlaybackEnd);
  };

  // Group messages by date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const allMessages = [...messages, ...localMessages].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: darkMode
        ? '#0b0d14'
        : '#efeae2',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif"
    }}>

      {/* ========== HEADER ========== */}
      <Box
        sx={{
          px: { xs: 1.5, sm: 2.5 },
          py: { xs: 1, sm: 1.3 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: darkMode
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #00a884 0%, #008069 100%)',
          color: 'white',
          position: 'relative',
          zIndex: 10,
          boxShadow: '0 2px 20px rgba(0,0,0,0.15)',
          minHeight: { xs: '60px', sm: '68px' }
        }}
      >
        {/* Left: Avatar + Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.2, sm: 1.8 }, flex: 1, minWidth: 0 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
                border: '2.5px solid white',
                boxShadow: '0 0 10px rgba(0, 255, 136, 0.8)'
              }} />
            }
          >
            <Avatar sx={{
              width: { xs: 42, sm: 48 },
              height: { xs: 42, sm: 48 },
              background: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)',
              fontSize: { xs: '20px', sm: '24px' },
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              border: '3px solid rgba(255,255,255,0.3)'
            }}>
              🎭
            </Avatar>
          </Badge>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.15rem' },
              color: 'white',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              letterSpacing: '0.3px'
            }}>
              Anonymous Stranger
            </Typography>
            <Typography variant="caption" sx={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: { xs: '0.75rem', sm: '0.8rem' },
              lineHeight: 1.2,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontWeight: 500
            }}>
              {showTyping ? (
                <span style={{ color: '#ffeb3b', fontStyle: 'italic', fontWeight: 600 }}>typing...</span>
              ) : (
                'online'
              )}
            </Typography>
          </Box>
        </Box>

        {/* Right: Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.4, sm: 0.8 } }}>
          <IconButton
            onClick={() => callManager.startCall('video')}
            disabled={!partnerId || callManager.isCallActive}
            size="small"
            sx={{
              color: 'white',
              width: { xs: 38, sm: 42 },
              height: { xs: 38, sm: 42 },
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              '&:hover': { 
                background: 'rgba(255,255,255,0.25)',
                transform: 'scale(1.05)'
              },
              '&:disabled': { opacity: 0.3 },
              transition: 'all 0.2s'
            }}
          >
            <Videocam sx={{ fontSize: { xs: 20, sm: 22 } }} />
          </IconButton>

          <IconButton
            onClick={() => callManager.startCall('audio')}
            disabled={!partnerId || callManager.isCallActive}
            size="small"
            sx={{
              color: 'white',
              width: { xs: 38, sm: 42 },
              height: { xs: 38, sm: 42 },
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              '&:hover': { 
                background: 'rgba(255,255,255,0.25)',
                transform: 'scale(1.05)'
              },
              '&:disabled': { opacity: 0.3 },
              transition: 'all 0.2s'
            }}
          >
            <Phone sx={{ fontSize: { xs: 20, sm: 22 } }} />
          </IconButton>

          <IconButton
            onClick={onToggleDarkMode}
            size="small"
            sx={{
              color: 'white',
              width: { xs: 38, sm: 42 },
              height: { xs: 38, sm: 42 },
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              '&:hover': { 
                background: 'rgba(255,255,255,0.25)',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s'
            }}
          >
            {darkMode ? <LightMode sx={{ fontSize: { xs: 19, sm: 21 } }} /> : <DarkMode sx={{ fontSize: { xs: 19, sm: 21 } }} />}
          </IconButton>

          <Button
            variant="contained"
            onClick={onEndChat}
            disabled={!endChatEnabled}
            size="small"
            sx={{
              background: endChatEnabled
                ? 'linear-gradient(135deg, #ff416c, #ff4b2b)'
                : 'rgba(255,255,255,0.15)',
              color: 'white',
              '&:hover': endChatEnabled ? {
                background: 'linear-gradient(135deg, #ff4b2b, #d63031)',
                boxShadow: '0 6px 20px rgba(255,65,108,0.5)',
                transform: 'translateY(-2px)'
              } : {},
              '&:disabled': {
                color: 'rgba(255,255,255,0.5)'
              },
              borderRadius: '24px',
              px: { xs: 1.8, sm: 2.5 },
              py: 0.6,
              fontWeight: 700,
              fontSize: { xs: '0.75rem', sm: '0.8rem' },
              minWidth: { xs: '50px', sm: '64px' },
              height: { xs: 34, sm: 38 },
              textTransform: 'none',
              transition: 'all 0.3s ease',
              boxShadow: endChatEnabled ? '0 4px 15px rgba(255,65,108,0.3)' : 'none',
              ml: 0.5
            }}
          >
            {endChatEnabled ? (
              <><ExitToApp sx={{ fontSize: 16, mr: 0.4, display: { xs: 'none', sm: 'inline-flex' } }} /> End</>
            ) : `${countdown}s`}
          </Button>
        </Box>
      </Box>

      {/* ========== CHAT WALLPAPER PATTERN (subtle) ========== */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        top: '60px',
        opacity: darkMode ? 0.025 : 0.035,
        backgroundImage: darkMode 
          ? `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h80v80H0V0zm20 20v40h40V20H20zm5 5h30v30H25V25z'/%3E%3C/g%3E%3C/svg%3E")`
          : `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M0 0h80v80H0V0zm20 20v40h40V20H20zm5 5h30v30H25V25z'/%3E%3C/g%3E%3C/svg%3E")`,
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* ========== MESSAGES AREA ========== */}
      <Box
        ref={messagesContainerRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          px: { xs: 1, sm: 2, md: 3 },
          py: { xs: 1, sm: 1.5 },
          position: 'relative',
          zIndex: 1,
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': {
            width: '5px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            background: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
            borderRadius: '10px'
          }
        }}
      >
        {/* Encrypted Notice */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          mb: 2,
          mt: 1
        }}>
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.7,
            background: darkMode
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(255, 243, 176, 0.85)',
            borderRadius: '8px',
            px: 2,
            py: 0.8,
            boxShadow: darkMode ? 'none' : '0 1px 3px rgba(0,0,0,0.08)'
          }}>
            <Lock sx={{ fontSize: 13, color: darkMode ? 'rgba(255,255,255,0.4)' : '#8b7355' }} />
            <Typography sx={{
              fontSize: { xs: '0.68rem', sm: '0.72rem' },
              color: darkMode ? 'rgba(255,255,255,0.45)' : '#6b5b3e',
              fontWeight: 400,
              textAlign: 'center'
            }}>
              Messages are end-to-end encrypted. Chat anonymously and be respectful.
            </Typography>
          </Box>
        </Box>

        {/* Messages */}
        {allMessages.map((msg, index) => {
          const isOwn = msg.senderId === userId;
          const isVoice = msg.type === 'voice';
          const prevMsg = allMessages[index - 1];
          const showDate = !prevMsg || formatDate(prevMsg.timestamp) !== formatDate(msg.timestamp);
          const isConsecutive = prevMsg && prevMsg.senderId === msg.senderId && !showDate &&
            (msg.timestamp - prevMsg.timestamp < 60000);

          return (
            <React.Fragment key={msg.id || index}>
              {/* Date Separator */}
              {showDate && (
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  my: 2
                }}>
                  <Box sx={{
                    background: darkMode
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(255,255,255,0.92)',
                    borderRadius: '8px',
                    px: 2,
                    py: 0.5,
                    boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.1)'
                  }}>
                    <Typography sx={{
                      fontSize: '0.72rem',
                      color: darkMode ? 'rgba(255,255,255,0.55)' : '#667781',
                      fontWeight: 500,
                      letterSpacing: '0.01em'
                    }}>
                      {formatDate(msg.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Message Bubble */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: isOwn ? 'flex-end' : 'flex-start',
                  mb: isConsecutive ? 0.3 : 1,
                  px: { xs: 0, sm: 0.5 },
                  alignItems: 'flex-end',
                  animation: 'msgAppear 0.25s cubic-bezier(0.2, 0, 0, 1)'
                }}
              >
                  <Box sx={{
                    maxWidth: { xs: '85%', sm: '75%', md: '65%' },
                    minWidth: '80px',
                    position: 'relative',
                    background: isOwn
                      ? darkMode
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'linear-gradient(135deg, #dcf8c6 0%, #d4f4c1 100%)'
                      : darkMode
                        ? 'linear-gradient(135deg, #2a2d3e 0%, #1e2033 100%)'
                        : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    borderRadius: isConsecutive
                      ? '12px'
                      : isOwn
                        ? '12px 12px 4px 12px'
                        : '12px 12px 12px 4px',
                    px: { xs: 1.8, sm: 2.2 },
                    py: { xs: 1, sm: 1.2 },
                    color: isOwn 
                      ? 'white'
                      : darkMode ? '#e4e6eb' : '#111b21',
                    boxShadow: darkMode
                      ? '0 2px 8px rgba(0,0,0,0.4)'
                      : '0 2px 6px rgba(0,0,0,0.12)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: darkMode
                        ? '0 4px 12px rgba(0,0,0,0.5)'
                        : '0 4px 10px rgba(0,0,0,0.15)'
                    }
                  }}>
                  {isVoice ? (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        cursor: 'pointer',
                        py: 0.3,
                        '&:active': { opacity: 0.7 }
                      }}
                      onClick={() => handleVoicePlay(msg.id, msg.senderId)}
                    >
                      <Box sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: isOwn
                          ? 'rgba(255,255,255,0.15)'
                          : darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        flexShrink: 0
                      }}>
                        ▶
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* Waveform */}
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          height: 24,
                          overflow: 'hidden'
                        }}>
                          {Array.from({ length: 20 }, (_, i) => (
                            <Box key={i} sx={{
                              width: 3,
                              minHeight: 3,
                              height: `${Math.random() * 80 + 20}%`,
                              borderRadius: 2,
                              background: isOwn
                                ? darkMode ? 'rgba(100,180,255,0.5)' : 'rgba(7,94,84,0.4)'
                                : darkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
                              transition: 'height 0.2s'
                            }} />
                          ))}
                        </Box>
                        <Typography variant="caption" sx={{
                          fontSize: '0.65rem',
                          opacity: 0.6,
                          mt: 0.3,
                          display: 'block'
                        }}>
                          {msg.duration || '0:00'}s
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography sx={{
                      fontSize: { xs: '0.9rem', sm: '0.95rem' },
                      lineHeight: 1.5,
                      fontWeight: 400,
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                      letterSpacing: '0.02em'
                    }}>
                      {msg.message}
                    </Typography>
                  )}

                  {/* Time + Status */}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 0.4,
                    mt: 0.3,
                    ml: 1,
                    float: 'right',
                    position: 'relative',
                    bottom: '-2px'
                  }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: { xs: '0.62rem', sm: '0.65rem' },
                        color: isOwn
                          ? darkMode ? 'rgba(155,200,255,0.55)' : 'rgba(0,80,60,0.45)'
                          : darkMode ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
                        fontWeight: 400,
                        lineHeight: 1
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                    <MessageStatus
                      status={msg.status}
                      isOwn={isOwn}
                    />
                  </Box>
                </Box>
              </Box>
            </React.Fragment>
          );
        })}

        <TypingIndicator show={showTyping} />

        <div ref={messagesEndRef} />
      </Box>

      {/* Scroll to bottom FAB */}
      <Box
        onClick={scrollToBottom}
        sx={{
          position: 'absolute',
          bottom: { xs: 80, sm: 90 },
          right: { xs: 12, sm: 20 },
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: darkMode ? '#2a2d3e' : '#ffffff',
          boxShadow: darkMode ? '0 3px 12px rgba(0,0,0,0.5)' : '0 3px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 5,
          opacity: showScrollDown ? 1 : 0,
          pointerEvents: showScrollDown ? 'auto' : 'none',
          transform: showScrollDown ? 'scale(1)' : 'scale(0.7)',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: darkMode ? '#353849' : '#f0f0f0'
          }
        }}
      >
        <KeyboardArrowDown sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : '#54656f', fontSize: 22 }} />
      </Box>

      {/* ========== MESSAGE INPUT ========== */}
      <Box sx={{
        background: darkMode
          ? 'linear-gradient(180deg, #1e2033 0%, #1a1d2e 100%)'
          : 'linear-gradient(180deg, #f0f2f5 0%, #e8eaed 100%)',
        position: 'relative',
        zIndex: 10,
        borderTop: darkMode
          ? '1px solid rgba(255,255,255,0.06)'
          : '1px solid rgba(0,0,0,0.08)',
        boxShadow: darkMode
          ? '0 -2px 10px rgba(0,0,0,0.3)'
          : '0 -2px 10px rgba(0,0,0,0.05)'
      }}>
        <MessageInput
          onSendMessage={handleSendMessage}
          onTypingStart={onTypingStart}
          onTypingStop={onTypingStop}
          onVoiceRecord={handleVoiceRecord}
          isConnected={isConnected}
          darkMode={darkMode}
        />
      </Box>

      {/* ========== ANIMATIONS ========== */}
      <style>{`
        @keyframes msgAppear {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 8px rgba(0, 255, 136, 0.6); }
          50% { box-shadow: 0 0 15px rgba(0, 255, 136, 0.9); }
          100% { box-shadow: 0 0 8px rgba(0, 255, 136, 0.6); }
        }
      `}</style>
    </Box>
  );
};

export default ChatInterface;