import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  Avatar,
  IconButton,
  Autocomplete
} from '@mui/material';
import { PhotoCamera, Close } from '@mui/icons-material';

const interests = [
  'Music', 'Movies', 'Sports', 'Gaming', 'Travel', 'Food', 'Art', 'Technology',
  'Books', 'Photography', 'Dancing', 'Cooking', 'Fitness', 'Nature', 'Fashion',
  'Science', 'History', 'Languages', 'Anime', 'Pets', 'Business', 'Politics'
];

const countries = [
  'United States', 'India', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Japan', 'Brazil', 'Mexico', 'Spain', 'Italy', 'Russia', 'China',
  'South Korea', 'Netherlands', 'Sweden', 'Norway', 'Other'
];

const AdvancedUserProfileModal = ({ open, onClose, onSubmit, darkMode }) => {
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    age: 18,
    gender: '',
    interestedIn: '',
    country: '',
    interests: [],
    bio: '',
    lookingFor: 'friendship',
    languages: [],
    isAnonymous: true,
    shareLocation: false
  });

  const [errors, setErrors] = useState({});

  const validateProfile = () => {
    const newErrors = {};
    
    if (!profile.name.trim()) newErrors.name = 'Name is required';
    if (!profile.username.trim()) newErrors.username = 'Username is required';
    if (profile.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (!profile.gender) newErrors.gender = 'Gender is required';
    if (!profile.interestedIn) newErrors.interestedIn = 'Interest preference is required';
    if (profile.age < 13 || profile.age > 100) newErrors.age = 'Age must be between 13-100';
    if (profile.bio.length > 500) newErrors.bio = 'Bio must be under 500 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateProfile()) {
      onSubmit(profile);
    }
  };

  const handleInterestChange = (event, newValue) => {
    setProfile(prev => ({ ...prev, interests: newValue }));
  };

  const handleLanguageChange = (event, newValue) => {
    setProfile(prev => ({ ...prev, languages: newValue }));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(15,15,35,0.95) 0%, rgba(26,26,46,0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
          borderRadius: 3
        }
      }}
    >
      <DialogTitle sx={{ 
        color: darkMode ? '#fff' : '#1e293b',
        borderBottom: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h5" fontWeight={600}>
          Create Your Profile
        </Typography>
        <IconButton onClick={onClose} sx={{ color: darkMode ? '#fff' : '#1e293b' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Avatar Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 80, height: 80, fontSize: '2rem' }}>
              {profile.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Profile Picture (Optional)
              </Typography>
              <IconButton color="primary" component="label">
                <PhotoCamera />
                <input hidden accept="image/*" type="file" />
              </IconButton>
            </Box>
          </Box>

          {/* Basic Info */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Display Name"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
            />
            <TextField
              label="Username"
              value={profile.username}
              onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
              error={!!errors.username}
              helperText={errors.username}
              fullWidth
            />
          </Box>

          {/* Age Slider */}
          <Box>
            <Typography gutterBottom>Age: {profile.age}</Typography>
            <Slider
              value={profile.age}
              onChange={(e, value) => setProfile(prev => ({ ...prev, age: value }))}
              min={13}
              max={100}
              marks={[
                { value: 18, label: '18' },
                { value: 25, label: '25' },
                { value: 35, label: '35' },
                { value: 50, label: '50' }
              ]}
            />
          </Box>

          {/* Gender & Preferences */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
            <FormControl error={!!errors.gender}>
              <InputLabel>Gender</InputLabel>
              <Select
                value={profile.gender}
                onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value }))}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <FormControl error={!!errors.interestedIn}>
              <InputLabel>Interested In</InputLabel>
              <Select
                value={profile.interestedIn}
                onChange={(e) => setProfile(prev => ({ ...prev, interestedIn: e.target.value }))}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="both">Both</MenuItem>
              </Select>
            </FormControl>

            <FormControl>
              <InputLabel>Looking For</InputLabel>
              <Select
                value={profile.lookingFor}
                onChange={(e) => setProfile(prev => ({ ...prev, lookingFor: e.target.value }))}
              >
                <MenuItem value="friendship">Friendship</MenuItem>
                <MenuItem value="dating">Dating</MenuItem>
                <MenuItem value="casual">Casual Chat</MenuItem>
                <MenuItem value="language">Language Exchange</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Location */}
          <Autocomplete
            options={countries}
            value={profile.country}
            onChange={(e, value) => setProfile(prev => ({ ...prev, country: value }))}
            renderInput={(params) => (
              <TextField {...params} label="Country (Optional)" />
            )}
          />

          {/* Interests */}
          <Autocomplete
            multiple
            options={interests}
            value={profile.interests}
            onChange={handleInterestChange}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  key={option}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Interests (Select up to 5)"
                placeholder="Add interests..."
              />
            )}
            limitTags={5}
          />

          {/* Languages */}
          <Autocomplete
            multiple
            freeSolo
            options={['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi']}
            value={profile.languages}
            onChange={handleLanguageChange}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  key={option}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Languages You Speak"
                placeholder="Add languages..."
              />
            )}
          />

          {/* Bio */}
          <TextField
            label="Bio (Optional)"
            multiline
            rows={3}
            value={profile.bio}
            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            error={!!errors.bio}
            helperText={errors.bio || `${profile.bio.length}/500 characters`}
            placeholder="Tell others about yourself..."
          />

          {/* Privacy Settings */}
          <Box>
            <Typography variant="h6" gutterBottom>Privacy Settings</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={profile.isAnonymous}
                  onChange={(e) => setProfile(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                />
              }
              label="Stay Anonymous (Recommended)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={profile.shareLocation}
                  onChange={(e) => setProfile(prev => ({ ...prev, shareLocation: e.target.checked }))}
                />
              }
              label="Share General Location"
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            px: 4
          }}
        >
          Start Chatting
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdvancedUserProfileModal;