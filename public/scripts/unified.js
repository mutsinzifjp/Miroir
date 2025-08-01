/**
 * Miroir - Unified JavaScript Framework
 * Common functionality for enhanced user experience
 */

class MiroirApp {
  constructor() {
    this.init();
  }

  init() {
    this.setupAccessibility();
    this.setupNavigation();
    this.setupMusicToggle();
    this.setupAnimations();
    this.setupParticleSystem();
    this.setupPageTransitions();
  }

  // Accessibility enhancements
  setupAccessibility() {
    // Add skip link if not present
    if (!document.querySelector('.skip-link')) {
      const skipLink = document.createElement('a');
      skipLink.href = '#main-content';
      skipLink.className = 'skip-link';
      skipLink.textContent = 'Skip to main content';
      document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // Enhance keyboard navigation
    document.addEventListener('keydown', (e) => {
      // Close menu on Escape
      if (e.key === 'Escape') {
        this.closeMenu();
      }
      
      // Handle Enter key on interactive elements
      if (e.key === 'Enter' && e.target.hasAttribute('data-action')) {
        e.target.click();
      }
    });

    // Manage focus visibility
    document.addEventListener('mousedown', () => {
      document.body.classList.add('mouse-user');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.remove('mouse-user');
      }
    });

    // Add ARIA live region for dynamic content
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    document.body.appendChild(liveRegion);
  }

  // Enhanced navigation system
  setupNavigation() {
    const navToggle = document.querySelector('.nav-toggle, .menu-toggle');
    const navMenu = document.querySelector('.nav-menu, .menu');
    
    if (navToggle && navMenu) {
      // Enhanced click handler
      navToggle.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleMenu();
      });

      // Enhanced keyboard support
      navToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleMenu();
        }
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
          this.closeMenu();
        }
      });

      // Manage focus within menu
      navMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          this.manageFocusInMenu(e);
        }
      });
    }
  }

  toggleMenu() {
    const navMenu = document.querySelector('.nav-menu, .menu');
    const navToggle = document.querySelector('.nav-toggle, .menu-toggle');
    
    if (!navMenu) return;

    const isOpen = navMenu.classList.contains('open') || navMenu.style.display === 'flex';
    
    if (isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    const navMenu = document.querySelector('.nav-menu, .menu');
    const navToggle = document.querySelector('.nav-toggle, .menu-toggle');
    
    if (!navMenu) return;

    navMenu.classList.add('open');
    navMenu.style.display = 'flex';
    navMenu.setAttribute('aria-hidden', 'false');
    navToggle?.setAttribute('aria-expanded', 'true');

    // Focus first menu item
    const firstLink = navMenu.querySelector('a');
    if (firstLink) {
      firstLink.focus();
    }

    this.announceToScreenReader('Navigation menu opened');
  }

  closeMenu() {
    const navMenu = document.querySelector('.nav-menu, .menu');
    const navToggle = document.querySelector('.nav-toggle, .menu-toggle');
    
    if (!navMenu) return;

    navMenu.classList.remove('open');
    navMenu.style.display = 'none';
    navMenu.setAttribute('aria-hidden', 'true');
    navToggle?.setAttribute('aria-expanded', 'false');
    
    this.announceToScreenReader('Navigation menu closed');
  }

  manageFocusInMenu(e) {
    const navMenu = document.querySelector('.nav-menu, .menu');
    const focusableElements = navMenu.querySelectorAll('a, button, [tabindex="0"]');
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

  // Enhanced music toggle
  setupMusicToggle() {
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    
    if (!musicToggle || !bgMusic) return;

    let isPlaying = false;

    const updateToggleState = (playing) => {
      isPlaying = playing;
      musicToggle.innerHTML = playing
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3z"/></svg>';
      
      musicToggle.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
      musicToggle.title = playing ? 'Pause background music' : 'Play background music';
    };

    musicToggle.addEventListener('click', async () => {
      try {
        if (isPlaying) {
          bgMusic.pause();
          this.announceToScreenReader('Background music paused');
        } else {
          await bgMusic.play();
          this.announceToScreenReader('Background music playing');
        }
        updateToggleState(!isPlaying);
      } catch (error) {
        console.warn('Audio playback failed:', error);
        this.announceToScreenReader('Audio playback not available');
      }
    });

    // Handle audio events
    bgMusic.addEventListener('play', () => updateToggleState(true));
    bgMusic.addEventListener('pause', () => updateToggleState(false));
    bgMusic.addEventListener('ended', () => updateToggleState(false));

    // Initialize state
    updateToggleState(false);
  }

  // Scroll-based animations
  setupAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Don't unobserve so animation can repeat if needed
        }
      });
    }, observerOptions);

    // Observe elements with scroll-reveal class
    document.querySelectorAll('.scroll-reveal').forEach((el) => {
      observer.observe(el);
    });

    // Auto-add scroll-reveal to common elements
    document.querySelectorAll('p, .card, .quote:not(.quote-hero)').forEach((el) => {
      if (!el.classList.contains('scroll-reveal')) {
        el.classList.add('scroll-reveal');
        observer.observe(el);
      }
    });
  }

  // Enhanced particle system
  setupParticleSystem() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    const colors = ['#e50914', '#ff1a1a', '#fff'];
    const particleCount = this.getParticleCount();

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const getParticleCount = () => {
      const width = window.innerWidth;
      if (width < 768) return 75; // Mobile
      if (width < 1024) return 100; // Tablet
      return 150; // Desktop
    };

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.8 + 0.2;
      }

      draw() {
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }
    }

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      animationId = requestAnimationFrame(animate);
    };

    // Handle resize
    window.addEventListener('resize', () => {
      resizeCanvas();
      // Recreate particles for new screen size
      const newCount = this.getParticleCount();
      if (newCount !== particles.length) {
        initParticles();
      }
    });

    // Pause animation when tab is not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        animate();
      }
    });

    // Handle reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return; // Don't start particle animation
    }

    // Initialize
    resizeCanvas();
    initParticles();
    animate();
  }

  getParticleCount() {
    const width = window.innerWidth;
    if (width < 768) return 75; // Mobile
    if (width < 1024) return 100; // Tablet
    return 150; // Desktop
  }

  // Page transition effects
  setupPageTransitions() {
    // Fade in page on load
    document.body.classList.add('loading');
    
    window.addEventListener('load', () => {
      setTimeout(() => {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
      }, 100);
    });

    // Smooth page transitions for internal links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && this.isInternalLink(link)) {
        e.preventDefault();
        this.navigateToPage(link.href);
      }
    });
  }

  isInternalLink(link) {
    return link.hostname === window.location.hostname && 
           !link.hasAttribute('target') &&
           !link.href.includes('#') &&
           link.href !== window.location.href;
  }

  navigateToPage(url) {
    document.body.style.opacity = '0';
    
    setTimeout(() => {
      window.location.href = url;
    }, 300);
  }

  // Screen reader announcements
  announceToScreenReader(message) {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }

  // Utility method to add semantic improvements
  enhanceSemantics() {
    // Add main landmark if not present
    if (!document.querySelector('main') && !document.getElementById('main-content')) {
      const container = document.querySelector('.container');
      if (container) {
        container.setAttribute('role', 'main');
        container.id = 'main-content';
      }
    }

    // Enhance headings hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = `heading-${index + 1}`;
      }
    });

    // Add language attribute if missing
    if (!document.documentElement.lang) {
      document.documentElement.lang = 'en';
    }
  }
}

// Global utility functions
window.MiroirUtils = {
  // Debounce function for performance
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function for scroll events
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Check if user prefers reduced motion
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Get contrast ratio for accessibility
  getContrastRatio(color1, color2) {
    // Simplified contrast ratio calculation
    const getLuminance = (color) => {
      const rgb = parseInt(color.replace('#', ''), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    };

    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }
};

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.miroirApp = new MiroirApp();
  });
} else {
  window.miroirApp = new MiroirApp();
}

// Legacy compatibility for existing toggle functions
window.toggleMenu = function() {
  if (window.miroirApp) {
    window.miroirApp.toggleMenu();
  }
};