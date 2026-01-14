import { useState, useRef, useCallback } from 'react';
import socketService from '../services/socketService';

const useCallManager = (userId, partnerId) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState(null);
  const [isIncoming, setIsIncoming] = useState(false);
  const [callerName, setCallerName] = useState('');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const incomingCallDataRef = useRef(null);
  const isOfferSentRef = useRef(false);
  const isAnswerSentRef = useRef(false);

  const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ];

  // Initialize call listeners
  const initializeCallListeners = useCallback(() => {
    // Listen for incoming calls
    socketService.onCallOffer((data) => {
      console.log('📞 Incoming call offer:', data);
      incomingCallDataRef.current = data;
      setCallerName('Anonymous Stranger');
      setCallType(data.callType);
      setIsIncoming(true);
    });

  // Listen for call answers
    socketService.onCallAnswer(async (data) => {
      console.log('📞 Call answer received:', data);
      if (peerConnectionRef.current && !isAnswerSentRef.current) {
        try {
          // Only set remote description if we're in the right state
          if (peerConnectionRef.current.signalingState === 'have-local-offer') {
            await peerConnectionRef.current.setRemoteDescription(
              new RTCSessionDescription(data.answer)
            );
            isAnswerSentRef.current = true;
          }
        } catch (error) {
          console.error('Error setting remote description:', error);
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
      
      setCallType(type);
      setIsCallActive(true);

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
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
        console.log('📞 Remote stream received for', type, 'call');
        const remoteStream = event.streams[0];
        
        if (type === 'video' && remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        } else if (type === 'audio' && remoteAudioRef.current) {
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

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: data.callType === 'video',
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
    setIsIncoming(false);
    
    if (incomingCallDataRef.current) {
      socketService.sendCallEnd({
        to: incomingCallDataRef.current.from
      });
    }
    
    incomingCallDataRef.current = null;
  }, []);

  // End active call
  const endCall = useCallback(() => {
    console.log('📞 Ending call');
    
    // Reset flags
    isOfferSentRef.current = false;
    isAnswerSentRef.current = false;
    
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

  return {
    // State
    isCallActive,
    callType,
    isIncoming,
    callerName,
    isVideoEnabled,
    isAudioEnabled,
    
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
    toggleAudio
  };
};

export default useCallManager;