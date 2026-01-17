import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  IconButton,
  Stack
} from '@mui/material';
import { PersonSearch, Close, LightMode, DarkMode } from '@mui/icons-material';

const WaitingRoom = ({ onCancel, darkMode, onToggleDarkMode, message }) => {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: darkMode 
        ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 30%, #e2e8f0 100%)',
      p: 2
    }}>
      {/* Theme Toggle */}
      <IconButton 
        onClick={onToggleDarkMode}
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          color: darkMode ? '#fff' : '#000',
          '&:hover': {
            background: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
          }
        }}
      >
        {darkMode ? <LightMode /> : <DarkMode />}
      </IconButton>

      <Paper 
        elevation={darkMode ? 0 : 3}
        sx={{ 
          p: 6, 
          textAlign: 'center', 
          maxWidth: 500, 
          width: '100%',
          background: darkMode 
            ? 'rgba(255,255,255,0.05)' 
            : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          border: darkMode 
            ? '1px solid rgba(255,255,255,0.1)' 
            : '1px solid rgba(0,0,0,0.1)',
          borderRadius: 4
        }}
      >
        <Box sx={{ mb: 4 }}>
          <PersonSearch sx={{ 
            fontSize: 80, 
            color: 'primary.main', 
            mb: 3,
            animation: 'pulse 2s infinite'
          }} />
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{ 
              color: darkMode ? '#fff' : '#1e293b',
              fontWeight: 600,
              mb: 2
            }}
          >
            {message || 'Finding Your Match...'}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: darkMode ? 'rgba(255,255,255,0.8)' : '#64748b',
              fontSize: '1.1rem',
              lineHeight: 1.6
            }}
          >
            {message 
              ? 'Please wait while we restore your connection...'
              : 'We\'re connecting you with someone interesting from around the world. This usually takes just a few seconds!'
            }
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <CircularProgress 
            size={60} 
            thickness={4}
            sx={{
              color: 'primary.main',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round'
              }
            }}
          />
        </Box>
        
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="outlined"
            startIcon={<Close />}
            onClick={onCancel}
            sx={{ 
              borderRadius: 25,
              px: 3,
              py: 1.5,
              color: darkMode ? '#fff' : '#64748b',
              borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
              '&:hover': {
                borderColor: '#FF6B6B',
                color: '#FF6B6B',
                background: 'rgba(255, 107, 107, 0.1)'
              }
            }}
          >
            Cancel
          </Button>
        </Stack>
      </Paper>
      
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </Box>
  );
};

export default WaitingRoom;