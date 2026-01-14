import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const NotificationSnackbar = ({ notification, onClose }) => {
  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={onClose}
        severity={notification.severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;