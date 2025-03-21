document.addEventListener('DOMContentLoaded', () => {
  // Initialize AOS animations - reduce duration for mobile
  AOS.init({
    duration: window.innerWidth < 768 ? 500 : 800,
    once: true,
    offset: 30,
    delay: 50,
    easing: 'ease-in-out',
    disable: 'phone' // Disable on very small screens to improve performance
  });

  // Initialize particles background with reduced particle count for mobile
  if (document.getElementById('particles-js')) {
    const particleCount = window.innerWidth < 768 ? 30 : 80;
    particlesJS('particles-js', {
      particles: {
        number: {
          value: particleCount,
          density: {
            enable: true,
            value_area: 800
          }
        },
        color: {
          value: '#6366f1'
        },
        shape: {
          type: 'circle',
          stroke: {
            width: 0,
            color: '#000000'
          }
        },
        opacity: {
          value: 0.3,
          random: true,
          anim: {
            enable: true,
            speed: 0.8, // Reduced for mobile
            opacity_min: 0.1,
            sync: false
          }
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: false,
            speed: 20, // Reduced speed for mobile
            size_min: 0.1,
            sync: false
          }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#6366f1',
          opacity: 0.2,
          width: 1
        },
        move: {
          enable: true,
          speed: window.innerWidth < 768 ? 1 : 2, // Slower on mobile
          direction: 'none',
          random: false,
          straight: false,
          out_mode: 'out',
          bounce: false,
          attract: {
            enable: true,
            rotateX: 600,
            rotateY: 1200
          }
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: {
            enable: window.innerWidth >= 768, // Disable hover effects on mobile
            mode: 'grab'
          },
          onclick: {
            enable: true,
            mode: 'push'
          },
          resize: true
        },
        modes: {
          grab: {
            distance: 140,
            line_linked: {
              opacity: 0.5
            }
          },
          push: {
            particles_nb: 2 // Reduced for mobile
          }
        }
      },
      retina_detect: true
    });
  }

  // Global Variables
  const SAMPLE_DATA = [
  ];
  
  let allUsernames = [];
  let filteredUsernames = [];
  let currentPage = 1;
  const itemsPerPage = window.innerWidth < 768 ? 6 : 12; // Fewer items per page on mobile
  let currentFilter = 'all';
  let currentSort = 'recent';
  let isSearching = false;
  let touchStartY = 0; // For detecting vertical scroll on mobile
  
  // DOM Elements
  const cardsContainer = document.querySelector('.username-cards');
  const loadingSpinner = document.getElementById('loading-spinner');
  const resultsCount = document.getElementById('results-count');
  const loadMoreBtn = document.getElementById('load-more');
  const searchForm = document.querySelector('.search-form');
  const searchTabs = document.querySelectorAll('.search-tab');
  const usernameSearch = document.getElementById('username-search');
  const lengthSelect = document.getElementById('length-select');
  const priceSelect = document.getElementById('price-select');
  const sortSelect = document.getElementById('sort-select');
  const featuredSliderTrack = document.querySelector('.featured-slider-track');
  const featuredNextBtn = document.querySelector('.featured-control.next');
  const featuredPrevBtn = document.querySelector('.featured-control.prev');
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  const navLinks = document.querySelectorAll('.nav-link');
  const themeToggle = document.getElementById('theme-toggle');
  const backToTopBtn = document.getElementById('back-to-top');
  const faqItems = document.querySelectorAll('.faq-item');
  const filterToggle = document.getElementById('filter-toggle') || document.createElement('div');
  const filterPanel = document.querySelector('.filter-panel') || document.createElement('div');
  
  // Create filter toggle button for mobile if it doesn't exist
  if (!document.getElementById('filter-toggle') && searchForm) {
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'filter-toggle';
    toggleBtn.className = 'filter-toggle-btn';
    toggleBtn.innerHTML = '<i class="fas fa-filter"></i> Filters';
    searchForm.parentNode.insertBefore(toggleBtn, searchForm);
    
    // Create and append mobile filter panel if it doesn't exist
    if (!document.querySelector('.filter-panel')) {
      const panel = document.createElement('div');
      panel.className = 'filter-panel';
      panel.innerHTML = `
        <div class="filter-panel-header">
          <h3>Filter Options</h3>
          <button class="filter-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="filter-panel-content"></div>
        <div class="filter-panel-footer">
          <button class="btn btn-primary apply-filters">Apply Filters</button>
          <button class="btn btn-outline reset-filters">Reset</button>
        </div>
      `;
      document.body.appendChild(panel);
      
      // Move filter elements to the panel on mobile
      if (window.innerWidth < 768 && searchForm) {
        const filterContent = panel.querySelector('.filter-panel-content');
        // Clone the filter elements instead of moving them, to maintain both views
        const filtersToClone = searchForm.querySelectorAll('.form-group');
        filtersToClone.forEach(filter => {
          const clone = filter.cloneNode(true);
          filterContent.appendChild(clone);
        });
        
        // Setup event listeners for mobile filter panel
        const closeBtn = panel.querySelector('.filter-close');
        const applyBtn = panel.querySelector('.apply-filters');
        const resetBtn = panel.querySelector('.reset-filters');
        
        closeBtn.addEventListener('click', () => {
          panel.classList.remove('active');
          document.body.classList.remove('no-scroll');
        });
        
        applyBtn.addEventListener('click', () => {
          // Sync the main form values with panel values
          const panelInputs = panel.querySelectorAll('select, input');
          panelInputs.forEach(input => {
            const mainInput = searchForm.querySelector(`#${input.id}`);
            if (mainInput) {
              mainInput.value = input.value;
            }
          });
          
          isSearching = true;
          currentPage = 1;
          displayUsernames();
          panel.classList.remove('active');
          document.body.classList.remove('no-scroll');
          showToast('Filters Applied', 'Your search results have been updated', 'success');
        });
        
        resetBtn.addEventListener('click', () => {
          resetFilters();
          panel.classList.remove('active');
          document.body.classList.remove('no-scroll');
        });
        
        // Update filter toggle reference
        const filterToggle = document.getElementById('filter-toggle');
        filterToggle.addEventListener('click', () => {
          panel.classList.add('active');
          document.body.classList.add('no-scroll');
        });
      }
    }
  }
  
  // Theme Management
  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      document.body.classList.remove('light-theme');
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
  }
  
  function toggleTheme() {
    if (document.body.classList.contains('light-theme')) {
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      showToast('Dark mode activated', 'Theme preference saved', 'info');
    } else {
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      showToast('Light mode activated', 'Theme preference saved', 'info');
    }
  }
  
  // Navigation Handling - Improved for mobile
  function initNavigation() {
    // Mobile menu toggle with improved touch handling
    mobileMenuToggle.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent any default behavior
      mobileMenuToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.classList.toggle('no-scroll');
    });
    
    // Close menu when tapping outside
    document.addEventListener('click', (e) => {
      if (mobileMenu.classList.contains('active') && 
          !mobileMenu.contains(e.target) && 
          !mobileMenuToggle.contains(e.target)) {
        mobileMenuToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.classList.remove('no-scroll');
      }
    });
    
    // Mobile menu links - improved touch handling
    mobileLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Only prevent default for hash links to allow smooth scrolling
        if (link.getAttribute('href').startsWith('#')) {
          e.preventDefault();
          const targetId = link.getAttribute('href').substring(1);
          const targetElement = document.getElementById(targetId);
          
          if (targetElement) {
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
            
            // Smooth scroll with offset for fixed header
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    });
    
    // Throttled scroll handling for better performance
    let lastScrollTime = 0;
    window.addEventListener('scroll', () => {
      if (Date.now() - lastScrollTime > 100) { // Throttle to 10 times per second max
        lastScrollTime = Date.now();
        
        const nav = document.querySelector('.main-nav');
        if (window.scrollY > 30) { // Reduced threshold for mobile
          nav.classList.add('scrolled');
          backToTopBtn.classList.add('visible');
        } else {
          nav.classList.remove('scrolled');
          backToTopBtn.classList.remove('visible');
        }
        
        // Active nav link based on scroll position - optimized
        const sections = document.querySelectorAll('section[id]');
        let currentSectionId = '';
        
        sections.forEach(section => {
          const sectionTop = section.offsetTop - 100;
          const sectionBottom = sectionTop + section.offsetHeight;
          const scrollPosition = window.scrollY;
          
          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            currentSectionId = section.getAttribute('id');
          }
        });
        
        if (currentSectionId) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
              link.classList.add('active');
            }
          });
          
          mobileLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
              link.classList.add('active');
            }
          });
        }
      }
    }, { passive: true }); // Add passive flag for better performance
    
    // Improved back to top button for mobile
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Use requestAnimationFrame for smoother scrolling on mobile
      const scrollToTop = () => {
        const position = window.pageYOffset;
        if (position > 0) {
          window.scrollTo(0, position - Math.max(20, position / 10));
          requestAnimationFrame(scrollToTop);
        }
      };
      
      // Check if browser supports smooth scrolling
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else {
        // Fallback for browsers without smooth scrolling
        requestAnimationFrame(scrollToTop);
      }
    });
  }
  
  // Toast Notifications - Modified for better mobile experience
  function showToast(title, message, type = 'success') {
    const toastContainer = document.querySelector('.toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.classList.add('toast', 'mobile-friendly');
    
    let iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-times-circle';
    if (type === 'info') iconClass = 'fa-info-circle';
    
    toast.innerHTML = `
      <div class="toast-icon ${type}">
        <i class="fas ${iconClass}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Animate in with a slight delay for mobile
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Make toast dismissible by tapping anywhere on it (mobile friendly)
    toast.addEventListener('click', (e) => {
      // Only dismiss if we didn't click on a button within the toast
      if (!e.target.closest('button:not(.toast-close)')) {
        toast.classList.remove('show');
        setTimeout(() => {
          toast.remove();
        }, 300);
      }
    });
    
    // Set up close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent double handling from the toast click event
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    });
    
    // Auto close after 4 seconds on mobile, 5 on desktop
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.remove('show');
        setTimeout(() => {
          if (toast.parentNode) {
            toast.remove();
          }
        }, 300);
      }
    }, window.innerWidth < 768 ? 4000 : 5000);
  }
  
  // Create toast container if it doesn't exist
  function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  }
  
  // FAQ Accordion - Improved for mobile touch
  function initFaqAccordion() {
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all items
        faqItems.forEach(faq => {
          const answer = faq.querySelector('.faq-answer');
          // Use height transition for smoother animation on mobile
          if (faq !== item || !isActive) {
            answer.style.maxHeight = '0';
            faq.classList.remove('active');
          }
        });
        
        // If it wasn't active, open it
        if (!isActive) {
          item.classList.add('active');
          const answer = item.querySelector('.faq-answer');
          // Set max-height for transition
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });
  }
  
  // API Data Fetching - Improved with better error handling for mobile networks
  async function fetchUsernames() {
    showLoading(true);
    isSearching = false; // Reset the flag when initially fetching usernames
    
    let retryCount = 0;
    const maxRetries = 3;
    const fetchWithRetry = async () => {
      try {
        // Add a cache-busting parameter for mobile networks
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/usernames?_=${timestamp}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          timeout: 10000 // 10 second timeout for mobile networks
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        
        const data = await response.json();
        
        // If successful
        if (data && data.data && data.data.length > 0) {
          processUsernameData(data.data);
        } else {
          // If API returns empty data
          processUsernameData(SAMPLE_DATA);
        }
      } catch (error) {
        console.error('Error fetching usernames:', error);
        
        // Retry logic for mobile networks
        if (retryCount < maxRetries) {
          retryCount++;
          showToast('Connection Issue', `Retrying... (${retryCount}/${maxRetries})`, 'info');
          
          // Exponential backoff for retries
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          return fetchWithRetry();
        } else {
          // Use sample data as fallback after retries
          processUsernameData(SAMPLE_DATA);
          showToast('Connection Issue', 'Using cached data instead', 'info');
        }
      } finally {
        showLoading(false);
      }
    };
    
    await fetchWithRetry();
  }
  
  function processUsernameData(data) {
    allUsernames = [];
    
    data.forEach(group => {
      const category = group.category || group.title || '';
      
      group.products.forEach(product => {
        const username = product.title;
        const price = parseFloat(product.description);
        const productId = product.id;
        const featured = product.featured !== undefined ? product.featured : Math.random() > 0.7;
        
        allUsernames.push({
          id: productId,
          username,
          price,
          category: category.toLowerCase(),
          charCount: username.length,
          featured
        });
      });
    });
    
    // Initialize display
    resetFilters();
    displayFeaturedUsernames(); // This now handles both featured usernames and scrolling usernames
  }
  
  // Username Display Functions - Improved for mobile
  function displayUsernames() {
    if (!cardsContainer) return;
    
    // Remember scroll position before clearing container
    const scrollPos = window.pageYOffset;
    
    cardsContainer.innerHTML = '';
    filteredUsernames = filterUsernames();
    
    const startIndex = 0;
    const endIndex = Math.min(currentPage * itemsPerPage, filteredUsernames.length);
    const displayedUsernames = filteredUsernames.slice(startIndex, endIndex);
    
    if (displayedUsernames.length === 0) {
      cardsContainer.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">
            <i class="fas fa-search"></i>
          </div>
          <h3>No Usernames Found</h3>
          <p>Try adjusting your search criteria or filters.</p>
          <button class="btn btn-outline reset-filters">
            <i class="fas fa-undo"></i> Reset Filters
          </button>
        </div>
      `;
      
      const resetBtn = cardsContainer.querySelector('.reset-filters');
      if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
          e.preventDefault();
          resetFilters();
        });
      }
    } else {
      // Batch DOM operations for better performance
      const fragment = document.createDocumentFragment();
      
      displayedUsernames.forEach(item => {
        const card = createUsernameCard(item);
        fragment.appendChild(card);
      });
      
      cardsContainer.appendChild(fragment);
      
      // Add buy now button event listeners
      addBuyNowEventListeners();
    }
    
    // Update results count
    updateResultsCount();
    
    // Toggle load more button
    toggleLoadMoreButton();
    
    // Only restore scroll position if we're not on the first page and not searching
    if (currentPage > 1 && !isSearching) {
      window.scrollTo(0, scrollPos);
    }
    
    // Re-enable any animations that might have been disabled
    if (!isSearching && window.innerWidth >= 768) {
      AOS.refresh();
    }
  }
  
  function createUsernameCard(item) {
    const card = document.createElement('div');
    card.className = 'card';
    
    // Only add animation attributes during initial data load and on desktop
    if (!isSearching && window.innerWidth >= 768) {
      card.setAttribute('data-aos', 'fade-up');
      card.setAttribute('data-aos-delay', (Math.random() * 200).toString());
    }
    
    // Determine badge class
    let badgeClass = '';
    if (item.category.toLowerCase() === 'hightier') {
      badgeClass = 'hightier';
    } else if (item.category.toLowerCase() === 'meaning') {
      badgeClass = 'meaning';
    } else if (item.category.toLowerCase() === 'repeated') {
      badgeClass = 'repeated';
    }
    
    // Format price with commas
    const formattedPrice = item.price.toLocaleString();
    
    // Set card HTML - improved for mobile touch targets
    card.innerHTML = `
      <div class="type-badge ${badgeClass}">${item.category}</div>
      <h2 class="username">@${item.username}</h2>
      <div class="price-label">Price</div>
      <div class="price">$${formattedPrice}</div>
      <div class="character-count">
        <i class="fas fa-text-height"></i>
        ${item.charCount} Characters
      </div>
      <button class="buy-now" data-id="${item.id}" data-username="${item.username}" data-price="${item.price}" data-category="${item.category}">
        <i class="fas fa-shopping-cart"></i>
        <span class="btn-text">Buy Now</span>
      </button>
    `;
    
    return card;
  }
  
  function displayFeaturedUsernames() {
    // If featured slider exists
    if (featuredSliderTrack) {
      featuredSliderTrack.innerHTML = '';
      
      // Sort all usernames by price (highest to lowest)
      const sortedUsernames = [...allUsernames].sort((a, b) => b.price - a.price);
      
      // Limit number of featured items on mobile for performance
      const maxFeaturedItems = window.innerWidth < 768 ? 10 : sortedUsernames.length;
      const featureItems = sortedUsernames.slice(0, maxFeaturedItems);
      
      if (featureItems.length > 0) {
        // Batch DOM updates
        const fragment = document.createDocumentFragment();
        
        featureItems.forEach(item => {
          const card = createUsernameCard(item);
          card.classList.add('featured-card');
          fragment.appendChild(card);
        });
        
        featuredSliderTrack.appendChild(fragment);
        
        // Add buy now button event listeners
        addBuyNowEventListeners();
        
        // Initialize featured slider
        initFeaturedSlider();
        
        // Update scrolling usernames to match
        updateScrollingUsernames(featureItems);
      }
    }
  }
  
  // New function to update scrolling usernames - optimized for mobile
  function updateScrollingUsernames(usernames) {
    const scrollingContainers = document.querySelectorAll('.username-scroll');
    
    if (scrollingContainers.length) {
      // Clear existing usernames
      scrollingContainers.forEach(container => {
        container.innerHTML = '';
      });
      
      // Limit number of scrolling usernames on mobile for performance
      const maxScroll = window.innerWidth < 768 ? 15 : usernames.length;
      const scrollItems = usernames.slice(0, maxScroll);
      
      // Add usernames from the featured section
      const fragment = document.createDocumentFragment();
      
      scrollItems.forEach(item => {
        const usernameSpan = document.createElement('span');
        usernameSpan.textContent = `@${item.username}`;
        fragment.appendChild(usernameSpan);
      });
      
      // Add to both scrolling containers
      scrollingContainers.forEach(container => {
        container.appendChild(fragment.cloneNode(true));
      });
    }
  }
  
  // Featured Slider Controls - Optimized for mobile
  function initFeaturedSlider() {
    const featuredSliderTrack = document.querySelector('.featured-slider-track');
    const featuredNextBtn = document.querySelector('.featured-control.next');
    const featuredPrevBtn = document.querySelector('.featured-control.prev');
    
    if (!featuredSliderTrack || !featuredNextBtn || !featuredPrevBtn) return;
    
    let currentSlide = 0;
    let slidesPerView = 4; // Default value that will be adjusted
    let maxSlides = 0;
    let slideWidth = 0;
    let autoSlideInterval;
    let isTouching = false;
    
    // Calculate how many slides to show based on viewport width
    function calculateSlidesPerView() {
      const viewportWidth = window.innerWidth;
      
      if (viewportWidth < 480) {
        slidesPerView = 1;
      } else if (viewportWidth < 768) {
        slidesPerView = 1.5; // Show partial next slide on mobile
      } else if (viewportWidth < 992) {
        slidesPerView = 2;
      } else if (viewportWidth < 1200) {
        slidesPerView = 3;
      } else {
        slidesPerView = 4;
      }
      
      updateSliderMetrics();
    }
    
    // Update slider measurements and position
    function updateSliderMetrics() {
      const slides = featuredSliderTrack.querySelectorAll('.card');
      if (slides.length === 0) return;
      
      const firstSlide = slides[0];
      const style = window.getComputedStyle(firstSlide);
      const marginRight = parseInt(style.marginRight) || 0;
      
      // Calculate slide width including margin
      slideWidth = firstSlide.offsetWidth + marginRight;
      
      // Calculate maximum slide position
      maxSlides = Math.max(0, slides.length - Math.floor(slidesPerView));
      
      // If we're past the max slides after a resize, adjust current position
      if (currentSlide > maxSlides) {
        currentSlide = maxSlides;
      }
      
      // Update slider position to match new metrics
      updateSliderPosition();
    }
    
    // Update the slider position based on currentSlide
    function updateSliderPosition() {
      if (!featuredSliderTrack) return;
      
      const translateX = -currentSlide * slideWidth;
      featuredSliderTrack.style.transform = `translateX(${translateX}px)`;
    }
    
    // Loop animation when reaching the end
    function animateSliderReset(direction) {
      featuredSliderTrack.style.transition = 'transform 0.3s ease'; // Faster on mobile
      
      if (direction === 'next') {
        // Animate slightly past the end
        featuredSliderTrack.style.transform = `translateX(${-maxSlides * slideWidth - 30}px)`;
        
        // Then reset to beginning
        setTimeout(() => {
          featuredSliderTrack.style.transition = 'none';
          currentSlide = 0;
          updateSliderPosition();
          setTimeout(() => {
            featuredSliderTrack.style.transition = 'transform 0.3s ease';
          }, 30);
        }, 300);
      } else {
        // Animate slightly before the beginning
        featuredSliderTrack.style.transform = 'translateX(30px)';
        
        // Then reset to end
        setTimeout(() => {
          featuredSliderTrack.style.transition = 'none';
          currentSlide = maxSlides;
          updateSliderPosition();
          setTimeout(() => {
            featuredSliderTrack.style.transition = 'transform 0.3s ease';
          }, 30);
        }, 300);
      }
    }
    
    // Start auto-slide functionality - slower on mobile
    function startAutoSlide() {
      stopAutoSlide(); // Clear any existing interval first
      
      // Longer interval on mobile to give time to interact
      const interval = window.innerWidth < 768 ? 7000 : 5000;
      
      autoSlideInterval = setInterval(() => {
        if (!isTouching) { // Don't auto-advance while user is touching
          if (currentSlide < maxSlides) {
            currentSlide++;
          } else {
            currentSlide = 0;
          }
          updateSliderPosition();
        }
      }, interval);
    }
    
    // Stop auto-slide functionality
    function stopAutoSlide() {
      if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
      }
    }
    
    // Next button click handler - improved for touch
    featuredNextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (currentSlide < maxSlides) {
        currentSlide++;
        updateSliderPosition();
      } else {
        // Loop back to start with animation
        animateSliderReset('next');
      }
    });
    
    // Previous button click handler - improved for touch
    featuredPrevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (currentSlide > 0) {
        currentSlide--;
        updateSliderPosition();
      } else {
          // Loop to end with animation
          animateSliderReset('prev');
        }
      });
      
      // Pause auto-slide on hover
      featuredSliderTrack.addEventListener('mouseenter', stopAutoSlide);
      featuredSliderTrack.addEventListener('mouseleave', startAutoSlide);
      
      // Recalculate on window resize
      let resizeTimeout;
      window.addEventListener('resize', () => {
        // Debounce the resize event
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          calculateSlidesPerView();
        }, 200);
      });
      
      // Initialize the slider
      calculateSlidesPerView();
      startAutoSlide();
      
      // Add touch swipe support for mobile
      let touchStartX = 0;
      let touchEndX = 0;
      
      featuredSliderTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoSlide();
      }, { passive: true });
      
      featuredSliderTrack.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoSlide();
      }, { passive: true });
      
      function handleSwipe() {
        const minSwipeDistance = 50;
        if (touchStartX - touchEndX > minSwipeDistance) {
          // Swipe left - next slide
          if (currentSlide < maxSlides) {
            currentSlide++;
            updateSliderPosition();
          }
        } else if (touchEndX - touchStartX > minSwipeDistance) {
          // Swipe right - previous slide
          if (currentSlide > 0) {
            currentSlide--;
            updateSliderPosition();
          }
        }
      }
      
      // Return public methods for external access
      return {
        recalculate: calculateSlidesPerView,
        next: () => {
          if (currentSlide < maxSlides) {
            currentSlide++;
            updateSliderPosition();
          }
        },
        prev: () => {
          if (currentSlide > 0) {
            currentSlide--;
            updateSliderPosition();
          }
        }
      };
    }
    
    // Filtering & Sorting
    function filterUsernames() {
      const searchTerm = usernameSearch.value.toLowerCase();
      const lengthFilter = lengthSelect.value;
      const priceFilter = priceSelect.value;
      
      let filtered = allUsernames.filter(item => {
        // Username search
        if (searchTerm && !item.username.toLowerCase().includes(searchTerm)) {
          return false;
        }
        
        // Category filter
        if (currentFilter !== 'all' && item.category.toLowerCase() !== currentFilter) {
          return false;
        }
        
        // Length filter
        if (lengthFilter !== 'all') {
          if (lengthFilter === '3' && item.charCount !== 3) return false;
          if (lengthFilter === '4' && item.charCount !== 4) return false;
          if (lengthFilter === '5' && item.charCount !== 5) return false;
          if (lengthFilter === '6+' && item.charCount < 6) return false;
        }
        
        // Price filter
        if (priceFilter !== 'all') {
          if (priceFilter === 'under500' && item.price >= 500) return false;
          if (priceFilter === '500-1000' && (item.price < 500 || item.price > 1000)) return false;
          if (priceFilter === '1000-5000' && (item.price < 1000 || item.price > 5000)) return false;
          if (priceFilter === 'over5000' && item.price <= 5000) return false;
        }
        
        return true;
      });
      
      // Sort results
      filtered = sortUsernames(filtered);
      
      return filtered;
    }
    
    function sortUsernames(usernames) {
      switch (currentSort) {
        case 'price-low':
          return [...usernames].sort((a, b) => a.price - b.price);
        case 'price-high':
          return [...usernames].sort((a, b) => b.price - a.price);
        case 'length':
          return [...usernames].sort((a, b) => a.charCount - b.charCount);
        case 'recent':
        default:
          return usernames; // Already sorted by most recent
      }
    }
    
    function resetFilters() {
      currentFilter = 'all';
      currentSort = 'recent';
      currentPage = 1;
      isSearching = true; // We're filtering, so set this to true
      
      // Reset form inputs
      usernameSearch.value = '';
      lengthSelect.value = 'all';
      priceSelect.value = 'all';
      sortSelect.value = 'recent';
      
      // Reset active tab
      searchTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-filter') === 'all') {
          tab.classList.add('active');
        }
      });
      
      // Display usernames
      displayUsernames();
      
      // Show a toast
      showToast('Filters Reset', 'Showing all available usernames', 'info');
    }
    
    function updateResultsCount() {
      if (resultsCount) {
        resultsCount.textContent = filteredUsernames.length;
      }
    }
    
    function toggleLoadMoreButton() {
      if (loadMoreBtn) {
        if (currentPage * itemsPerPage < filteredUsernames.length) {
          loadMoreBtn.style.display = 'flex';
        } else {
          loadMoreBtn.style.display = 'none';
        }
      }
    }
    
    function showLoading(isLoading) {
      if (loadingSpinner) {
        if (isLoading) {
          loadingSpinner.style.display = 'flex';
          if (cardsContainer) {
            cardsContainer.style.opacity = '0.5';
          }
        } else {
          loadingSpinner.style.display = 'none';
          if (cardsContainer) {
            cardsContainer.style.opacity = '1';
          }
        }
      }
    }
    
    // Event Handlers
    function addBuyNowEventListeners() {
      const buyButtons = document.querySelectorAll('.buy-now');
      buyButtons.forEach(button => {
        button.addEventListener('click', handleBuyNow);
      });
    }
    
    function handleBuyNow(event) {
      const button = event.currentTarget;
      const productId = button.getAttribute('data-id');
      const username = button.getAttribute('data-username');
      const price = button.getAttribute('data-price');
      const category = button.getAttribute('data-category');
      
      // Save selected username details to localStorage for the checkout page
      localStorage.setItem('selectedUsername', JSON.stringify({
        id: productId,
        username,
        price,
        category
      }));
      
      // Add loading animation to button
      const originalContent = button.innerHTML;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
      button.disabled = true;
      
      // Redirect to checkout page after a short delay
      setTimeout(() => {
        window.location.href = 'checkout.html';
      }, 500);
    }
    
    // Event Listeners Setup
    function setupEventListeners() {
      // Search form
      if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
          e.preventDefault();
          isSearching = true;
          currentPage = 1;
          displayUsernames();
        });
      }
      
      // Category tabs
      if (searchTabs) {
        searchTabs.forEach(tab => {
          tab.addEventListener('click', () => {
            isSearching = true;
            searchTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.getAttribute('data-filter');
            currentPage = 1;
            displayUsernames();
          });
        });
      }
      
      // Search input (real-time filtering)
      if (usernameSearch) {
        usernameSearch.addEventListener('input', debounce(() => {
          isSearching = true;
          currentPage = 1;
          displayUsernames();
        }, 500));
      }
      
      // Length and price filters
      if (lengthSelect) {
        lengthSelect.addEventListener('change', () => {
          isSearching = true;
          currentPage = 1;
          displayUsernames();
        });
      }
      
      if (priceSelect) {
        priceSelect.addEventListener('change', () => {
          isSearching = true;
          currentPage = 1;
          displayUsernames();
        });
      }
      
      // Sort selector
      if (sortSelect) {
        sortSelect.addEventListener('change', () => {
          isSearching = true;
          currentSort = sortSelect.value;
          currentPage = 1;
          displayUsernames();
        });
      }
      
      // Load more button
      if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
          isSearching = true;
          currentPage++;
          displayUsernames();
        });
      }
      
      // Theme toggle
      if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
      }
      
      // Contact form
      const contactForm = document.querySelector('.contact-form');
      if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = contactForm.querySelector('#name').value;
          showToast('Message Sent', `Thank you ${name}, we'll respond shortly!`, 'success');
          contactForm.reset();
        });
      }
      
      // Newsletter form
      const newsletterForm = document.querySelector('.newsletter-form');
      if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
          e.preventDefault();
          showToast('Subscription Successful', 'You\'ve been added to our newsletter', 'success');
          newsletterForm.reset();
        });
      }
    }
    
    // Utilities
    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          timeout = null;
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
    
    // Animate elements when scrolled into view
    function animateOnScroll() {
      const elements = document.querySelectorAll('.animate-on-scroll');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1
      });
      
      elements.forEach(element => {
        observer.observe(element);
      });
    }
    
    // Initialize everything
    function init() {
      initTheme();
      initNavigation();
      initFaqAccordion();
      fetchUsernames();
      setupEventListeners();
      animateOnScroll();
    }
    
    // Start the application
    init();
  });