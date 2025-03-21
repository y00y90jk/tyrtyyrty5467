// Enhanced Claimer.me JavaScript
document.addEventListener('DOMContentLoaded', () => {
  // Initialize AOS animations
  AOS.init({
    duration: 800,
    once: true,
    offset: 50,
    delay: 100,
    easing: 'ease-in-out'
  });

  // Initialize particles background
  if (document.getElementById('particles-js')) {
    particlesJS('particles-js', {
      particles: {
        number: {
          value: 80,
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
            speed: 1,
            opacity_min: 0.1,
            sync: false
          }
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: false,
            speed: 40,
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
          speed: 2,
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
            enable: true,
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
            particles_nb: 4
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
  const itemsPerPage = 12;
  let currentFilter = 'all';
  let currentSort = 'recent';
  // New flag to track if we're in a search/filter operation
  let isSearching = false;
  
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
  
  // Navigation Handling
  function initNavigation() {
    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenuToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.classList.toggle('no-scroll');
    });
    
    // Mobile menu links
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.classList.remove('no-scroll');
      });
    });
    
    // Scroll handling for nav
    window.addEventListener('scroll', () => {
      const nav = document.querySelector('.main-nav');
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
        backToTopBtn.classList.add('visible');
      } else {
        nav.classList.remove('scrolled');
        backToTopBtn.classList.remove('visible');
      }
      
      // Active nav link based on scroll position
      const sections = document.querySelectorAll('section[id]');
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionBottom = sectionTop + section.offsetHeight;
        const scrollPosition = window.scrollY;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          const id = section.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
          
          mobileLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    });
    
    // Back to top button
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Toast Notifications
  function showToast(title, message, type = 'success') {
    const toastContainer = document.querySelector('.toast-container');
    const toast = document.createElement('div');
    toast.classList.add('toast');
    
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
      <button class="toast-close">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Set up close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    });
    
    // Auto close after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.remove('show');
        setTimeout(() => {
          if (toast.parentNode) {
            toast.remove();
          }
        }, 300);
      }
    }, 5000);
  }
  
  // FAQ Accordion
  function initFaqAccordion() {
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all items
        faqItems.forEach(faq => {
          faq.classList.remove('active');
          const answer = faq.querySelector('.faq-answer');
          answer.style.maxHeight = '0';
        });
        
        // If it wasn't active, open it
        if (!isActive) {
          item.classList.add('active');
          const answer = item.querySelector('.faq-answer');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });
  }
  
  // API Data Fetching - Modified to use ApiService
  async function fetchUsernames() {
    showLoading(true);
    isSearching = false; // Reset the flag when initially fetching usernames
    
    try {
      // Use ApiService's fetchUsernames method instead of direct API call
      const data = await ApiService.fetchUsernames();
      
      // If successful
      if (data && data.data && data.data.length > 0) {
        processUsernameData(data.data);
      } else {
        // If API returns empty data
        processUsernameData(SAMPLE_DATA);
      }
    } catch (error) {
      console.error('Error fetching usernames:', error);
      // Use sample data as fallback
      processUsernameData(SAMPLE_DATA);
      showToast('Connection Issue', 'Using sample data instead', 'info');
    } finally {
      showLoading(false);
    }
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
  
  // Username Display Functions
  function displayUsernames() {
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
        resetBtn.addEventListener('click', resetFilters);
      }
    } else {
      displayedUsernames.forEach(item => {
        const card = createUsernameCard(item);
        cardsContainer.appendChild(card);
      });
      
      // Add buy now button event listeners
      addBuyNowEventListeners();
    }
    
    // Update results count
    updateResultsCount();
    
    // Toggle load more button
    toggleLoadMoreButton();
  }
  
  function createUsernameCard(item) {
    const card = document.createElement('div');
    card.className = 'card';
    
    // Only add animation attributes during initial data load, not during filtering
    if (!isSearching) {
      card.setAttribute('data-aos', 'fade-up');
      card.setAttribute('data-aos-delay', (Math.random() * 300).toString());
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
    
    // Set card HTML
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
        Buy Now
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
      
      // Use all usernames instead of only filtering for featured
      if (sortedUsernames.length > 0) {
        sortedUsernames.forEach(item => {
          const card = createUsernameCard(item);
          card.classList.add('featured-card');
          featuredSliderTrack.appendChild(card);
        });
        
        // Add buy now button event listeners
        addBuyNowEventListeners();
        
        // Initialize featured slider
        initFeaturedSlider();
        
        // Update scrolling usernames to match
        updateScrollingUsernames(sortedUsernames);
      }
    }
  }
  
  // New function to update scrolling usernames
  function updateScrollingUsernames(usernames) {
    const scrollingContainers = document.querySelectorAll('.username-scroll');
    
    if (scrollingContainers.length) {
      // Clear existing usernames
      scrollingContainers.forEach(container => {
        container.innerHTML = '';
      });
      
      // Add all usernames from the featured section
      usernames.forEach(item => {
        const usernameSpan = document.createElement('span');
        usernameSpan.textContent = `@${item.username}`;
        
        // Add to both scrolling containers (original and clone for infinite scroll)
        scrollingContainers.forEach(container => {
          const clone = usernameSpan.cloneNode(true);
          container.appendChild(clone);
        });
      });
    }
  }
  
  // Featured Slider Controls
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
    
    // Calculate how many slides to show based on viewport width
    function calculateSlidesPerView() {
      const viewportWidth = window.innerWidth;
      
      if (viewportWidth < 768) {
        slidesPerView = 1;
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
      maxSlides = Math.max(0, slides.length - slidesPerView);
      
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
      featuredSliderTrack.style.transition = 'transform 0.4s ease';
      
      if (direction === 'next') {
        // Animate slightly past the end
        featuredSliderTrack.style.transform = `translateX(${-maxSlides * slideWidth - 50}px)`;
        
        // Then reset to beginning
        setTimeout(() => {
          featuredSliderTrack.style.transition = 'none';
          currentSlide = 0;
          updateSliderPosition();
          setTimeout(() => {
            featuredSliderTrack.style.transition = 'transform 0.4s ease';
          }, 50);
        }, 400);
      } else {
        // Animate slightly before the beginning
        featuredSliderTrack.style.transform = 'translateX(50px)';
        
        // Then reset to end
        setTimeout(() => {
          featuredSliderTrack.style.transition = 'none';
          currentSlide = maxSlides;
          updateSliderPosition();
          setTimeout(() => {
            featuredSliderTrack.style.transition = 'transform 0.4s ease';
          }, 50);
        }, 400);
      }
    }
    
    // Start auto-slide functionality
    function startAutoSlide() {
      stopAutoSlide(); // Clear any existing interval first
      
      autoSlideInterval = setInterval(() => {
        if (currentSlide < maxSlides) {
          currentSlide++;
        } else {
          currentSlide = 0;
        }
        updateSliderPosition();
      }, 5000);
    }
    
    // Stop auto-slide functionality
    function stopAutoSlide() {
      if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
      }
    }
    
    // Next button click handler
    featuredNextBtn.addEventListener('click', () => {
      if (currentSlide < maxSlides) {
        currentSlide++;
        updateSliderPosition();
      } else {
        // Loop back to start with animation
        animateSliderReset('next');
      }
    });
    
    // Previous button click handler
    featuredPrevBtn.addEventListener('click', () => {
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
