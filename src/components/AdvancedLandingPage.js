import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Container, Grid, Card, CardContent,
  IconButton, Fade, Zoom, useTheme, alpha, Stack, Chip
} from '@mui/material';
import {
  Chat, VideoCall, Security, Speed, Public, EmojiEmotions,
  AutoAwesome, Bolt, Shield, Rocket, Star, Favorite
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(78, 205, 196, 0.3); }
  50% { box-shadow: 0 0 40px rgba(78, 205, 196, 0.6); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const AdvancedLandingPage = ({ onStartChat, darkMode, onToggleDarkMode }) => {
  const theme = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  const features = [
    {
      icon: <Bolt sx={{ fontSize: 40, color: '#FFD700' }} />,
      title: '⚡ Ultra-Fast Matching',
      description: 'AI-powered matching in <0.5 seconds',
      gradient: 'linear-gradient(135deg, #FFD700, #FFA500)'
    },
    {
      icon: <VideoCall sx={{ fontSize: 40, color: '#FF6B6B' }} />,
      title: '📹 4K Video Calls',
      description: 'Crystal clear HD video with screen sharing',
      gradient: 'linear-gradient(135deg, #FF6B6B, #FF8E53)'
    },
    {
      icon: <EmojiEmotions sx={{ fontSize: 40, color: '#4ECDC4' }} />,
      title: '😊 Rich Emojis & Reactions',
      description: '1000+ emojis, GIFs, and instant reactions',
      gradient: 'linear-gradient(135deg, #4ECDC4, #44A08D)'
    },
    {
      icon: <Shield sx={{ fontSize: 40, color: '#A8E6CF' }} />,
      title: '🛡️ Complete Privacy',
      description: 'Anonymous chats with auto-cleanup',
      gradient: 'linear-gradient(135deg, #A8E6CF, #88D8A3)'
    },
    {
      icon: <Public sx={{ fontSize: 40, color: '#FFB6C1' }} />,
      title: '🌍 Global Connections',
      description: 'Connect with strangers worldwide instantly',
      gradient: 'linear-gradient(135deg, #FFB6C1, #FFA0AC)'
    },
    {
      icon: <AutoAwesome sx={{ fontSize: 40, color: '#DDA0DD' }} />,
      title: '✨ Smart Features',
      description: 'File sharing, voice messages, live typing',
      gradient: 'linear-gradient(135deg, #DDA0DD, #D8BFD8)'
    }
  ];

  const stats = [
    { number: '1M+', label: '👥 Active Users', color: '#4ECDC4' },
    { number: '50M+', label: '💬 Messages Daily', color: '#FF6B6B' },
    { number: '99.9%', label: '⚡ Uptime', color: '#FFD700' },
    { number: '<0.5s', label: '🚀 Match Speed', color: '#A8E6CF' }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: darkMode 
          ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        backgroundSize: '400% 400%',
        animation: `${gradientShift} 15s ease infinite`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.1) 0%, transparent 50%)`,
          pointerEvents: 'none',
          transition: 'all 0.3s ease'
        }}
      />

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: Math.random() * 10 + 5,
            height: Math.random() * 10 + 5,
            borderRadius: '50%',
            background: `rgba(255,255,255,${Math.random() * 0.3 + 0.1})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `${floatingAnimation} ${Math.random() * 10 + 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
        {/* Header */}
        <Fade in timeout={1000}>
          <Box textAlign="center" mb={8}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '3rem', md: '5rem' },
                fontWeight: 900,
                background: 'linear-gradient(45deg, #FFD700, #FF6B6B, #4ECDC4, #A8E6CF)',
                backgroundSize: '400% 400%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                animation: `${gradientShift} 3s ease infinite`,
                textShadow: '0 0 30px rgba(255,255,255,0.5)',
                mb: 2
              }}
            >
              🚀 StrangerChat Pro
            </Typography>
            
            <Typography
              variant="h4"
              sx={{
                color: 'white',
                fontWeight: 300,
                mb: 4,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}
            >
              ✨ The World's Most Advanced Anonymous Chat Platform
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" mb={4}>
              {['🔥 Trending', '⚡ Ultra Fast', '🛡️ 100% Safe', '🌍 Global'].map((tag, i) => (
                <Chip
                  key={i}
                  label={tag}
                  sx={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    fontWeight: 600
                  }}
                />
              ))}
            </Stack>

            <Button
              variant="contained"
              size="large"
              onClick={onStartChat}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              sx={{
                fontSize: '1.5rem',
                py: 2,
                px: 6,
                borderRadius: '50px',
                background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                backgroundSize: '200% 200%',
                animation: `${gradientShift} 2s ease infinite, ${pulseGlow} 2s ease infinite`,
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.3s ease',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                '&:hover': {
                  boxShadow: '0 15px 40px rgba(0,0,0,0.4)'
                }
              }}
            >
              🎯 Start Chatting Now
            </Button>
          </Box>
        </Fade>

        {/* Stats Section */}
        <Zoom in timeout={1500}>
          <Grid container spacing={3} mb={8}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Card
                  sx={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '20px',
                    textAlign: 'center',
                    py: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      color: stat.color,
                      fontWeight: 900,
                      textShadow: `0 0 20px ${stat.color}50`
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                    {stat.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Zoom>

        {/* Features Grid */}
        <Grid container spacing={4} mb={8}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Zoom in timeout={1000 + index * 200}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '25px',
                    p: 3,
                    transition: 'all 0.4s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-15px) scale(1.02)',
                      boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                      background: 'rgba(255,255,255,0.15)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '20px',
                      background: feature.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      animation: `${floatingAnimation} 6s ease-in-out infinite`,
                      animationDelay: `${index * 0.5}s`
                    }}
                  >
                    {feature.icon}
                  </Box>
                  
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'white',
                      fontWeight: 700,
                      mb: 2,
                      textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                    }}
                  >
                    {feature.title}
                  </Typography>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255,255,255,0.8)',
                      lineHeight: 1.6
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action */}
        <Fade in timeout={2000}>
          <Box
            textAlign="center"
            sx={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '30px',
              p: 6,
              mt: 8
            }}
          >
            <Typography
              variant="h3"
              sx={{
                color: 'white',
                fontWeight: 700,
                mb: 3,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}
            >
              🌟 Ready to Meet Amazing Strangers?
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                mb: 4,
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Join millions of users worldwide in the most advanced, secure, and fun anonymous chat experience ever created! 🚀
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={onStartChat}
              sx={{
                fontSize: '1.3rem',
                py: 2,
                px: 5,
                borderRadius: '50px',
                background: 'linear-gradient(45deg, #4ECDC4, #44A08D)',
                animation: `${pulseGlow} 3s ease infinite`,
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 15px 40px rgba(0,0,0,0.4)'
                }
              }}
            >
              🎉 Let's Chat Now!
            </Button>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default AdvancedLandingPage;