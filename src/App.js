import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  Snackbar,
  createTheme
} from '@mui/material';
import { Chat, Refresh } from '@mui/icons-material';
import socketService from './services/socketService';
import notificationService from './services/notificationService';
import WaitingRoom from './components/WaitingRoom';
import ChatInterface from './components/ChatInterface';
import LandingPage from './components/LandingPage';
import UserProfileModal from './components/UserProfileModal';
import SessionTimeoutModal from './components/SessionTimeoutModal';
import ErrorBoundary from './components/ErrorBoundary';
import VideoCallComponent from './components/VideoCallComponent';
import useCallManager from './hooks/useCallManager';

const STATES = {
  LANDING: 'landing',
  PROFILE_SETUP: 'profile_setup',
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  WAITING: 'waiting',
  CHATTING: 'chatting'
};

function App() {
  const [state, setState] = useState(STATES.LANDING);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [partnerId, setPartnerId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [userProfile, setUserProfile] = useState(null);
  const [sessionTimeoutOpen, setSessionTimeoutOpen] = useState(false);

  // Video call manager
  const callManager = useCallManager(userId, partnerId);

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#4ECDC4' : '#667eea',
      },
      secondary: {
        main: darkMode ? '#FF6B6B' : '#764ba2',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
  });

  const handleStartChat = () => {
    setState(STATES.PROFILE_SETUP);
  };

  const handleProfileSubmit = async (profileData) => {
    console.log('Profile submitted:', profileData);
    const apiUrl = process.env.REACT_APP_API_URL;
    if (!apiUrl) {
      showNotification('API URL not configured', 'error');
      return;
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${apiUrl}/api/users/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(profileData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Profile created:', userData);
        setUserProfile(userData);
        showNotification('Profile created! Finding strangers...', 'success');
        setState(STATES.CONNECTING);
        handleConnectWithProfile(userData);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Profile creation failed:', response.status, errorData);
        showNotification(`Failed to create profile: ${errorData.error || response.status}`, 'error');
      }
    } catch (error) {
      console.error('Profile creation error:', error);
      if (error.name === 'AbortError') {
        showNotification('Request timeout. Please try again.', 'error');
      } else if (error.message.includes('fetch')) {
        showNotification('Network error. Check your connection.', 'error');
      } else {
        showNotification('Failed to create profile. Please try again.', 'error');
      }
    }
  };

  const handleConnect = () => {
    handleConnectWithProfile(userProfile);
  };
  
  const handleConnectWithProfile = (profileData) => {
    setState(STATES.CONNECTING);
    setMessages([]);
    
    console.log('🚀 Connecting with profile:', profileData);
    
    const socket = socketService.connect();
    
    socket.on('connect', () => {
      console.log('✅ Socket connected, now joining chat');
      socketService.joinChat(profileData?.id);
    });
    
    socketService.onUserCreated((data) => {
      console.log('User created:', data.userId);
      setUserId(data.userId);
    });

    socketService.onMatched((data) => {
      console.log('Matched with:', data.partnerId);
      setState(STATES.CHATTING);
      setPartnerId(data.partnerId);
      setSessionId(data.sessionId);
      showNotification('Connected with a stranger!', 'success');
    });

    socketService.onWaiting((data) => {
      console.log('Waiting:', data.message);
      setState(STATES.WAITING);
      showNotification(data.message, 'info');
    });

    socketService.onNewMessage((message) => {
      console.log('📩 Received message:', message.id);
      setMessages(prev => [...prev, message]);
      
      if (document.hidden) {
        notificationService.showMessageNotification(message.message);
        notificationService.playNotificationSound();
      }
      
      setTimeout(() => {
        socketService.markMessageSeen(message.id);
      }, 500);
    });

    socketService.onMessageSent((message) => {
      console.log('📤 Message sent:', message.id, 'status:', message.status);
      setMessages(prev => [...prev, message]);
    });

    socketService.onChatEnded((data) => {
      showNotification(data.reason, 'warning');
      setState(STATES.WAITING);
      setMessages([]);
      setPartnerId(null);
      setSessionId(null);
    });

    socketService.onPartnerTyping((data) => {
      console.log('📨 FRONTEND: Received partner-typing event:', data);
      setIsPartnerTyping(data.typing);
    });

    socketService.onError((error) => {
      showNotification(error.message, 'error');
    });
    
    socketService.onMessageDelivered((data) => {
      console.log('✅ Message delivered:', data.messageId);
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId ? { ...msg, status: 'delivered' } : msg
      ));
    });
    
    socketService.onMessageSeenByPartner((data) => {
      console.log('👁️ Message seen:', data.messageId);
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId ? { ...msg, status: 'seen' } : msg
      ));
    });
    
    socketService.onMessageStatusUpdate((data) => {
      console.log('📊 Message status update:', data.messageId, 'status:', data.status);
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId ? { ...msg, status: data.status } : msg
      ));
    });
    
    socketService.onMessageFailed((data) => {
      console.log('❌ Message failed:', data.messageId, 'error:', data.error);
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId ? { ...msg, status: 'failed' } : msg
      ));
      showNotification(data.error, 'error');
    });
    
    socketService.onEnableEndChat(() => {
      console.log('🔓 End chat button enabled');
    });
    
    callManager.initializeCallListeners();
    
    socketService.onSessionTimeout((data) => {
      console.log('⏰ Session timeout:', data.reason);
      setSessionTimeoutOpen(true);
      setState(STATES.DISCONNECTED);
      setMessages([]);
      setPartnerId(null);
      setSessionId(null);
      showNotification(data.reason, 'warning');
    });
  };

  const handleSendMessage = (message, messageId) => {
    socketService.sendMessage(message, messageId);
  };
  
  const handleTypingStart = () => {
    console.log('📤 APP: handleTypingStart called');
    socketService.startTyping();
  };
  
  const handleTypingStop = () => {
    console.log('📤 APP: handleTypingStop called');
    socketService.stopTyping();
  };
  
  const handleMessageSeen = (messageId) => {
    socketService.markMessageSeen(messageId);
  };

  const handleEndChat = () => {
    socketService.endChat();
  };

  const handleDisconnect = () => {
    socketService.disconnect();
    setState(STATES.LANDING);
    setMessages([]);
    setUserId(null);
    setPartnerId(null);
    setSessionId(null);
  };

  const handleRetry = () => {
    handleDisconnect();
    setTimeout(handleConnect, 1000);
  };
  
  const handleSessionTimeoutClose = () => {
    setSessionTimeoutOpen(false);
  };
  
  const handleFindNewStranger = () => {
    setSessionTimeoutOpen(false);
    if (userProfile) {
      handleConnectWithProfile(userProfile);
    } else {
      setState(STATES.PROFILE_SETUP);
    }
  };

  useEffect(() => {
    return () => {
      socketService.disconnect();
    };
  }, []);

  const renderContent = () => {
    switch (state) {
      case STATES.LANDING:
        return (
          <LandingPage 
            onStartChat={handleStartChat} 
            darkMode={darkMode} 
            onToggleDarkMode={toggleDarkMode} 
          />
        );

      case STATES.PROFILE_SETUP:
        return (
          <>
            <LandingPage 
              onStartChat={handleStartChat} 
              darkMode={darkMode} 
              onToggleDarkMode={toggleDarkMode} 
            />
            <UserProfileModal
              open={true}
              onClose={() => setState(STATES.LANDING)}
              onSubmit={handleProfileSubmit}
              darkMode={darkMode}
            />
          </>
        );

      case STATES.DISCONNECTED:
        return (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 400, mx: 'auto', mt: 4 }}>
            <Chat sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Stranger Chat
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Connect with random strangers and have anonymous conversations
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleConnect}
              sx={{ mt: 2 }}
            >
              Start Chatting
            </Button>
          </Paper>
        );

      case STATES.CONNECTING:
        return (
          <WaitingRoom 
            onCancel={() => {
              socketService.disconnect();
              setState(STATES.LANDING);
              setMessages([]);
              setPartnerId(null);
            }}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        );

      case STATES.WAITING:
        return (
          <WaitingRoom 
            onCancel={() => {
              socketService.disconnect();
              setState(STATES.LANDING);
              setMessages([]);
              setPartnerId(null);
            }}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        );

      case STATES.CHATTING:
        return (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            onEndChat={handleEndChat}
            onTypingStart={handleTypingStart}
            onTypingStop={handleTypingStop}
            onMessageSeen={handleMessageSeen}
            partnerId={partnerId}
            userId={userId}
            isPartnerTyping={isPartnerTyping}
            isConnected={socketService.isConnected}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        );

      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: state === STATES.LANDING ? 'transparent' : 'background.default' }}>
        {state === STATES.LANDING ? (
          renderContent()
        ) : state === STATES.CHATTING ? (
          renderContent()
        ) : (
          <Container maxWidth="md" sx={{ py: 4 }}>
            {renderContent()}
            
            {state !== STATES.DISCONNECTED && (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleDisconnect}
                >
                  Back to Home
                </Button>
              </Box>
            )}
          </Container>
        )}
        
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={() => setNotification({ ...notification, open: false })}
        >
          <Alert 
            severity={notification.severity}
            onClose={() => setNotification({ ...notification, open: false })}
          >
            {notification.message}
          </Alert>
        </Snackbar>
        
        <SessionTimeoutModal
          open={sessionTimeoutOpen}
          onClose={handleSessionTimeoutClose}
          onFindNew={handleFindNewStranger}
          darkMode={darkMode}
        />
      </Box>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;