import React from 'react';
import { Backdrop, CircularProgress, Box, Typography } from '@mui/material';

const LoadingBackdrop = ({ isLoading, state, STATES }) => {
  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={isLoading}
    >
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress color="inherit" />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {state === STATES.CONNECTING ? 'Connecting...' : 'Loading...'}
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default LoadingBackdrop;