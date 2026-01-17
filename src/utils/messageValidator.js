// Message validation and sanitization utilities

export const validateMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return { isValid: false, error: 'Message must be a string' };
  }

  const trimmed = message.trim();
  
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }

  // NO LENGTH LIMIT - UNLIMITED
  // NO SPAM PATTERN CHECK - UNLIMITED

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
  // NO SPAM DETECTION - UNLIMITED MESSAGES ALLOWED
  return { isSpam: false };
};