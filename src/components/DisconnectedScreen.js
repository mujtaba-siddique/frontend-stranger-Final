import React from 'react';
import { Container, Paper, Typography, Box, Button } from '@mui/material';
import { Warning } from '@mui/icons-material';

const DisconnectedScreen = ({ 
  retryCount, 
  maxRetries, 
  isLoading, 
  onRetry, 
  onGoHome,
  darkMode = true
}) => {
  return (
    <Container maxWidth="sm" sx={{ 
      mt: 4, 
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Paper sx={{ 
        p: 4,
        background: darkMode 
          ? 'rgba(255,255,255,0.05)' 
          : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        border: darkMode 
          ? '1px solid rgba(255,255,255,0.1)' 
          : '1px solid rgba(0,0,0,0.1)',
        boxShadow: darkMode 
          ? '0 25px 50px rgba(0,0,0,0.3)' 
          : '0 25px 50px rgba(0,0,0,0.15)'
      }}>
        <Warning sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom sx={{ 
          color: darkMode ? '#fff' : '#1e293b',
          fontWeight: 600
        }}>
          Connection Lost
        </Typography>
        <Typography variant="body1" sx={{ 
          mb: 3,
          color: darkMode ? 'rgba(255,255,255,0.8)' : '#64748b'
        }}>
          {retryCount >= maxRetries 
            ? 'Unable to connect after multiple attempts. Please check your internet connection.'
            : 'Lost connection to the server. This might be due to network issues.'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={onRetry}
            disabled={isLoading}
            sx={{
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
              '&:hover': {
                background: 'linear-gradient(45deg, #4ECDC4, #FF6B6B)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading ? 'Retrying...' : 'Retry Connection'}
          </Button>
          <Button 
            variant="outlined" 
            onClick={onGoHome}
            sx={{
              borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
              color: darkMode ? '#fff' : '#64748b',
              '&:hover': {
                borderColor: '#FF6B6B',
                background: 'rgba(255, 107, 107, 0.1)'
              }
            }}
          >
            Go Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default DisconnectedScreen;