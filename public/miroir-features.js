/**
 * MIROIR ENHANCED FEATURES JAVASCRIPT
 * Advanced functionality, themes, PWA, accessibility
 */

class MiroirFeatures {
  constructor() {
    this.currentTheme = 'dark';
    this.isServiceWorkerSupported = 'serviceWorker' in navigator;
    this.isNotificationSupported = 'Notification' in window;
    this.db = null;
    this.intersectionObserver = null;
    
    this.init();
  }

  async init() {
    console.log('[Miroir] Initializing enhanced features...');
    
    // Initialize core features
    this.initThemeSystem();
    this.initAccessibilityFeatures();
    this.initAnimations();
    this.initModals();
    this.initForms();
    
    // Initialize PWA features
    if (this.isServiceWorkerSupported) {
      await this.initServiceWorker();
    }
    
    // Initialize database
    await this.initIndexedDB();
    
    // Initialize notifications
    if (this.isNotificationSupported) {
      this.initNotifications();
    }
    
    console.log('[Miroir] Enhanced features initialized');
  }

  // ======================================
  // THEME SYSTEM
  // ======================================
  initThemeSystem() {
    // Load saved theme
    const savedTheme = localStorage.getItem('miroir-theme') || 'dark';
    this.setTheme(savedTheme);
    
    // Create theme selector
    this.createThemeSelector();
    
    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem('miroir-theme')) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  createThemeSelector() {
    // Add theme button to menu
    const menu = document.querySelector('.menu');
    if (menu) {
      const themeButton = document.createElement('button');
      themeButton.innerHTML = '🎨 Themes';
      themeButton.className = 'theme-toggle-btn';
      themeButton.style.cssText = `
        background: transparent;
        border: 1px solid var(--miroir-red);
        color: var(--text-primary);
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: var(--transition-smooth);
        width: 100%;
        text-align: left;
      `;
      themeButton.addEventListener('click', () => this.toggleThemeSelector());
      menu.appendChild(themeButton);
    }

    // Create theme selector panel
    const themeSelector = document.createElement('div');
    themeSelector.className = 'theme-selector';
    themeSelector.innerHTML = `
      <h3>Choose Theme</h3>
      <div class="theme-options">
        <button class="theme-option" data-theme="dark">🌙 Dark</button>
        <button class="theme-option" data-theme="light">☀️ Light</button>
        <button class="theme-option" data-theme="gold">✨ Gold</button>
        <button class="theme-option" data-theme="blue">🌊 Blue</button>
      </div>
    `;
    document.body.appendChild(themeSelector);

    // Add event listeners
    themeSelector.querySelectorAll('.theme-option').forEach(button => {
      button.addEventListener('click', (e) => {
        const theme = e.target.dataset.theme;
        this.setTheme(theme);
        this.toggleThemeSelector();
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!themeSelector.contains(e.target) && !e.target.classList.contains('theme-toggle-btn')) {
        themeSelector.classList.remove('open');
      }
    });
  }

  toggleThemeSelector() {
    const selector = document.querySelector('.theme-selector');
    selector.classList.toggle('open');
    this.updateThemeSelector();
  }

  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('miroir-theme', theme);
    this.updateThemeSelector();
    
    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }

  updateThemeSelector() {
    const options = document.querySelectorAll('.theme-option');
    options.forEach(option => {
      option.classList.toggle('active', option.dataset.theme === this.currentTheme);
    });
  }

  // ======================================
  // ACCESSIBILITY FEATURES
  // ======================================
  initAccessibilityFeatures() {
    this.addSkipToContentLink();
    this.addBackToTopButton();
    this.enhanceKeyboardNavigation();
    this.addARIALabels();
  }

  addSkipToContentLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-to-content';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Add main content id if not exists
    const mainContent = document.querySelector('.container') || document.querySelector('main');
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content';
    }
  }

  addBackToTopButton() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    backToTopBtn.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M7 14l5-5 5 5z"/>
      </svg>
    `;
    document.body.appendChild(backToTopBtn);

    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });

    // Smooth scroll to top
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  enhanceKeyboardNavigation() {
    // Enhanced focus management for modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
        this.closeThemeSelector();
      }
      
      if (e.key === 'Tab') {
        this.manageFocusTrapping(e);
      }
    });
  }

  addARIALabels() {
    // Enhance existing elements with ARIA labels
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle && !menuToggle.getAttribute('aria-label')) {
      menuToggle.setAttribute('aria-label', 'Toggle navigation menu');
      menuToggle.setAttribute('aria-expanded', 'false');
    }

    const menu = document.querySelector('.menu');
    if (menu && !menu.getAttribute('role')) {
      menu.setAttribute('role', 'navigation');
      menu.setAttribute('aria-label', 'Main navigation');
    }
  }

  // ======================================
  // ANIMATIONS & INTERACTIONS
  // ======================================
  initAnimations() {
    this.initIntersectionObserver();
    this.initParallaxEffects();
    this.initHoverEffects();
  }

  initIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Unobserve after animation to improve performance
            this.intersectionObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      // Observe elements with animation classes
      const animatedElements = document.querySelectorAll(
        '.fade-in-up, .fade-in-left, .fade-in-right, .scale-in, .timeline-item'
      );
      animatedElements.forEach(el => this.intersectionObserver.observe(el));
    }
  }

  initParallaxEffects() {
    // Simple parallax for background elements
    if (window.requestAnimationFrame) {
      let ticking = false;
      
      const updateParallax = () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax-element');
        
        parallaxElements.forEach(element => {
          const speed = element.dataset.speed || 0.5;
          const yPos = -(scrolled * speed);
          element.style.transform = `translateY(${yPos}px)`;
        });
        
        ticking = false;
      };

      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(updateParallax);
          ticking = true;
        }
      });
    }
  }

  initHoverEffects() {
    // Add hover effects to interactive elements
    const hoverElements = document.querySelectorAll('.hover-lift, .hover-glow');
    hoverElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        element.style.transform = element.classList.contains('hover-lift') 
          ? 'translateY(-5px)' 
          : 'scale(1.05)';
      });
      
      element.addEventListener('mouseleave', () => {
        element.style.transform = '';
      });
    });
  }

  // ======================================
  // MODAL SYSTEM
  // ======================================
  initModals() {
    this.createModalContainer();
    this.bindModalTriggers();
  }

  createModalContainer() {
    if (!document.querySelector('.modal-overlay')) {
      const modalOverlay = document.createElement('div');
      modalOverlay.className = 'modal-overlay';
      modalOverlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true">
          <div class="modal-header">
            <h2 class="modal-title"></h2>
            <button class="modal-close" aria-label="Close modal">&times;</button>
          </div>
          <div class="modal-content"></div>
        </div>
      `;
      document.body.appendChild(modalOverlay);

      // Bind close events
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) this.closeModal();
      });
      
      modalOverlay.querySelector('.modal-close').addEventListener('click', () => {
        this.closeModal();
      });
    }
  }

  bindModalTriggers() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-modal]')) {
        e.preventDefault();
        const modalType = e.target.dataset.modal;
        this.openModal(modalType, e.target);
      }
    });
  }

  openModal(type, trigger) {
    const overlay = document.querySelector('.modal-overlay');
    const modal = overlay.querySelector('.modal');
    const title = modal.querySelector('.modal-title');
    const content = modal.querySelector('.modal-content');

    // Set content based on type
    switch (type) {
      case 'story-form':
        title.textContent = 'Share Your Story';
        content.innerHTML = this.getStoryFormHTML();
        break;
      case 'reflection-form':
        title.textContent = 'Create Reflection';
        content.innerHTML = this.getReflectionFormHTML();
        break;
      case 'timeline-detail':
        const timelineData = JSON.parse(trigger.dataset.timeline || '{}');
        title.textContent = timelineData.title || 'Timeline Detail';
        content.innerHTML = this.getTimelineDetailHTML(timelineData);
        break;
      default:
        title.textContent = 'Information';
        content.innerHTML = '<p>Modal content will be loaded here.</p>';
    }

    overlay.classList.add('active');
    modal.querySelector('.modal-close').focus();
    document.body.style.overflow = 'hidden';

    // Initialize form functionality if needed
    if (type.includes('form')) {
      this.initModalForm(type);
    }
  }

  closeModal() {
    const overlay = document.querySelector('.modal-overlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeAllModals() {
    this.closeModal();
  }

  // ======================================
  // FORM SYSTEM
  // ======================================
  initForms() {
    document.addEventListener('submit', (e) => {
      if (e.target.matches('.enhanced-form')) {
        e.preventDefault();
        this.handleFormSubmission(e.target);
      }
    });
  }

  async handleFormSubmission(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.id = Date.now().toString();
    data.timestamp = new Date().toISOString();
    data.synced = false;

    const submitBtn = form.querySelector('.form-submit');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
      // Save to IndexedDB
      await this.saveToIndexedDB(form.dataset.type || 'submissions', data);
      
      // Schedule background sync
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register(`${form.dataset.type || 'story'}-submission`);
      }

      submitBtn.textContent = 'Saved!';
      form.reset();
      
      // Show success message
      this.showNotification('Your submission has been saved!', 'success');
      
      setTimeout(() => {
        this.closeModal();
      }, 1500);
      
    } catch (error) {
      console.error('Form submission error:', error);
      submitBtn.textContent = 'Error - Try Again';
      this.showNotification('Error saving submission. Please try again.', 'error');
    } finally {
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }, 2000);
    }
  }

  // ======================================
  // PWA FUNCTIONALITY
  // ======================================
  async initServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('[Miroir] Service Worker registered:', registration);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.showUpdateAvailable();
          }
        });
      });
      
    } catch (error) {
      console.error('[Miroir] Service Worker registration failed:', error);
    }
  }

  showUpdateAvailable() {
    const updateBanner = document.createElement('div');
    updateBanner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: var(--miroir-red);
      color: white;
      padding: 15px;
      text-align: center;
      z-index: 1001;
      transform: translateY(-100%);
      transition: transform 0.3s ease;
    `;
    updateBanner.innerHTML = `
      <span>A new version is available!</span>
      <button onclick="location.reload()" style="margin-left: 15px; background: white; color: var(--miroir-red); border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
        Update Now
      </button>
    `;
    document.body.appendChild(updateBanner);
    
    setTimeout(() => {
      updateBanner.style.transform = 'translateY(0)';
    }, 100);
  }

  // ======================================
  // INDEXEDDB FUNCTIONALITY
  // ======================================
  async initIndexedDB() {
    try {
      this.db = await this.openDatabase();
      console.log('[Miroir] IndexedDB initialized');
    } catch (error) {
      console.error('[Miroir] IndexedDB initialization failed:', error);
    }
  }

  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MiroirDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains('story-submissions')) {
          const storyStore = db.createObjectStore('story-submissions', { keyPath: 'id' });
          storyStore.createIndex('synced', 'synced', { unique: false });
          storyStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('reflection-submissions')) {
          const reflectionStore = db.createObjectStore('reflection-submissions', { keyPath: 'id' });
          reflectionStore.createIndex('synced', 'synced', { unique: false });
          reflectionStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('user-preferences')) {
          db.createObjectStore('user-preferences', { keyPath: 'key' });
        }
      };
    });
  }

  async saveToIndexedDB(storeName, data) {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // ======================================
  // NOTIFICATION SYSTEM
  // ======================================
  initNotifications() {
    // Request permission if not already granted
    if (Notification.permission === 'default') {
      this.requestNotificationPermission();
    }
  }

  async requestNotificationPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('[Miroir] Notification permission granted');
      }
    } catch (error) {
      console.error('[Miroir] Notification permission error:', error);
    }
  }

  showNotification(message, type = 'info') {
    // Create in-app notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#44ff44' : 'var(--miroir-red)'};
      color: white;
      padding: 15px 20px;
      border-radius: 6px;
      z-index: 1002;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // ======================================
  // HELPER METHODS
  // ======================================
  getStoryFormHTML() {
    return `
      <form class="enhanced-form" data-type="story-submissions">
        <div class="form-group">
          <label class="form-label" for="story-title">Story Title</label>
          <input type="text" id="story-title" name="title" class="form-input" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="story-content">Your Story</label>
          <textarea id="story-content" name="content" class="form-textarea" required placeholder="Share your truth..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="story-tags">Tags (comma separated)</label>
          <input type="text" id="story-tags" name="tags" class="form-input" placeholder="truth, reflection, memory">
        </div>
        <div class="form-group">
          <label class="form-label" for="story-anonymous">
            <input type="checkbox" id="story-anonymous" name="anonymous"> Submit anonymously
          </label>
        </div>
        <button type="submit" class="form-submit">Share Story</button>
      </form>
    `;
  }

  getReflectionFormHTML() {
    return `
      <form class="enhanced-form" data-type="reflection-submissions">
        <div class="form-group">
          <label class="form-label" for="reflection-prompt">Reflection Prompt</label>
          <select id="reflection-prompt" name="prompt" class="form-select" required>
            <option value="">Choose a prompt...</option>
            <option value="truth">What truth have you been avoiding?</option>
            <option value="memory">What memory shaped who you are?</option>
            <option value="rebellion">How do you rebel against expectations?</option>
            <option value="mirror">What does your mirror reflect back to you?</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="reflection-content">Your Reflection</label>
          <textarea id="reflection-content" name="content" class="form-textarea" required placeholder="Let your thoughts flow..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="reflection-mood">Current Mood</label>
          <select id="reflection-mood" name="mood" class="form-select">
            <option value="contemplative">Contemplative</option>
            <option value="hopeful">Hopeful</option>
            <option value="melancholic">Melancholic</option>
            <option value="empowered">Empowered</option>
            <option value="uncertain">Uncertain</option>
          </select>
        </div>
        <button type="submit" class="form-submit">Save Reflection</button>
      </form>
    `;
  }

  getTimelineDetailHTML(data) {
    return `
      <div class="timeline-detail">
        <p><strong>Date:</strong> ${data.date || 'Unknown'}</p>
        <p><strong>Type:</strong> ${data.type || 'Reflection'}</p>
        <div class="timeline-description">
          ${data.description || 'No description available.'}
        </div>
        ${data.tags ? `<div class="timeline-tags">
          <strong>Tags:</strong> ${data.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join(' ')}
        </div>` : ''}
      </div>
    `;
  }

  initModalForm(type) {
    // Add any specific form initialization logic here
    const form = document.querySelector('.modal .enhanced-form');
    if (form) {
      // Auto-focus first input
      const firstInput = form.querySelector('input, textarea, select');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }

  manageFocusTrapping(e) {
    const modal = document.querySelector('.modal-overlay.active .modal');
    if (modal) {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  closeThemeSelector() {
    const selector = document.querySelector('.theme-selector');
    if (selector) {
      selector.classList.remove('open');
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.miroirFeatures = new MiroirFeatures();
  });
} else {
  window.miroirFeatures = new MiroirFeatures();
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);