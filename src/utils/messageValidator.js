// Message validation and sanitization utilities

export const validateMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return { isValid: false, error: 'Message must be a string' };
  }

  const trimmed = message.trim();
  
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }

  if (trimmed.length > 1000) {
    return { isValid: false, error: 'Message too long (max 1000 characters)' };
  }

  // Check for spam patterns
  const spamPatterns = [
    /(.)\1{10,}/g, // Repeated characters
    /https?:\/\/[^\s]+/gi, // URLs
    /\b\d{10,}\b/g, // Long numbers (phone numbers)
    /@[a-zA-Z0-9._-]+/g // Email-like patterns
  ];

  for (const pattern of spamPatterns) {
    if (pattern.test(trimmed)) {
      return { isValid: false, error: 'Message contains prohibited content' };
    }
  }

  return { isValid: true, message: trimmed };
};

export const sanitizeMessage = (message) => {
  if (!message) return '';
  
  return message
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

export const detectSpam = (messages, userId, timeWindow = 60000) => {
  const now = Date.now();
  const recentMessages = messages.filter(msg => 
    msg.senderId === userId && 
    (now - new Date(msg.timestamp).getTime()) < timeWindow
  );

  // Rate limiting: max 10 messages per minute
  if (recentMessages.length >= 10) {
    return { isSpam: true, reason: 'Rate limit exceeded' };
  }

  // Duplicate message detection
  const lastMessage = recentMessages[recentMessages.length - 1];
  const duplicates = recentMessages.filter(msg => msg.message === lastMessage?.message);
  
  if (duplicates.length >= 3) {
    return { isSpam: true, reason: 'Duplicate messages detected' };
  }

  return { isSpam: false };
};