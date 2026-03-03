// Voice Recorder Class
export class VoiceRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.stream = null;
    }

    async startRecording() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.start();
            return true;
        } catch (error) {
            console.error('Recording failed:', error);
            return false;
        }
    }

    stopRecording() {
        return new Promise((resolve) => {
            if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
                resolve(null);
                return;
            }

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                this.cleanup();
                resolve(audioBlob);
            };

            this.mediaRecorder.stop();
        });
    }

    cleanup() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.audioChunks = [];
    }

    isRecording() {
        return this.mediaRecorder && this.mediaRecorder.state === 'recording';
    }
}

// Voice Player Class
export class VoicePlayer {
    constructor() {
        this.audioElement = null;
        this.receivedChunks = [];
        this.isReceiving = false;
    }

    startReceiving() {
        this.receivedChunks = [];
        this.isReceiving = true;
        this.receivedMessageId = null;
        console.log('📽️ Started receiving new voice message');
    }

    addChunk(chunk) {
        try {
            const text = new TextDecoder().decode(chunk);

            // Check for message ID
            if (text.startsWith('MSG_ID:')) {
                const newMessageId = text.substring(7).trim();
                console.log('🏷️ Received messageId:', newMessageId);

                // Start receiving if not already
                if (!this.isReceiving) {
                    this.isReceiving = true;
                    this.receivedChunks = [];
                }

                // Set messageId AFTER starting
                this.receivedMessageId = newMessageId;
                return;
            }

            // Check if this is the end marker
            if (text === 'END_OF_VOICE' || text.trim() === 'END_OF_VOICE') {
                console.log('✅ End marker received, finishing with messageId:', this.receivedMessageId);
                this.finishReceiving();
                return;
            }
        } catch (e) {
            // Decode failed - it's binary audio data
        }

        // If not MSG_ID or END_OF_VOICE, treat as binary audio data
        if (this.isReceiving) {
            this.receivedChunks.push(new Uint8Array(chunk));
        }
    }

    finishReceiving() {
        if (this.receivedChunks.length === 0) {
            console.log('⚠️ No chunks to play');
            this.isReceiving = false;
            this.receivedMessageId = null;
            return;
        }

        const messageId = this.receivedMessageId;

        // Skip if messageId is null
        if (!messageId) {
            console.log('⚠️ Skipping voice message - no messageId');
            this.receivedChunks = [];
            this.isReceiving = false;
            this.receivedMessageId = null;
            return;
        }

        console.log('🎵 Creating blob from', this.receivedChunks.length, 'chunks with messageId:', messageId);
        const blob = new Blob(this.receivedChunks, { type: 'audio/webm' });
        console.log('🎵 Blob size:', blob.size, 'bytes');

        // Don't auto-play, just store the blob and trigger callback
        if (this.onVoiceMessageReceived) {
            this.onVoiceMessageReceived(blob, messageId);
        }

        this.receivedChunks = [];
        this.isReceiving = false;
        this.receivedMessageId = null;
    }

    playVoice(blob, onEndCallback) {
        // Stop any existing playback
        if (this.audioElement) {
            this.audioElement.pause();
            URL.revokeObjectURL(this.audioElement.src);
            this.audioElement = null;
        }

        console.log('🔊 Playing voice message...');
        this.audioElement = new Audio();
        this.audioElement.src = URL.createObjectURL(blob);

        this.audioElement.onended = () => {
            console.log('✅ Playback ended');
            if (this.audioElement) {
                URL.revokeObjectURL(this.audioElement.src);
                this.audioElement = null;
            }
            // Use the callback passed as parameter
            if (onEndCallback) {
                onEndCallback();
            } else if (this.onPlaybackEnd) {
                this.onPlaybackEnd();
            }
        };

        this.audioElement.onerror = (error) => {
            console.error('❌ Playback error:', error);
            if (this.audioElement) {
                URL.revokeObjectURL(this.audioElement.src);
                this.audioElement = null;
            }
        };

        this.audioElement.play().then(() => {
            console.log('▶️ Playback started');
        }).catch(error => {
            console.error('Playback failed:', error);
            if (this.audioElement) {
                URL.revokeObjectURL(this.audioElement.src);
                this.audioElement = null;
            }
        });
    }

    stop() {
        if (this.audioElement) {
            this.audioElement.pause();
            URL.revokeObjectURL(this.audioElement.src);
            this.audioElement = null;
        }
        this.receivedChunks = [];
        this.isReceiving = false;
    }
}

// WebRTC Voice Class
export class WebRTCVoice {
    constructor(socket, userId) {
        this.socket = socket;
        this.userId = userId;
        this.peerConnection = null;
        this.dataChannel = null;
        this.pendingCandidates = [];
        this.isAnswerSet = false;

        this.config = {
            iceServers: [
                // Google STUN servers (free, unlimited)
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },

                // Metered Open Relay TURN (free)
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
            ]
        };

        this.setupSocketListeners();
    }

    setupSocketListeners() {
        // Remove old listeners first
        this.socket.off('voice-offer');
        this.socket.off('voice-answer');
        this.socket.off('voice-ice-candidate');

        this.socket.on('voice-offer', async (data) => {
            console.log('📞 Received voice-offer from:', data.from);
            await this.handleOffer(data);
        });

        this.socket.on('voice-answer', async (data) => {
            console.log('📥 Received voice-answer');
            await this.handleAnswer(data);
        });

        this.socket.on('voice-ice-candidate', async (data) => {
            console.log('❄️ Received ICE candidate');
            await this.handleIceCandidate(data);
        });
    }

    async createOffer(partnerId) {
        try {
            // Close existing connection if any
            if (this.peerConnection) {
                console.log('🧹 Closing existing connection...');
                this.peerConnection.close();
            }

            console.log('🆕 Creating new RTCPeerConnection...');
            this.peerConnection = new RTCPeerConnection(this.config);
            this.partnerId = partnerId;
            this.isAnswerSet = false;
            this.pendingCandidates = [];
            this.setupPeerConnection();

            this.dataChannel = this.peerConnection.createDataChannel('voice', {
                ordered: true
            });
            this.setupDataChannel(this.dataChannel);

            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            console.log('📤 Sending offer to:', partnerId);
            this.socket.emit('voice-offer', {
                offer: offer,
                to: partnerId,
                from: this.userId
            });

            return true;
        } catch (error) {
            console.error('Offer creation failed:', error);
            return false;
        }
    }

    async handleOffer(data) {
        try {
            // Close existing connection if any
            if (this.peerConnection) {
                console.log('🧹 Closing existing connection for new offer...');
                this.peerConnection.close();
            }

            console.log('🆕 Creating peer connection for offer...');
            this.peerConnection = new RTCPeerConnection(this.config);
            this.partnerId = data.from;
            this.isAnswerSet = false;
            this.pendingCandidates = [];
            this.setupPeerConnection();

            this.peerConnection.ondatachannel = (event) => {
                console.log('📡 DataChannel received');
                this.dataChannel = event.channel;
                this.setupDataChannel(this.dataChannel);
            };

            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));

            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            this.isAnswerSet = true;

            console.log('📤 Sending answer to:', data.from);
            this.socket.emit('voice-answer', {
                answer: answer,
                to: data.from
            });

            this.processPendingCandidates();
        } catch (error) {
            console.error('Offer handling failed:', error);
        }
    }

    async handleAnswer(data) {
        try {
            if (!this.peerConnection) {
                console.error('❌ No peer connection for answer');
                return;
            }

            if (this.peerConnection.signalingState !== 'have-local-offer') {
                console.warn('⚠️ Wrong state for answer:', this.peerConnection.signalingState);
                return;
            }

            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
            this.isAnswerSet = true;
            this.processPendingCandidates();
        } catch (error) {
            console.error('Answer handling failed:', error);
        }
    }

    async handleIceCandidate(data) {
        try {
            const candidate = new RTCIceCandidate(data.candidate);

            if (this.peerConnection && this.peerConnection.remoteDescription && this.isAnswerSet) {
                await this.peerConnection.addIceCandidate(candidate);
            } else {
                // Queue candidates if connection not ready yet (don't drop them)
                this.pendingCandidates.push(candidate);
                console.log('📦 Voice ICE candidate queued (waiting for connection)');
            }
        } catch (error) {
            console.error('ICE candidate error:', error);
        }
    }

    async processPendingCandidates() {
        for (const candidate of this.pendingCandidates) {
            try {
                await this.peerConnection.addIceCandidate(candidate);
            } catch (error) {
                console.error('Pending ICE error:', error);
            }
        }
        this.pendingCandidates = [];
    }

    setupPeerConnection() {
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit('voice-ice-candidate', {
                    candidate: event.candidate,
                    to: this.partnerId
                });
            }
        };

        this.peerConnection.onconnectionstatechange = () => {
            if (this.onConnectionStateChange) {
                this.onConnectionStateChange(this.peerConnection.connectionState);
            }
        };
    }

    setupDataChannel(channel) {
        channel.binaryType = 'arraybuffer';

        channel.onopen = () => {
            console.log('✅ DataChannel opened!');
            if (this.onChannelOpen) this.onChannelOpen();
        };

        channel.onmessage = (event) => {
            if (this.onVoiceReceived) {
                this.onVoiceReceived(event.data);
            }
        };

        channel.onerror = (error) => {
            console.error('DataChannel error:', error);
        };

        channel.onclose = () => {
            if (this.onChannelClose) this.onChannelClose();
        };
    }

    async sendVoiceBlob(blob, partnerId, messageId) {
        this.partnerId = partnerId;
        this.currentMessageId = messageId;

        // Check if we need a new connection
        const needsNewConnection = !this.peerConnection ||
            this.peerConnection.connectionState === 'closed' ||
            this.peerConnection.connectionState === 'failed' ||
            !this.dataChannel ||
            this.dataChannel.readyState === 'closed';

        if (needsNewConnection) {
            console.log('🔄 Creating new peer connection...');
            await this.createOffer(partnerId);
            await this.waitForConnection();
        } else if (this.dataChannel.readyState === 'connecting') {
            console.log('⏳ Waiting for existing connection...');
            await this.waitForConnection();
        } else if (this.dataChannel.readyState === 'open') {
            console.log('✅ Reusing existing connection');
        }

        console.log('📡 DataChannel ready, sending blob with messageId:', messageId);

        // Send messageId first
        this.dataChannel.send(new TextEncoder().encode(`MSG_ID:${messageId}`));

        const arrayBuffer = await blob.arrayBuffer();
        const chunkSize = 16384;

        for (let offset = 0; offset < arrayBuffer.byteLength; offset += chunkSize) {
            const chunk = arrayBuffer.slice(offset, offset + chunkSize);
            this.dataChannel.send(chunk);
        }

        this.dataChannel.send(new TextEncoder().encode('END_OF_VOICE'));
    }

    waitForConnection(timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const checkConnection = setInterval(() => {
                if (this.dataChannel && this.dataChannel.readyState === 'open') {
                    clearInterval(checkConnection);
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(checkConnection);
                    reject(new Error('Connection timeout'));
                }
            }, 100);
        });
    }

    close() {
        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = null;
        }

        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        this.pendingCandidates = [];
        this.isAnswerSet = false;
    }
}
