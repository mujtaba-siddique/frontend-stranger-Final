import React, { useState, useRef } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  Chip,
  Typography,
  Dialog,
  DialogContent,
  Button,
  LinearProgress
} from '@mui/material';
import {
  EmojiEmotions,
  AttachFile,
  Mic,
  MicOff,
  Image,
  VideoFile,
  Description,
  Send,
  MoreVert,
  Reply,
  ContentCopy,
  Delete,
  Report
} from '@mui/icons-material';

const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

const EnhancedMessageBubble = ({ 
  message, 
  isOwn, 
  darkMode, 
  onReact, 
  onReply, 
  onReport,
  onDelete 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [reactionMenu, setReactionMenu] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleReactionClick = (event) => {
    setReactionMenu(event.currentTarget);
  };

  const handleReaction = (reaction) => {
    onReact(message.id, reaction);
    setReactionMenu(null);
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(message.message);
    setAnchorEl(null);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: isOwn ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: 1,
      mb: 1,
      group: true,
      '&:hover .message-actions': {
        opacity: 1
      }
    }}>
      <Box
        sx={{
          maxWidth: '70%',
          background: isOwn 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : darkMode 
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.05)',
          borderRadius: isOwn ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
          p: 2,
          color: isOwn ? 'white' : darkMode ? 'white' : '#1e293b',
          position: 'relative'
        }}
      >
        {/* Reply indicator */}
        {message.replyTo && (
          <Box sx={{ 
            borderLeft: '3px solid rgba(255,255,255,0.5)',
            pl: 1,
            mb: 1,
            opacity: 0.7,
            fontSize: '0.8rem'
          }}>
            Replying to: {message.replyTo.message.substring(0, 50)}...
          </Box>
        )}

        {/* Message content */}
        <Typography variant="body1">
          {message.message}
        </Typography>

        {/* File attachments */}
        {message.attachments && message.attachments.map((file, index) => (
          <Box key={index} sx={{ mt: 1 }}>
            {file.type.startsWith('image/') && (
              <img 
                src={file.url} 
                alt="attachment" 
                style={{ maxWidth: '200px', borderRadius: '8px' }}
              />
            )}
            {file.type.startsWith('video/') && (
              <video 
                src={file.url} 
                controls 
                style={{ maxWidth: '200px', borderRadius: '8px' }}
              />
            )}
            {file.type.startsWith('audio/') && (
              <audio src={file.url} controls style={{ width: '200px' }} />
            )}
          </Box>
        ))}

        {/* Voice message */}
        {message.voiceMessage && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <IconButton size="small">
              <Mic />
            </IconButton>
            <LinearProgress 
              variant="determinate" 
              value={50} 
              sx={{ flex: 1, height: 4, borderRadius: 2 }}
            />
            <Typography variant="caption">0:15</Typography>
          </Box>
        )}

        {/* Reactions */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
            {Object.entries(message.reactions).map(([reaction, count]) => (
              <Chip
                key={reaction}
                label={`${reaction} ${count}`}
                size="small"
                onClick={() => handleReaction(reaction)}
                sx={{ 
                  height: 24,
                  fontSize: '0.7rem',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'inherit'
                }}
              />
            ))}
          </Box>
        )}

        {/* Timestamp */}
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block',
            textAlign: 'right',
            mt: 0.5,
            opacity: 0.7
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit', 
            minute: '2-digit'
          })}
        </Typography>
      </Box>

      {/* Message actions */}
      <Box 
        className="message-actions"
        sx={{ 
          opacity: 0,
          transition: 'opacity 0.2s',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5
        }}
      >
        <Tooltip title="React">
          <IconButton 
            size="small" 
            onClick={handleReactionClick}
            sx={{ color: darkMode ? '#fff' : '#666' }}
          >
            <EmojiEmotions fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="More">
          <IconButton 
            size="small" 
            onClick={handleMenuClick}
            sx={{ color: darkMode ? '#fff' : '#666' }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Reaction menu */}
      <Menu
        anchorEl={reactionMenu}
        open={Boolean(reactionMenu)}
        onClose={() => setReactionMenu(null)}
      >
        <Box sx={{ display: 'flex', gap: 1, p: 1 }}>
          {reactions.map((reaction) => (
            <IconButton
              key={reaction}
              onClick={() => handleReaction(reaction)}
              sx={{ fontSize: '1.5rem' }}
            >
              {reaction}
            </IconButton>
          ))}
        </Box>
      </Menu>

      {/* Context menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => { onReply(message); setAnchorEl(null); }}>
          <Reply sx={{ mr: 1 }} /> Reply
        </MenuItem>
        <MenuItem onClick={copyMessage}>
          <ContentCopy sx={{ mr: 1 }} /> Copy
        </MenuItem>
        {isOwn && (
          <MenuItem onClick={() => { onDelete(message.id); setAnchorEl(null); }}>
            <Delete sx={{ mr: 1 }} /> Delete
          </MenuItem>
        )}
        {!isOwn && (
          <MenuItem onClick={() => { onReport(message.id); setAnchorEl(null); }}>
            <Report sx={{ mr: 1 }} /> Report
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default EnhancedMessageBubble;