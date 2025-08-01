// Push Notification System for Miroir
class MiroirNotifications {
  constructor() {
    this.init();
  }

  async init() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        this.swRegistration = registration;
        this.setupNotificationButton();
        this.checkExistingSubscription();
      } catch (error) {
        console.log('Service Worker registration failed:', error);
      }
    }
  }

  setupNotificationButton() {
    const notificationBtn = document.createElement('button');
    notificationBtn.id = 'notification-toggle';
    notificationBtn.innerHTML = '🔔';
    notificationBtn.style.cssText = `
      position: fixed;
      top: 20px;
      right: 80px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 2px solid var(--theme-accent, #e50914);
      background: transparent;
      color: var(--theme-accent, #e50914);
      font-size: 20px;
      cursor: pointer;
      z-index: 1000;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    `;

    notificationBtn.addEventListener('mouseenter', () => {
      notificationBtn.style.background = 'var(--theme-accent, #e50914)';
      notificationBtn.style.color = 'var(--theme-bg, #000)';
      notificationBtn.style.boxShadow = '0 0 15px var(--theme-accent, #e50914)';
    });

    notificationBtn.addEventListener('mouseleave', () => {
      notificationBtn.style.background = 'transparent';
      notificationBtn.style.color = 'var(--theme-accent, #e50914)';
      notificationBtn.style.boxShadow = 'none';
    });

    notificationBtn.addEventListener('click', () => this.toggleNotifications());
    document.body.appendChild(notificationBtn);
  }

  async checkExistingSubscription() {
    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        this.updateNotificationButton(true);
      }
    } catch (error) {
      console.log('Error checking subscription:', error);
    }
  }

  async toggleNotifications() {
    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      
      if (subscription) {
        await this.unsubscribeFromNotifications(subscription);
      } else {
        await this.subscribeToNotifications();
      }
    } catch (error) {
      console.log('Error toggling notifications:', error);
    }
  }

  async subscribeToNotifications() {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // In a real app, you'd get this from your server
        const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NUG7J0EdpjpgF0NpdqW0UhGLZ5g3V_RhNEOJ1nDLCTK7cHfztB2L4M';
        
        const subscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
        });

        // Send subscription to server (in a real app)
        await this.sendSubscriptionToServer(subscription);
        
        this.updateNotificationButton(true);
        this.showLocalNotification('Notifications Enabled', 'You will now receive updates about new stories and reflections');
      }
    } catch (error) {
      console.log('Error subscribing to notifications:', error);
    }
  }

  async unsubscribeFromNotifications(subscription) {
    try {
      await subscription.unsubscribe();
      this.updateNotificationButton(false);
      this.showLocalNotification('Notifications Disabled', 'You will no longer receive push notifications');
    } catch (error) {
      console.log('Error unsubscribing from notifications:', error);
    }
  }

  updateNotificationButton(isSubscribed) {
    const btn = document.getElementById('notification-toggle');
    if (btn) {
      btn.innerHTML = isSubscribed ? '🔕' : '🔔';
      btn.title = isSubscribed ? 'Disable notifications' : 'Enable notifications';
      btn.setAttribute('aria-label', isSubscribed ? 'Disable notifications' : 'Enable notifications');
    }
  }

  showLocalNotification(title, body) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/miroir.png',
        badge: '/miroir.png'
      });
    }
  }

  async sendSubscriptionToServer(subscription) {
    // In a real application, you would send this to your server
    console.log('Subscription object:', subscription);
    
    // Store locally for demo purposes
    localStorage.setItem('miroir-notification-subscription', JSON.stringify(subscription));
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Send test notification (for demo purposes)
  static sendTestNotification() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification('New Story Available', {
          body: 'A new reflection has been added to the Living Archive',
          icon: '/miroir.png',
          badge: '/miroir.png',
          vibrate: [100, 50, 100],
          data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
          },
          actions: [
            {
              action: 'explore',
              title: 'Explore',
              icon: '/miroir.png'
            },
            {
              action: 'close',
              title: 'Close',
              icon: '/miroir.png'
            }
          ]
        });
      });
    }
  }
}

// Initialize notifications when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.miroirNotifications = new MiroirNotifications();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MiroirNotifications;
}