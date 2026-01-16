import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    try {
      // Clean up existing connection
      if (this.socket) {
        console.log('🧽 Cleaning up existing socket connection');
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
      }
      
      const socketUrl = process.env.REACT_APP_SOCKET_URL;
      if (!socketUrl) {
        throw new Error('REACT_APP_SOCKET_URL not configured');
      }
      
      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
      });
      
      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('✅ SOCKET CONNECTED:', this.socket.id);
      });

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false;
        console.log('❌ SOCKET DISCONNECTED:', reason);
      });

      this.socket.on('connect_error', (error) => {
        this.isConnected = false;
        console.error('❌ CONNECTION ERROR:', error);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        this.isConnected = true;
        console.log('🔄 RECONNECTED after', attemptNumber, 'attempts');
        const savedSession = localStorage.getItem('activeSession');
        if (savedSession) {
          const session = JSON.parse(savedSession);
          this.joinChat(session.userId);
        }
      });

      return this.socket;
    } catch (error) {
      console.error('❌ Socket connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinChat(profileId = null) {
    if (this.socket && this.isConnected) {
      console.log('🚀 Emitting join-chat event with profile:', profileId);
      this.socket.emit('join-chat', { profileId });
    } else {
      console.error('❌ Cannot join chat - socket not connected');
    }
  }

  sendMessage(message, messageId) {
    if (this.socket && this.isConnected && message.trim()) {
      console.log('📤 SENDING MESSAGE:', { message, messageId });
      this.socket.emit('send-message', { message, messageId });
    } else {
      console.error('❌ Cannot send message - socket not connected or empty message');
    }
  }
  
  startTyping() {
    if (this.socket && this.isConnected) {
      console.log('⌨️ EMITTING: typing-start');
      this.socket.emit('typing-start');
    } else {
      console.log('❌ Cannot emit typing-start - not connected');
    }
  }
  
  stopTyping() {
    if (this.socket && this.isConnected) {
      console.log('✋ EMITTING: typing-stop');
      this.socket.emit('typing-stop');
    } else {
      console.log('❌ Cannot emit typing-stop - not connected');
    }
  }
  
  markMessageSeen(messageId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('message-seen', { messageId });
    }
  }

  endChat() {
    if (this.socket) {
      this.socket.emit('end-chat');
    }
  }

  sendTyping() {
    if (this.socket) {
      this.socket.emit('typing');
    }
  }

  onUserCreated(callback) {
    if (this.socket) {
      this.socket.on('user-created', callback);
    }
  }

  onMatched(callback) {
    if (this.socket) {
      this.socket.on('matched', callback);
    }
  }

  onWaiting(callback) {
    if (this.socket) {
      this.socket.on('waiting', callback);
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  onMessageSent(callback) {
    if (this.socket) {
      this.socket.on('message-sent', callback);
    }
  }

  onChatEnded(callback) {
    if (this.socket) {
      this.socket.on('chat-ended', callback);
    }
  }

  onPartnerTyping(callback) {
    if (this.socket) {
      this.socket.on('partner-typing', callback);
    }
  }
  
  onMessageDelivered(callback) {
    if (this.socket) {
      this.socket.on('message-delivered', callback);
    }
  }
  
  onMessageSeenByPartner(callback) {
    if (this.socket) {
      this.socket.on('message-seen-by-partner', callback);
    }
  }
  
  onMessageStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('message-status-update', callback);
    }
  }
  
  onNetworkIssue(callback) {
    if (this.socket) {
      this.socket.on('network-issue', callback);
    }
  }
  
  onMessageFailed(callback) {
    if (this.socket) {
      this.socket.on('message-failed', callback);
    }
  }

  onError(callback) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }
  
  onEnableEndChat(callback) {
    if (this.socket) {
      this.socket.on('enable-end-chat', callback);
    }
  }
  
  onSessionTimeout(callback) {
    if (this.socket) {
      this.socket.on('session-timeout', callback);
    }
  }
  
  onInactivityWarning(callback) {
    if (this.socket) {
      this.socket.on('inactivity-warning', callback);
    }
  }

  onPartnerReconnected(callback) {
    if (this.socket) {
      this.socket.on('partner-reconnected', callback);
    }
  }

  onPartnerConnectionLost(callback) {
    if (this.socket) {
      this.socket.on('partner-connection-lost', callback);
    }
  }

  onCallConnectionLost(callback) {
    if (this.socket) {
      this.socket.on('call-connection-lost', callback);
    }
  }

  onCallReconnectNeeded(callback) {
    if (this.socket) {
      this.socket.on('call-reconnect-needed', callback);
    }
  }

  // Video Call Methods
  sendCallOffer(data) {
    if (this.socket && this.isConnected) {
      console.log('📞 Sending call offer:', data);
      this.socket.emit('call-offer', data);
    }
  }

  sendCallAnswer(data) {
    if (this.socket && this.isConnected) {
      console.log('📞 Sending call answer:', data);
      this.socket.emit('call-answer', data);
    }
  }

  sendIceCandidate(data) {
    if (this.socket && this.isConnected) {
      console.log('📞 Sending ICE candidate:', data);
      this.socket.emit('ice-candidate', data);
    }
  }

  sendCallEnd(data) {
    if (this.socket && this.isConnected) {
      console.log('📞 Sending call end:', data);
      this.socket.emit('call-end', data);
    }
  }

  onCallOffer(callback) {
    if (this.socket) {
      this.socket.on('call-offer', callback);
    }
  }

  onCallAnswer(callback) {
    if (this.socket) {
      this.socket.on('call-answer', callback);
    }
  }

  onIceCandidate(callback) {
    if (this.socket) {
      this.socket.on('ice-candidate', callback);
    }
  }

  onCallEnded(callback) {
    if (this.socket) {
      this.socket.on('call-ended', callback);
    }
  }

  onCallFailed(callback) {
    if (this.socket) {
      this.socket.on('call-failed', callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      console.log('🧽 Removing all socket listeners');
      this.socket.removeAllListeners();
    }
  }
  
  // Clean method to remove specific listeners
  removeEventListeners() {
    if (this.socket) {
      const events = [
        'user-created', 'matched', 'waiting', 'new-message', 'message-sent',
        'chat-ended', 'partner-typing', 'error', 'message-delivered', 
        'message-seen-by-partner', 'enable-end-chat', 'session-timeout', 
        'inactivity-warning', 'call-offer', 'call-answer', 'ice-candidate', 
        'call-ended', 'call-failed', 'partner-reconnected', 'partner-connection-lost',
        'call-connection-lost', 'call-reconnect-needed'
      ];
      
      events.forEach(event => {
        this.socket.off(event);
      });
      
      console.log('🧽 Removed specific event listeners');
    }
  }
}

const socketService = new SocketService();
export default socketService;