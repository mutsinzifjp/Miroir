/**
 * MIROIR NOTIFICATIONS SYSTEM
 * Push notifications, subscription management, preferences
 */

class MiroirNotifications {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.subscription = null;
    this.publicVapidKey = 'YOUR_VAPID_PUBLIC_KEY'; // Replace with actual VAPID key
    this.preferences = {
      enabled: true,
      reflectionReminders: true,
      newStories: true,
      weeklyDigest: true,
      quietHours: { start: 22, end: 8 }
    };
    
    this.init();
  }

  async init() {
    if (!this.isSupported) {
      console.warn('[Notifications] Push notifications not supported');
      return;
    }

    console.log('[Notifications] Initializing notification system...');
    
    await this.loadPreferences();
    await this.checkExistingSubscription();
    this.createNotificationControls();
    this.scheduleLocalNotifications();
    
    console.log('[Notifications] Notification system initialized');
  }

  // ======================================
  // SUBSCRIPTION MANAGEMENT
  // ======================================
  async checkExistingSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      this.subscription = await registration.pushManager.getSubscription();
      
      if (this.subscription) {
        console.log('[Notifications] Existing subscription found');
        this.updateSubscriptionStatus(true);
      }
    } catch (error) {
      console.error('[Notifications] Error checking subscription:', error);
    }
  }

  async subscribe() {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Subscribe to push notifications
      this.subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.publicVapidKey)
      });

      console.log('[Notifications] Successfully subscribed:', this.subscription);
      
      // Save subscription to server (in real app)
      await this.saveSubscriptionToServer(this.subscription);
      
      this.updateSubscriptionStatus(true);
      this.showNotification('Notifications enabled! You\'ll receive updates about new reflections.', 'success');
      
    } catch (error) {
      console.error('[Notifications] Subscription failed:', error);
      this.showNotification('Failed to enable notifications. Please try again.', 'error');
    }
  }

  async unsubscribe() {
    try {
      if (this.subscription) {
        await this.subscription.unsubscribe();
        this.subscription = null;
        
        // Remove subscription from server (in real app)
        await this.removeSubscriptionFromServer();
        
        this.updateSubscriptionStatus(false);
        this.showNotification('Notifications disabled.', 'info');
      }
    } catch (error) {
      console.error('[Notifications] Unsubscribe failed:', error);
    }
  }

  async saveSubscriptionToServer(subscription) {
    // In a real application, send subscription to your backend
    console.log('[Notifications] Saving subscription to server:', subscription);
    
    // Store locally for demo purposes
    localStorage.setItem('miroir-push-subscription', JSON.stringify(subscription));
  }

  async removeSubscriptionFromServer() {
    // In a real application, remove subscription from your backend
    console.log('[Notifications] Removing subscription from server');
    
    // Remove from localStorage for demo purposes
    localStorage.removeItem('miroir-push-subscription');
  }

  // ======================================
  // NOTIFICATION CONTROLS UI
  // ======================================
  createNotificationControls() {
    // Add to main menu
    const menu = document.querySelector('.menu');
    if (menu) {
      const notificationButton = document.createElement('button');
      notificationButton.innerHTML = '🔔 Notifications';
      notificationButton.className = 'notification-toggle-btn';
      notificationButton.style.cssText = `
        background: transparent;
        border: 1px solid var(--miroir-red);
        color: var(--text-primary);
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: var(--transition-smooth);
        width: 100%;
        text-align: left;
        margin-top: 5px;
      `;
      notificationButton.addEventListener('click', () => this.toggleNotificationPanel());
      menu.appendChild(notificationButton);
    }

    // Create notification panel
    this.createNotificationPanel();
  }

  createNotificationPanel() {
    const panel = document.createElement('div');
    panel.className = 'notification-panel';
    panel.style.cssText = `
      position: fixed;
      top: 120px;
      right: 20px;
      z-index: 12;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 20px;
      display: none;
      flex-direction: column;
      gap: 15px;
      box-shadow: 0 0 15px var(--shadow-color);
      max-width: 300px;
    `;

    panel.innerHTML = `
      <h3 style="margin: 0; color: var(--text-primary); font-size: 1.1rem;">
        🔔 Notification Settings
      </h3>
      
      <div class="notification-main-toggle">
        <label style="display: flex; align-items: center; gap: 10px; color: var(--text-primary); cursor: pointer;">
          <input type="checkbox" id="notifications-enabled" ${this.preferences.enabled ? 'checked' : ''}>
          <span>Enable Notifications</span>
        </label>
        <div class="subscription-status" style="font-size: 0.9rem; color: var(--text-muted); margin-top: 5px;">
          Checking subscription...
        </div>
      </div>

      <div class="notification-preferences" style="display: ${this.preferences.enabled ? 'block' : 'none'};">
        <h4 style="margin: 10px 0 5px 0; color: var(--text-primary); font-size: 1rem;">
          Notification Types
        </h4>
        
        <label style="display: flex; align-items: center; gap: 10px; color: var(--text-secondary); cursor: pointer; margin-bottom: 8px;">
          <input type="checkbox" id="reflection-reminders" ${this.preferences.reflectionReminders ? 'checked' : ''}>
          <span>Daily reflection reminders</span>
        </label>
        
        <label style="display: flex; align-items: center; gap: 10px; color: var(--text-secondary); cursor: pointer; margin-bottom: 8px;">
          <input type="checkbox" id="new-stories" ${this.preferences.newStories ? 'checked' : ''}>
          <span>New story notifications</span>
        </label>
        
        <label style="display: flex; align-items: center; gap: 10px; color: var(--text-secondary); cursor: pointer; margin-bottom: 15px;">
          <input type="checkbox" id="weekly-digest" ${this.preferences.weeklyDigest ? 'checked' : ''}>
          <span>Weekly reflection digest</span>
        </label>

        <h4 style="margin: 10px 0 5px 0; color: var(--text-primary); font-size: 1rem;">
          Quiet Hours
        </h4>
        <div style="display: flex; gap: 10px; align-items: center;">
          <input type="time" id="quiet-start" value="${this.formatTime(this.preferences.quietHours.start)}" 
                 style="background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); padding: 5px; border-radius: 4px;">
          <span style="color: var(--text-secondary);">to</span>
          <input type="time" id="quiet-end" value="${this.formatTime(this.preferences.quietHours.end)}" 
                 style="background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); padding: 5px; border-radius: 4px;">
        </div>
      </div>

      <div class="notification-actions" style="display: flex; gap: 10px; margin-top: 10px;">
        <button class="test-notification-btn" style="flex: 1; background: var(--miroir-red); color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">
          Test Notification
        </button>
      </div>
    `;

    document.body.appendChild(panel);
    this.bindNotificationPanelEvents(panel);
  }

  bindNotificationPanelEvents(panel) {
    // Main toggle
    const enabledToggle = panel.querySelector('#notifications-enabled');
    enabledToggle.addEventListener('change', (e) => {
      this.preferences.enabled = e.target.checked;
      this.savePreferences();
      
      const preferencesSection = panel.querySelector('.notification-preferences');
      preferencesSection.style.display = e.target.checked ? 'block' : 'none';
      
      if (e.target.checked && !this.subscription) {
        this.subscribe();
      } else if (!e.target.checked && this.subscription) {
        this.unsubscribe();
      }
    });

    // Preference toggles
    ['reflection-reminders', 'new-stories', 'weekly-digest'].forEach(id => {
      const checkbox = panel.querySelector(`#${id}`);
      const prefKey = id.replace('-', '');
      checkbox.addEventListener('change', (e) => {
        this.preferences[prefKey] = e.target.checked;
        this.savePreferences();
      });
    });

    // Quiet hours
    panel.querySelector('#quiet-start').addEventListener('change', (e) => {
      this.preferences.quietHours.start = this.parseTime(e.target.value);
      this.savePreferences();
    });

    panel.querySelector('#quiet-end').addEventListener('change', (e) => {
      this.preferences.quietHours.end = this.parseTime(e.target.value);
      this.savePreferences();
    });

    // Test notification
    panel.querySelector('.test-notification-btn').addEventListener('click', () => {
      this.sendTestNotification();
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && !e.target.classList.contains('notification-toggle-btn')) {
        panel.style.display = 'none';
      }
    });
  }

  toggleNotificationPanel() {
    const panel = document.querySelector('.notification-panel');
    const isVisible = panel.style.display === 'flex';
    panel.style.display = isVisible ? 'none' : 'flex';
    
    if (!isVisible) {
      this.updateSubscriptionStatus();
    }
  }

  updateSubscriptionStatus(subscribed = null) {
    const statusElement = document.querySelector('.subscription-status');
    if (!statusElement) return;

    if (subscribed === null) {
      subscribed = !!this.subscription;
    }

    statusElement.textContent = subscribed 
      ? '✅ Subscribed to push notifications'
      : '❌ Not subscribed to push notifications';
    statusElement.style.color = subscribed ? '#44ff44' : '#ff4444';
  }

  // ======================================
  // LOCAL NOTIFICATIONS
  // ======================================
  scheduleLocalNotifications() {
    // Schedule daily reflection reminder
    if (this.preferences.enabled && this.preferences.reflectionReminders) {
      this.scheduleDailyReminder();
    }

    // Schedule weekly digest
    if (this.preferences.enabled && this.preferences.weeklyDigest) {
      this.scheduleWeeklyDigest();
    }
  }

  scheduleDailyReminder() {
    // Calculate next reminder time (e.g., 7 PM daily)
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(19, 0, 0, 0); // 7 PM

    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    setTimeout(() => {
      if (this.isQuietTime()) return;
      
      this.showLocalNotification(
        'Miroir Reflection Reminder',
        'Take a moment to reflect on your day. What truth emerged today?',
        '/my-miroir.html'
      );
      
      // Schedule next day
      this.scheduleDailyReminder();
    }, timeUntilReminder);
  }

  scheduleWeeklyDigest() {
    // Calculate next Sunday at 10 AM
    const now = new Date();
    const nextSunday = new Date();
    const daysUntilSunday = (7 - now.getDay()) % 7;
    
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(10, 0, 0, 0);

    if (nextSunday <= now) {
      nextSunday.setDate(nextSunday.getDate() + 7);
    }

    const timeUntilDigest = nextSunday.getTime() - now.getTime();

    setTimeout(() => {
      if (this.isQuietTime()) return;
      
      this.showLocalNotification(
        'Miroir Weekly Reflection',
        'Your weekly reflection digest is ready. Review your journey this week.',
        '/timeline.html'
      );
      
      // Schedule next week
      this.scheduleWeeklyDigest();
    }, timeUntilDigest);
  }

  isQuietTime() {
    const now = new Date();
    const currentHour = now.getHours();
    const { start, end } = this.preferences.quietHours;
    
    if (start < end) {
      return currentHour >= start && currentHour < end;
    } else {
      return currentHour >= start || currentHour < end;
    }
  }

  // ======================================
  // NOTIFICATION UTILITIES
  // ======================================
  async showLocalNotification(title, body, url = '/') {
    if (Notification.permission !== 'granted') return;

    // Check if tab is visible
    if (!document.hidden) {
      // Show in-app notification instead
      this.showInAppNotification(body);
      return;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: '/miroir.png',
        badge: '/miroir.png',
        tag: 'miroir-local',
        renotify: true,
        requireInteraction: false,
        silent: this.isQuietTime()
      });

      notification.onclick = () => {
        window.focus();
        if (url !== '/') {
          window.location.href = url;
        }
        notification.close();
      };

      // Auto-close after 10 seconds
      setTimeout(() => notification.close(), 10000);
      
    } catch (error) {
      console.error('[Notifications] Failed to show local notification:', error);
    }
  }

  showInAppNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--miroir-red);
      color: white;
      padding: 15px 20px;
      border-radius: 6px;
      z-index: 1003;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideInRight 0.3s ease;
      cursor: pointer;
    `;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 1.2rem;">🔔</span>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    notification.onclick = () => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    };
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);
  }

  sendTestNotification() {
    const messages = [
      'This is a test notification from Miroir!',
      'Your mirror reflects your inner truth.',
      'Time for a moment of reflection.',
      'What story will you tell today?'
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    this.showLocalNotification('Miroir Test', randomMessage);
  }

  showNotification(message, type = 'info') {
    // Reuse the main notification system
    if (window.miroirFeatures) {
      window.miroirFeatures.showNotification(message, type);
    } else {
      console.log(`[Notification] ${message}`);
    }
  }

  // ======================================
  // PREFERENCES MANAGEMENT
  // ======================================
  async loadPreferences() {
    try {
      const saved = localStorage.getItem('miroir-notification-preferences');
      if (saved) {
        this.preferences = { ...this.preferences, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('[Notifications] Failed to load preferences:', error);
    }
  }

  savePreferences() {
    try {
      localStorage.setItem('miroir-notification-preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('[Notifications] Failed to save preferences:', error);
    }
  }

  // ======================================
  // UTILITY METHODS
  // ======================================
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

  formatTime(hour) {
    return hour.toString().padStart(2, '0') + ':00';
  }

  parseTime(timeString) {
    return parseInt(timeString.split(':')[0], 10);
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.miroirNotifications = new MiroirNotifications();
  });
} else {
  window.miroirNotifications = new MiroirNotifications();
}