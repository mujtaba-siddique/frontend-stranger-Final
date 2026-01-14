import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, LinearProgress, Card, CardContent,
  Avatar, Chip, Stack, IconButton, Fade, Zoom, CircularProgress
} from '@mui/material';
import {
  Search, Public, Speed, EmojiEmotions, Close, Refresh,
  PersonSearch, ConnectWithoutContact, AutoAwesome, Bolt
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';

const scanAnimation = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
`;

const pulseRing = keyframes`
  0% { transform: scale(0.33); }
  40%, 50% { opacity: 1; }
  100% { opacity: 0; transform: scale(1.33); }
`;

const floatBubble = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-30px) rotate(120deg); }
  66% { transform: translateY(-15px) rotate(240deg); }
`;

const AdvancedWaitingRoom = ({ onCancel, darkMode, onToggleDarkMode }) => {
  const [progress, setProgress] = useState(0);
  const [searchPhase, setSearchPhase] = useState(0);
  const [foundUsers, setFoundUsers] = useState([]);
  const [matchingAnimation, setMatchingAnimation] = useState(false);

  const searchPhases = [
    { text: '🔍 Scanning for perfect matches...', duration: 3000 },
    { text: '🌍 Searching globally...', duration: 2500 },
    { text: '⚡ Analyzing compatibility...', duration: 2000 },
    { text: '🎯 Finding your stranger...', duration: 1500 }
  ];

  const mockUsers = [
    { id: 1, country: '🇺🇸', age: '22', interests: ['🎵', '🎮', '📚'] },
    { id: 2, country: '🇯🇵', age: '25', interests: ['🎨', '🍜', '🎬'] },
    { id: 3, country: '🇬🇧', age: '28', interests: ['⚽', '🎸', '☕'] },
    { id: 4, country: '🇩🇪', age: '24', interests: ['🏔️', '📷', '🍺'] },
    { id: 5, country: '🇫🇷', age: '26', interests: ['🍷', '🎭', '📖'] }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setMatchingAnimation(true);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 500);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const phaseTimer = setInterval(() => {
      setSearchPhase((prev) => (prev + 1) % searchPhases.length);
    }, 3000);

    return () => clearInterval(phaseTimer);
  }, []);

  useEffect(() => {
    const userTimer = setInterval(() => {
      if (foundUsers.length < 5) {
        const newUser = mockUsers[foundUsers.length];
        setFoundUsers(prev => [...prev, newUser]);
      }
    }, 1000);

    return () => clearInterval(userTimer);
  }, [foundUsers.length]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: darkMode 
          ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated Background */}
      {[...Array(15)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
            borderRadius: '50%',
            background: `rgba(255,255,255,${Math.random() * 0.1 + 0.05})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `${floatBubble} ${Math.random() * 20 + 15}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 10}s`
          }}
        />
      ))}

      <Card
        sx={{
          maxWidth: 600,
          width: '90%',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '30px',
          p: 4,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Scanning Effect */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #4ECDC4, transparent)',
            animation: `${scanAnimation} 2s ease-in-out infinite`
          }}
        />

        {/* Header */}
        <Box mb={4}>
          <Box
            sx={{
              position: 'relative',
              display: 'inline-block',
              mb: 3
            }}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                fontSize: '3rem',
                animation: `${pulseRing} 2s ease-out infinite`
              }}
            >
              🔍
            </Avatar>
            
            {/* Pulse Rings */}
            {[...Array(3)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: '2px solid #4ECDC4',
                  animation: `${pulseRing} 2s ease-out infinite`,
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </Box>

          <Typography
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 700,
              mb: 2,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}
          >
            🚀 Finding Your Perfect Stranger
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 400,
              mb: 3
            }}
          >
            {searchPhases[searchPhase].text}
          </Typography>
        </Box>

        {/* Progress Section */}
        <Box mb={4}>
          <Box
            sx={{
              position: 'relative',
              mb: 2
            }}
          >
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 12,
                borderRadius: 6,
                background: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #FF6B6B, #4ECDC4, #FFD700)',
                  borderRadius: 6,
                  animation: progress < 100 ? `${scanAnimation} 1s ease-in-out infinite` : 'none'
                }
              }}
            />
            <Typography
              variant="body2"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white',
                fontWeight: 600,
                textShadow: '0 1px 3px rgba(0,0,0,0.5)'
              }}
            >
              {Math.round(progress)}%
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} justifyContent="center" mb={3}>
            <Chip
              icon={<Speed />}
              label={`⚡ ${Math.round(progress * 10)} users scanned`}
              sx={{
                background: 'rgba(255,215,0,0.2)',
                color: '#FFD700',
                border: '1px solid rgba(255,215,0,0.3)'
              }}
            />
            <Chip
              icon={<Public />}
              label={`🌍 ${foundUsers.length} countries`}
              sx={{
                background: 'rgba(78,205,196,0.2)',
                color: '#4ECDC4',
                border: '1px solid rgba(78,205,196,0.3)'
              }}
            />
          </Stack>
        </Box>

        {/* Found Users Animation */}
        {foundUsers.length > 0 && (
          <Box mb={4}>
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                mb: 2,
                fontWeight: 600
              }}
            >
              👥 Potential Matches Found
            </Typography>
            
            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
              {foundUsers.map((user, index) => (
                <Zoom in key={user.id} timeout={500} style={{ transitionDelay: `${index * 200}ms` }}>
                  <Card
                    sx={{
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '15px',
                      p: 2,
                      minWidth: 100,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        background: 'rgba(255,255,255,0.2)'
                      }
                    }}
                  >
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      {user.country}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'white', fontWeight: 600, mb: 1 }}
                    >
                      Age: {user.age}
                    </Typography>
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      {user.interests.map((interest, i) => (
                        <Typography key={i} variant="body2">
                          {interest}
                        </Typography>
                      ))}
                    </Stack>
                  </Card>
                </Zoom>
              ))}
            </Stack>
          </Box>
        )}

        {/* Matching Animation */}
        {matchingAnimation && (
          <Fade in timeout={1000}>
            <Box mb={4}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                <CircularProgress
                  size={60}
                  sx={{
                    color: '#4ECDC4',
                    animation: `${pulseRing} 1s ease infinite`
                  }}
                />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  color: '#4ECDC4',
                  fontWeight: 700,
                  textShadow: '0 0 20px rgba(78,205,196,0.5)'
                }}
              >
                🎉 Perfect Match Found!
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}
              >
                Connecting you now...
              </Typography>
            </Box>
          </Fade>
        )}

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="outlined"
            onClick={onCancel}
            sx={{
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'white',
              borderRadius: '25px',
              px: 3,
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.5)',
                background: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            ❌ Cancel Search
          </Button>
          
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
              borderRadius: '25px',
              px: 3,
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          >
            ⚡ Boost Search
          </Button>
        </Stack>

        {/* Tips */}
        <Box
          sx={{
            mt: 4,
            p: 3,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              fontStyle: 'italic'
            }}
          >
            💡 <strong>Pro Tip:</strong> Our AI matches you based on interests, age, and location for the best conversations! 
            Average wait time: <span style={{ color: '#4ECDC4' }}>15 seconds</span> ⚡
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default AdvancedWaitingRoom;