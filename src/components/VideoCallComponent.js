import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Dialog,
  DialogContent,
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
  isRinging = false,
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
  callQuality = 'good',
  callDuration = 0
}) => {
  const [isVideoSwapped, setIsVideoSwapped] = useState(false);
  const ringtoneRef = useRef(null);

  // === RINGTONE SYSTEM ===
  useEffect(() => {
    let audioContext;
    let ringInterval;

    if (isIncoming) {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        const playRingTone = () => {
          if (!audioContext || audioContext.state === 'closed') return;

          // Two-tone ring pattern (classic phone ring)
          const frequencies = [440, 480];
          frequencies.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;

            const now = audioContext.currentTime;
            // Ring pattern: ON 1s, OFF 0.2s, ON 1s
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
            gain.gain.setValueAtTime(0.12, now + 0.4);
            gain.gain.linearRampToValueAtTime(0, now + 0.45);
            // Second burst
            gain.gain.setValueAtTime(0, now + 0.6);
            gain.gain.linearRampToValueAtTime(0.12, now + 0.65);
            gain.gain.setValueAtTime(0.12, now + 1.0);
            gain.gain.linearRampToValueAtTime(0, now + 1.05);

            osc.start(now);
            osc.stop(now + 1.1);
          });
        };

        // Resume context (required after user interaction policy)
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }

        playRingTone();
        ringInterval = setInterval(playRingTone, 2500);
        ringtoneRef.current = { audioContext, ringInterval };
      } catch (err) {
        console.log('Ringtone init error:', err);
      }
    }

    return () => {
      if (ringInterval) clearInterval(ringInterval);
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => { });
      }
      ringtoneRef.current = null;
    };
  }, [isIncoming]);

  // Stop ringtone when call is accepted
  useEffect(() => {
    if (!isIncoming && ringtoneRef.current) {
      const { audioContext, ringInterval } = ringtoneRef.current;
      if (ringInterval) clearInterval(ringInterval);
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => { });
      }
      ringtoneRef.current = null;
    }
  }, [isIncoming]);

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityColor = () => {
    if (callQuality === 'poor') return '#ff4757';
    if (callQuality === 'fair') return '#ffa502';
    return '#00ff88';
  };

  const getQualityBars = () => {
    const count = callQuality === 'poor' ? 1 : callQuality === 'fair' ? 2 : 3;
    return Array.from({ length: 3 }, (_, i) => (
      <Box key={i} sx={{
        width: 3,
        height: 6 + i * 4,
        borderRadius: 1,
        background: i < count ? getQualityColor() : 'rgba(255,255,255,0.2)',
        transition: 'background 0.3s ease'
      }} />
    ));
  };

  // ==========================================
  // INCOMING CALL DIALOG
  // ==========================================
  if (isIncoming) {
    return (
      <Dialog
        open={true}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: darkMode
              ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #16213e 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)',
            borderRadius: 4,
            p: 2,
            border: '1px solid rgba(0, 255, 136, 0.2)',
            boxShadow: '0 0 60px rgba(0, 255, 136, 0.15)'
          }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', p: 4 }}>
          {/* Pulsing Avatar */}
          <Box sx={{
            position: 'relative',
            display: 'inline-block',
            mb: 3,
            animation: 'ringPulse 1.5s ease-in-out infinite'
          }}>
            <Avatar
              sx={{
                width: 90,
                height: 90,
                mx: 'auto',
                background: callType === 'video'
                  ? 'linear-gradient(135deg, #667eea, #764ba2)'
                  : 'linear-gradient(135deg, #00ff88, #00cc6a)',
                fontSize: '2.5rem',
                boxShadow: callType === 'video'
                  ? '0 0 40px rgba(102, 126, 234, 0.5)'
                  : '0 0 40px rgba(0, 255, 136, 0.5)'
              }}
            >
              {callType === 'video' ? '📹' : '📞'}
            </Avatar>
          </Box>

          <Typography variant="h5" gutterBottom sx={{
            color: darkMode ? 'white' : '#1e293b',
            fontWeight: 700,
            letterSpacing: '-0.5px'
          }}>
            Incoming {callType === 'video' ? 'Video' : 'Voice'} Call
          </Typography>

          <Typography variant="body1" sx={{
            mb: 1,
            color: darkMode ? 'rgba(255,255,255,0.8)' : '#64748b',
            fontWeight: 500
          }}>
            {callerName}
          </Typography>

          <Typography variant="caption" sx={{
            display: 'block',
            mb: 4,
            color: darkMode ? 'rgba(255,255,255,0.5)' : '#94a3b8',
            animation: 'blink 1.5s infinite'
          }}>
            {callType === 'video' ? '📹' : '🔊'} {callType === 'video' ? 'Video' : 'Voice'} call incoming...
          </Typography>

          <Stack direction="row" spacing={4} justifyContent="center">
            {/* Reject */}
            <Box sx={{ textAlign: 'center' }}>
              <IconButton
                onClick={onRejectCall}
                sx={{
                  width: 68,
                  height: 68,
                  background: 'linear-gradient(135deg, #ff4757, #c0392b)',
                  color: 'white',
                  boxShadow: '0 8px 30px rgba(255, 71, 87, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ff3742, #e74c3c)',
                    transform: 'scale(1.08)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <CallEnd sx={{ fontSize: 30 }} />
              </IconButton>
              <Typography variant="caption" sx={{
                display: 'block', mt: 1,
                color: darkMode ? 'rgba(255,255,255,0.6)' : '#94a3b8'
              }}>
                Decline
              </Typography>
            </Box>

            {/* Accept */}
            <Box sx={{ textAlign: 'center' }}>
              <IconButton
                onClick={onAcceptCall}
                sx={{
                  width: 68,
                  height: 68,
                  background: 'linear-gradient(135deg, #00ff88, #00b359)',
                  color: 'white',
                  boxShadow: '0 8px 30px rgba(0, 255, 136, 0.4)',
                  animation: 'acceptPulse 2s ease-in-out infinite',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00cc6a, #00994d)',
                    transform: 'scale(1.08)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {callType === 'video' ? <Videocam sx={{ fontSize: 30 }} /> : <Phone sx={{ fontSize: 30 }} />}
              </IconButton>
              <Typography variant="caption" sx={{
                display: 'block', mt: 1,
                color: darkMode ? 'rgba(255,255,255,0.6)' : '#94a3b8'
              }}>
                Accept
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        {/* Animations */}
        <style>{`
          @keyframes ringPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.08); }
            100% { transform: scale(1); }
          }
          @keyframes acceptPulse {
            0% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.5); }
            70% { box-shadow: 0 0 0 15px rgba(0, 255, 136, 0); }
            100% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); }
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </Dialog>
    );
  }

  // ==========================================
  // ACTIVE CALL INTERFACE
  // ==========================================
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
        {/* Top Bar */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)',
          p: 2,
          pb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          {/* Left: Caller info */}
          <Box>
            <Typography variant="h6" sx={{
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '-0.3px'
            }}>
              Anonymous Stranger
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
              {/* Call Quality bars */}
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '2px', mr: 0.5 }}>
                {getQualityBars()}
              </Box>

              <Typography variant="caption" sx={{
                color: isRinging ? '#feca57' : callDuration === 0 ? '#87ceeb' : 'rgba(255,255,255,0.7)',
                fontSize: '0.8rem',
                fontWeight: isRinging || callDuration === 0 ? 600 : 400
              }}>
                {isReconnecting
                  ? '🔄 Reconnecting...'
                  : isRinging
                    ? '📞 Ringing...'
                    : callDuration === 0
                      ? '📞 Calling...'
                      : formatDuration(callDuration)
                }
              </Typography>

              {callType && (
                <Typography variant="caption" sx={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '0.7rem',
                  ml: 0.5
                }}>
                  • {callType === 'video' ? 'Video' : 'Voice'}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Right: encrypted badge */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 2,
            px: 1.2,
            py: 0.4
          }}>
            <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)' }}>
              🔒 Encrypted
            </Typography>
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box sx={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}>
          {callType === 'video' ? (
            <>
              {/* Remote Video (full screen) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={{
                  position: 'absolute',
                  width: isVideoSwapped ? '130px' : '100%',
                  height: isVideoSwapped ? '180px' : '100%',
                  top: isVideoSwapped ? '80px' : '0',
                  right: isVideoSwapped ? '12px' : '0',
                  left: isVideoSwapped ? 'auto' : '0',
                  objectFit: 'cover',
                  background: '#0a0a0a',
                  borderRadius: isVideoSwapped ? '12px' : '0',
                  border: isVideoSwapped ? '2px solid rgba(255,255,255,0.3)' : 'none',
                  cursor: isVideoSwapped ? 'pointer' : 'default',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isVideoSwapped ? '0 8px 32px rgba(0,0,0,0.6)' : 'none',
                  zIndex: isVideoSwapped ? 3 : 1
                }}
                onClick={() => isVideoSwapped && setIsVideoSwapped(false)}
              />

              {/* Local Video (picture-in-picture) */}
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  position: 'absolute',
                  width: isVideoSwapped ? '100%' : '130px',
                  height: isVideoSwapped ? '100%' : '180px',
                  top: isVideoSwapped ? '0' : '80px',
                  right: isVideoSwapped ? '0' : '12px',
                  left: isVideoSwapped ? '0' : 'auto',
                  objectFit: 'cover',
                  background: '#0a0a0a',
                  borderRadius: isVideoSwapped ? '0' : '12px',
                  border: isVideoSwapped ? 'none' : '2px solid rgba(255,255,255,0.3)',
                  cursor: isVideoSwapped ? 'default' : 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isVideoSwapped ? 'none' : '0 8px 32px rgba(0,0,0,0.6)',
                  zIndex: isVideoSwapped ? 1 : 3
                }}
                onClick={() => !isVideoSwapped && setIsVideoSwapped(true)}
              />

              {/* Hidden audio element for remote audio */}
              <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />
            </>
          ) : (
            /* ===== VOICE CALL UI ===== */
            <Box sx={{
              textAlign: 'center',
              color: 'white',
              position: 'relative',
              zIndex: 2
            }}>
              {/* Hidden audio elements */}
              <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />
              <audio ref={localAudioRef} muted style={{ display: 'none' }} />

              {/* Animated rings behind avatar */}
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                {[1, 2, 3].map(i => (
                  <Box key={i} sx={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    width: 120 + i * 40,
                    height: 120 + i * 40,
                    borderRadius: '50%',
                    border: `1px solid rgba(102, 126, 234, ${0.15 / i})`,
                    transform: 'translate(-50%, -50%)',
                    animation: isRinging ? `voiceRing ${2 + i * 0.5}s ease-in-out infinite` : 'none'
                  }} />
                ))}
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    fontSize: '3rem',
                    boxShadow: '0 0 50px rgba(102, 126, 234, 0.4)',
                    position: 'relative',
                    zIndex: 2
                  }}
                >
                  🎭
                </Avatar>
              </Box>

              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
                {isRinging ? 'Ringing...' : callDuration === 0 ? 'Calling...' : 'Voice Call'}
              </Typography>

              <Typography variant="h6" sx={{
                opacity: 0.7,
                mb: 3,
                fontWeight: (isRinging || callDuration === 0) ? 500 : 400,
                color: isRinging ? '#feca57' : callDuration === 0 ? '#87ceeb' : 'rgba(255,255,255,0.7)'
              }}>
                {isReconnecting ? '🔄 Reconnecting...' : isRinging ? '📞 Ringing...' : callDuration === 0 ? '📞 Calling...' : formatDuration(callDuration)}
              </Typography>

              {/* Audio status indicators */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 2 }}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5,
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 2, px: 2, py: 0.8
                }}>
                  {isAudioEnabled
                    ? <Mic sx={{ color: '#00ff88', fontSize: '1.2rem' }} />
                    : <MicOff sx={{ color: '#ff4757', fontSize: '1.2rem' }} />
                  }
                  <Typography variant="caption">
                    {isAudioEnabled ? 'Mic On' : 'Muted'}
                  </Typography>
                </Box>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5,
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 2, px: 2, py: 0.8
                }}>
                  {isSpeakerOn
                    ? <VolumeUp sx={{ fontSize: '1.2rem' }} />
                    : <VolumeDown sx={{ fontSize: '1.2rem' }} />
                  }
                  <Typography variant="caption">
                    {isSpeakerOn ? 'Speaker' : 'Earpiece'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Voice call background animation */}
          {callType === 'audio' && (
            <Box sx={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 50% 40%, rgba(102, 126, 234, 0.15) 0%, transparent 60%)',
              zIndex: 1
            }} />
          )}
        </Box>

        {/* ===== BOTTOM CONTROLS ===== */}
        <Box sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 70%, transparent 100%)',
          pt: 5,
          pb: 4,
          px: 2,
          display: 'flex',
          justifyContent: 'center',
          gap: { xs: 2, sm: 3 }
        }}>
          {/* Video Toggle */}
          {callType === 'video' && (
            <Box sx={{ textAlign: 'center' }}>
              <IconButton
                onClick={onToggleVideo}
                sx={{
                  width: 52, height: 52,
                  background: isVideoEnabled ? 'rgba(255,255,255,0.15)' : 'rgba(255, 71, 87, 0.8)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  '&:hover': { background: isVideoEnabled ? 'rgba(255,255,255,0.25)' : 'rgba(255, 71, 87, 0.9)' },
                  transition: 'all 0.2s ease'
                }}
              >
                {isVideoEnabled ? <Videocam /> : <VideocamOff />}
              </IconButton>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: 0.5, fontSize: '0.6rem' }}>
                {isVideoEnabled ? 'Camera' : 'Camera Off'}
              </Typography>
            </Box>
          )}

          {/* Mic Toggle */}
          <Box sx={{ textAlign: 'center' }}>
            <IconButton
              onClick={onToggleAudio}
              sx={{
                width: 52, height: 52,
                background: isAudioEnabled ? 'rgba(255,255,255,0.15)' : 'rgba(255, 71, 87, 0.8)',
                color: 'white',
                backdropFilter: 'blur(10px)',
                '&:hover': { background: isAudioEnabled ? 'rgba(255,255,255,0.25)' : 'rgba(255, 71, 87, 0.9)' },
                transition: 'all 0.2s ease'
              }}
            >
              {isAudioEnabled ? <Mic /> : <MicOff />}
            </IconButton>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: 0.5, fontSize: '0.6rem' }}>
              {isAudioEnabled ? 'Mute' : 'Unmute'}
            </Typography>
          </Box>

          {/* Speaker Toggle (voice calls) */}
          {callType === 'audio' && (
            <Box sx={{ textAlign: 'center' }}>
              <IconButton
                onClick={onToggleSpeaker}
                sx={{
                  width: 52, height: 52,
                  background: isSpeakerOn ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.15)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  '&:hover': { background: isSpeakerOn ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.25)' },
                  transition: 'all 0.2s ease'
                }}
              >
                {isSpeakerOn ? <VolumeUp /> : <VolumeDown />}
              </IconButton>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: 0.5, fontSize: '0.6rem' }}>
                Speaker
              </Typography>
            </Box>
          )}

          {/* Camera Switch (video calls) */}
          {callType === 'video' && (
            <Box sx={{ textAlign: 'center' }}>
              <IconButton
                onClick={onSwitchCamera}
                sx={{
                  width: 52, height: 52,
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  '&:hover': { background: 'rgba(255,255,255,0.25)' },
                  transition: 'all 0.2s ease'
                }}
              >
                <Cameraswitch />
              </IconButton>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: 0.5, fontSize: '0.6rem' }}>
                Flip
              </Typography>
            </Box>
          )}

          {/* End Call */}
          <Box sx={{ textAlign: 'center' }}>
            <IconButton
              onClick={onEndCall}
              sx={{
                width: 60, height: 60,
                background: 'linear-gradient(135deg, #ff4757, #c0392b)',
                color: 'white',
                boxShadow: '0 8px 30px rgba(255, 71, 87, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ff3742, #e74c3c)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 12px 40px rgba(255, 71, 87, 0.5)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <CallEnd sx={{ fontSize: 28 }} />
            </IconButton>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: 0.5, fontSize: '0.6rem' }}>
              End
            </Typography>
          </Box>
        </Box>

        {/* Global Animations */}
        <style>{`
          @keyframes voiceRing {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
            50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          }
        `}</style>
      </Box>
    );
  }

  return null;
};

export default VideoCallComponent;