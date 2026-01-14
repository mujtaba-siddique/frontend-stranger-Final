import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { keyframes } from '@emotion/react';

const bounce = keyframes`
  0%, 60%, 100% { 
    transform: translateY(0);
    opacity: 0.4;
  }
  30% { 
    transform: translateY(-8px);
    opacity: 1;
  }
`;

const TypingIndicator = ({ show }) => {
  if (!show) return null;
  
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'flex-start', 
      mb: 3,
      alignItems: 'flex-end',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <Avatar sx={{ 
        width: 40, 
        height: 40, 
        mr: 2,
        background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
        boxShadow: '0 0 15px rgba(255, 107, 107, 0.4)',
        fontSize: '18px'
      }}>
        🎭
      </Avatar>
      <Box
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          p: 3,
          px: 4,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '25px 25px 25px 8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          color: 'white',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          },
          transition: 'all 0.3s ease'
        }}
      >
        <Typography variant="body2" sx={{ 
          fontStyle: 'italic',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '14px'
        }}>
          ✨ typing something
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #ff6b6b, #feca57)',
                boxShadow: '0 0 10px rgba(255, 107, 107, 0.5)',
                animation: `${bounce} 1.4s infinite ease-in-out`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default TypingIndicator;
