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
  VolumeUp,
  VolumeDown,
  Cameraswitch
} from '@mui/icons-material';

const VideoCallComponent = ({
  isCallActive,
  callType,
  isIncoming,
  callerName,
  onAcceptCall,
  onRejectCall,
  onEndCall,
  onToggleVideo,
  onToggleAudio,
  onToggleSpeaker,
  onSwitchCamera,
  isVideoEnabled,
  isAudioEnabled,
  isSpeakerOn,
  isFrontCamera,
  localVideoRef,
  remoteVideoRef,
  localAudioRef,
  remoteAudioRef,
  darkMode,
  isReconnecting = false,
  callQuality = 'good'
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
        {/* Call Header with Controls */}
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
          minHeight: '70px'
        }}>
          <Box>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
              Anonymous Stranger
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
                {isReconnecting ? '🔄 Reconnecting...' : formatDuration(callDuration)}
              </Typography>
              {callQuality !== 'good' && (
                <Typography variant="caption" sx={{ 
                  color: callQuality === 'poor' ? '#ff4757' : '#ffa502',
                  fontSize: '0.7rem',
                  ml: 1
                }}>
                  {callQuality === 'poor' ? '⚠️ Poor' : '⚠️ Fair'}
                </Typography>
              )}
            </Box>
          </Box>
          
          {/* Call Controls */}
          <Box sx={{
            display: 'flex',
            gap: 1.5,
            alignItems: 'center'
          }}>
            {callType === 'video' && (
              <>
                <IconButton
                  onClick={onToggleVideo}
                  sx={{
                    width: 44,
                    height: 44,
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
                  {isVideoEnabled ? <Videocam fontSize="small" /> : <VideocamOff fontSize="small" />}
                </IconButton>
                
                <IconButton
                  onClick={onSwitchCamera}
                  sx={{
                    width: 44,
                    height: 44,
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.3)',
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  <Cameraswitch fontSize="small" />
                </IconButton>
              </>
            )}

            <IconButton
              onClick={onToggleAudio}
              sx={{
                width: 44,
                height: 44,
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
              {isAudioEnabled ? <Mic fontSize="small" /> : <MicOff fontSize="small" />}
            </IconButton>

            {callType === 'audio' && (
              <IconButton
                onClick={onToggleSpeaker}
                sx={{
                  width: 44,
                  height: 44,
                  background: isSpeakerOn 
                    ? 'rgba(0,255,136,0.3)' 
                    : 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': {
                    background: isSpeakerOn 
                      ? 'rgba(0,255,136,0.4)' 
                      : 'rgba(255,255,255,0.3)',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                {isSpeakerOn ? <VolumeUp fontSize="small" /> : <VolumeDown fontSize="small" />}
              </IconButton>
            )}

            <IconButton
              onClick={onEndCall}
              sx={{
                width: 44,
                height: 44,
                background: 'linear-gradient(135deg, #ff4757, #ff3742)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ff3742, #ff2f3a)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <CallEnd fontSize="small" />
            </IconButton>
          </Box>
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
              
              {isReconnecting && (
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  background: 'rgba(0,0,0,0.8)',
                  p: 3,
                  borderRadius: 2
                }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                    🔄 Reconnecting...
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Please wait while we restore your connection
                  </Typography>
                </Box>
              )}
              
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
                {isReconnecting ? '🔄 Reconnecting...' : formatDuration(callDuration)}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <VolumeUp sx={{ color: isAudioEnabled ? '#00ff88' : '#ff4757', fontSize: '2rem' }} />
                <Typography variant="h6">
                  {isAudioEnabled ? 'Microphone On' : 'Microphone Off'}
                </Typography>
              </Box>
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                {isSpeakerOn ? <VolumeUp sx={{ fontSize: '1.5rem' }} /> : <VolumeDown sx={{ fontSize: '1.5rem' }} />}
                <Typography variant="body1">
                  {isSpeakerOn ? 'Speaker Mode' : 'Earpiece Mode'}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  return null;
};

export default VideoCallComponent;