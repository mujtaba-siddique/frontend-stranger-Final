class NotificationService {
  constructor() {
    this.permission = 'default';
    this.init();
  }

  async init() {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
    }
  }

  async requestPermission() {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    }
    return false;
  }

  showNotification(title, options = {}) {
    if (this.permission === 'granted' && 'Notification' in window) {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'stranger-chat',
        renotify: true,
        ...options
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    }
  }

  showMessageNotification(message, senderName = 'Anonymous Stranger') {
    return this.showNotification(`New message from ${senderName}`, {
      body: message.length > 50 ? message.substring(0, 50) + '...' : message,
      icon: '/favicon.ico',
      tag: 'new-message'
    });
  }

  playNotificationSound() {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Could not play notification sound:', e));
    } catch (error) {
      console.log('Notification sound not available:', error);
    }
  }
}

const notificationService = new NotificationService();
export default notificationService;