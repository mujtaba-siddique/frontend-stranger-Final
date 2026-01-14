import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  IconButton,
  Fade,
  Slide,
  Zoom,
  Avatar,
  Chip,
  Stack,
  Paper,
  Rating
} from '@mui/material';
import {
  Chat,
  Security,
  Speed,
  Public,
  LightMode,
  DarkMode,
  PlayArrow,
  Shield,
  VideoCall,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  ArrowDownward
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(255, 107, 107, 0.5); }
  50% { box-shadow: 0 0 40px rgba(255, 107, 107, 0.8); }
`;

const LandingPage = ({ onStartChat, darkMode, onToggleDarkMode }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box sx={{ 
      background: darkMode 
        ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 30%, #e2e8f0 100%)',
      minHeight: '100vh'
    }}>
      {/* Floating Nav */}
      <Box sx={{ 
        position: 'fixed', 
        top: { xs: 10, sm: 15, md: 20 }, 
        left: '50%', 
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: darkMode ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: { xs: 25, sm: 35, md: 50 },
        px: { xs: 2, sm: 2.5, md: 3 },
        py: { xs: 0.8, sm: 1, md: 1.2 },
        border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
        boxShadow: darkMode ? 'none' : '0 8px 32px rgba(0,0,0,0.1)',
        display: { xs: 'none', sm: 'block' }
      }}>
        <Stack direction="row" spacing={{ xs: 1.5, sm: 2, md: 3 }} alignItems="center">
          {['home', 'about', 'testimonials', 'features'].map((section) => (
            <Button
              key={section}
              onClick={() => scrollToSection(section)}
              size={window.innerWidth < 900 ? 'small' : 'medium'}
              sx={{ 
                color: darkMode ? '#fff' : '#334155', 
                textTransform: 'capitalize',
                minWidth: 'auto',
                px: { xs: 1, sm: 1.5, md: 2 },
                py: { xs: 0.5, sm: 0.8, md: 1 },
                fontWeight: 500,
                fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                '&:hover': { 
                  color: '#FF6B6B',
                  background: 'rgba(255, 107, 107, 0.1)'
                }
              }}
            >
              {section}
            </Button>
          ))}
          <IconButton 
            onClick={onToggleDarkMode} 
            size={window.innerWidth < 900 ? 'small' : 'medium'}
            sx={{ 
              color: darkMode ? '#fff' : '#334155',
              p: { xs: 0.5, sm: 0.8, md: 1 }
            }}
          >
            {darkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Stack>
      </Box>

      {/* Mobile Menu Button */}
      <Box sx={{ 
        position: 'fixed',
        top: 15,
        right: 15,
        zIndex: 1001,
        display: { xs: 'block', sm: 'none' }
      }}>
        <IconButton 
          onClick={onToggleDarkMode}
          sx={{
            background: darkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
            color: darkMode ? '#fff' : '#334155',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              background: darkMode ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,1)'
            }
          }}
        >
          {darkMode ? <LightMode /> : <DarkMode />}
        </IconButton>
      </Box>

      {/* Hero Section */}
      <Box id="home" sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 8, sm: 10, md: 12 },
        px: { xs: 2, sm: 3, md: 2, lg: 1 }
      }}>
        {/* Animated Background Elements */}
        <Box sx={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: darkMode 
            ? 'rgba(138, 43, 226, 0.3)' 
            : 'rgba(255, 107, 107, 0.2)',
          animation: `${float} 6s ease-in-out infinite`,
          filter: 'blur(40px)'
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: darkMode 
            ? 'rgba(255, 20, 147, 0.3)' 
            : 'rgba(78, 205, 196, 0.2)',
          animation: `${float} 8s ease-in-out infinite reverse`,
          filter: 'blur(60px)'
        }} />

        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in={isVisible} timeout={1000}>
                <Box>
                  <Typography 
                    variant="h1" 
                    sx={{ 
                      fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' },
                      fontWeight: 900,
                      mb: { xs: 2, sm: 2.5, md: 3 },
                      background: darkMode 
                        ? 'linear-gradient(45deg, #8A2BE2, #FF1493, #00CED1)'
                        : 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: { xs: 1.2, sm: 1.15, md: 1.1 },
                      textAlign: { xs: 'center', md: 'left' }
                    }}
                  >
                    Stranger Chat
                  </Typography>
                  
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      color: darkMode ? '#fff' : '#475569',
                      mb: { xs: 2, sm: 3, md: 4 },
                      fontWeight: 300,
                      opacity: 0.9,
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      textAlign: { xs: 'center', md: 'left' }
                    }}
                  >
                    Connect. Discover. Experience.
                  </Typography>
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: darkMode ? 'rgba(255,255,255,0.8)' : '#64748b',
                      mb: { xs: 4, sm: 5, md: 6 },
                      lineHeight: 1.6,
                      maxWidth: { xs: '100%', md: 500 },
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                      textAlign: { xs: 'center', md: 'left' }
                    }}
                  >
                    Meet fascinating people from around the globe through anonymous, 
                    secure conversations. Your next great friendship is just one click away.
                  </Typography>

                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={{ xs: 2, sm: 3 }}
                    alignItems={{ xs: 'center', sm: 'flex-start' }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      onClick={onStartChat}
                      startIcon={<PlayArrow />}
                      sx={{
                        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                        py: { xs: 1.5, sm: 2, md: 2.5 },
                        px: { xs: 3, sm: 4, md: 5 },
                        borderRadius: 50,
                        minWidth: { xs: '200px', sm: 'auto' },
                        background: darkMode 
                          ? 'linear-gradient(45deg, #8A2BE2, #FF1493)'
                          : 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                        animation: `${glow} 2s ease-in-out infinite`,
                        '&:hover': {
                          transform: { xs: 'scale(1.02)', sm: 'translateY(-2px)', md: 'translateY(-3px)' },
                          background: darkMode 
                            ? 'linear-gradient(45deg, #FF1493, #8A2BE2)'
                            : 'linear-gradient(45deg, #4ECDC4, #FF6B6B)',
                        },
                        '&:active': {
                          transform: { xs: 'scale(0.98)', sm: 'scale(0.98)' }
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Start Chatting
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => scrollToSection('about')}
                      sx={{
                        color: darkMode ? '#fff' : '#FF6B6B',
                        borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(255, 107, 107, 0.3)',
                        py: { xs: 1.5, sm: 2, md: 2.5 },
                        px: { xs: 3, sm: 4, md: 5 },
                        borderRadius: 50,
                        minWidth: { xs: '200px', sm: 'auto' },
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                        '&:hover': {
                          borderColor: '#FF6B6B',
                          background: 'rgba(255, 107, 107, 0.1)',
                          transform: { xs: 'scale(1.02)', sm: 'translateY(-1px)' }
                        },
                        '&:active': {
                          transform: { xs: 'scale(0.98)', sm: 'scale(0.98)' }
                        }
                      }}
                    >
                      Learn More
                    </Button>
                  </Stack>
                </Box>
              </Fade>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Zoom in={isVisible} timeout={1500}>
                <Box sx={{ textAlign: 'center', mt: { xs: 4, md: 0 } }}>
                  <Box sx={{
                    width: { xs: 200, sm: 250, md: 300 },
                    height: { xs: 200, sm: 250, md: 300 },
                    borderRadius: '50%',
                    background: darkMode 
                      ? 'linear-gradient(45deg, #8A2BE2, #FF1493, #00CED1)'
                      : 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    animation: `${float} 4s ease-in-out infinite`,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: { xs: -15, sm: -18, md: -20 },
                      borderRadius: '50%',
                      background: darkMode 
                        ? 'linear-gradient(45deg, #8A2BE2, #FF1493, #00CED1)'
                        : 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1)',
                      filter: 'blur(20px)',
                      opacity: 0.7,
                      zIndex: -1
                    }
                  }}>
                    <Chat sx={{ fontSize: { xs: 80, sm: 100, md: 120 }, color: '#fff' }} />
                  </Box>
                  
                  <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mt: { xs: 3, sm: 4 } }}>
                    {[
                      { number: "50K+", label: "Users" },
                      { number: "200K+", label: "Chats" },
                      { number: "180+", label: "Countries" }
                    ].map((stat, index) => (
                      <Grid item xs={4} key={index}>
                        <Paper sx={{
                          background: darkMode 
                            ? 'rgba(255,255,255,0.1)' 
                            : 'rgba(255,255,255,0.8)',
                          backdropFilter: 'blur(10px)',
                          p: { xs: 1, sm: 1.5, md: 2 },
                          textAlign: 'center',
                          border: darkMode 
                            ? '1px solid rgba(255,255,255,0.1)' 
                            : '1px solid rgba(0,0,0,0.1)',
                          boxShadow: darkMode ? 'none' : '0 4px 20px rgba(0,0,0,0.1)',
                          borderRadius: { xs: 2, sm: 3, md: 4 }
                        }}>
                          <Typography 
                            variant="h5" 
                            sx={{ 
                              color: '#FF6B6B', 
                              fontWeight: 800,
                              fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' }
                            }}
                          >
                            {stat.number}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: darkMode ? '#fff' : '#64748b',
                              fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
                            }}
                          >
                            {stat.label}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Zoom>
            </Grid>
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: { xs: 6, sm: 7, md: 8 } }}>
            <IconButton 
              onClick={() => scrollToSection('about')}
              sx={{ 
                color: darkMode ? '#fff' : '#FF6B6B',
                animation: `${float} 2s ease-in-out infinite`,
                display: { xs: 'none', sm: 'inline-flex' }
              }}
            >
              <ArrowDownward sx={{ fontSize: { xs: 30, sm: 35, md: 40 } }} />
            </IconButton>
          </Box>
        </Container>
      </Box>

      {/* Live Stats Banner */}
      <Box sx={{ 
        py: { xs: 3, sm: 4, md: 5 }, 
        px: { xs: 2, sm: 3, md: 2, lg: 1 },
        background: darkMode 
          ? 'linear-gradient(90deg, #8A2BE2, #FF1493)' 
          : 'linear-gradient(90deg, #FF6B6B, #4ECDC4)',
        textAlign: 'center'
      }}>
        <Container maxWidth="xl">
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#fff', 
              mb: { xs: 1.5, sm: 2, md: 2.5 }, 
              fontWeight: 600,
              fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.5rem' }
            }}
          >
            🔥 Live Activity
          </Typography>
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {[
              { icon: '👥', number: '1,247', label: 'Online Now' },
              { icon: '💬', number: '8,932', label: 'Chats Today' },
              { icon: '⚡', number: '2.3s', label: 'Avg Match Time' },
              { icon: '🌍', number: '89', label: 'Countries Active' }
            ].map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box>
                  <Typography variant="h4" sx={{ mb: 1 }}>{stat.icon}</Typography>
                  <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800 }}>
                    {stat.number}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="xl">
          <Typography 
            variant="h2" 
            sx={{ 
              textAlign: 'center',
              mb: 8,
              color: darkMode ? '#fff' : '#1e293b',
              fontWeight: 800
            }}
          >
            How It Works
          </Typography>
          
          <Grid container spacing={4} alignItems="center">
            {[
              { 
                step: '01', 
                title: 'Click Start', 
                desc: 'No signup, no personal info required',
                icon: '🚀'
              },
              { 
                step: '02', 
                title: 'Get Matched', 
                desc: 'AI finds you the perfect stranger instantly',
                icon: '🎯'
              },
              { 
                step: '03', 
                title: 'Start Chatting', 
                desc: 'Anonymous, safe, and fun conversations',
                icon: '💬'
              }
            ].map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Fade in={isVisible} timeout={1500 + index * 300}>
                  <Box sx={{ textAlign: 'center', position: 'relative' }}>
                    <Box sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: darkMode 
                        ? `linear-gradient(45deg, #8A2BE2, #FF1493)` 
                        : `linear-gradient(45deg, #FF6B6B, #4ECDC4)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      fontSize: '3rem',
                      position: 'relative',
                      '&::before': {
                        content: `"${item.step}"`,
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: '#fff',
                        color: '#FF6B6B',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }
                    }}>
                      {item.icon}
                    </Box>
                    <Typography variant="h5" sx={{ color: darkMode ? '#fff' : '#1e293b', mb: 2, fontWeight: 600 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: darkMode ? 'rgba(255,255,255,0.8)' : '#64748b' }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* About Section */}
      <Box id="about" sx={{ py: 10, background: darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(248,250,252,0.8)' }}>
        <Container maxWidth="xl">
          <Typography 
            variant="h2" 
            sx={{ 
              textAlign: 'center',
              mb: 8,
              color: darkMode ? '#fff' : '#1e293b',
              fontWeight: 800
            }}
          >
            Why Choose Us?
          </Typography>
          
          <Grid container spacing={4}>
            {[
              {
                icon: <Security sx={{ fontSize: 50 }} />,
                title: "100% Anonymous",
                description: "Complete privacy protection. No personal data required.",
                color: "#FF6B6B"
              },
              {
                icon: <Speed sx={{ fontSize: 50 }} />,
                title: "Instant Matching",
                description: "Connect with strangers in under 3 seconds worldwide.",
                color: "#4ECDC4"
              },
              {
                icon: <Public sx={{ fontSize: 50 }} />,
                title: "Global Reach",
                description: "180+ countries, 24/7 active community members.",
                color: "#45B7D1"
              },
              {
                icon: <Shield sx={{ fontSize: 50 }} />,
                title: "Safe Environment",
                description: "AI-powered moderation keeps conversations clean.",
                color: "#96CEB4"
              }
            ].map((feature, index) => (
              <Grid item xs={12} md={3} key={index}>
                <Slide direction="up" in={isVisible} timeout={1000 + index * 200}>
                  <Card sx={{
                    height: '100%',
                    background: darkMode 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: darkMode 
                      ? '1px solid rgba(255,255,255,0.1)' 
                      : '1px solid rgba(0,0,0,0.1)',
                    textAlign: 'center',
                    p: 3,
                    boxShadow: darkMode ? 'none' : '0 4px 20px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      background: darkMode 
                        ? 'rgba(255,255,255,0.1)' 
                        : 'rgba(255,255,255,1)',
                      borderColor: feature.color,
                      boxShadow: darkMode 
                        ? `0 20px 40px ${feature.color}20` 
                        : '0 8px 30px rgba(0,0,0,0.15)'
                    },
                    transition: 'all 0.3s ease'
                  }}>
                    <Avatar sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 3,
                      background: feature.color,
                      boxShadow: `0 0 30px ${feature.color}50`
                    }}>
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h5" sx={{ color: darkMode ? '#fff' : '#1e293b', mb: 2, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: darkMode ? 'rgba(255,255,255,0.8)' : '#64748b' }}>
                      {feature.description}
                    </Typography>
                  </Card>
                </Slide>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box id="testimonials" sx={{ py: 10 }}>
        <Container maxWidth="xl">
          <Typography 
            variant="h2" 
            sx={{ 
              textAlign: 'center',
              mb: 8,
              color: darkMode ? '#fff' : '#1e293b',
              fontWeight: 800
            }}
          >
            User Stories
          </Typography>
          
          <Grid container spacing={4}>
            {[
              {
                name: "Emma Wilson",
                rating: 5,
                comment: "Made amazing friends from Japan and Brazil! This platform changed my perspective on global connections.",
                avatar: "E",
                country: "USA"
              },
              {
                name: "Raj Patel",
                rating: 5,
                comment: "Perfect for practicing English with native speakers. Safe, anonymous, and incredibly fun!",
                avatar: "R",
                country: "India"
              },
              {
                name: "Sofia Garcia",
                rating: 4,
                comment: "Love the instant connections! Met someone who became my language exchange partner.",
                avatar: "S",
                country: "Spain"
              }
            ].map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Zoom in={isVisible} timeout={1500 + index * 300}>
                  <Card sx={{
                    background: darkMode 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: darkMode 
                      ? '1px solid rgba(255,255,255,0.1)' 
                      : '1px solid rgba(0,0,0,0.1)',
                    p: 4,
                    textAlign: 'center',
                    boxShadow: darkMode ? 'none' : '0 4px 20px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      background: darkMode 
                        ? 'rgba(255,255,255,0.1)' 
                        : 'rgba(255,255,255,1)',
                      boxShadow: darkMode 
                        ? 'none' 
                        : '0 8px 30px rgba(0,0,0,0.15)'
                    },
                    transition: 'all 0.3s ease'
                  }}>
                    <Avatar sx={{
                      width: 70,
                      height: 70,
                      mx: 'auto',
                      mb: 2,
                      background: darkMode 
                        ? 'linear-gradient(45deg, #8A2BE2, #FF1493)'
                        : 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                      fontSize: '2rem',
                      fontWeight: 700
                    }}>
                      {testimonial.avatar}
                    </Avatar>
                    <Typography variant="h6" sx={{ color: darkMode ? '#fff' : '#1e293b', mb: 1 }}>
                      {testimonial.name}
                    </Typography>
                    <Chip label={testimonial.country} size="small" sx={{ mb: 2, background: '#FF6B6B', color: '#fff' }} />
                    <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                    <Typography variant="body1" sx={{ color: darkMode ? 'rgba(255,255,255,0.8)' : '#64748b', fontStyle: 'italic' }}>
                      "{testimonial.comment}"
                    </Typography>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="xl">
          <Typography 
            variant="h2" 
            sx={{ 
              textAlign: 'center',
              mb: 8,
              color: darkMode ? '#fff' : '#1e293b',
              fontWeight: 800
            }}
          >
            Frequently Asked Questions
          </Typography>
          
          <Grid container spacing={3} justifyContent="center">
            {[
              {
                q: "Is Stranger Chat really anonymous?",
                a: "Yes! We don't store any personal information. No names, emails, or phone numbers required."
              },
              {
                q: "How do you ensure user safety?",
                a: "We use AI-powered moderation, report systems, and can instantly disconnect inappropriate users."
              },
              {
                q: "Can I choose who I chat with?",
                a: "Our smart matching algorithm connects you with compatible strangers based on interests and language."
              },
              {
                q: "Is the service free?",
                a: "Yes! Stranger Chat is completely free with no hidden costs or premium subscriptions."
              }
            ].map((faq, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Slide direction="up" in={isVisible} timeout={1000 + index * 100}>
                  <Paper sx={{
                    p: 3,
                    background: darkMode 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(255,255,255,0.9)',
                    border: darkMode 
                      ? '1px solid rgba(255,255,255,0.1)' 
                      : '1px solid rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: darkMode 
                        ? '0 10px 30px rgba(255, 107, 107, 0.2)' 
                        : '0 10px 30px rgba(0,0,0,0.1)'
                    },
                    transition: 'all 0.3s ease'
                  }}>
                    <Typography variant="h6" sx={{ 
                      color: darkMode ? '#fff' : '#1e293b', 
                      mb: 2, 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        background: '#FF6B6B', 
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 800
                      }}>
                        ?
                      </Box>
                      {faq.q}
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: darkMode ? 'rgba(255,255,255,0.8)' : '#64748b',
                      lineHeight: 1.6
                    }}>
                      {faq.a}
                    </Typography>
                  </Paper>
                </Slide>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Upcoming Features */}
      <Box id="features" sx={{ py: 10, background: darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(248,250,252,0.8)' }}>
        <Container maxWidth="xl">
          <Typography 
            variant="h2" 
            sx={{ 
              textAlign: 'center',
              mb: 8,
              color: darkMode ? '#fff' : '#1e293b',
              fontWeight: 800
            }}
          >
            Coming Soon
          </Typography>
          
          <Grid container spacing={6} justifyContent="center">
            {[
              {
                icon: <VideoCall sx={{ fontSize: 60 }} />,
                title: "Video Calls",
                description: "Face-to-face anonymous conversations with advanced privacy filters and real-time translation.",
                status: "Beta Testing",
                color: "#4ECDC4"
              },
              {
                icon: <Phone sx={{ fontSize: 60 }} />,
                title: "Voice Calls",
                description: "Crystal clear voice conversations with voice modulation for complete anonymity.",
                status: "Development",
                color: "#FF6B6B"
              }
            ].map((feature, index) => (
              <Grid item xs={12} md={5} key={index}>
                <Slide direction={index % 2 === 0 ? 'left' : 'right'} in={isVisible} timeout={2000}>
                  <Card sx={{
                    background: darkMode 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: darkMode 
                      ? '1px solid rgba(255,255,255,0.1)' 
                      : '1px solid rgba(0,0,0,0.1)',
                    p: 5,
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: darkMode ? 'none' : '0 4px 20px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-15px)',
                      background: darkMode 
                        ? 'rgba(255,255,255,0.1)' 
                        : 'rgba(255,255,255,1)',
                      borderColor: feature.color,
                      boxShadow: darkMode 
                        ? `0 25px 50px ${feature.color}20` 
                        : '0 12px 40px rgba(0,0,0,0.15)'
                    },
                    transition: 'all 0.4s ease',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: feature.color
                    }
                  }}>
                    <Box sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: `linear-gradient(45deg, ${feature.color}, ${feature.color}80)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      boxShadow: `0 0 40px ${feature.color}50`
                    }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h3" sx={{ color: darkMode ? '#fff' : '#1e293b', mb: 2, fontWeight: 700 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: darkMode ? 'rgba(255,255,255,0.8)' : '#64748b', mb: 3, lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                    <Chip 
                      label={feature.status}
                      sx={{ 
                        background: feature.color,
                        color: '#fff',
                        fontWeight: 600,
                        px: 2
                      }}
                    />
                  </Card>
                </Slide>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ 
        background: darkMode ? 'rgba(0,0,0,0.8)' : 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        py: 6,
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={4}>
              <Typography variant="h4" sx={{ color: '#fff', mb: 2, fontWeight: 700 }}>
                Stranger Chat
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                Connecting hearts and minds across the globe through anonymous, meaningful conversations.
              </Typography>
              <Stack direction="row" spacing={2}>
                {[
                  { icon: <Facebook />, color: '#1877F2' },
                  { icon: <Twitter />, color: '#1DA1F2' },
                  { icon: <Instagram />, color: '#E4405F' },
                  { icon: <LinkedIn />, color: '#0A66C2' }
                ].map((social, index) => (
                  <IconButton 
                    key={index}
                    sx={{ 
                      color: social.color,
                      background: 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        background: social.color,
                        color: '#fff',
                        transform: 'translateY(-3px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
                Quick Links
              </Typography>
              <Stack spacing={1}>
                {['Privacy Policy', 'Terms of Service', 'Community Guidelines', 'Help Center'].map((link) => (
                  <Button 
                    key={link}
                    sx={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      justifyContent: 'flex-start',
                      '&:hover': { color: '#FF6B6B' }
                    }}
                  >
                    {link}
                  </Button>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              <Button
                variant="contained"
                size="large"
                onClick={onStartChat}
                startIcon={<Chat />}
                sx={{
                  fontSize: '1.1rem',
                  py: 2,
                  px: 4,
                  borderRadius: 50,
                  background: darkMode 
                    ? 'linear-gradient(45deg, #8A2BE2, #FF1493)'
                    : 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    background: darkMode 
                      ? 'linear-gradient(45deg, #FF1493, #8A2BE2)'
                      : 'linear-gradient(45deg, #4ECDC4, #FF6B6B)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Start Your Journey
              </Button>
            </Grid>
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: 4, pt: 4, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              © 2024 Stranger Chat. Connecting the world, one conversation at a time. ❤️
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;