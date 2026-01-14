import React from 'react';
import { Box } from '@mui/material';
import { Check, DoneAll, Schedule } from '@mui/icons-material';

const MessageStatus = ({ status, isOwn, isOnline = true }) => {
  if (!isOwn) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return isOnline ? 
          <Schedule sx={{ fontSize: 14, color: 'grey.500' }} /> :
          <Schedule sx={{ fontSize: 14, color: 'error.main' }} />;
      case 'pending':
        return isOnline ? 
          <Schedule sx={{ fontSize: 14, color: 'grey.500' }} /> :
          <Schedule sx={{ fontSize: 14, color: 'error.main' }} />;
      case 'sent':
        return isOnline ? 
          <Check sx={{ fontSize: 14, color: 'grey.500' }} /> :
          <Schedule sx={{ fontSize: 14, color: 'error.main' }} />;
      case 'delivered':
        return <DoneAll sx={{ fontSize: 14, color: 'grey.500' }} />;
      case 'seen':
      case 'read':
        return <DoneAll sx={{ fontSize: 14, color: 'primary.main' }} />;
      case 'failed':
      case 'network_issue':
        return <Schedule sx={{ fontSize: 14, color: 'error.main' }} />;
      default:
        return <Schedule sx={{ fontSize: 14, color: 'error.main' }} />;
    }
  };

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 0.5 }}>
      {getStatusIcon()}
    </Box>
  );
};

export default MessageStatus;