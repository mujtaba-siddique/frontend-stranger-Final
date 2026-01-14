import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Dialog,
  DialogContent,
  Button,
  Stack,
  Avatar
} from '@mui/material';
import {
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  CallEnd,
  Phone,
  VolumeUp
} from '@mui/icons-material';

const VideoCallComponent = ({
  isCallActive,
  callType, // 'video' or 'audio'
  isIncoming,
  callerName,
  onAcceptCall,
  onRejectCall,
  onEndCall,
  onToggleVideo,
  onToggleAudio,
  isVideoEnabled,
  isAudioEnabled,
  localVideoRef,
  remoteVideoRef,
  localAudioRef,
  remoteAudioRef,
  darkMode
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const callStartTime = useRef(null);

  useEffect(() => {
    let interval;
    if (isCallActive && !isIncoming) {
      callStartTime.current = Date.now();
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCallActive, isIncoming]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Incoming call dialog
  if (isIncoming) {
    return (
      <Dialog
        open={true}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: darkMode 
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: 4,
            p: 2
          }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', p: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
              fontSize: '2rem'
            }}
          >
            🎭
          </Avatar>
          
          <Typography variant="h5" gutterBottom sx={{ color: darkMode ? 'white' : '#1e293b' }}>
            Incoming {callType === 'video' ? 'Video' : 'Voice'} Call
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, color: darkMode ? 'rgba(255,255,255,0.7)' : '#64748b' }}>
            {callerName} is calling you...
          </Typography>

          <Stack direction="row" spacing={3} justifyContent="center">
            <IconButton
              onClick={onRejectCall}
              sx={{
                width: 64,
                height: 64,
                background: 'linear-gradient(135deg, #ff4757, #ff3742)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ff3742, #ff2f3a)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <CallEnd size={28} />
            </IconButton>
            
            <IconButton
              onClick={onAcceptCall}
              sx={{
                width: 64,
                height: 64,
                background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00cc6a, #00b359)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              {callType === 'video' ? <Videocam size={28} /> : <Phone size={28} />}
            </IconButton>
          </Stack>
        </DialogContent>
      </Dialog>
    );
  }

  // Active call interface
  if (isCallActive) {
    return (
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Call Header */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
          p: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '60px'
        }}>
          <Box>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
              Anonymous Stranger
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
              {formatDuration(callDuration)}
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ 
            color: 'white',
            background: 'rgba(255,255,255,0.2)',
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            fontSize: '0.8rem'
          }}>
            {callType === 'video' ? 'Video Call' : 'Voice Call'}
          </Typography>
        </Box>

        {/* Video Area */}
        <Box sx={{ 
          flex: 1, 
          position: 'relative', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '100%',
          height: 'calc(100vh - 140px)',
          marginTop: '60px',
          marginBottom: '80px'
        }}>
          {callType === 'video' ? (
            <>
              {/* Remote Video (Partner's video - full screen) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  background: '#1a1a1a'
                }}
              />
              
              {/* Local Video (Your video - small window) */}
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  width: 150,
                  height: 100,
                  objectFit: 'cover',
                  borderRadius: 8,
                  border: '2px solid white',
                  background: '#1a1a1a'
                }}
              />
            </>
          ) : (
            // Audio Call UI
            <Box sx={{ textAlign: 'center', color: 'white' }}>
              {/* Audio elements for voice call */}
              <audio
                ref={remoteAudioRef}
                autoPlay
                playsInline
                controls={false}
                style={{ display: 'none' }}
              />
              
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 3,
                  background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                  fontSize: '3rem'
                }}
              >
                🎭
              </Avatar>
              <Typography variant="h4" gutterBottom>
                Voice Call
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.7, mb: 2 }}>
                {formatDuration(callDuration)}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <VolumeUp sx={{ color: isAudioEnabled ? '#00ff88' : '#ff4757', fontSize: '2rem' }} />
                <Typography variant="h6">
                  {isAudioEnabled ? 'Microphone On' : 'Microphone Off'}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Call Controls */}
        <Box sx={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 2,
          zIndex: 10
        }}>
          {callType === 'video' && (
            <IconButton
              onClick={onToggleVideo}
              sx={{
                width: 48,
                height: 48,
                background: isVideoEnabled 
                  ? 'rgba(255,255,255,0.2)' 
                  : 'rgba(255,0,0,0.8)',
                color: 'white',
                '&:hover': {
                  background: isVideoEnabled 
                    ? 'rgba(255,255,255,0.3)' 
                    : 'rgba(255,0,0,0.9)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              {isVideoEnabled ? <Videocam /> : <VideocamOff />}
            </IconButton>
          )}

          <IconButton
            onClick={onToggleAudio}
            sx={{
              width: 48,
              height: 48,
              background: isAudioEnabled 
                ? 'rgba(255,255,255,0.2)' 
                : 'rgba(255,0,0,0.8)',
              color: 'white',
              '&:hover': {
                background: isAudioEnabled 
                  ? 'rgba(255,255,255,0.3)' 
                  : 'rgba(255,0,0,0.9)',
                transform: 'scale(1.05)'
              }
            }}
          >
            {isAudioEnabled ? <Mic /> : <MicOff />}
          </IconButton>

          <IconButton
            onClick={onEndCall}
            sx={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #ff4757, #ff3742)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #ff3742, #ff2f3a)',
                transform: 'scale(1.05)'
              }
            }}
          >
            <CallEnd />
          </IconButton>
        </Box>
      </Box>
    );
  }

  return null;
};

export default VideoCallComponent;