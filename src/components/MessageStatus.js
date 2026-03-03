import React from 'react';
import { Typography } from '@mui/material';

const MessageStatus = ({ status, isOwn }) => {
  if (!isOwn) return null;

  const getStatusDisplay = () => {
    switch (status) {
      case 'sending':
      case 'pending':
        return { icon: '🕐', color: 'inherit', opacity: 0.45 };
      case 'sent':
        return { icon: '✓', color: 'inherit', opacity: 0.5 };
      case 'delivered':
        return { icon: '✓✓', color: 'inherit', opacity: 0.5 };
      case 'seen':
      case 'read':
        return { icon: '✓✓', color: '#53bdeb', opacity: 1 };
      case 'failed':
      case 'network_issue':
        return { icon: '!', color: '#ef4444', opacity: 1 };
      default:
        return { icon: '🕐', color: 'inherit', opacity: 0.45 };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <Typography
      component="span"
      sx={{
        fontSize: '0.65rem',
        color: statusDisplay.color,
        opacity: statusDisplay.opacity,
        fontWeight: 600,
        ml: 0.3,
        lineHeight: 1,
        letterSpacing: '-0.5px'
      }}
    >
      {statusDisplay.icon}
    </Typography>
  );
};

export default MessageStatus;