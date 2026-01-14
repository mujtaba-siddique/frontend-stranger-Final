import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, TextField, IconButton, Paper, Avatar, Chip,
  Stack, Menu, MenuItem, Tooltip, Fade, Zoom, Badge, Fab,
  Dialog, DialogContent, Grid, Button, Divider
} from '@mui/material';
import {
  Send, EmojiEmotions, AttachFile, Call, VideoCall, MoreVert,
  Reply, Favorite, ThumbUp, Laugh, Angry, Sad, Wow,
  Image, Mic, GifBox, Sticker, Close, VolumeUp
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';

const messageSlideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const typingDots = keyframes`
  0%, 60%, 100% { transform: initial; }
  30% { transform: translateY(-10px); }
`;

const reactionPop = keyframes`
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

const UltraAdvancedChatInterface = ({
  messages, onSendMessage, onEndChat, onTypingStart, onTypingStop,
  partnerId, userId, isPartnerTyping, darkMode, onToggleDarkMode,
  onStartCall
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactions, setShowReactions] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Emoji categories with extensive selection
  const emojiCategories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '💌', '💋', '💍', '💎'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️'],
    'Food': ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯'],
    'Activities': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🤺', '🤾‍♀️', '🤾', '🤾‍♂️', '🏌️‍♀️', '🏌️', '🏌️‍♂️', '🏇', '🧘‍♀️', '🧘', '🧘‍♂️', '🏄‍♀️', '🏄', '🏄‍♂️', '🏊‍♀️', '🏊', '🏊‍♂️', '🤽‍♀️', '🤽', '🤽‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🧗‍♀️', '🧗', '🧗‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🚴‍♀️', '🚴', '🚴‍♂️', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️'],
    'Objects': ['📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪓', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪥', '🪒', '🧽', '🪣', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌', '🧸', '🖼️', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒️', '🗓️', '📆', '📅', '🗑️', '📇', '🗃️', '🗳️', '🗄️', '📋', '📁', '📂', '🗂️', '🗞️', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇️', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '📝', '✏️', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓']
  };

  const reactions = [
    { emoji: '❤️', name: 'love', color: '#FF6B6B' },
    { emoji: '👍', name: 'like', color: '#4ECDC4' },
    { emoji: '😂', name: 'laugh', color: '#FFD700' },
    { emoji: '😮', name: 'wow', color: '#FF8C42' },
    { emoji: '😢', name: 'sad', color: '#6C5CE7' },
    { emoji: '😡', name: 'angry', color: '#E17055' }
  ];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(() => {
    if (message.trim()) {
      onSendMessage(message, Date.now().toString(), 'text', null, null, null, replyingTo?.id);
      setMessage('');
      setReplyingTo(null);
      inputRef.current?.focus();
    }
  }, [message, onSendMessage, replyingTo]);

  const handleTyping = useCallback((value) => {
    setMessage(value);
    
    if (value.trim()) {
      onTypingStart();
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        onTypingStop();
      }, 1000);
    } else {
      onTypingStop();
    }
  }, [onTypingStart, onTypingStop]);

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleReaction = (messageId, reaction) => {
    // Add reaction logic here
    setShowReactions(null);
  };

  const handleMessageMenu = (event, message) => {
    setMenuAnchor(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleReply = () => {
    setReplyingTo(selectedMessage);
    setMenuAnchor(null);
    inputRef.current?.focus();
  };

  const MessageBubble = ({ msg, isOwn }) => (
    <Fade in timeout={300}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: isOwn ? 'flex-end' : 'flex-start',
          mb: 2,
          animation: `${messageSlideIn} 0.3s ease-out`
        }}
      >
        <Box
          sx={{
            maxWidth: '70%',
            position: 'relative'
          }}
        >
          {msg.replyTo && (
            <Box
              sx={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '10px 10px 0 0',
                p: 1,
                mb: 0.5,
                borderLeft: '3px solid #4ECDC4'
              }}
            >
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Replying to: {msg.replyTo.message.substring(0, 50)}...
              </Typography>
            </Box>
          )}
          
          <Paper
            elevation={3}
            sx={{
              p: 2,
              background: isOwn 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: isOwn ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
              color: 'white',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
              }
            }}
            onClick={(e) => handleMessageMenu(e, msg)}
          >
            {msg.messageType === 'image' && (
              <Box
                component="img"
                src={msg.fileData}
                sx={{
                  maxWidth: '100%',
                  borderRadius: '10px',
                  mb: msg.message ? 1 : 0
                }}
              />
            )}
            
            {msg.messageType === 'voice' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton size="small" sx={{ color: 'white' }}>
                  <VolumeUp />
                </IconButton>
                <Box
                  sx={{
                    flex: 1,
                    height: 4,
                    background: 'rgba(255,255,255,0.3)',
                    borderRadius: 2
                  }}
                />
                <Typography variant="caption">0:15</Typography>
              </Box>
            )}
            
            <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
              {msg.message}
            </Typography>
            
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 1
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.7rem'
                }}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
              
              {isOwn && (
                <Typography
                  variant="caption"
                  sx={{
                    color: msg.status === 'seen' ? '#4ECDC4' : 'rgba(255,255,255,0.5)',
                    fontSize: '0.7rem'
                  }}
                >
                  {msg.status === 'sent' && '✓'}
                  {msg.status === 'delivered' && '✓✓'}
                  {msg.status === 'seen' && '✓✓'}
                </Typography>
              )}
            </Box>
            
            {/* Reactions */}
            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -10,
                  right: isOwn ? 10 : 'auto',
                  left: isOwn ? 'auto' : 10,
                  display: 'flex',
                  gap: 0.5
                }}
              >
                {Object.entries(msg.reactions).map(([reaction, count]) => (
                  <Chip
                    key={reaction}
                    label={`${reaction} ${count}`}
                    size="small"
                    sx={{
                      height: 20,
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontSize: '0.7rem',
                      animation: `${reactionPop} 0.3s ease`
                    }}
                  />
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Fade>
  );

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: darkMode 
          ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
      }}
    >
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 0
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge
              variant="dot"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#4ECDC4',
                  boxShadow: '0 0 10px #4ECDC4'
                }
              }}
            >
              <Avatar
                sx={{
                  background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                  width: 50,
                  height: 50
                }}
              >
                👤
              </Avatar>
            </Badge>
            
            <Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                🌟 Anonymous Stranger
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {isPartnerTyping ? '⌨️ Typing...' : '🟢 Online'}
              </Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Voice Call">
              <IconButton 
                sx={{ color: 'white' }}
                onClick={() => onStartCall && onStartCall('audio')}
              >
                <Call />
              </IconButton>
            </Tooltip>
            <Tooltip title="Video Call">
              <IconButton 
                sx={{ color: 'white' }}
                onClick={() => onStartCall && onStartCall('video')}
              >
                <VideoCall />
              </IconButton>
            </Tooltip>
            <Tooltip title="End Chat">
              <Button
                variant="contained"
                color="error"
                onClick={onEndChat}
                sx={{ borderRadius: '20px' }}
              >
                🚪 End Chat
              </Button>
            </Tooltip>
          </Stack>
        </Box>
      </Paper>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '10px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '10px',
            '&:hover': {
              background: 'rgba(255,255,255,0.5)'
            }
          }
        }}
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            isOwn={msg.senderId === userId}
          />
        ))}
        
        {/* Typing Indicator */}
        {isPartnerTyping && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
            <Paper
              sx={{
                p: 2,
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px 20px 20px 5px',
                display: 'flex',
                gap: 0.5
              }}
            >
              {[...Array(3)].map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#4ECDC4',
                    animation: `${typingDots} 1.4s ease-in-out infinite`,
                    animationDelay: `${i * 0.16}s`
                  }}
                />
              ))}
            </Paper>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Reply Preview */}
      {replyingTo && (
        <Box
          sx={{
            p: 2,
            background: 'rgba(255,255,255,0.1)',
            borderLeft: '3px solid #4ECDC4',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#4ECDC4' }}>
              Replying to:
            </Typography>
            <Typography variant="body2" sx={{ color: 'white' }}>
              {replyingTo.message.substring(0, 50)}...
            </Typography>
          </Box>
          <IconButton onClick={() => setReplyingTo(null)} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
      )}

      {/* Input Area */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 0
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            sx={{ color: 'white' }}
          >
            <EmojiEmotions />
          </IconButton>
          
          <IconButton sx={{ color: 'white' }}>
            <AttachFile />
          </IconButton>
          
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            maxRows={3}
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="💬 Type your message... (Press Enter to send)"
            sx={{
              '& .MuiOutlinedInput-root': {
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '25px',
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)'
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.5)'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#4ECDC4'
                }
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255,255,255,0.7)'
              }
            }}
          />
          
          <Fab
            size="small"
            onClick={handleSendMessage}
            disabled={!message.trim()}
            sx={{
              background: message.trim() 
                ? 'linear-gradient(45deg, #FF6B6B, #4ECDC4)' 
                : 'rgba(255,255,255,0.2)',
              '&:hover': {
                transform: 'scale(1.1)'
              }
            }}
          >
            <Send />
          </Fab>
        </Box>
      </Paper>

      {/* Emoji Picker Dialog */}
      <Dialog
        open={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent
          sx={{
            background: darkMode ? '#1a1a2e' : 'white',
            maxHeight: 400,
            overflow: 'auto'
          }}
        >
          {Object.entries(emojiCategories).map(([category, emojis]) => (
            <Box key={category} mb={2}>
              <Typography variant="h6" gutterBottom>
                {category}
              </Typography>
              <Grid container spacing={1}>
                {emojis.map((emoji) => (
                  <Grid item key={emoji}>
                    <Button
                      onClick={() => handleEmojiSelect(emoji)}
                      sx={{
                        minWidth: 40,
                        height: 40,
                        fontSize: '1.5rem',
                        '&:hover': {
                          transform: 'scale(1.2)'
                        }
                      }}
                    >
                      {emoji}
                    </Button>
                  </Grid>
                ))}
              </Grid>
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}
        </DialogContent>
      </Dialog>

      {/* Message Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={handleReply}>
          <Reply sx={{ mr: 1 }} /> Reply
        </MenuItem>
        <MenuItem onClick={() => setShowReactions(selectedMessage?.id)}>
          <EmojiEmotions sx={{ mr: 1 }} /> React
        </MenuItem>
      </Menu>

      {/* Reaction Picker */}
      {showReactions && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 100,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '25px',
            p: 1,
            display: 'flex',
            gap: 1,
            zIndex: 1000
          }}
        >
          {reactions.map((reaction) => (
            <IconButton
              key={reaction.name}
              onClick={() => handleReaction(showReactions, reaction)}
              sx={{
                fontSize: '2rem',
                '&:hover': {
                  transform: 'scale(1.3)',
                  background: `${reaction.color}20`
                }
              }}
            >
              {reaction.emoji}
            </IconButton>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default UltraAdvancedChatInterface;