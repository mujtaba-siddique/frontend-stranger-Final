import { useState, useRef, useCallback } from 'react';
import socketService from '../services/socketService';

const useCallManager = (userId, partnerId) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState(null);
  const [isIncoming, setIsIncoming] = useState(false);
  const [callerName, setCallerName] = useState('');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const incomingCallDataRef = useRef(null);
  const isOfferSentRef = useRef(false);
  const isAnswerSentRef = useRef(false);
  const reconnectAttemptRef = useRef(0);
  const callStateRef = useRef(null);
  const listenersInitializedRef = useRef(false);

  const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ];

  // Reconnect call after network issue
  const reconnectCall = useCallback(async () => {
    if (!callStateRef.current || reconnectAttemptRef.current >= 3) return;
    
    console.log('🔄 Attempting to reconnect call...');
    reconnectAttemptRef.current++;
    
    try {
      const { type, isInitiator } = callStateRef.current;
      
      if (isInitiator) {
        await startCall(type);
      }
    } catch (error) {
      console.error('❌ Reconnect failed:', error);
      if (reconnectAttemptRef.current < 3) {
        setTimeout(() => reconnectCall(), 2000);
      } else {
        endCall();
      }
    }
  }, []);

  // Initialize call listeners
  const initializeCallListeners = useCallback(() => {
    if (listenersInitializedRef.current) {
      console.log('⚠️ Listeners already initialized, skipping...');
      return;
    }
    
    console.log('🔧 Initializing call listeners (ONCE)...');
    listenersInitializedRef.current = true;
    
    // Listen for incoming calls
    socketService.onCallOffer(async (data) => {
      console.log('📞 Incoming call offer:', data);
      
      incomingCallDataRef.current = data;
      setCallerName('Anonymous Stranger');
      setCallType(data.callType);
      setIsIncoming(true);
    });

    // Listen for network reconnection during call
    socketService.socket?.on('reconnect', () => {
      if (isCallActive && callStateRef.current) {
        console.log('🔄 Network reconnected during call');
        reconnectCall();
      }
    });

  // Listen for call answers
    socketService.onCallAnswer(async (data) => {
      console.log('📞 Call answer received');
      if (peerConnectionRef.current) {
        const currentState = peerConnectionRef.current.signalingState;
        console.log('Current signaling state:', currentState);
        
        if (currentState === 'stable') {
          console.log('⚠️ Already in stable state, ignoring duplicate answer');
          return;
        }
        
        if (currentState === 'have-local-offer' && !isAnswerSentRef.current) {
          try {
            await peerConnectionRef.current.setRemoteDescription(
              new RTCSessionDescription(data.answer)
            );
            isAnswerSentRef.current = true;
            console.log('✅ Answer set successfully');
          } catch (error) {
            console.error('❌ Error setting remote description:', error);
          }
        }
      }
    });

    // Listen for ICE candidates
    socketService.onIceCandidate(async (data) => {
      console.log('📞 ICE candidate received:', data);
      if (peerConnectionRef.current && data.candidate) {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      }
    });

    // Listen for call end
    socketService.onCallEnded(() => {
      console.log('📞 Call ended by partner');
      endCall();
    });
  }, []);

  // Start a call (video or audio)
  const startCall = useCallback(async (type) => {
    if (!partnerId || isCallActive) {
      console.error('Cannot start call - no partner or call already active');
      return;
    }

    console.log(`📞 Starting ${type} call with partner:`, partnerId);
    
    try {
      // Reset flags
      isOfferSentRef.current = false;
      isAnswerSentRef.current = false;
      reconnectAttemptRef.current = 0;
      
      // Save call state for reconnection
      callStateRef.current = { type, isInitiator: true };
      
      setCallType(type);
      setIsCallActive(true);

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video' ? { facingMode: 'user' } : false,
        audio: true
      });

      localStreamRef.current = stream;

      if (localVideoRef.current && type === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      peerConnectionRef.current = pc;

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log('📞 Remote track received:', event.track.kind, 'for', type, 'call');
        const remoteStream = event.streams[0];
        
        if (event.track.kind === 'video' && remoteVideoRef.current) {
          console.log('📹 Setting remote video stream');
          remoteVideoRef.current.srcObject = remoteStream;
        } else if (event.track.kind === 'audio' && remoteAudioRef.current) {
          console.log('🔊 Setting remote audio stream');
          remoteAudioRef.current.srcObject = remoteStream;
          remoteAudioRef.current.volume = 1.0;
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('📞 Sending ICE candidate');
          socketService.sendIceCandidate({
            candidate: event.candidate,
            to: partnerId
          });
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('📞 Connection state:', pc.connectionState);
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          console.log('⚠️ Call connection lost, attempting reconnect...');
          setTimeout(() => reconnectCall(), 1000);
        } else if (pc.connectionState === 'connected') {
          reconnectAttemptRef.current = 0;
        }
      };

      // Create and send offer only once
      if (!isOfferSentRef.current) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        isOfferSentRef.current = true;

        console.log('📞 Sending call offer');
        socketService.sendCallOffer({
          offer: offer,
          to: partnerId,
          from: userId,
          callType: type
        });
      }

    } catch (error) {
      console.error('📞 Error starting call:', error);
      alert('Could not access camera/microphone');
      endCall();
    }
  }, [partnerId, userId, isCallActive]);

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    const data = incomingCallDataRef.current;
    if (!data || isAnswerSentRef.current) return;

    console.log('📞 Accepting call');
    
    try {
      setIsIncoming(false);
      setIsCallActive(true);
      
      // Reset flags
      isOfferSentRef.current = false;
      isAnswerSentRef.current = false;
      reconnectAttemptRef.current = 0;
      
      // Save call state for reconnection
      callStateRef.current = { type: data.callType, isInitiator: false };

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: data.callType === 'video' ? { facingMode: 'user' } : false,
        audio: true
      });

      localStreamRef.current = stream;

      if (localVideoRef.current && data.callType === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      peerConnectionRef.current = pc;

      // Add local stream
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log('📞 Remote stream received for', data.callType, 'call');
        const remoteStream = event.streams[0];
        
        if (data.callType === 'video' && remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        } else if (data.callType === 'audio' && remoteAudioRef.current) {
          console.log('🔊 Setting remote audio stream');
          remoteAudioRef.current.srcObject = remoteStream;
          remoteAudioRef.current.volume = 1.0;
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('📞 Sending ICE candidate');
          socketService.sendIceCandidate({
            candidate: event.candidate,
            to: data.from
          });
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('📞 Connection state:', pc.connectionState);
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          console.log('⚠️ Call connection lost, attempting reconnect...');
          setTimeout(() => reconnectCall(), 1000);
        } else if (pc.connectionState === 'connected') {
          reconnectAttemptRef.current = 0;
        }
      };

      // Set remote description and create answer only once
      if (!isAnswerSentRef.current) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        isAnswerSentRef.current = true;

        console.log('📞 Sending call answer');
        socketService.sendCallAnswer({
          answer: answer,
          to: data.from
        });
      }

    } catch (error) {
      console.error('📞 Error accepting call:', error);
      alert('Could not access camera/microphone');
      rejectCall();
    }
  }, []);

  // Reject incoming call
  const rejectCall = useCallback(() => {
    console.log('📞 Rejecting call');
    
    if (incomingCallDataRef.current) {
      socketService.sendCallEnd({
        to: incomingCallDataRef.current.from
      });
    }
    
    setIsIncoming(false);
    setCallType(null);
    setCallerName('');
    incomingCallDataRef.current = null;
  }, []);

  // End active call
  const endCall = useCallback(() => {
    console.log('📞 Ending call');
    
    // Reset flags
    isOfferSentRef.current = false;
    isAnswerSentRef.current = false;
    reconnectAttemptRef.current = 0;
    callStateRef.current = null;
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Clear audio/video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (localAudioRef.current) {
      localAudioRef.current.srcObject = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    // Notify partner if call was active
    if (isCallActive && partnerId) {
      socketService.sendCallEnd({
        to: partnerId
      });
    }

    // Reset state
    setIsCallActive(false);
    setIsIncoming(false);
    setCallType(null);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    incomingCallDataRef.current = null;
  }, [isCallActive, partnerId]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, []);

  // Toggle speaker (earpiece/speaker)
  const toggleSpeaker = useCallback(() => {
    if (remoteAudioRef.current) {
      const newSpeakerState = !isSpeakerOn;
      setIsSpeakerOn(newSpeakerState);
      
      // Set audio output
      if (remoteAudioRef.current.setSinkId) {
        remoteAudioRef.current.setSinkId(newSpeakerState ? 'default' : 'communications')
          .catch(err => console.log('Speaker toggle error:', err));
      }
      
      // Adjust volume for speaker mode
      remoteAudioRef.current.volume = newSpeakerState ? 1.0 : 0.8;
      console.log(`🔊 Speaker ${newSpeakerState ? 'ON' : 'OFF (Earpiece)'}`);
    }
  }, [isSpeakerOn]);

  // Switch camera (front/back)
  const switchCamera = useCallback(async () => {
    if (!localStreamRef.current || callType !== 'video') return;
    
    try {
      const newFacingMode = isFrontCamera ? 'environment' : 'user';
      
      // Stop current video track
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.stop();
      }
      
      // Get new stream with switched camera
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: false
      });
      
      const newVideoTrack = newStream.getVideoTracks()[0];
      
      // Replace track in peer connection
      if (peerConnectionRef.current) {
        const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(newVideoTrack);
        }
      }
      
      // Update local stream
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      localStreamRef.current = new MediaStream([newVideoTrack, audioTrack]);
      
      // Update local video element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      
      setIsFrontCamera(!isFrontCamera);
      console.log(`📷 Switched to ${newFacingMode === 'user' ? 'front' : 'back'} camera`);
    } catch (error) {
      console.error('❌ Camera switch failed:', error);
    }
  }, [isFrontCamera, callType]);

  return {
    // State
    isCallActive,
    callType,
    isIncoming,
    callerName,
    isVideoEnabled,
    isAudioEnabled,
    isSpeakerOn,
    isFrontCamera,
    
    // Refs
    localVideoRef,
    remoteVideoRef,
    localAudioRef,
    remoteAudioRef,
    
    // Actions
    initializeCallListeners,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleVideo,
    toggleAudio,
    toggleSpeaker,
    switchCamera
  };
};

export default useCallManager;