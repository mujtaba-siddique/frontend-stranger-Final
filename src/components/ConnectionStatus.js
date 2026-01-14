import React from 'react';
import { Box, Typography } from '@mui/material';

const ConnectionStatus = ({ connectionStatus, state, STATES }) => {
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'success';
      case 'matched': return 'primary';
      case 'connecting': return 'warning';
      case 'error': return 'error';
      case 'timeout': return 'error';
      default: return 'default';
    }
  };
  
  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'matched': return 'Chatting';
      case 'connecting': return 'Connecting...';
      case 'waiting': return 'Finding stranger...';
      case 'error': return 'Connection Error';
      case 'timeout': return 'Session Timeout';
      default: return 'Disconnected';
    }
  };

  if (state === STATES.LANDING) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: 'background.paper',
        px: 2,
        py: 1,
        borderRadius: 2,
        boxShadow: 2
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: `${getConnectionStatusColor()}.main`,
          animation: connectionStatus === 'connecting' ? 'pulse 1.5s infinite' : 'none'
        }}
      />
      <Typography variant="caption" color="text.secondary">
        {getConnectionStatusText()}
      </Typography>
    </Box>
  );
};

export default ConnectionStatus;