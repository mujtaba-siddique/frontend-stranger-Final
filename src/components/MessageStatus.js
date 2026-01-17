import React from 'react';
import { Box, Typography } from '@mui/material';

const MessageStatus = ({ status, isOwn }) => {
  if (!isOwn) return null;

  const getStatusDisplay = () => {
    switch (status) {
      case 'sending':
      case 'pending':
        return { icon: '⏱️', color: 'rgba(255,255,255,0.5)' }; // Clock
      case 'sent':
        return { icon: '✓', color: 'rgba(255,255,255,0.7)' }; // Single tick
      case 'delivered':
        return { icon: '✓✓', color: 'rgba(255,255,255,0.7)' }; // Double tick
      case 'seen':
      case 'read':
        return { icon: '✓✓', color: '#4ECDC4' }; // Blue double tick
      case 'failed':
      case 'network_issue':
        return { icon: '❌', color: '#ff4757' }; // Red X
      default:
        return { icon: '⏱️', color: 'rgba(255,255,255,0.5)' };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <Typography 
      variant="caption" 
      sx={{ 
        fontSize: '11px',
        color: statusDisplay.color,
        fontWeight: 600,
        ml: 0.5
      }}
    >
      {statusDisplay.icon}
    </Typography>
  );
};

export default MessageStatus;