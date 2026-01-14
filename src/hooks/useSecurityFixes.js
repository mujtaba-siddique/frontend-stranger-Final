// FRONTEND HIGH PRIORITY FIXES

import { useCallback, useMemo, useRef, useEffect } from 'react';

// 1. Memory Leak Prevention Hook
export const useCleanup = (cleanupFn) => {
    const cleanupRef = useRef(cleanupFn);
    cleanupRef.current = cleanupFn;
    
    useEffect(() => {
        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
            }
        };
    }, []);
};

// 2. Optimized Socket Connection
export const useOptimizedSocket = (socketService) => {
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;
    
    const connect = useCallback(() => {
        try {
            socketService.connect();
            reconnectAttempts.current = 0;
        } catch (error) {
            console.error('Socket connection failed:', error);
            if (reconnectAttempts.current < maxReconnectAttempts) {
                reconnectAttempts.current++;
                setTimeout(connect, 2000 * reconnectAttempts.current);
            }
        }
    }, [socketService]);
    
    return { connect };
};

// 3. Message Validation
export const validateMessage = (message) => {
    if (!message || typeof message !== 'string') {
        return { valid: false, error: 'Invalid message' };
    }
    
    const trimmed = message.trim();
    if (!trimmed) {
        return { valid: false, error: 'Message cannot be empty' };
    }
    
    if (trimmed.length > 1000) {
        return { valid: false, error: 'Message too long' };
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /data:text\/html/i
    ];
    
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(trimmed)) {
            return { valid: false, error: 'Message contains invalid content' };
        }
    }
    
    return { valid: true, message: trimmed };
};

// 4. Debounced Input Hook
export const useDebouncedCallback = (callback, delay) => {
    const timeoutRef = useRef(null);
    
    return useCallback((...args) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);
};

// 5. Error Boundary Hook
export const useErrorHandler = () => {
    const [error, setError] = useState(null);
    
    const handleError = useCallback((error) => {
        console.error('Application error:', error);
        setError(error);
    }, []);
    
    const clearError = useCallback(() => {
        setError(null);
    }, []);
    
    return { error, handleError, clearError };
};

// 6. WebRTC Connection Monitor
export const useWebRTCMonitor = (webrtcService) => {
    const [connectionState, setConnectionState] = useState('new');
    const [iceState, setIceState] = useState('new');
    
    useEffect(() => {
        if (!webrtcService.peerConnection) return;
        
        const pc = webrtcService.peerConnection;
        
        const handleConnectionStateChange = () => {
            setConnectionState(pc.connectionState);
        };
        
        const handleIceStateChange = () => {
            setIceState(pc.iceConnectionState);
        };
        
        pc.addEventListener('connectionstatechange', handleConnectionStateChange);
        pc.addEventListener('iceconnectionstatechange', handleIceStateChange);
        
        return () => {
            pc.removeEventListener('connectionstatechange', handleConnectionStateChange);
            pc.removeEventListener('iceconnectionstatechange', handleIceStateChange);
        };
    }, [webrtcService.peerConnection]);
    
    return { connectionState, iceState };
};