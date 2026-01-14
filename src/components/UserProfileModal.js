import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Avatar,
  Fade,
  Backdrop
} from '@mui/material';
import { Person, Close } from '@mui/icons-material';

const UserProfileModal = ({ open, onClose, onSubmit, darkMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    gender: '',
    interestedIn: ''
  });

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    if (formData.name && formData.username && formData.gender && formData.interestedIn) {
      console.log('All fields valid, calling onSubmit');
      onSubmit(formData);
    } else {
      console.log('Missing fields:', {
        name: !formData.name,
        username: !formData.username,
        gender: !formData.gender,
        interestedIn: !formData.interestedIn
      });
      alert('Please fill all fields');
    }
  };

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
          width: { xs: '90%', sm: 450 },
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
          outline: 'none'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ 
              color: darkMode ? '#fff' : '#1e293b',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Avatar sx={{ 
                background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                width: 50,
                height: 50
              }}>
                <Person />
              </Avatar>
              Quick Match Setup
            </Typography>
            <Button
              onClick={onClose}
              sx={{ 
                minWidth: 'auto',
                p: 1,
                color: darkMode ? '#fff' : '#64748b'
              }}
            >
              <Close />
            </Button>
          </Box>

          <Typography variant="body1" sx={{ 
            color: darkMode ? 'rgba(255,255,255,0.8)' : '#64748b',
            mb: 4,
            textAlign: 'center'
          }}>
Set your preferences for instant matching!
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={handleChange('name')}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: darkMode 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(255,255,255,0.8)',
                    '& fieldset': {
                      borderColor: darkMode 
                        ? 'rgba(255,255,255,0.2)' 
                        : 'rgba(0,0,0,0.2)'
                    },
                    '&:hover fieldset': {
                      borderColor: '#FF6B6B'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FF6B6B'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: darkMode ? 'rgba(255,255,255,0.7)' : '#64748b'
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#FF6B6B'
                  },
                  '& .MuiOutlinedInput-input': {
                    color: darkMode ? '#fff' : '#1e293b'
                  }
                }}
              />

              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={handleChange('username')}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: darkMode 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(255,255,255,0.8)',
                    '& fieldset': {
                      borderColor: darkMode 
                        ? 'rgba(255,255,255,0.2)' 
                        : 'rgba(0,0,0,0.2)'
                    },
                    '&:hover fieldset': {
                      borderColor: '#FF6B6B'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FF6B6B'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: darkMode ? 'rgba(255,255,255,0.7)' : '#64748b'
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#FF6B6B'
                  },
                  '& .MuiOutlinedInput-input': {
                    color: darkMode ? '#fff' : '#1e293b'
                  }
                }}
              />

              <FormControl fullWidth required>
                <InputLabel sx={{ 
                  color: darkMode ? 'rgba(255,255,255,0.7)' : '#64748b',
                  '&.Mui-focused': { color: '#FF6B6B' }
                }}>
                  Gender
                </InputLabel>
                <Select
                  value={formData.gender}
                  onChange={handleChange('gender')}
                  label="Gender"
                  sx={{
                    background: darkMode 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(255,255,255,0.8)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: darkMode 
                        ? 'rgba(255,255,255,0.2)' 
                        : 'rgba(0,0,0,0.2)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#FF6B6B'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#FF6B6B'
                    },
                    '& .MuiSelect-select': {
                      color: darkMode ? '#fff' : '#1e293b'
                    }
                  }}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel sx={{ 
                  color: darkMode ? 'rgba(255,255,255,0.7)' : '#64748b',
                  '&.Mui-focused': { color: '#FF6B6B' }
                }}>
                  Interested In
                </InputLabel>
                <Select
                  value={formData.interestedIn}
                  onChange={handleChange('interestedIn')}
                  label="Interested In"
                  sx={{
                    background: darkMode 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(255,255,255,0.8)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: darkMode 
                        ? 'rgba(255,255,255,0.2)' 
                        : 'rgba(0,0,0,0.2)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#FF6B6B'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#FF6B6B'
                    },
                    '& .MuiSelect-select': {
                      color: darkMode ? '#fff' : '#1e293b'
                    }
                  }}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="both">Both</MenuItem>
                </Select>
              </FormControl>

              <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
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
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={!formData.name || !formData.username || !formData.gender || !formData.interestedIn}
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #4ECDC4, #FF6B6B)',
                      transform: 'translateY(-2px)'
                    },
                    '&:disabled': {
                      background: 'rgba(128, 128, 128, 0.5)',
                      color: 'rgba(255, 255, 255, 0.5)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Find Stranger
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Fade>
    </Modal>
  );
};

export default UserProfileModal;