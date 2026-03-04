import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import socketService from '../services/socketService';
import EncryptionService from '../utils/encryption';

const useCallManager = (userId, partnerId) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState(null);
  const [isIncoming, setIsIncoming] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [callerName, setCallerName] = useState('');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [callQuality, setCallQuality] = useState('good');
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const incomingCallDataRef = useRef(null);
  const callStateRef = useRef(null);
  const qualityCheckIntervalRef = useRef(null);
  const callTimeoutRef = useRef(null);
  const callActiveRef = useRef(false);
  const partnerIdRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const connectedTimeRef = useRef(null);
  const iceCandidateQueueRef = useRef([]);
  const remoteDescriptionSetRef = useRef(false);
  const isIncomingRef = useRef(false);
  const initialGatheringRef = useRef(false);
  const gatheringTimeoutRef = useRef(null);

  // Keep refs in sync to avoid stale closures
  useEffect(() => { callActiveRef.current = isCallActive; }, [isCallActive]);
  useEffect(() => { partnerIdRef.current = partnerId; }, [partnerId]);

  /*
   * FREE TURN SERVER CONFIGURATION
   * ─────────────────────────────────────────────────────
   * Uses multiple free providers for maximum reliability:
   * 
   * 1. Google STUN (unlimited, free) - for direct P2P
   * 2. Metered Open Relay TURN (free, ports 80/443) - main relay
   * 3. ExpressTURN (1000GB/month free) - backup relay
   * 
   * Ports 80 & 443 help bypass corporate firewalls.
   * TCP transport ensures connectivity even on strict networks.
   */
  const ICE_SERVERS = useMemo(() => [
    // Google STUN servers (free, unlimited)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },

    // Metered Open Relay TURN (free - static auth)
    {
      urls: 'turn:standard.relay.metered.ca:80',
      username: 'e8dd65b92c62d5590f72a0e4',
      credential: '5sIbJJYPc/Ib+dUI'
    },
    {
      urls: 'turn:standard.relay.metered.ca:80?transport=tcp',
      username: 'e8dd65b92c62d5590f72a0e4',
      credential: '5sIbJJYPc/Ib+dUI'
    },
    {
      urls: 'turn:standard.relay.metered.ca:443',
      username: 'e8dd65b92c62d5590f72a0e4',
      credential: '5sIbJJYPc/Ib+dUI'
    },
    {
      urls: 'turns:standard.relay.metered.ca:443?transport=tcp',
      username: 'e8dd65b92c62d5590f72a0e4',
      credential: '5sIbJJYPc/Ib+dUI'
    },

    // Backup TURN servers
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ], []);

  const CALL_TIMEOUT = 30000;
  const ICE_RESTART_DELAY = 3000;
  const ICE_GATHERING_TIMEOUT = 3000; // Max wait for ICE gathering before sending offer

  const resetCallState = useCallback(() => {
    setIsCallActive(false);
    setIsRinging(false);
    setIsIncoming(false);
    setCallType(null);
    setCallerName('');
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    setCallQuality('good');
    setCallDuration(0);
    connectedTimeRef.current = null;
    remoteDescriptionSetRef.current = false;
    iceCandidateQueueRef.current = [];
    isIncomingRef.current = false;
    initialGatheringRef.current = false;
    if (gatheringTimeoutRef.current) {
      clearTimeout(gatheringTimeoutRef.current);
      gatheringTimeoutRef.current = null;
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
    if (qualityCheckIntervalRef.current) {
      clearInterval(qualityCheckIntervalRef.current);
      qualityCheckIntervalRef.current = null;
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
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
    remoteStreamRef.current = null;
    callStateRef.current = null;
    incomingCallDataRef.current = null;
    remoteDescriptionSetRef.current = false;
    iceCandidateQueueRef.current = [];
    initialGatheringRef.current = false;
    if (gatheringTimeoutRef.current) {
      clearTimeout(gatheringTimeoutRef.current);
      gatheringTimeoutRef.current = null;
    }
  }, []);

  // Start call duration timer
  const startDurationTimer = useCallback(() => {
    connectedTimeRef.current = Date.now();
    durationIntervalRef.current = setInterval(() => {
      if (connectedTimeRef.current) {
        setCallDuration(Math.floor((Date.now() - connectedTimeRef.current) / 1000));
      }
    }, 1000);
  }, []);

  const monitorCallQuality = useCallback(() => {
    if (!peerConnectionRef.current) return;
    qualityCheckIntervalRef.current = setInterval(async () => {
      try {
        if (!peerConnectionRef.current) return;
        const stats = await peerConnectionRef.current.getStats();
        let packetsLost = 0;
        let packetsReceived = 0;
        let jitter = 0;
        let roundTripTime = 0;

        stats.forEach(report => {
          if (report.type === 'inbound-rtp' && report.kind === 'audio') {
            packetsLost += report.packetsLost || 0;
            packetsReceived += report.packetsReceived || 0;
            jitter = report.jitter || 0;
          }
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            roundTripTime = report.currentRoundTripTime || 0;
          }
        });

        const lossRate = packetsReceived > 0 ? (packetsLost / packetsReceived) * 100 : 0;

        // Quality based on loss + jitter + RTT
        if (lossRate > 10 || jitter > 0.1 || roundTripTime > 0.5) {
          setCallQuality('poor');
        } else if (lossRate > 3 || jitter > 0.05 || roundTripTime > 0.3) {
          setCallQuality('fair');
        } else {
          setCallQuality('good');
        }
      } catch (err) {
        // Silently ignore - connection may have closed
      }
    }, 3000);
  }, []);

  // Process queued ICE candidates after remote description is set
  const processIceCandidateQueue = useCallback(async () => {
    if (!peerConnectionRef.current || !remoteDescriptionSetRef.current) return;

    const queue = iceCandidateQueueRef.current;
    iceCandidateQueueRef.current = [];

    for (const candidate of queue) {
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('⚠️ Queued ICE candidate failed:', err.message);
      }
    }
    if (queue.length > 0) {
      console.log(`✅ Processed ${queue.length} queued ICE candidates`);
    }
  }, []);

  const getUserMedia = useCallback(async (type) => {
    const constraints = {
      video: type === 'video' ? {
        facingMode: 'user',
        width: { ideal: 1280, min: 640 },
        height: { ideal: 720, min: 480 },
        frameRate: { ideal: 30, max: 30 }
      } : false,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
        channelCount: 1
      }
    };
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      // Fallback: try with lower quality constraints
      if (type === 'video') {
        try {
          return await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: 640, height: 480 },
            audio: { echoCancellation: true, noiseSuppression: true }
          });
        } catch (fallbackErr) {
          // Try audio-only as last resort
          try {
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            return audioStream;
          } catch (audioErr) {
            throw new Error('Camera/microphone access denied');
          }
        }
      }
      if (err.name === 'NotAllowedError') {
        throw new Error('Camera/microphone permission denied. Please allow access and try again.');
      } else if (err.name === 'NotFoundError') {
        throw new Error('No camera/microphone found on this device.');
      } else if (err.name === 'NotReadableError') {
        throw new Error('Camera/microphone is being used by another app.');
      }
      throw err;
    }
  }, []);

  // Attach remote stream to video/audio elements — with retry for when elements aren't mounted yet
  const attachRemoteStream = useCallback((stream) => {
    if (!stream) return;

    const tryAttach = () => {
      let attached = false;
      // Attach video
      const hasVideo = stream.getVideoTracks().length > 0;
      if (hasVideo && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play().catch(() => { });
        console.log('✅ Remote video attached');
        attached = true;
      }
      // Attach audio
      const hasAudio = stream.getAudioTracks().length > 0;
      if (hasAudio && remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.volume = 1.0;
        remoteAudioRef.current.play().catch(() => { });
        console.log('✅ Remote audio attached');
        attached = true;
      }
      return attached;
    };

    // Try immediately
    if (!tryAttach()) {
      // Elements not mounted yet — retry after React renders
      console.log('⏳ Remote stream saved, waiting for video elements to mount...');
      const retryInterval = setInterval(() => {
        if (tryAttach()) {
          clearInterval(retryInterval);
          console.log('✅ Remote stream attached on retry');
        }
      }, 100);
      // Stop retrying after 5 seconds
      setTimeout(() => clearInterval(retryInterval), 5000);
    }
  }, []);

  const setupPeerConnection = useCallback((pc, isInitiator, targetId) => {
    pc.ontrack = (event) => {
      console.log('📞 Remote track received:', event.track.kind, 'streams:', event.streams.length);
      const remoteStream = event.streams[0] || new MediaStream([event.track]);
      // Save the remote stream so it persists
      remoteStreamRef.current = remoteStream;
      // Attach to elements (with retry if not mounted yet)
      attachRemoteStream(remoteStream);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // During initial gathering phase (caller), don't trickle ICE candidates
        // They'll be bundled into the SDP offer when gathering completes
        if (initialGatheringRef.current) {
          console.log('📦 ICE candidate gathered (bundling in offer)');
          return;
        }
        socketService.sendIceCandidate({
          candidate: event.candidate,
          to: targetId
        });
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log('📞 Connection state:', state);

      if (state === 'connected') {
        setIsRinging(false);
        startDurationTimer();
        monitorCallQuality();
      }

      if (state === 'disconnected') {
        console.log('⚠️ Peer disconnected, attempting ICE restart in 3s...');
        setTimeout(() => {
          if (peerConnectionRef.current && peerConnectionRef.current.connectionState === 'disconnected') {
            try {
              if (peerConnectionRef.current.restartIce) {
                peerConnectionRef.current.restartIce();
                console.log('🔄 ICE restart triggered');
              }
            } catch (e) {
              console.error('ICE restart failed:', e);
            }
          }
        }, ICE_RESTART_DELAY);
      }

      if (state === 'failed') {
        console.log('❌ Peer connection failed, attempting recovery...');
        // Try ICE restart first instead of immediately killing the call
        try {
          if (peerConnectionRef.current && peerConnectionRef.current.restartIce) {
            peerConnectionRef.current.restartIce();
            console.log('🔄 ICE restart triggered on failure');
          }
        } catch (e) {
          console.error('ICE restart on failure failed:', e);
        }
        // Give it 10 seconds to recover, then end the call
        setTimeout(() => {
          if (peerConnectionRef.current && peerConnectionRef.current.connectionState === 'failed') {
            console.log('❌ Peer connection permanently failed after retry');
            if (callActiveRef.current && partnerIdRef.current) {
              socketService.sendCallEnd({ to: partnerIdRef.current });
            }
            cleanup();
            resetCallState();
          }
        }, 10000);
      }
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      console.log('🧊 ICE connection state:', state);
      if (state === 'failed') {
        try {
          if (pc.restartIce) pc.restartIce();
          console.log('🔄 ICE restart on ICE failure');
        } catch (e) { /* ignore */ }
      }
      // Re-attach remote stream when ICE reconnects
      if (state === 'connected' || state === 'completed') {
        if (remoteStreamRef.current) {
          attachRemoteStream(remoteStreamRef.current);
        }
      }
    };

    pc.onicegatheringstatechange = () => {
      console.log('🧊 ICE gathering state:', pc.iceGatheringState);
      // When initial ICE gathering completes, send the offer with all candidates in SDP
      if (pc.iceGatheringState === 'complete' && initialGatheringRef.current) {
        initialGatheringRef.current = false;
        // Clear the gathering fallback timeout
        if (gatheringTimeoutRef.current) {
          clearTimeout(gatheringTimeoutRef.current);
          gatheringTimeoutRef.current = null;
        }
        console.log('✅ ICE gathering complete, sending offer with bundled candidates');
        socketService.sendCallOffer({
          offer: pc.localDescription,
          to: partnerIdRef.current,
          from: userId,
          callType: callStateRef.current?.type
        });
        setIsRinging(true);
        console.log('📤 Call offer sent, now Ringing...');
      }
    };
  }, [monitorCallQuality, cleanup, resetCallState, startDurationTimer, attachRemoteStream, userId]);

  // endCall uses refs - no stale closure
  const endCall = useCallback(() => {
    console.log('📞 Ending call');
    const wasActive = callActiveRef.current;
    const currentPartnerId = partnerIdRef.current;
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
    cleanup();
    if (wasActive && currentPartnerId) {
      socketService.sendCallEnd({ to: currentPartnerId });
    }
    resetCallState();
  }, [cleanup, resetCallState]);

  const rejectCall = useCallback(() => {
    console.log('📞 Rejecting call');
    if (incomingCallDataRef.current) {
      socketService.sendCallEnd({ to: incomingCallDataRef.current.from });
      incomingCallDataRef.current = null;
    }
    setIsIncoming(false);
    setCallType(null);
    setCallerName('');
    callStateRef.current = null;
    isIncomingRef.current = false;
  }, []);

  const initializeCallListeners = useCallback(() => {
    // NOTE: No guard here — socketService methods already use socket.off() before socket.on()
    // so duplicate listeners are impossible. The guard was preventing re-binding after reconnect.
    console.log('🔧 Initializing call listeners');

    socketService.onCallOffer(async (data) => {
      console.log('📞 Incoming encrypted call offer from:', data.from);
      // Decrypt offer from backend
      const decryptedOffer = EncryptionService.decrypt(data.offer);
      if (callActiveRef.current || isIncomingRef.current) {
        console.log('⚠️ Already in a call or incoming, auto-rejecting');
        socketService.sendCallEnd({ to: data.from });
        return;
      }
      incomingCallDataRef.current = { ...data, offer: decryptedOffer };
      isIncomingRef.current = true;
      setCallerName('Anonymous Stranger');
      setCallType(data.callType);
      setIsIncoming(true);
    });

    socketService.onCallAnswer(async (data) => {
      console.log('📞 Call answer received (encrypted)');
      if (!peerConnectionRef.current) return;
      const state = peerConnectionRef.current.signalingState;
      if (state === 'stable') return;
      if (state === 'have-local-offer') {
        try {
          // Decrypt answer from backend
          const decryptedAnswer = EncryptionService.decrypt(data.answer);
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(decryptedAnswer));
          remoteDescriptionSetRef.current = true;
          console.log('✅ Remote description (answer) set');
          setIsRinging(false);
          if (callTimeoutRef.current) {
            clearTimeout(callTimeoutRef.current);
            callTimeoutRef.current = null;
          }
          await processIceCandidateQueue();
        } catch (err) {
          console.error('❌ Error setting answer:', err);
          endCall();
        }
      }
    });

    socketService.onIceCandidate(async (data) => {
      if (!data.candidate) return;

      // Decrypt ICE candidate from backend
      const decryptedCandidate = EncryptionService.decrypt(data.candidate);

      if (!peerConnectionRef.current || !remoteDescriptionSetRef.current) {
        iceCandidateQueueRef.current.push(decryptedCandidate);
        console.log('📦 ICE candidate queued (waiting for peer connection / remote description)');
        return;
      }

      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(decryptedCandidate));
      } catch (err) {
        console.warn('⚠️ Error adding ICE candidate:', err.message);
      }
    });

    socketService.onCallEnded(() => {
      console.log('📞 Call ended by partner');
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
      cleanup();
      resetCallState();
    });

    socketService.onCallFailed((data) => {
      console.log('📞 Call failed:', data.reason);
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
      cleanup();
      resetCallState();
    });

    socketService.onCallTimeout((data) => {
      console.log('📞 Call timeout:', data.reason);
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
      cleanup();
      resetCallState();
    });
  }, [cleanup, endCall, resetCallState, processIceCandidateQueue]);

  // startCall with Calling → Ringing flow
  // Phase 1: "Calling..." — ICE candidates are being gathered
  // Phase 2: "Ringing..." — ICE gathering complete, offer sent to receiver
  const startCall = useCallback(async (type) => {
    if (!partnerId || callActiveRef.current) return;
    console.log(`📞 Starting ${type} call to ${partnerId}`);
    try {
      callStateRef.current = { type, isInitiator: true };
      setCallType(type);
      setIsCallActive(true);
      // Don't set isRinging yet — we're in "Calling..." phase
      setIsRinging(false);
      setCallDuration(0);

      const stream = await getUserMedia(type);
      localStreamRef.current = stream;
      // Attach local video — may need to retry if element not mounted yet
      if (type === 'video') {
        const attachLocal = () => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            return true;
          }
          return false;
        };
        if (!attachLocal()) {
          const retryId = setInterval(() => {
            if (attachLocal()) clearInterval(retryId);
          }, 100);
          setTimeout(() => clearInterval(retryId), 3000);
        }
      }

      const pc = new RTCPeerConnection({
        iceServers: ICE_SERVERS,
        iceCandidatePoolSize: 10,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        iceTransportPolicy: 'relay'  // Force TURN for Jio
      });
      peerConnectionRef.current = pc;
      remoteDescriptionSetRef.current = false;
      initialGatheringRef.current = true; // Enable gathering phase — suppress trickle ICE

      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
        console.log(`📡 Added ${track.kind} track to peer connection`);
      });

      setupPeerConnection(pc, true, partnerId);

      // Create offer with optimal codecs
      const offerOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: type === 'video'
      };
      const offer = await pc.createOffer(offerOptions);
      await pc.setLocalDescription(offer);
      console.log('📞 Calling... (ICE gathering in progress)');

      // If ICE gathering is already complete (unlikely but possible), send offer now
      if (pc.iceGatheringState === 'complete') {
        initialGatheringRef.current = false;
        socketService.sendCallOffer({
          offer: pc.localDescription, to: partnerId, from: userId, callType: type
        });
        setIsRinging(true);
        console.log('📤 Call offer sent immediately (ICE was already complete)');
      } else {
        // Fallback: if ICE gathering takes too long (slow TURN servers etc.),
        // send the offer with whatever candidates we have after timeout
        gatheringTimeoutRef.current = setTimeout(() => {
          if (initialGatheringRef.current && peerConnectionRef.current) {
            initialGatheringRef.current = false;
            console.log('⏱️ ICE gathering timeout, sending offer with partial candidates');
            socketService.sendCallOffer({
              offer: peerConnectionRef.current.localDescription,
              to: partnerIdRef.current,
              from: userId,
              callType: type
            });
            setIsRinging(true);
            console.log('📤 Call offer sent (partial ICE), now Ringing...');
          }
        }, ICE_GATHERING_TIMEOUT);
      }
      // onicegatheringstatechange in setupPeerConnection will handle normal completion

      // Client-side call timeout
      callTimeoutRef.current = setTimeout(() => {
        if (callActiveRef.current && peerConnectionRef.current) {
          const connState = peerConnectionRef.current.connectionState;
          if (connState !== 'connected') {
            console.log('📞 Call timeout - no answer after 30s');
            endCall();
          }
        }
      }, CALL_TIMEOUT);
    } catch (error) {
      console.error('📞 Error starting call:', error);
      cleanup();
      setIsCallActive(false);
      setIsRinging(false);
      setCallType(null);
      initialGatheringRef.current = false;
      if (gatheringTimeoutRef.current) {
        clearTimeout(gatheringTimeoutRef.current);
        gatheringTimeoutRef.current = null;
      }
    }
  }, [partnerId, userId, getUserMedia, setupPeerConnection, ICE_SERVERS, cleanup, endCall]);

  const acceptCall = useCallback(async () => {
    const data = incomingCallDataRef.current;
    if (!data) return;
    console.log('📞 Accepting', data.callType, 'call from:', data.from);
    try {
      setIsIncoming(false);
      setIsCallActive(true);
      setCallDuration(0);
      callStateRef.current = { type: data.callType, isInitiator: false };

      const stream = await getUserMedia(data.callType);
      localStreamRef.current = stream;
      // Attach local video — may need to retry if element not mounted yet
      if (data.callType === 'video') {
        const attachLocal = () => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            return true;
          }
          return false;
        };
        if (!attachLocal()) {
          const retryId = setInterval(() => {
            if (attachLocal()) clearInterval(retryId);
          }, 100);
          setTimeout(() => clearInterval(retryId), 3000);
        }
      }

      const pc = new RTCPeerConnection({
        iceServers: ICE_SERVERS,
        iceCandidatePoolSize: 10,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        iceTransportPolicy: 'relay'  // Force TURN for Jio
      });
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
        console.log(`📡 Added ${track.kind} track to peer connection`);
      });

      setupPeerConnection(pc, false, data.from);

      // Set remote description first, then create answer
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      remoteDescriptionSetRef.current = true;
      console.log('✅ Remote description (offer) set');

      // Process any queued ICE candidates
      await processIceCandidateQueue();

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketService.sendCallAnswer({ answer, to: data.from });
      console.log('📤 Call answer sent');

      incomingCallDataRef.current = null;
    } catch (error) {
      console.error('📞 Error accepting call:', error);
      if (incomingCallDataRef.current) {
        socketService.sendCallEnd({ to: incomingCallDataRef.current.from });
      }
      cleanup();
      setIsIncoming(false);
      setIsCallActive(false);
      setCallType(null);
      setCallerName('');
    }
  }, [getUserMedia, setupPeerConnection, ICE_SERVERS, cleanup, processIceCandidateQueue]);

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
          .catch(err => console.log('Speaker toggle error:', err));
      }
      remoteAudioRef.current.volume = newState ? 1.0 : 0.8;
    }
  }, [isSpeakerOn]);

  const switchCamera = useCallback(async () => {
    if (!localStreamRef.current || callType !== 'video') return;
    const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
    const newFacingMode = isFrontCamera ? 'environment' : 'user';
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      const newVideoTrack = newStream.getVideoTracks()[0];
      if (peerConnectionRef.current) {
        const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender) await sender.replaceTrack(newVideoTrack);
      }
      if (oldVideoTrack) oldVideoTrack.stop();
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      localStreamRef.current = new MediaStream(audioTrack ? [newVideoTrack, audioTrack] : [newVideoTrack]);
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      setIsFrontCamera(!isFrontCamera);
    } catch (error) {
      console.error('❌ Camera switch failed:', error);
    }
  }, [isFrontCamera, callType]);

  useEffect(() => {
    return () => {
      cleanup();
      if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      if (gatheringTimeoutRef.current) clearTimeout(gatheringTimeoutRef.current);
    };
  }, [cleanup]);

  return {
    isCallActive,
    callType,
    isIncoming,
    isRinging,
    callerName,
    isVideoEnabled,
    isAudioEnabled,
    isSpeakerOn,
    isFrontCamera,
    callQuality,
    callDuration,
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
