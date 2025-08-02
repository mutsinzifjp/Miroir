/**
 * MIROIR AUDIO VISUAL COMPONENTS
 * Custom audio players, image carousels, slideshows
 */

class MiroirAudioVisual {
  constructor() {
    this.currentAudio = null;
    this.audioPlayers = new Map();
    this.carousels = new Map();
    this.init();
  }

  init() {
    console.log('[AudioVisual] Initializing audio/visual components...');
    this.initCustomAudioPlayers();
    this.initImageCarousels();
    this.initSlideshows();
    this.bindEvents();
    console.log('[AudioVisual] Audio/visual components initialized');
  }

  // ======================================
  // CUSTOM AUDIO PLAYER
  // ======================================
  initCustomAudioPlayers() {
    const audioElements = document.querySelectorAll('audio[data-custom-player]');
    audioElements.forEach((audio, index) => {
      this.createCustomPlayer(audio, `player-${index}`);
    });
  }

  createCustomPlayer(audioElement, playerId) {
    const player = {
      audio: audioElement,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1
    };

    // Hide original audio element
    audioElement.style.display = 'none';

    // Create custom player UI
    const playerContainer = document.createElement('div');
    playerContainer.className = 'custom-audio-player';
    playerContainer.innerHTML = `
      <div class="audio-player-controls">
        <button class="play-pause-btn" aria-label="Play/Pause">
          <svg class="play-icon" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg class="pause-icon" viewBox="0 0 24 24" style="display: none;">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>
        
        <div class="progress-container">
          <div class="time-display">
            <span class="current-time">0:00</span>
            <span class="duration">0:00</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill"></div>
            <div class="progress-handle"></div>
          </div>
        </div>
        
        <div class="volume-container">
          <button class="volume-btn" aria-label="Mute/Unmute">
            <svg class="volume-icon" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3z"/>
            </svg>
          </button>
          <div class="volume-slider">
            <div class="volume-fill"></div>
            <div class="volume-handle"></div>
          </div>
        </div>
      </div>
      
      <div class="audio-player-info">
        <div class="track-title">${audioElement.dataset.title || 'Audio Track'}</div>
        <div class="track-artist">${audioElement.dataset.artist || ''}</div>
      </div>
    `;

    // Insert player after audio element
    audioElement.parentNode.insertBefore(playerContainer, audioElement.nextSibling);

    // Bind player events
    this.bindAudioPlayerEvents(player, playerContainer);
    this.audioPlayers.set(playerId, player);

    // Style the player
    this.styleAudioPlayer(playerContainer);
  }

  styleAudioPlayer(container) {
    container.style.cssText = `
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 15px;
      padding: 20px;
      margin: 20px 0;
      max-width: 400px;
      box-shadow: 0 5px 15px var(--shadow-color);
    `;

    const controls = container.querySelector('.audio-player-controls');
    controls.style.cssText = `
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
    `;

    const playBtn = container.querySelector('.play-pause-btn');
    playBtn.style.cssText = `
      background: var(--miroir-red);
      border: none;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: var(--transition-smooth);
    `;

    const progressContainer = container.querySelector('.progress-container');
    progressContainer.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;

    const progressBar = container.querySelector('.progress-bar');
    progressBar.style.cssText = `
      height: 6px;
      background: var(--bg-tertiary);
      border-radius: 3px;
      position: relative;
      cursor: pointer;
    `;

    const progressFill = container.querySelector('.progress-fill');
    progressFill.style.cssText = `
      height: 100%;
      background: var(--miroir-red);
      border-radius: 3px;
      width: 0%;
      transition: width 0.1s ease;
    `;
  }

  bindAudioPlayerEvents(player, container) {
    const playPauseBtn = container.querySelector('.play-pause-btn');
    const progressBar = container.querySelector('.progress-bar');
    const progressFill = container.querySelector('.progress-fill');
    const currentTimeSpan = container.querySelector('.current-time');
    const durationSpan = container.querySelector('.duration');
    const playIcon = container.querySelector('.play-icon');
    const pauseIcon = container.querySelector('.pause-icon');

    // Play/Pause
    playPauseBtn.addEventListener('click', () => {
      if (player.isPlaying) {
        player.audio.pause();
      } else {
        // Pause other players
        this.pauseAllPlayers();
        player.audio.play();
      }
    });

    // Audio events
    player.audio.addEventListener('play', () => {
      player.isPlaying = true;
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
    });

    player.audio.addEventListener('pause', () => {
      player.isPlaying = false;
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
    });

    player.audio.addEventListener('timeupdate', () => {
      player.currentTime = player.audio.currentTime;
      const progress = (player.currentTime / player.audio.duration) * 100;
      progressFill.style.width = `${progress}%`;
      currentTimeSpan.textContent = this.formatTime(player.currentTime);
    });

    player.audio.addEventListener('loadedmetadata', () => {
      player.duration = player.audio.duration;
      durationSpan.textContent = this.formatTime(player.duration);
    });

    // Progress bar click
    progressBar.addEventListener('click', (e) => {
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const progress = clickX / rect.width;
      player.audio.currentTime = progress * player.audio.duration;
    });
  }

  pauseAllPlayers() {
    this.audioPlayers.forEach(player => {
      if (player.isPlaying) {
        player.audio.pause();
      }
    });
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // ======================================
  // IMAGE CAROUSEL
  // ======================================
  initImageCarousels() {
    const carouselElements = document.querySelectorAll('.image-carousel');
    carouselElements.forEach((carousel, index) => {
      this.createImageCarousel(carousel, `carousel-${index}`);
    });
  }

  createImageCarousel(container, carouselId) {
    const images = Array.from(container.querySelectorAll('img'));
    if (images.length === 0) return;

    const carousel = {
      container,
      images,
      currentIndex: 0,
      autoPlay: container.dataset.autoplay === 'true',
      interval: parseInt(container.dataset.interval) || 5000
    };

    // Create carousel structure
    container.innerHTML = `
      <div class="carousel-viewport">
        <div class="carousel-track">
          ${images.map((img, index) => `
            <div class="carousel-slide ${index === 0 ? 'active' : ''}">
              <img src="${img.src}" alt="${img.alt || ''}" loading="lazy">
              ${img.dataset.caption ? `<div class="slide-caption">${img.dataset.caption}</div>` : ''}
            </div>
          `).join('')}
        </div>
        
        <button class="carousel-btn prev-btn" aria-label="Previous image">
          <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6v12z"/></svg>
        </button>
        
        <button class="carousel-btn next-btn" aria-label="Next image">
          <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6v12z"/></svg>
        </button>
        
        <div class="carousel-indicators">
          ${images.map((_, index) => `
            <button class="indicator ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Go to slide ${index + 1}"></button>
          `).join('')}
        </div>
      </div>
    `;

    // Style the carousel
    this.styleCarousel(container);

    // Bind events
    this.bindCarouselEvents(carousel);

    // Start autoplay if enabled
    if (carousel.autoPlay) {
      this.startCarouselAutoplay(carousel);
    }

    this.carousels.set(carouselId, carousel);
  }

  styleCarousel(container) {
    container.style.cssText = `
      position: relative;
      max-width: 100%;
      margin: 20px 0;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 8px 25px var(--shadow-color);
    `;

    const viewport = container.querySelector('.carousel-viewport');
    viewport.style.cssText = `
      position: relative;
      width: 100%;
      overflow: hidden;
    `;

    const track = container.querySelector('.carousel-track');
    track.style.cssText = `
      display: flex;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    const slides = container.querySelectorAll('.carousel-slide');
    slides.forEach(slide => {
      slide.style.cssText = `
        min-width: 100%;
        position: relative;
      `;
      
      const img = slide.querySelector('img');
      img.style.cssText = `
        width: 100%;
        height: 300px;
        object-fit: cover;
        display: block;
      `;
    });

    const buttons = container.querySelectorAll('.carousel-btn');
    buttons.forEach(btn => {
      btn.style.cssText = `
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(0,0,0,0.7);
        color: white;
        border: none;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition-smooth);
        z-index: 2;
      `;
    });

    container.querySelector('.prev-btn').style.left = '15px';
    container.querySelector('.next-btn').style.right = '15px';

    const indicators = container.querySelector('.carousel-indicators');
    indicators.style.cssText = `
      position: absolute;
      bottom: 15px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      z-index: 2;
    `;

    container.querySelectorAll('.indicator').forEach(indicator => {
      indicator.style.cssText = `
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: none;
        background: rgba(255,255,255,0.5);
        cursor: pointer;
        transition: var(--transition-smooth);
      `;
    });

    container.querySelectorAll('.indicator.active').forEach(indicator => {
      indicator.style.background = 'white';
    });
  }

  bindCarouselEvents(carousel) {
    const { container } = carousel;
    
    container.querySelector('.prev-btn').addEventListener('click', () => {
      this.goToPreviousSlide(carousel);
    });

    container.querySelector('.next-btn').addEventListener('click', () => {
      this.goToNextSlide(carousel);
    });

    container.querySelectorAll('.indicator').forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        this.goToSlide(carousel, index);
      });
    });

    // Touch/swipe support
    let startX = 0;
    let isDragging = false;

    container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    });

    container.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
    });

    container.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      
      const endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;

      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          this.goToNextSlide(carousel);
        } else {
          this.goToPreviousSlide(carousel);
        }
      }
      
      isDragging = false;
    });
  }

  goToSlide(carousel, index) {
    carousel.currentIndex = index;
    this.updateCarousel(carousel);
  }

  goToNextSlide(carousel) {
    carousel.currentIndex = (carousel.currentIndex + 1) % carousel.images.length;
    this.updateCarousel(carousel);
  }

  goToPreviousSlide(carousel) {
    carousel.currentIndex = carousel.currentIndex === 0 
      ? carousel.images.length - 1 
      : carousel.currentIndex - 1;
    this.updateCarousel(carousel);
  }

  updateCarousel(carousel) {
    const track = carousel.container.querySelector('.carousel-track');
    const translateX = -carousel.currentIndex * 100;
    track.style.transform = `translateX(${translateX}%)`;

    // Update indicators
    carousel.container.querySelectorAll('.indicator').forEach((indicator, index) => {
      indicator.classList.toggle('active', index === carousel.currentIndex);
      indicator.style.background = index === carousel.currentIndex ? 'white' : 'rgba(255,255,255,0.5)';
    });
  }

  startCarouselAutoplay(carousel) {
    carousel.autoplayInterval = setInterval(() => {
      this.goToNextSlide(carousel);
    }, carousel.interval);

    // Pause on hover
    carousel.container.addEventListener('mouseenter', () => {
      clearInterval(carousel.autoplayInterval);
    });

    carousel.container.addEventListener('mouseleave', () => {
      this.startCarouselAutoplay(carousel);
    });
  }

  // ======================================
  // SLIDESHOW
  // ======================================
  initSlideshows() {
    const slideshowElements = document.querySelectorAll('.slideshow');
    slideshowElements.forEach((slideshow, index) => {
      this.createSlideshow(slideshow, `slideshow-${index}`);
    });
  }

  createSlideshow(container, slideshowId) {
    const slides = Array.from(container.children);
    if (slides.length === 0) return;

    container.style.cssText = `
      position: relative;
      min-height: 400px;
      overflow: hidden;
      border-radius: 15px;
      margin: 20px 0;
    `;

    slides.forEach((slide, index) => {
      slide.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: ${index === 0 ? 1 : 0};
        transition: opacity 1s ease-in-out;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-secondary);
        color: var(--text-primary);
        padding: 40px;
        text-align: center;
      `;
    });

    const slideshow = {
      container,
      slides,
      currentIndex: 0,
      isPlaying: true,
      interval: parseInt(container.dataset.interval) || 4000
    };

    this.startSlideshowAutoplay(slideshow);
  }

  startSlideshowAutoplay(slideshow) {
    slideshow.autoplayInterval = setInterval(() => {
      const currentSlide = slideshow.slides[slideshow.currentIndex];
      slideshow.currentIndex = (slideshow.currentIndex + 1) % slideshow.slides.length;
      const nextSlide = slideshow.slides[slideshow.currentIndex];

      currentSlide.style.opacity = '0';
      nextSlide.style.opacity = '1';
    }, slideshow.interval);
  }

  // ======================================
  // EVENT BINDING
  // ======================================
  bindEvents() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea')) return;

      switch (e.key) {
        case 'Space':
          if (this.currentAudio) {
            e.preventDefault();
            this.currentAudio.paused ? this.currentAudio.play() : this.currentAudio.pause();
          }
          break;
        case 'ArrowLeft':
          // Previous in carousel
          break;
        case 'ArrowRight':
          // Next in carousel
          break;
      }
    });

    // Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      const mediaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadMediaElement(entry.target);
            mediaObserver.unobserve(entry.target);
          }
        });
      });

      document.querySelectorAll('[data-lazy-load]').forEach(element => {
        mediaObserver.observe(element);
      });
    }
  }

  loadMediaElement(element) {
    if (element.dataset.src) {
      element.src = element.dataset.src;
      element.removeAttribute('data-src');
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.miroirAudioVisual = new MiroirAudioVisual();
  });
} else {
  window.miroirAudioVisual = new MiroirAudioVisual();
}