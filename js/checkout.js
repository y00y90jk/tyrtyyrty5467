document.addEventListener('DOMContentLoaded', () => {
  // Cache DOM elements for better performance
  const elements = {
    checkoutUsername: document.getElementById('checkout-username'),
    checkoutPrice: document.getElementById('checkout-price'),
    checkoutCategory: document.getElementById('checkout-category'),
    checkoutForm: document.getElementById('checkout-form'),
    emailInput: document.getElementById('email'),
    emailError: document.getElementById('email-error'),
    termsCheckbox: document.getElementById('terms'),
    termsError: document.getElementById('terms-error'),
    termsLink: document.getElementById('terms-link'),
    termsModal: document.getElementById('terms-modal'),
    closeModal: document.getElementById('close-modal'),
    acceptTerms: document.getElementById('accept-terms'),
    notification: document.getElementById('notification'),
    cryptoOptions: document.querySelectorAll('.crypto-option')
  };
  
  // Load the selected username from localStorage
  const selectedUsernameData = JSON.parse(localStorage.getItem('selectedUsername'));
  if (!selectedUsernameData) {
    window.location.href = 'index.html'; // Redirect back if no username was selected
    return;
  }
  
  // Initialize page with username data
  initPage(selectedUsernameData);
  
  // Setup event listeners
  setupEventListeners();

  /**
   * Initialize the page with selected username data
   * @param {Object} data - The username data object
   */
  function initPage(data) {
    elements.checkoutUsername.textContent = `@${data.username}`;
    elements.checkoutPrice.textContent = `$${data.price}`;
    
    elements.checkoutCategory.textContent = data.category;
    elements.checkoutCategory.setAttribute('data-category', data.category);
    
    // Set up crypto options click behavior
    elements.cryptoOptions.forEach(option => {
      option.addEventListener('click', () => {
        // Select the radio inside this option
        const radio = option.querySelector('input[type="radio"]');
        radio.checked = true;
        
        // Remove selected class from all options
        elements.cryptoOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selected class to this option
        option.classList.add('selected');
      });
      
      // Pre-select the first option
      if (option.dataset.value === 'bitcoin') {
        option.classList.add('selected');
      }
    });
  }
  
  /**
   * Set up all event listeners
   */
  function setupEventListeners() {
    // Form submission
    elements.checkoutForm.addEventListener('submit', handleFormSubmit);
    
    // Terms modal
    elements.termsLink.addEventListener('click', openTermsModal);
    elements.closeModal.addEventListener('click', closeTermsModal);
    elements.acceptTerms.addEventListener('click', acceptTerms);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === elements.termsModal) {
        closeTermsModal();
      }
    });
    
    // Email validation on blur
    elements.emailInput.addEventListener('blur', validateEmail);
    
    // Remove error message when user corrects input
    elements.emailInput.addEventListener('input', () => {
      elements.emailError.textContent = '';
    });
    
    elements.termsCheckbox.addEventListener('change', () => {
      elements.termsError.textContent = '';
    });
  }
  
  /**
   * Validate email format
   * @returns {boolean} - Whether the email is valid
   */
  function validateEmail() {
    const email = elements.emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      elements.emailError.textContent = 'Email is required';
      return false;
    }
    
    if (!emailRegex.test(email)) {
      elements.emailError.textContent = 'Please enter a valid email address';
      return false;
    }
    
    elements.emailError.textContent = '';
    return true;
  }
  
  /**
   * Open terms and conditions modal
   * @param {Event} e - The click event
   */
  function openTermsModal(e) {
    e.preventDefault();
    elements.termsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  /**
   * Close terms and conditions modal
   */
  function closeTermsModal() {
    elements.termsModal.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  /**
   * Accept terms and conditions
   */
  function acceptTerms() {
    elements.termsCheckbox.checked = true;
    elements.termsError.textContent = '';
    closeTermsModal();
  }
  
  /**
   * Handle form submission
   * @param {Event} e - The submit event
   */
  async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate form
    const isEmailValid = validateEmail();
    
    if (!elements.termsCheckbox.checked) {
      elements.termsError.textContent = 'You must agree to the Terms and Conditions';
    }
    
    if (!isEmailValid || !elements.termsCheckbox.checked) {
      return;
    }
    
    // Get form values
    const email = elements.emailInput.value.trim();
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    // Map the payment method to the appropriate code
    const paymentMethodMap = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'bnb': 'BNB',
      'litecoin': 'LTC',
      'tron': 'TRX',
      'usdt-erc20': 'USDT_ERC20',
      'usdt-trc20': 'USDT_TRC20'
    };
    
    // Show loading state
    const button = elements.checkoutForm.querySelector('button[type="submit"]');
    button.classList.add('loading');
    button.disabled = true;
    
    try {
      const productDetails = await ApiService.getProductDetails(selectedUsernameData.id);
      
      if (!productDetails?.data?.variants?.length) {
        throw new Error('Failed to retrieve product variant information');
      }
      const variantId = productDetails.data.variants[0].id;
      const invoice = await ApiService.createInvoice({
        customer_email: email,
        payment_method: paymentMethodMap[paymentMethod],
        product_variants: {
          [variantId]: {
            quantity: 1,
          }
        }
      });
      if (invoice?.data?.id) {
        // Use ApiService to get checkout URL
        const checkout = await ApiService.getCheckoutUrl(invoice.data.id);
        
        // Use ApiService to extract payment URL
        let paymentUrl = ApiService.extractPaymentUrl(checkout);
        
        if (paymentUrl) {
          paymentUrl = paymentUrl.replace(/\\\//g, '/');
          window.location.href = paymentUrl;
        } else {
          throw new Error('Payment URL not found in response');
        }
      } else {
        throw new Error('Failed to create invoice');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showNotification('error', `Error: ${error.message || 'There was an error processing your checkout'}`);
      
      // Reset button
      button.classList.remove('loading');
      button.disabled = false;
    }
  }
  
  /**
   * Show notification
   * @param {string} type - The notification type ('success' or 'error')
   * @param {string} message - The notification message
   */
  function showNotification(type, message) {
    const notification = elements.notification;
    const icon = notification.querySelector('.notification-icon');
    const messageEl = notification.querySelector('.notification-message');
    
    // Set icon and message
    if (type === 'success') {
      notification.className = 'notification success';
      icon.className = 'notification-icon fas fa-check-circle';
    } else {
      notification.className = 'notification error';
      icon.className = 'notification-icon fas fa-exclamation-circle';
    }
    
    messageEl.textContent = message;
    
    // Show notification
    notification.classList.add('show');
    
    // Hide after 5 seconds
    setTimeout(() => {
      notification.classList.remove('show');
    }, 5000);
  }
  
});

// Add event listeners once DOM is loaded to avoid errors
window.addEventListener('load', () => {
  // Add a connection error handler
  window.addEventListener('online', () => {
    const notification = document.getElementById('notification');
    const icon = notification.querySelector('.notification-icon');
    const messageEl = notification.querySelector('.notification-message');
    
    notification.className = 'notification success';
    icon.className = 'notification-icon fas fa-wifi';
    messageEl.textContent = 'You are back online!';
    
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  });
  
  window.addEventListener('offline', () => {
    const notification = document.getElementById('notification');
    const icon = notification.querySelector('.notification-icon');
    const messageEl = notification.querySelector('.notification-message');
    
    notification.className = 'notification error';
    icon.className = 'notification-icon fas fa-wifi-slash';
    messageEl.textContent = 'You are offline. Please check your connection.';
    
    notification.classList.add('show');
  });
});