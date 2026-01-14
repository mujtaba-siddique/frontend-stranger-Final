import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Stack,
  Avatar,
  Fade,
  Backdrop
} from '@mui/material';
import { AccessTime, Refresh } from '@mui/icons-material';

const SessionTimeoutModal = ({ open, onClose, onFindNew, darkMode }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        sx: { backdropFilter: 'blur(10px)' }
      }}
    >
      <Fade in={open}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 400 },
          background: darkMode 
            ? 'rgba(30, 30, 30, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: darkMode 
            ? '1px solid rgba(255,255,255,0.1)' 
            : '1px solid rgba(0,0,0,0.1)',
          borderRadius: 4,
          boxShadow: darkMode 
            ? '0 25px 50px rgba(0,0,0,0.5)' 
            : '0 25px 50px rgba(0,0,0,0.15)',
          p: 4,
          outline: 'none',
          textAlign: 'center'
        }}>
          <Avatar sx={{ 
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 3,
            background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
            fontSize: '2rem'
          }}>
            <AccessTime sx={{ fontSize: '2rem' }} />
          </Avatar>

          <Typography variant="h4" sx={{ 
            color: darkMode ? '#fff' : '#1e293b',
            fontWeight: 700,
            mb: 2
          }}>
            Session Expired
          </Typography>

          <Typography variant="body1" sx={{ 
            color: darkMode ? 'rgba(255,255,255,0.8)' : '#64748b',
            mb: 4,
            lineHeight: 1.6
          }}>
            Your chat session has ended due to 5 minutes of inactivity. 
            Would you like to find a new stranger to chat with?
          </Typography>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={onClose}
              fullWidth
              sx={{
                py: 1.5,
                borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                color: darkMode ? '#fff' : '#64748b',
                '&:hover': {
                  borderColor: '#FF6B6B',
                  background: 'rgba(255, 107, 107, 0.1)'
                }
              }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={onFindNew}
              fullWidth
              sx={{
                py: 1.5,
                background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4ECDC4, #FF6B6B)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Find New Stranger
            </Button>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
};

export default SessionTimeoutModal;