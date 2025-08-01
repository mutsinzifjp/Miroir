/* Miroir - Advanced Features JavaScript */

class MiroirFeatures {
  constructor() {
    this.init();
  }

  init() {
    this.setupBackToTop();
    this.setupThemeSwitcher();
    this.setupSmoothScrolling();
    this.setupAccessibility();
    this.setupModals();
    this.setupAnimations();
  }

  // Back to Top Button
  setupBackToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    backToTopBtn.setAttribute('title', 'Back to top');
    document.body.appendChild(backToTopBtn);

    // Show/hide button based on scroll position
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

  // Theme Switcher
  setupThemeSwitcher() {
    const themeSwitcher = document.createElement('div');
    themeSwitcher.className = 'theme-switcher';
    themeSwitcher.setAttribute('role', 'group');
    themeSwitcher.setAttribute('aria-label', 'Theme switcher');

    const themes = [
      { name: 'dark', label: 'Dark', symbol: '🌙' },
      { name: 'light', label: 'Light', symbol: '☀️' },
      { name: 'gold', label: 'Gold', symbol: '✨' },
      { name: 'blue', label: 'Blue', symbol: '🌊' }
    ];

    themes.forEach(theme => {
      const btn = document.createElement('button');
      btn.className = `theme-btn ${theme.name}`;
      btn.setAttribute('aria-label', `Switch to ${theme.label} theme`);
      btn.setAttribute('title', `${theme.label} theme`);
      btn.textContent = theme.symbol;
      btn.addEventListener('click', () => this.setTheme(theme.name));
      themeSwitcher.appendChild(btn);
    });

    document.body.appendChild(themeSwitcher);

    // Load saved theme or default to dark
    const savedTheme = localStorage.getItem('miroir-theme') || 'dark';
    this.setTheme(savedTheme);
  }

  setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('miroir-theme', themeName);

    // Update active button
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`.theme-btn.${themeName}`)?.classList.add('active');

    // Update body background and color based on theme
    const body = document.body;
    const themes = {
      dark: { bg: '#000', color: '#fff' },
      light: { bg: '#f5f5f5', color: '#333' },
      gold: { bg: '#1a1a0d', color: '#fff' },
      blue: { bg: '#0a0a1a', color: '#e6f2ff' }
    };

    if (themes[themeName]) {
      body.style.backgroundColor = themes[themeName].bg;
      body.style.color = themes[themeName].color;
    }
  }

  // Smooth Scrolling for Internal Links
  setupSmoothScrolling() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  }

  // Enhanced Accessibility
  setupAccessibility() {
    // Add focus indicators for keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });

    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only';
    skipLink.style.position = 'absolute';
    skipLink.style.top = '-40px';
    skipLink.style.left = '6px';
    skipLink.style.background = 'var(--theme-accent)';
    skipLink.style.color = 'white';
    skipLink.style.padding = '8px';
    skipLink.style.textDecoration = 'none';
    skipLink.style.borderRadius = '4px';
    skipLink.style.zIndex = '1000';
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  // Modal System
  setupModals() {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" aria-label="Close modal">&times;</button>
        <div class="modal-body"></div>
      </div>
    `;
    document.body.appendChild(modalOverlay);

    // Close modal events
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay || e.target.classList.contains('modal-close')) {
        this.closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        this.closeModal();
      }
    });
  }

  showModal(content) {
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalBody = modalOverlay.querySelector('.modal-body');
    modalBody.innerHTML = content;
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus management
    const closeBtn = modalOverlay.querySelector('.modal-close');
    closeBtn.focus();
  }

  closeModal() {
    const modalOverlay = document.querySelector('.modal-overlay');
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Intersection Observer for Animations
  setupAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe elements for animation
    document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .timeline-item').forEach(el => {
      observer.observe(el);
    });
  }

  // Dynamic Content Filtering
  setupFiltering(container, items, filters) {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-controls';
    filterContainer.setAttribute('role', 'group');
    filterContainer.setAttribute('aria-label', 'Content filters');

    // Add "All" filter
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.textContent = 'All';
    allBtn.setAttribute('data-filter', 'all');
    allBtn.addEventListener('click', () => this.filterItems('all', items));
    filterContainer.appendChild(allBtn);

    // Add category filters
    filters.forEach(filter => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.textContent = filter.label;
      btn.setAttribute('data-filter', filter.value);
      btn.addEventListener('click', () => this.filterItems(filter.value, items));
      filterContainer.appendChild(btn);
    });

    container.insertBefore(filterContainer, container.firstChild);
  }

  filterItems(filterValue, items) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filterValue}"]`).classList.add('active');

    // Filter items
    items.forEach(item => {
      const categories = item.dataset.categories ? item.dataset.categories.split(' ') : [];
      if (filterValue === 'all' || categories.includes(filterValue)) {
        item.style.display = '';
        item.classList.add('fade-in');
      } else {
        item.style.display = 'none';
        item.classList.remove('fade-in');
      }
    });
  }

  // Timeline Component
  createTimeline(container, timelineData) {
    const timeline = document.createElement('div');
    timeline.className = 'timeline';

    timelineData.forEach((item, index) => {
      const timelineItem = document.createElement('div');
      timelineItem.className = 'timeline-item';
      
      timelineItem.innerHTML = `
        <div class="timeline-content" tabindex="0" role="button" aria-label="Timeline item: ${item.title}">
          <div class="timeline-marker"></div>
          <h3>${item.title}</h3>
          <p class="timeline-date">${item.date}</p>
          <p>${item.description}</p>
        </div>
      `;

      // Add click handler for detailed view
      timelineItem.addEventListener('click', () => {
        if (item.detail) {
          this.showModal(`
            <h2>${item.title}</h2>
            <p><strong>${item.date}</strong></p>
            <div>${item.detail}</div>
          `);
        }
      });

      timeline.appendChild(timelineItem);
    });

    container.appendChild(timeline);
    this.setupAnimations(); // Re-setup animations for new elements
  }

  // Audio Player Component
  createAudioPlayer(container, audioSrc, title) {
    const player = document.createElement('div');
    player.className = 'audio-player';
    
    player.innerHTML = `
      <button class="audio-play-btn" aria-label="Play ${title}">▶</button>
      <div class="audio-info">
        <strong>${title}</strong>
      </div>
      <div class="audio-progress">
        <div class="audio-progress-bar"></div>
      </div>
      <span class="audio-time">0:00</span>
      <audio src="${audioSrc}" preload="metadata"></audio>
    `;

    const audio = player.querySelector('audio');
    const playBtn = player.querySelector('.audio-play-btn');
    const progressBar = player.querySelector('.audio-progress-bar');
    const timeDisplay = player.querySelector('.audio-time');

    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play();
        playBtn.textContent = '⏸';
        playBtn.setAttribute('aria-label', `Pause ${title}`);
      } else {
        audio.pause();
        playBtn.textContent = '▶';
        playBtn.setAttribute('aria-label', `Play ${title}`);
      }
    });

    audio.addEventListener('timeupdate', () => {
      const progress = (audio.currentTime / audio.duration) * 100;
      progressBar.style.width = `${progress}%`;
      
      const minutes = Math.floor(audio.currentTime / 60);
      const seconds = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
      timeDisplay.textContent = `${minutes}:${seconds}`;
    });

    audio.addEventListener('ended', () => {
      playBtn.textContent = '▶';
      playBtn.setAttribute('aria-label', `Play ${title}`);
      progressBar.style.width = '0%';
      timeDisplay.textContent = '0:00';
    });

    container.appendChild(player);
  }

  // Image Carousel Component
  createCarousel(container, images) {
    const carousel = document.createElement('div');
    carousel.className = 'carousel';
    
    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'carousel-container';
    
    images.forEach((image, index) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      slide.innerHTML = `
        <img src="${image.src}" alt="${image.alt}" loading="lazy">
        ${image.caption ? `<div class="carousel-caption">${image.caption}</div>` : ''}
      `;
      carouselContainer.appendChild(slide);
    });

    carousel.appendChild(carouselContainer);

    // Navigation buttons
    if (images.length > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.className = 'carousel-nav prev';
      prevBtn.innerHTML = '❮';
      prevBtn.setAttribute('aria-label', 'Previous image');
      
      const nextBtn = document.createElement('button');
      nextBtn.className = 'carousel-nav next';
      nextBtn.innerHTML = '❯';
      nextBtn.setAttribute('aria-label', 'Next image');

      carousel.appendChild(prevBtn);
      carousel.appendChild(nextBtn);

      // Dots indicator
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'carousel-dots';
      
      images.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        if (index === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.addEventListener('click', () => this.goToSlide(carousel, index));
        dotsContainer.appendChild(dot);
      });

      container.appendChild(carousel);
      container.appendChild(dotsContainer);

      // Navigation functionality
      let currentSlide = 0;
      
      prevBtn.addEventListener('click', () => {
        currentSlide = currentSlide > 0 ? currentSlide - 1 : images.length - 1;
        this.updateCarousel(carousel, currentSlide);
      });

      nextBtn.addEventListener('click', () => {
        currentSlide = currentSlide < images.length - 1 ? currentSlide + 1 : 0;
        this.updateCarousel(carousel, currentSlide);
      });

      // Auto-play (optional)
      if (images.length > 1) {
        setInterval(() => {
          currentSlide = currentSlide < images.length - 1 ? currentSlide + 1 : 0;
          this.updateCarousel(carousel, currentSlide);
        }, 5000);
      }
    } else {
      container.appendChild(carousel);
    }
  }

  updateCarousel(carousel, slideIndex) {
    const container = carousel.querySelector('.carousel-container');
    const dots = carousel.parentElement.querySelectorAll('.carousel-dot');
    
    container.style.transform = `translateX(-${slideIndex * 100}%)`;
    
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === slideIndex);
    });
  }

  goToSlide(carousel, slideIndex) {
    this.updateCarousel(carousel, slideIndex);
  }

  // Personalized Reflections Feature
  createReflectionMirror(container) {
    const reflectionDiv = document.createElement('div');
    reflectionDiv.innerHTML = `
      <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.05); border-radius: 15px; border: 1px solid var(--theme-accent); margin: 20px 0;">
        <h3 style="color: var(--theme-accent); margin-bottom: 20px;">Personalized Reflections</h3>
        <p style="margin-bottom: 20px; font-style: italic;">Type your truth and see it reflected back as poetry</p>
        <textarea id="truth-input" placeholder="Share your truth here..." style="width: 100%; max-width: 500px; height: 100px; padding: 15px; background: rgba(0,0,0,0.3); border: 1px solid var(--theme-accent); border-radius: 10px; color: var(--theme-text); font-family: inherit; resize: vertical;"></textarea>
        <br><br>
        <button id="reflect-btn" style="padding: 12px 30px; background: var(--theme-accent); color: var(--theme-bg); border: none; border-radius: 25px; font-weight: bold; cursor: pointer; transition: all 0.3s ease;">Reflect My Truth</button>
        <div id="reflection-output" style="margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.02); border-radius: 10px; min-height: 100px; display: none;"></div>
      </div>
    `;

    const textarea = reflectionDiv.querySelector('#truth-input');
    const button = reflectionDiv.querySelector('#reflect-btn');
    const output = reflectionDiv.querySelector('#reflection-output');

    button.addEventListener('click', () => {
      const truth = textarea.value.trim();
      if (truth) {
        const reflection = this.generatePoetryReflection(truth);
        output.innerHTML = `
          <h4 style="color: var(--theme-accent); margin-bottom: 15px;">Your Truth Reflected:</h4>
          <div style="font-style: italic; line-height: 1.8; text-align: center; font-size: 1.1em;">
            ${reflection}
          </div>
        `;
        output.style.display = 'block';
        output.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    // Allow Enter key to trigger reflection
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        button.click();
      }
    });

    container.appendChild(reflectionDiv);
  }

  generatePoetryReflection(truth) {
    // Simple poetry transformation - in a real app, this could use AI
    const words = truth.toLowerCase().split(/\s+/);
    const poeticWords = {
      'i': 'I dance',
      'am': 'breathe as',
      'feel': 'sense the whispers of',
      'think': 'dream',
      'believe': 'hold sacred',
      'want': 'yearn for',
      'need': 'cry out for',
      'love': 'embrace with infinite tenderness',
      'hate': 'resist with fierce determination',
      'fear': 'trembles before',
      'hope': 'reaches toward tomorrow\'s light',
      'truth': 'the mirror\'s honest gaze',
      'pain': 'the teacher wearing thorns',
      'joy': 'light spilling from cracked vessels',
      'anger': 'fire that cleanses and transforms',
      'sad': 'beautiful in its depth',
      'happy': 'radiant as dawn breaking'
    };

    let reflection = truth;
    
    // Apply poetic transformations
    Object.entries(poeticWords).forEach(([word, replacement]) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      reflection = reflection.replace(regex, replacement);
    });

    // Add line breaks for poetic format
    const lines = reflection.split(/[.!?]+/).filter(line => line.trim());
    return lines.map(line => line.trim()).join('<br><br>') + 
           '<br><br><em style="opacity: 0.7;">— Reflected through the Mirror of Truth</em>';
  }
}

// Initialize Miroir Features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.miroirFeatures = new MiroirFeatures();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MiroirFeatures;
}