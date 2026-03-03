import React from 'react';
import { Box } from '@mui/material';
import { keyframes } from '@emotion/react';

const bounce = keyframes`
  0%, 60%, 100% { 
    transform: translateY(0);
    opacity: 0.4;
  }
  30% { 
    transform: translateY(-5px);
    opacity: 1;
  }
`;

const TypingIndicator = ({ show, darkMode }) => {
  if (!show) return null;

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'flex-start',
      mb: 1,
      px: { xs: 0, sm: 0.5 },
      animation: 'msgAppear 0.25s cubic-bezier(0.2, 0, 0, 1)'
    }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.2,
          background: darkMode ? '#1e2033' : '#ffffff',
          borderRadius: '10px 10px 10px 3px',
          boxShadow: darkMode
            ? '0 1px 3px rgba(0,0,0,0.35)'
            : '0 1px 2px rgba(0,0,0,0.1)',
          minWidth: 70
        }}
      >
        <Box sx={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: darkMode ? 'rgba(255,255,255,0.4)' : '#90959a',
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
