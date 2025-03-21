const ApiService = (function() {
    // API configuration
    const CLOUDFLARE_WORKER_URL = 'https://cors-anywhere.xxbdrx.workers.dev';
  
    // Function to get product details including variant ID
    async function getProductDetails(productId) {
      const API_URL = `https://sell.app/api/v2/products/${productId}`;
      try {
        const response = await fetch(`${CLOUDFLARE_WORKER_URL}?api_url=${encodeURIComponent(API_URL)}`);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching product details:', error);
        throw error;
      }
    }
  
    // Function to create an invoice
    async function createInvoice(invoiceData) {
      try {
        const API_URL = 'https://sell.app/api/v2/invoices';
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(invoiceData)
        };
        const response = await fetch(`${CLOUDFLARE_WORKER_URL}?api_url=${encodeURIComponent(API_URL)}`, options);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error creating invoice:', error);
        throw error;
      }
    }
  
    // Function to get checkout URL using the invoice ID
    async function getCheckoutUrl(invoiceId) {
      try {
        const API_URL = `https://sell.app/api/v2/invoices/${invoiceId}/checkout`;
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        };
        
        const response = await fetch(`${CLOUDFLARE_WORKER_URL}?api_url=${encodeURIComponent(API_URL)}`, options);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error getting checkout URL:', error);
        throw error;
      }
    }
  
    // Function to extract payment URL from checkout response
    function extractPaymentUrl(checkout) {
      // Check for direct payment_url at the top level
      if (checkout?.payment_url) {
        return checkout.payment_url;
      }
      // Check inside data object
      if (checkout?.data?.payment_url) {
        return checkout.data.payment_url;
      }
      // Check inside invoice.payment.gateway.data
      if (checkout?.invoice?.payment?.gateway?.data?.checkout_url) {
        return checkout.invoice.payment.gateway.data.checkout_url;
      }
      return null;
    }
  
    // Function to fetch usernames
    async function fetchUsernames() {
      const API_URL = 'https://sell.app/api/v2/groups';
      try {
        const response = await fetch(`${CLOUDFLARE_WORKER_URL}?api_url=${encodeURIComponent(API_URL)}`);
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching usernames:', error);
        throw error;
      }
    }
  
    // Return public methods
    return {
      getProductDetails,
      createInvoice,
      getCheckoutUrl,
      extractPaymentUrl,
      fetchUsernames
    };
  })();