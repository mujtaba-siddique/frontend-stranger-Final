import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
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
  const [callQuality, setCallQuality] = useState('good');

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
  const iceCandidateQueueRef = useRef([]);
  const callTimeoutRef = useRef(null);
  const qualityCheckIntervalRef = useRef(null);

  const ICE_SERVERS = useMemo(() => [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ], []);

  const CALL_TIMEOUT = 30000;

  const cleanup = useCallback(() => {
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
    if (qualityCheckIntervalRef.current) {
      clearInterval(qualityCheckIntervalRef.current);
      qualityCheckIntervalRef.current = null;
    }
    iceCandidateQueueRef.current = [];
  }, []);

  const monitorCallQuality = useCallback(() => {
    if (!peerConnectionRef.current) return;

    qualityCheckIntervalRef.current = setInterval(async () => {
      try {
        const stats = await peerConnectionRef.current.getStats();
        let packetsLost = 0;
        let packetsReceived = 0;

        stats.forEach(report => {
          if (report.type === 'inbound-rtp') {
            packetsLost += report.packetsLost || 0;
            packetsReceived += report.packetsReceived || 0;
          }
        });

        const lossRate = packetsReceived > 0 ? (packetsLost / packetsReceived) * 100 : 0;
        
        if (lossRate > 10) setCallQuality('poor');
        else if (lossRate > 5) setCallQuality('fair');
        else setCallQuality('good');
      } catch (err) {
        console.error('Quality check error:', err);
      }
    }, 3000);
  }, []);

  const processIceCandidateQueue = useCallback(async () => {
    if (!peerConnectionRef.current || peerConnectionRef.current.remoteDescription === null) return;

    while (iceCandidateQueueRef.current.length > 0) {
      const candidate = iceCandidateQueueRef.current.shift();
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('✅ Queued ICE candidate added');
      } catch (err) {
        console.error('❌ Error adding queued ICE candidate:', err);
      }
    }
  }, []);

  const getUserMedia = useCallback(async (type) => {
    const constraints = {
      video: type === 'video' ? {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } : false,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    };

    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        throw new Error('Camera/microphone permission denied');
      } else if (err.name === 'NotFoundError') {
        throw new Error('No camera/microphone found');
      }
      throw err;
    }
  }, []);

  const setupPeerConnection = useCallback((pc, isInitiator, targetId) => {
    pc.ontrack = (event) => {
      console.log('📞 Remote track:', event.track.kind);
      const remoteStream = event.streams[0];
      
      if (event.track.kind === 'video' && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      } else if (event.track.kind === 'audio' && remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current.volume = 1.0;
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.sendIceCandidate({
          candidate: event.candidate,
          to: targetId
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('📞 Connection state:', pc.connectionState);
      
      if (pc.connectionState === 'connected') {
        reconnectAttemptRef.current = 0;
        monitorCallQuality();
      }
    };

    pc.onicegatheringstatechange = () => {
      console.log('🧊 ICE gathering state:', pc.iceGatheringState);
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      console.log('🧊 ICE connection state:', state);
    };
  }, [monitorCallQuality]);

  const rejectCall = useCallback(() => {
    console.log('📞 Rejecting call');
    cleanup();
    
    if (incomingCallDataRef.current) {
      socketService.sendCallEnd({ to: incomingCallDataRef.current.from });
    }
    
    setIsIncoming(false);
    setCallType(null);
    setCallerName('');
    incomingCallDataRef.current = null;
  }, [cleanup]);

  const endCall = useCallback(() => {
    console.log('📞 Ending call');
    cleanup();
    
    isOfferSentRef.current = false;
    isAnswerSentRef.current = false;
    reconnectAttemptRef.current = 0;
    callStateRef.current = null;
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localAudioRef.current) localAudioRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;

    if (isCallActive && partnerId) {
      socketService.sendCallEnd({ to: partnerId });
    }

    setIsCallActive(false);
    setIsIncoming(false);
    setCallType(null);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    setCallQuality('good');
    incomingCallDataRef.current = null;
  }, [isCallActive, partnerId, cleanup]);

  const initializeCallListeners = useCallback(() => {
    if (listenersInitializedRef.current) return;
    
    console.log('🔧 Initializing call listeners');
    listenersInitializedRef.current = true;
    
    socketService.onCallOffer(async (data) => {
      console.log('📞 Incoming call offer');
      
      incomingCallDataRef.current = data;
      setCallerName('Anonymous Stranger');
      setCallType(data.callType);
      setIsIncoming(true);

      callTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Call timeout');
        cleanup();
        if (incomingCallDataRef.current) {
          socketService.sendCallEnd({ to: incomingCallDataRef.current.from });
        }
        setIsIncoming(false);
        setCallType(null);
        setCallerName('');
        incomingCallDataRef.current = null;
      }, CALL_TIMEOUT);
    });

    socketService.onCallAnswer(async (data) => {
      console.log('📞 Call answer received');
      if (!peerConnectionRef.current) return;

      const state = peerConnectionRef.current.signalingState;
      
      if (state === 'stable') {
        console.log('⚠️ Already stable, ignoring');
        return;
      }
      
      if (state === 'have-local-offer') {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          await processIceCandidateQueue();
          console.log('✅ Answer set');
        } catch (err) {
          console.error('❌ Error setting answer:', err);
        }
      }
    });

    socketService.onIceCandidate(async (data) => {
      if (!peerConnectionRef.current || !data.candidate) return;

      if (peerConnectionRef.current.remoteDescription === null) {
        console.log('📦 Queueing ICE candidate');
        iceCandidateQueueRef.current.push(data.candidate);
      } else {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          console.log('✅ ICE candidate added');
        } catch (err) {
          console.error('❌ Error adding ICE candidate:', err);
        }
      }
    });

    socketService.onCallEnded(() => {
      console.log('📞 Call ended by partner');
      endCall();
    });

    socketService.socket?.on('reconnect', () => {
      console.log('🔄 Socket reconnected');
    });
  }, [processIceCandidateQueue, endCall, cleanup]);

  const startCall = useCallback(async (type) => {
    if (!partnerId || isCallActive) return;

    console.log(`📞 Starting ${type} call`);
    
    try {
      isOfferSentRef.current = false;
      isAnswerSentRef.current = false;
      reconnectAttemptRef.current = 0;
      callStateRef.current = { type, isInitiator: true };
      
      setCallType(type);
      setIsCallActive(true);

      const stream = await getUserMedia(type);
      localStreamRef.current = stream;

      if (localVideoRef.current && type === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      setupPeerConnection(pc, true, partnerId);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketService.sendCallOffer({
        offer: offer,
        to: partnerId,
        from: userId,
        callType: type
      });

    } catch (error) {
      console.error('📞 Error starting call:', error);
      alert(error.message || 'Could not access camera/microphone');
      cleanup();
      setIsCallActive(false);
      setCallType(null);
    }
  }, [partnerId, userId, isCallActive, getUserMedia, setupPeerConnection, ICE_SERVERS, cleanup]);

  const acceptCall = useCallback(async () => {
    const data = incomingCallDataRef.current;
    if (!data) return;

    console.log('📞 Accepting call');
    cleanup();
    
    try {
      setIsIncoming(false);
      setIsCallActive(true);
      
      isOfferSentRef.current = false;
      isAnswerSentRef.current = false;
      reconnectAttemptRef.current = 0;
      callStateRef.current = { type: data.callType, isInitiator: false };

      const stream = await getUserMedia(data.callType);
      localStreamRef.current = stream;

      if (localVideoRef.current && data.callType === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      setupPeerConnection(pc, false, data.from);

      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      await processIceCandidateQueue();

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketService.sendCallAnswer({
        answer: answer,
        to: data.from
      });

    } catch (error) {
      console.error('📞 Error accepting call:', error);
      alert(error.message || 'Could not access camera/microphone');
      cleanup();
      if (incomingCallDataRef.current) {
        socketService.sendCallEnd({ to: incomingCallDataRef.current.from });
      }
      setIsIncoming(false);
      setCallType(null);
      setCallerName('');
      incomingCallDataRef.current = null;
    }
  }, [getUserMedia, setupPeerConnection, processIceCandidateQueue, cleanup, ICE_SERVERS]);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, []);

  const toggleSpeaker = useCallback(() => {
    if (remoteAudioRef.current) {
      const newState = !isSpeakerOn;
      setIsSpeakerOn(newState);
      
      if (remoteAudioRef.current.setSinkId) {
        remoteAudioRef.current.setSinkId(newState ? 'default' : 'communications')
          .catch(err => console.log('Speaker error:', err));
      }
      
      remoteAudioRef.current.volume = newState ? 1.0 : 0.8;
    }
  }, [isSpeakerOn]);

  const switchCamera = useCallback(async () => {
    if (!localStreamRef.current || callType !== 'video') return;
    
    try {
      const newFacingMode = isFrontCamera ? 'environment' : 'user';
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) videoTrack.stop();
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: false
      });
      
      const newVideoTrack = newStream.getVideoTracks()[0];
      
      if (peerConnectionRef.current) {
        const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender) await sender.replaceTrack(newVideoTrack);
      }
      
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      localStreamRef.current = new MediaStream([newVideoTrack, audioTrack]);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      
      setIsFrontCamera(!isFrontCamera);
    } catch (error) {
      console.error('❌ Camera switch failed:', error);
    }
  }, [isFrontCamera, callType]);

  useEffect(() => {
    return () => {
      cleanup();
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [cleanup]);

  return {
    isCallActive,
    callType,
    isIncoming,
    callerName,
    isVideoEnabled,
    isAudioEnabled,
    isSpeakerOn,
    isFrontCamera,
    callQuality,
    localVideoRef,
    remoteVideoRef,
    localAudioRef,
    remoteAudioRef,
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
