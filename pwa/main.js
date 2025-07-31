// main.js - Core script for Hygiene & Cleaning Products Store

// --- CONFIGURATION ---
// IMPORTANT: Replace these placeholder values with your actual data
const GOOGLE_APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_JSON_FEED_URL_HERE';
const AMAZON_AFFILIATE_TAG = 'your-amazon-affiliate-tag-20';
const AMAZON_PAY_MERCHANT_ID = 'YOUR_AMAZON_PAY_MERCHANT_ID';
const AMAZON_PAY_PUBLIC_KEY_ID = 'YOUR_AMAZON_PAY_PUBLIC_KEY_ID';
// This should be a real, embeddable YouTube Video ID
const PLACEHOLDER_YOUTUBE_VIDEO_ID = 'dQw4w9WgXcQ';

let videoPlaying = false; // Global flag to prevent multiple video popups

/**
 * Fetches product data from the Google Apps Script URL.
 * Returns sample data on error or if the feed is empty.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of product objects.
 */
async function fetchProducts() {
  console.log('Attempting to fetch products...');
  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL);

    // Check if the response is okay (status 200-299)
    if (!response.ok) {
      // Throw an error with the status for better debugging
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let products = await response.json();
    console.log('Fetched products successfully:', products);

    // Check if the fetched data is an array and is not empty
    if (!Array.isArray(products) || products.length === 0) {
      console.warn('Fetched data is not an array or is empty. Using sample product.');
      return [sampleProduct()];
    }

    // Map the fetched product keys to the expected keys used in rendering
    products = products.map(p => ({
      "Product ID": p.productId || 0,
      "Category": p.productCategory || '',
      "Product Name": p.productName || '',
      "Description": p.productDescription || '',
      "Price ($)": p.productPrice || 0,
      "Retail Price ($)": p.productPriceOld || 0,
      "Image URL": p.productImageUrl || '',
      "Amazon ASIN": p.productAsin || '',
      "Stock Left": p.productFomoText ? parseInt(p.productFomoText.match(/\d+/)) || 0 : 0,
      "People Viewing": 10, // Default value, as not provided
      "Star Rating": p.productRating ? p.productRating.toString() : '4.5',
      "Is Verified Seller": false, // Placeholder, no data
      "Is Best Seller": p.productBadge === 'Best Seller',
      "Is Eco Certified": p.productBadge === 'Eco-Friendly'
    }));

    return products;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    console.warn('Using sample product for testing due to fetch error.');
    // Return sample product unconditionally on error
    return [sampleProduct()];
  }
}

/**
 * Generates a sample product object for testing or fallback.
 * @returns {object} A sample product object.
 */
function sampleProduct() {
  console.log('Generating sample product...');
  return {
    "Product ID": 999,
    "Category": "Sample Category",
    "Product Name": "Sample Product (Fallback)",
    "Description": "This is a sample product description used when the product feed is unavailable or empty. It shows how a product card looks.",
    "Price ($)": 9.99,
    "Image URL": "https://via.placeholder.com/300x200?text=Sample+Product", // Larger placeholder image
    "Amazon ASIN": "B000000000",
    "Stock Left": 5, // Sample FOMO data
    "People Viewing": 15, // Sample FOMO data
    "Star Rating": "4.5" // Sample rating
  };
}


/**
 * Creates a DOM element for a single product card.
 * @param {object} product - The product data object.
 * @returns {HTMLElement} The created product card element.
 */
function createProductCard(product) {
  console.log('Creating product card for:', product);
  // Ensure required fields exist, fall back to sample if necessary (basic check)
   if (!product || !product['Amazon ASIN'] || !product['Product Name'] || !product['Image URL'] || product['Price ($)'] === undefined) {
       console.error('Invalid product data provided for card creation:', product);
       product = sampleProduct(); // Fallback to sample if data is severely malformed
   }


  const productLink = `https://www.amazon.com/dp/${product['Amazon ASIN']}?tag=${AMAZON_AFFILIATE_TAG}`;
  const reviewsLink = `https://www.amazon.com/product-reviews/${product['Amazon ASIN']}`;

  const card = document.createElement('div');
  card.className = 'product-card bg-white rounded-xl shadow-lg p-5 flex flex-col min-w-[280px] max-w-xs snap-start transition-transform transform hover:scale-105 hover:shadow-xl mx-auto';
  card.style.height = '95%'; // reduce height by 5% as per original code
  card.setAttribute('data-asin', product['Amazon ASIN']); // Use ASIN for lookup

  const img = document.createElement('img');
  img.src = product['Image URL'];
  img.alt = product['Product Name'];
  img.loading = 'lazy'; // Defer loading of images until they are in the viewport
  img.className = 'w-full h-40 object-cover mb-4 rounded-xl shadow transition-transform duration-300 ease-in-out';
  // The hover effect is now handled by the parent card's `hover:scale-105` class.
  // The complex JS zoom logic has been removed for simplicity and reliability.


  const name = document.createElement('h2');
  name.textContent = product['Product Name'];
  name.className = 'text-lg font-semibold mb-1 text-gray-900 truncate text-center';

  const description = document.createElement('p');
  description.className = 'text-gray-600 flex-grow cursor-pointer underline line-clamp-3 text-center text-sm';
  description.style.minHeight = '4.5rem'; // increase height for description area as per original code
  description.textContent = product['Description'];
  description.addEventListener('click', () => openDescriptionPopup(product));

  const price = document.createElement('p');
  price.className = 'text-indigo-700 font-extrabold mt-2 text-lg text-center';
  // Assuming 'Retail Price ($)' might be available for strike-through
  const retailPrice = product['Retail Price ($)'] || (product['Price ($)'] * 1.5).toFixed(2); // Sample calc if no retail price
  price.innerHTML = `<sub class="line-through text-gray-500 mr-2">Reg. Price: $${retailPrice}</sub> $${product['Price ($)']}`;

  // --- FOMO microcopy ---
  // Fetches or uses default values for stock and viewing count.
  // These would ideally be updated dynamically via a WebSocket or periodic fetch in a real application.
  const qtyLeft = document.createElement('span');
  qtyLeft.id = `qty-left-${product['Product ID']}`;
  // Check if 'Stock Left' exists and is not the placeholder value -999
  qtyLeft.textContent = (product['Stock Left'] !== undefined && product['Stock Left'] !== -999) ? product['Stock Left'] : '0';
  qtyLeft.className = 'text-red-600 font-semibold';

  const qtyLeftText = document.createElement('span');
  qtyLeftText.id = `qty-left-text-${product['Product ID']}`;
  qtyLeftText.textContent = ' left in stock!';
  qtyLeftText.className = 'text-red-600 font-semibold';

  const stockLeft = document.createElement('p');
  stockLeft.className = 'text-red-600 font-semibold text-center mt-1 text-sm flex justify-center space-x-1';
   // Only show stock message if stock > 0
  if (parseInt(qtyLeft.textContent) > 0) {
     stockLeft.appendChild(qtyLeft);
     stockLeft.appendChild(qtyLeftText);
  } else {
      stockLeft.textContent = 'Currently out of stock.'; // Indicate out of stock
      stockLeft.classList.remove('text-red-600');
      stockLeft.classList.add('text-gray-500');
  }


  const viewQty = document.createElement('span');
  viewQty.id = `view-qty-${product['Product ID']}`;
  // Use 'People Viewing' if available, otherwise default to 10
  viewQty.textContent = product['People Viewing'] !== undefined ? product['People Viewing'] : '10';
  viewQty.className = 'text-red-600 font-semibold';

  const viewQtyText = document.createElement('span');
  viewQtyText.id = `view-qty-text-${product['Product ID']}`;
  viewQtyText.textContent = ' people viewing now';
  viewQtyText.className = 'text-red-600 font-semibold';

  const peopleViewing = document.createElement('p');
  peopleViewing.className = 'text-red-600 font-semibold text-center mt-1 text-sm flex justify-center space-x-1';
  peopleViewing.appendChild(viewQty);
  peopleViewing.appendChild(viewQtyText);
   // --- End FOMO microcopy ---


  // Badges container
  const badgesContainer = document.createElement('div');
  badgesContainer.className = 'flex justify-center space-x-2 mt-2 flex-wrap gap-1'; // Added flex-wrap and gap for small screens

  /**
   * Helper function to create a badge element with a tooltip.
   * @param {string} text - The text to display on the badge.
   * @param {string} tooltip - The text to display in the tooltip.
   * @returns {HTMLElement} The created badge element.
   */
  function createBadge(text, tooltip) {
    const badge = document.createElement('span');
    badge.textContent = text;
    // Added more padding, smaller text, and darker background for better contrast
    badge.className = 'bg-gray-300 text-gray-800 px-2 py-0.5 rounded-full text-xs font-semibold cursor-help relative inline-block';
    badge.setAttribute('tabindex', '0'); // Make badge focusable for keyboard users
    badge.setAttribute('aria-label', tooltip); // Provide tooltip text for screen readers

    // Tooltip element
    const tooltipEl = document.createElement('div');
    // Adjusted positioning slightly, improved styling
    tooltipEl.className = 'absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-md opacity-0 pointer-events-none transition-opacity duration-300 whitespace-nowrap';
    tooltipEl.textContent = tooltip;

    // Event listeners for showing/hiding tooltip on hover and focus
    badge.addEventListener('mouseenter', () => { tooltipEl.style.opacity = '1'; });
    badge.addEventListener('mouseleave', () => { tooltipEl.style.opacity = '0'; });
    badge.addEventListener('focus', () => { tooltipEl.style.opacity = '1'; });
    badge.addEventListener('blur', () => { tooltipEl.style.opacity = '0'; }); // --- This was the missing part ---

    badge.appendChild(tooltipEl);
    return badge;
  }

  // Example badges (consider adding logic to show/hide based on product data)
   if (product['Is Verified Seller']) { // Example conditional badge
       badgesContainer.appendChild(createBadge('✅ Verified Seller', 'This seller is verified and trusted.'));
   }
   if (product['Is Best Seller']) { // Example conditional badge
       badgesContainer.appendChild(createBadge('🌟 Best Seller', 'This product is a best seller.'));
   }
   if (product['Is Eco Certified']) { // Example conditional badge
       badgesContainer.appendChild(createBadge('🌱 Eco-Certified', 'This product is certified eco-friendly.'));
   }
    // Add default badges if none are applicable or if data is missing
   if (!badgesContainer.hasChildNodes()) {
       badgesContainer.appendChild(createBadge('🛍️ Available', 'Product is available.'));
   }


  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'mt-4 flex space-x-2 justify-center flex-wrap gap-2';

  // Pay with Amazon button with logo image
  // IMPORTANT: Requires actual Amazon Pay setup and backend to generate session config
  const payButton = document.createElement('button');
  payButton.id = `AmazonPayButton-${product['Product ID']}`; // Unique ID for Amazon Pay SDK
  payButton.className = 'flex-grow max-w-[120px] rounded-xl shadow-md overflow-hidden cursor-pointer flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition p-2'; // Changed background to fit Amazon branding better

  const amazonPayLogo = document.createElement('img');
  // Use a standard Amazon Pay button image URL
  amazonPayLogo.src = 'https://images-na.ssl-images-amazon.com/images/G/01/amazonpay/contact-us/amazon-pay-logo-dark._CB485932824_.png';
  amazonPayLogo.alt = 'Pay with Amazon';
  amazonPayLogo.className = 'h-8 object-contain'; // Adjusted height slightly

  payButton.appendChild(amazonPayLogo);

  // Add click event to redirect to Amazon product page with affiliate tag (fallback/alternative action)
  // The Amazon Pay SDK renderButton call below will typically handle the primary click action
  payButton.addEventListener('click', () => {
    console.log(`Amazon Pay button clicked for ASIN: ${product['Amazon ASIN']}. Redirecting to Amazon.`);
    // Fallback redirection - Amazon Pay SDK usually handles the click for checkout
     window.open(`https://www.amazon.com/dp/${product['Amazon ASIN']}?tag=${AMAZON_AFFILIATE_TAG}`, '_blank', 'noopener');
  });

  // View on Amazon button
  const viewButton = document.createElement('a');
  viewButton.href = productLink;
  viewButton.target = '_blank';
  viewButton.rel = 'noopener noreferrer'; // Security recommended for target="_blank"
  viewButton.textContent = '🔍 View on Amazon';
  // Used standard Tailwind classes, added more responsive width
  viewButton.className = 'bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 flex-grow max-w-xs text-center font-semibold shadow-md text-sm md:text-base';


  // View Reviews button with star rating number
  const reviewsButton = document.createElement('button');
  reviewsButton.type = 'button';
  const starRating = product['Star Rating'] || '4.7'; // Use rating from data or default
  // Added conditional color based on rating (example)
  const ratingColorClass = parseFloat(starRating) >= 4.0 ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700';

  reviewsButton.innerHTML = `⭐ ${starRating}`; // Use innerHTML to keep star and text
  reviewsButton.className = `${ratingColorClass} text-white py-1 px-3 rounded-xl flex-grow max-w-[120px] text-center font-semibold shadow-md text-sm`; // Smaller padding/text for reviews button
  reviewsButton.addEventListener('click', () => openReviewsPopup(product));

  // --- Append elements to the card ---
  card.appendChild(img);
  card.appendChild(name);
  card.appendChild(description);
  card.appendChild(price);
  card.appendChild(stockLeft); // Append FOMO stock
  card.appendChild(peopleViewing); // Append FOMO viewing
  card.appendChild(badgesContainer); // Append badges
  buttonsContainer.appendChild(payButton);
  // The original code had 'viewButton' hidden initially. Keeping it visible by default.
  buttonsContainer.appendChild(viewButton);
  buttonsContainer.appendChild(reviewsButton);
  card.appendChild(buttonsContainer); // Append buttons container

  return card;
}


// Function to render products in the product slider container
async function renderProducts() {
  console.log('renderProducts called');
  // Wait for products to be fetched
  const products = await fetchProducts();
  console.log('Products fetched and ready for rendering:', products);

  const container = document.getElementById('product-slider');
  if (!container) {
    console.error('Product slider container not found (#product-slider)');
    return;
  }
  // Clear existing content
  container.innerHTML = '';

  if (!products || products.length === 0) {
    container.textContent = 'No products available at the moment.';
    container.className = 'text-center text-gray-600'; // Center the message
    return;
  }

  // Create and append a card for each product
  products.forEach(product => {
    const card = createProductCard(product);
    if (card) {
      container.appendChild(card);
    } else {
      console.error('Failed to create product card for product data:', product);
    }
  });

  console.log('Product cards rendered.');

  // Optional: Start continuous scroll animation (if implemented elsewhere)
  // startAutoScroll(container); // Assumes startAutoScroll function is defined

  // Call Amazon Pay renderButton for each product button AFTER rendering cards
  // IMPORTANT: Replace 'merchant_id', 'LIVE-xxxxxxxxxx', 'payload', 'xxxx'
  // with your actual Amazon Pay credentials and session configuration logic.
  // This part usually involves a backend call to securely create the checkout session.
  if (window.amazon && amazon.Pay) {
      console.log('Amazon Pay SDK detected. Attempting to render buttons.');
    products.forEach(product => {
      const buttonId = `AmazonPayButton-${product['Product ID']}`;
      const buttonContainer = document.getElementById(buttonId); // Use a better variable name

      // Check if the button element exists before trying to render
      if (buttonContainer) {
        try {
             amazon.Pay.renderButton(`#${buttonId}`, {
              merchantId: AMAZON_PAY_MERCHANT_ID,
              publicKeyId: AMAZON_PAY_PUBLIC_KEY_ID,
              ledgerCurrency: 'USD',
              checkoutLanguage: 'en_US',
              productType: 'PayAndShip', // Or 'Checkout' depending on your flow
              placement: 'Cart', // Or 'Product', 'Home', etc.
              buttonColor: 'Gold', // Or 'DarkGray', 'LightGray'
              // The createCheckoutSessionConfig must be generated securely on your server
              createCheckoutSessionConfig: {
                payloadJSON: 'REPLACE_WITH_SECURELY_GENERATED_PAYLOAD_JSON', // <-- REPLACE (usually from backend)
                signature: 'REPLACE_WITH_SECURELY_GENERATED_SIGNATURE', // <-- REPLACE (usually from backend)
                algorithm: 'AMZN-PAY-RSASSA-PSS-V2' // Or 'AMZN-PAY-RSASSA-PSS'
              }
            });
             console.log(`Amazon Pay button rendered for ASIN: ${product['Amazon ASIN']}`);
        } catch (error) {
            console.error(`Error rendering Amazon Pay button for ASIN ${product['Amazon ASIN']}:`, error);
        }
      } else {
          console.warn(`Amazon Pay button container not found for ASIN ${product['Amazon ASIN']} (ID: ${buttonId})`);
      }
    });
     console.log('Amazon Pay render button calls completed.');
  } else {
    console.warn('Amazon Pay SDK (window.amazon.Pay) not loaded. Amazon Pay buttons will not render.');
  }
}


/**
 * Opens the popup modal to show product details, including a video.
 * @param {object} product - The product data object.
 */
function openDescriptionPopup(product) {
  console.log('Opening description popup for:', product);
  // Prevent opening if a video is already considered playing (simple flag)
  if (videoPlaying) {
      console.log('Video already playing, preventing new description popup.');
      return;
  }

  const popup = document.getElementById('popup-modal');
  const popupContent = document.getElementById('popup-content');
  if (!popup || !popupContent) {
      console.error('Popup modal elements not found.');
      return;
  }
   // Clear previous content
  popupContent.innerHTML = '';
   // Set title for accessibility
  popup.setAttribute('aria-labelledby', 'popup-title');


  // --- Video Element ---
  const videoWrapper = document.createElement('div');
  videoWrapper.className = 'aspect-w-16 aspect-h-9 mb-4 w-full max-w-full'; // Ensure wrapper is responsive

  const iframe = document.createElement('iframe');
  // Use the placeholder video ID from the configuration section
  const videoUrl = product['Video URL'] || `https://www.youtube.com/embed/${PLACEHOLDER_YOUTUBE_VIDEO_ID}?enablejsapi=1`;
  iframe.src = videoUrl;
  iframe.title = `Promotional Video for ${product['Product Name']}`;
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true; // Allow fullscreen
  iframe.className = 'w-full h-64 rounded'; // Basic styling, height might need adjustment

  videoWrapper.appendChild(iframe);
  popupContent.appendChild(videoWrapper);
  // --- End Video Element ---

  // --- Product Details Area (Initially hidden or shown after video) ---
   const productDetailsArea = document.createElement('div');
   productDetailsArea.id = 'popup-product-details';
   productDetailsArea.className = 'hidden'; // Hide initially
   // Content will be added by showProductDetailsInPopup

   popupContent.appendChild(productDetailsArea);
  // --- End Product Details Area ---


  // --- YouTube API Setup ---
  // This part loads the YouTube Iframe API and listens for video events.
  // The global window.onYouTubeIframeAPIReady function is called by the API script when it loads.
  // If the API is already loaded (window.YT exists), call the function directly.
  const loadYouTubeAPI = () => {
      // Define the function that the YouTube API script will call
      window.onYouTubeIframeAPIReady = function() {
          console.log('YouTube Iframe API Ready.');
          // Create a new YouTube Player instance linked to the iframe
          // Note: The iframe must have enablejsapi=1 in its src
          const player = new YT.Player(iframe, {
              events: {
                  // Listen for player state changes
                  'onStateChange': function(event) {
                      console.log('YouTube Player state changed:', event.data);
                      // YT.PlayerState.ENDED (0) means the video has finished playing
                      if (event.data === YT.PlayerState.ENDED) {
                          console.log('Video ended. Showing product details.');
                          videoPlaying = false; // Reset flag
                          showProductDetailsInPopup(product); // Show product details below the video
                          // Show "View on Amazon" button on the product card (moved this logic here)
                           const productCardElement = document.querySelector(`.product-card[data-asin="${product['Amazon ASIN']}"]`);
                           if (productCardElement) {
                                const viewBtn = productCardElement.querySelector('a[href*="amazon.com/dp/"][target="_blank"]'); // Find the View on Amazon link
                                if (viewBtn) {
                                     console.log('Showing "View on Amazon" button on card after video.');
                                     viewBtn.classList.remove('hidden');
                                     // You might want to hide the Amazon Pay button if you only want one primary action after video
                                     // const payBtn = productCardElement.querySelector('button[id^="AmazonPayButton-"]');
                                     // if (payBtn) payBtn.classList.add('hidden');
                                }
                           }
                      } else if (event.data === YT.PlayerState.PLAYING) {
                           videoPlaying = true; // Set flag when playing starts
                      } else {
                           // Handle other states if needed (BUFFERING, PAUSED, CUED)
                      }
                  },
                   'onError': function(event) {
                       console.error('YouTube Player error:', event.data);
                       videoPlaying = false; // Reset flag on error
                       showProductDetailsInPopup(product); // Show details even if video fails
                       // Potentially hide the iframe and show an error message
                       iframe.style.display = 'none';
                       const errorMsg = document.createElement('p');
                       errorMsg.textContent = 'Could not load video.';
                       errorMsg.className = 'text-red-600 text-center mb-4';
                       videoWrapper.appendChild(errorMsg);
                   }
              }
          });
      };

      // Load the YouTube Iframe API script if it's not already loaded
      if (!window.YT) {
          console.log('Loading YouTube Iframe API script...');
          const tag = document.createElement('script');
          tag.src = "https://www.youtube.com/iframe_api"; // Correct YouTube API script URL
          const firstScriptTag = document.getElementsByTagName('script')[0];
           if(firstScriptTag && firstScriptTag.parentNode) {
               firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
           } else {
               document.body.appendChild(tag); // Fallback append
           }

      } else {
          // API is already loaded, call the ready function directly
          console.log('YouTube Iframe API already loaded, calling onYouTubeIframeAPIReady.');
          window.onYouTubeIframeAPIReady();
      }
  };

  // Load the YouTube API setup logic
  loadYouTubeAPI();
  // --- End YouTube API Setup ---


   // Show the popup modal
  popup.classList.remove('hidden');
  console.log('Description popup shown.');

  // Optional: Show initial product details below the video immediately
   // showProductDetailsInPopup(product); // Uncomment this line if you want details visible from the start

}

/**
 * Shows the product details in the popup content area.
 * @param {object} product - The product data object.
 */
function showProductDetailsInPopup(product) {
  console.log('Showing product details in popup for:', product);
  const productDetailsArea = document.getElementById('popup-product-details');
   if (!productDetailsArea) {
       console.error('Product details area in popup not found.');
       return;
   }
  productDetailsArea.innerHTML = ''; // Clear previous details
  productDetailsArea.classList.remove('hidden'); // Make sure the area is visible


  // Add a title for the details section
   const detailsTitle = document.createElement('h3');
   detailsTitle.className = 'text-lg font-semibold mb-2 text-gray-800';
   detailsTitle.textContent = 'Product Information';
   productDetailsArea.appendChild(detailsTitle);


  // Show product image (again, maybe smaller, or remove if video/main image is enough)
   const img = document.createElement('img');
   img.src = product['Image URL'];
   img.alt = product['Product Name'];
   img.className = 'w-40 h-40 object-cover mb-4 rounded-xl shadow float-left mr-4'; // Smaller, float left
   productDetailsArea.appendChild(img);


  // Product name
  const title = document.createElement('h2');
  title.className = 'text-xl font-semibold mb-2'; // Adjusted size
  title.textContent = product['Product Name'];
  productDetailsArea.appendChild(title);

  // Description
  const desc = document.createElement('p');
  desc.className = 'mb-4 text-gray-700'; // Added margin bottom and text color
  desc.textContent = product['Description'];
  productDetailsArea.appendChild(desc);

  // Clear float after image
   const clearDiv = document.createElement('div');
   clearDiv.className = 'clearfix'; // Use a utility class to clear floats
   productDetailsArea.appendChild(clearDiv); // Append clear after the floated image and its siblings

  // Price
  const price = document.createElement('p');
  price.className = 'text-indigo-700 font-bold mb-4 text-lg'; // Adjusted size and color
  price.textContent = `Price: $${product['Price ($)']}`; // Added label
  productDetailsArea.appendChild(price);

   // FOMO microcopy (optional, could also show here)
   const stockStatus = document.createElement('p');
   stockStatus.className = 'text-sm text-red-600 mb-2';
   const stockCount = (product['Stock Left'] !== undefined && product['Stock Left'] !== -999) ? product['Stock Left'] : 0;
   stockStatus.textContent = stockCount > 0 ? `Only ${stockCount} left in stock!` : 'Currently out of stock.';
    if (stockCount <= 0) stockStatus.classList.replace('text-red-600', 'text-gray-500');
   productDetailsArea.appendChild(stockStatus);

   const viewingStatus = document.createElement('p');
   viewingStatus.className = 'text-sm text-red-600 mb-4';
   const viewingCount = product['People Viewing'] !== undefined ? product['People Viewing'] : '...'; // Use '...' if not available
   viewingStatus.textContent = `${viewingCount} people viewing now`;
   productDetailsArea.appendChild(viewingStatus);


  // Buy button
  const buyBtn = document.createElement('a');
  buyBtn.href = `https://www.amazon.com/dp/${product['Amazon ASIN']}?tag=${AMAZON_AFFILIATE_TAG}`;
  buyBtn.target = '_blank';
  buyBtn.rel = 'noopener noreferrer'; // Security recommended
  // Adjusted button styling
  buyBtn.className = 'bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 inline-block text-center font-semibold transition';
  buyBtn.textContent = 'Buy on Amazon';
  productDetailsArea.appendChild(buyBtn);
}


/**
 * Opens the popup modal to show product reviews.
 * @param {object} product - The product data object.
 */
function openReviewsPopup(product) {
  console.log('Opening reviews popup for:', product);
  const popup = document.getElementById('popup-modal');
  const popupContent = document.getElementById('popup-content');
   if (!popup || !popupContent) {
      console.error('Popup modal elements not found.');
      return;
   }
  // Clear previous content
  popupContent.innerHTML = '';
  popup.setAttribute('aria-labelledby', 'popup-title');


  // Show image ad first
  const adImage = document.createElement('img');
  // IMPORTANT: Replace with your actual ad image URL
  adImage.src = 'https://via.placeholder.com/600x200?text=Sponsored+Ad'; // <-- REPLACE
  adImage.alt = 'Sponsored Advertisement';
  adImage.className = 'w-full rounded mb-4';
   adImage.id = 'reviews-popup-ad'; // Give it an ID to reference

  popupContent.appendChild(adImage);

   // Add a title for the ad state
   const adTitle = document.createElement('h2');
   adTitle.id = 'popup-title'; // Set ID for aria-labelledby
   adTitle.className = 'text-xl font-semibold mb-2 text-center';
   adTitle.textContent = 'Loading Reviews...';
   popupContent.appendChild(adTitle);


   // Show the popup
  popup.classList.remove('hidden');
   console.log('Reviews popup shown with ad.');


  // After a delay, replace the ad with the reviews iframe
  const adDisplayDuration = 3000; // 3 seconds (Adjusted from 30s for faster testing)
  console.log(`Ad will display for ${adDisplayDuration / 1000} seconds.`);

  setTimeout(() => {
     console.log('Ad display duration ended. Loading reviews iframe.');
    // Clear the ad content
    popupContent.innerHTML = '';

    // Add the reviews title
     const reviewsTitle = document.createElement('h2');
     reviewsTitle.id = 'popup-title'; // Set ID for aria-labelledby
     reviewsTitle.className = 'text-xl font-semibold mb-2';
     reviewsTitle.textContent = `${product['Product Name']} - Reviews`;
     popupContent.appendChild(reviewsTitle);


    // Create and append the reviews iframe
    const iframe = document.createElement('iframe');
    // IMPORTANT: Ensure Amazon allows embedding their reviews page in an iframe.
    // They might prevent this with X-Frame-Options headers. Direct linking might be necessary.
    iframe.src = `https://www.amazon.com/product-reviews/${product['Amazon ASIN']}`; // Reviews URL
    iframe.className = 'w-full h-96 rounded border';
    iframe.title = `Reviews for ${product['Product Name']}`; // Add title for accessibility
    iframe.onerror = () => console.error('Failed to load reviews iframe. Amazon might prevent embedding.'); // Basic error check


    popupContent.appendChild(iframe);
     console.log('Reviews iframe added to popup.');

  }, adDisplayDuration);
}

/**
 * Closes the popup modal.
 */
function closePopup() {
  console.log('Closing popup.');
  const popup = document.getElementById('popup-modal');
   if (popup) {
       popup.classList.add('hidden');
       // Stop any potentially playing video when closing
       const iframe = popup.querySelector('iframe[src*="youtube.com/embed"]');
       if (iframe && iframe.contentWindow && typeof iframe.contentWindow.postMessage === 'function') {
            // Send a message to the YouTube player to stop the video
            iframe.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
            console.log('Attempted to stop YouTube video on popup close.');
       }
        videoPlaying = false; // Reset video flag
   }
}

// --- Chatbot Functionality ---

/**
 * Creates and appends the floating chatbot bubble button.
 */
function createChatbotBubble() {
  console.log('Creating chatbot bubble.');
  const bubble = document.createElement('button');
  bubble.id = 'chatbot-bubble';
  bubble.setAttribute('aria-label', 'Open chat'); // Accessibility label
  // Combined styling and animation class
  bubble.className = 'fixed bottom-4 right-4 w-14 h-14 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white cursor-pointer animate-pulse z-50 focus:outline-none focus:ring-2 focus:ring-indigo-500'; // Added focus styles
  // Using Material Icons span for the icon
  bubble.innerHTML = '<span class="material-icons">chat</span>'; // Requires Material Icons font

  // Event listener to open the chatbot widget and hide the bubble
  bubble.addEventListener('click', () => {
    console.log('Chatbot bubble clicked.');
    const chatbot = document.getElementById('chatbot');
     if (chatbot) {
         chatbot.style.display = 'flex'; // Make chatbot visible
         // Optional: Add a class for a fade-in animation here if desired
         // chatbot.classList.add('animate-fadeInChatbot');
         bubble.style.display = 'none'; // Hide the bubble
         console.log('Chatbot opened.');
     } else {
         console.error('Chatbot element not found.');
     }
  });

  document.body.appendChild(bubble);
   console.log('Chatbot bubble appended to body.');
}

/**
 * Appends a message to the chatbot message display.
 * @param {'user'|'bot'} sender - The sender of the message ('user' or 'bot').
 * @param {string} message - The message text.
 */
function appendChatMessage(sender, message) {
  const msgDiv = document.createElement('div');
  // Dynamically set classes based on sender for styling
  msgDiv.className = sender === 'user'
    ? 'ml-auto mb-2 bg-indigo-100 text-indigo-900 rounded-lg px-3 py-2 max-w-[80%] break-words animate-fadeIn shadow-sm' // User message styles
    : 'mr-auto mb-2 bg-gray-200 text-gray-800 rounded-lg px-3 py-2 max-w-[80%] break-words animate-fadeIn shadow-sm'; // Bot message styles

  msgDiv.textContent = message; // Use textContent to prevent XSS if messages contain HTML
  chatbotMessages.appendChild(msgDiv);

  // Auto-scroll to the latest message
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

/**
 * Displays a typing indicator in the chatbot.
 */
function showTypingIndicator() {
  const typingIndicatorId = 'typing-indicator';
  if (!document.getElementById(typingIndicatorId)) {
    const typingDiv = document.createElement('div');
    typingDiv.id = typingIndicatorId;
     // Styling for typing indicator
    typingDiv.className = 'mr-auto mb-2 text-gray-500 italic animate-pulse px-3 py-2'; // Added padding
    typingDiv.textContent = 'Chatbot is typing...';
    chatbotMessages.appendChild(typingDiv);
    // Scroll to show the indicator
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }
}

/**
 * Hides the typing indicator in the chatbot.
 */
function hideTypingIndicator() {
  const typingDiv = document.getElementById('typing-indicator');
  if (typingDiv) {
    typingDiv.remove();
  }
}

/**
 * Simple function to generate a bot response based on user input.
 * Replace with a real API call for a functional chatbot.
 * @param {string} message - The user's message.
 * @returns {string} The bot's response.
 */
function getBotResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes('hello') || msg.includes('hi') || msg === 'hey') {
    return 'Hello! How can I assist you with our hygiene and cleaning products today?';
  }
  if (msg.includes('recommend') || msg.includes('suggest')) {
    return 'I recommend checking out our top-rated disinfectants and hand sanitizers! You can find them in the product list above.';
  }
   if (msg.includes('price') || msg.includes('cost')) {
     return 'Prices vary by product. Please click on a product card to see its details and current pricing sourced from Amazon.';
   }
   if (msg.includes('buy') || msg.includes('purchase') || msg.includes('order')) {
     return 'You can purchase products by clicking the "Pay with Amazon" or "View on Amazon" buttons on each product card. This will take you to Amazon to complete your purchase.';
   }
    if (msg.includes('shipping')) {
        return 'Shipping is handled by Amazon. Details will be available on the Amazon product page.';
    }
     if (msg.includes('contact') || msg.includes('support') || msg.includes('help')) {
         return 'I am an automated assistant. If you need further help, please refer to the product details on Amazon or check the site footer for contact information (if available).';
     }

  // Fallback response
  return 'Sorry, I am still learning. Please ask about specific products, categories, or the buying process.';
}
// --- End Chatbot Functionality ---


// --- Ad Rotation Functionality ---
// Simple functions to rotate the text content of ad elements on a timer.

function rotateAds(adElementId, adTexts, displayTimes) {
    const adElement = document.getElementById(adElementId);
    if (!adElement) {
        console.error(`Ad element not found: #${adElementId}`);
        return;
    }
    // Ensure the arrays have the same length to avoid out-of-bounds errors
    if (adTexts.length !== displayTimes.length) {
        console.warn(`Ad texts and display times arrays have different lengths for #${adElementId}. Rotation aborted.`);
        return;
    }

    let adIndex = 0;

    function updateAd() {
        if (adTexts.length === 0) return; // Don't run if there are no ads

        adElement.textContent = adTexts[adIndex];
        const currentDisplayTime = displayTimes[adIndex];

        // Increment index and loop back to 0 if it reaches the end
        adIndex = (adIndex + 1) % adTexts.length;

        // Use setTimeout to schedule the next update
        setTimeout(updateAd, currentDisplayTime);
    }

    // Start the rotation
    updateAd();
}

// Ad texts and display times for top and bottom ads
const topAds = [
  'Your Ad Here - Promote Your Products!',
  'Special Discount - Save 20% Today!',
  'Limited Time Offer - Buy One Get One Free!'
];
const topDisplayTimes = [27000, 27000, 3000]; // in milliseconds

const bottomAds = [
  'Bottom Ad 1 - Exclusive Deals!',
  'Bottom Ad 2 - Free Shipping on Orders Over $50!',
  'Bottom Ad 3 - New Arrivals Just In!',
  'Bottom Ad 4 - Flash Sale - 3 Seconds Only!',
  'Bottom Ad 5 - Clearance Sale!',
  'Bottom Ad 6 - Buy More, Save More!',
  'Bottom Ad 7 - Limited Stock Available!',
  'Bottom Ad 8 - Last Chance Offers!',
];
const bottomDisplayTimes = [8300, 8300, 8300, 3000, 8300, 8300, 8300, 3000]; // in milliseconds

// --- End Ad Rotation Functionality ---


// --- Popup Close Function ---
// Already defined above the main load listener, kept for structure.
// function closePopup() { ... }
// --- End Popup Close Function ---


let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('beforeinstallprompt event captured');
});

// --- Main Load Listener ---
// This function runs when the entire page has finished loading.
window.addEventListener('load', () => {
  console.log('Window loaded. Initializing script.');

  // Render product cards
  renderProducts();

  // Setup popup close button listener
  const popupClose = document.getElementById('popup-close');
   if (popupClose) {
        popupClose.addEventListener('click', closePopup);
         // Close popup when clicking outside the modal content
        const popupModal = document.getElementById('popup-modal');
        if(popupModal) {
            popupModal.addEventListener('click', (event) => {
                // Check if the click target is the modal background itself, not the content
                if (event.target === popupModal) {
                    closePopup();
                }
            });
        }
   } else {
       console.error('Popup close button (#popup-close) not found.');
   }


  // Create floating chatbot bubble
  createChatbotBubble();

  // Social media share links setup
  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent('Check out these Hygiene & Cleaning Products!');

   const facebookShare = document.getElementById('share-facebook');
   if(facebookShare) facebookShare.href = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;

   const twitterShare = document.getElementById('share-twitter');
   if(twitterShare) twitterShare.href = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`;

   const whatsappShare = document.getElementById('share-whatsapp');
   if(whatsappShare) whatsappShare.href = `https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`;

   const linkedinShare = document.getElementById('share-linkedin');
    if(linkedinShare) linkedinShare.href = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;

    console.log('Social share links updated.');


  // Start ad rotations
  rotateAds('top-ad', topAds, topDisplayTimes);
  rotateAds('mid-ad', bottomAds, bottomDisplayTimes); // Assuming mid-ad is the bottom ad element

    console.log('Ad rotations started.');

  // Chatbot functionality setup
  const chatbot = document.getElementById('chatbot');
  const chatbotHeader = document.getElementById('chatbot-header');
  const chatbotClose = document.getElementById('chatbot-close');
  const chatbotMessages = document.getElementById('chatbot-messages');
  const chatbotForm = document.getElementById('chatbot-form');
  const chatbotInput = document.getElementById('chatbot-input');

   if (chatbot && chatbotHeader && chatbotClose && chatbotMessages && chatbotForm && chatbotInput) {
        console.log('Chatbot elements found. Setting up listeners.');

        // Toggle chatbot visibility/height on header click
        chatbotHeader.addEventListener('click', () => {
            // Toggle a class that controls height/visibility via CSS transitions
            chatbot.classList.toggle('expanded'); // Add/remove 'expanded' class
             // Update aria-expanded attribute for accessibility
             const isExpanded = chatbot.classList.contains('expanded');
             chatbotHeader.setAttribute('aria-expanded', isExpanded);
        });

        // Close chatbot on close button click
        chatbotClose.addEventListener('click', () => {
             console.log('Chatbot close button clicked.');
             // Use CSS transition for fade out and translate
             chatbot.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
             chatbot.style.opacity = '0';
             chatbot.style.transform = 'translateY(20px)'; // Move down slightly while fading

             // Hide element completely after transition
             setTimeout(() => {
               chatbot.style.display = 'none'; // Hide the element
               // Reset styles for next time it's opened
               chatbot.style.opacity = '';
               chatbot.style.transform = '';
               chatbot.style.transition = '';
               // Ensure it's not marked as expanded when closed
               chatbot.classList.remove('expanded');
                chatbotHeader.setAttribute('aria-expanded', 'false');


               // Show the chatbot bubble again
               const bubble = document.getElementById('chatbot-bubble');
               if (bubble) bubble.style.display = 'flex';
                console.log('Chatbot closed.');
             }, 300); // Match CSS transition duration
        });

        // Chatbot form submit handler
        chatbotForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent page reload
            const userMessage = chatbotInput.value.trim();

            if (!userMessage) {
                 // Optionally provide user feedback for empty message
                 console.log('Attempted to send empty message.');
                 return;
            }

            appendChatMessage('user', userMessage); // Add user message to display
            chatbotInput.value = ''; // Clear input

            showTypingIndicator(); // Show "Chatbot is typing..."

            // Simulate bot response delay and then provide response
            setTimeout(() => {
                const botResponse = getBotResponse(userMessage);
                appendChatMessage('bot', botResponse); // Add bot message
                hideTypingIndicator(); // Hide typing indicator
            }, 1500); // Simulate typing time
        });

       // Ensure Chatbot is hidden on load by default (handled by HTML/CSS, but double-check here if needed)
        // chatbot.style.display = 'none'; // Make sure chatbot is hidden initially
         // Add 'expanded' class initially if you want it open by default, otherwise ensure it's not present
        // chatbot.classList.add('expanded'); // Or remove if hidden by default
         chatbotHeader.setAttribute('aria-expanded', 'false'); // Default state is collapsed

    } else {
         console.error('One or more chatbot elements not found.');
    }

     // Ensure the fadeIn animation CSS is injected (kept from original)
     // This should ideally be part of your main CSS or a dedicated styles file.
     const fadeInStyleId = 'fadeIn-animation-style';
     if(!document.getElementById(fadeInStyleId)) {
         const style = document.createElement('style');
         style.id = fadeInStyleId;
         style.textContent = `
           @keyframes fadeIn {
             from { opacity: 0; transform: translateY(10px); }
             to { opacity: 1; transform: translateY(0); }
           }
           .animate-fadeIn {
             animation: fadeIn 0.3s ease forwards;
           }
            /* Optional: Add chatbot specific animation class */
            .chatbot:not(.expanded) { /* Style when collapsed */
                 height: 4rem; /* Or a fixed small height for the header */
                 /* Add any other styles for the collapsed state */
            }
            .chatbot.expanded { /* Style when expanded */
                 height: 24rem; /* Or auto/max-content with max-height */
                 /* Add any other styles for the expanded state */
                 transition: height 0.3s ease; /* Animate height change */
            }

         `;
         document.head.appendChild(style);
     }
+
+    // Bookmark button click event and notification popup logic
+    const bookmarkButton = document.getElementById('bookmark-button');
+    const bookmarkNotification = document.getElementById('bookmark-notification');
+
+    if (bookmarkButton && bookmarkNotification) {
+        bookmarkButton.addEventListener('click', () => {
+            if (deferredPrompt) {
+                deferredPrompt.prompt();
+                deferredPrompt.userChoice.then((choiceResult) => {
+                    if (choiceResult.outcome === 'accepted') {
+                        console.log('User accepted the A2HS prompt');
+                        bookmarkNotification.classList.remove('opacity-0', 'pointer-events-none');
+                        bookmarkNotification.classList.add('opacity-100');
+                        setTimeout(() => {
+                            bookmarkNotification.classList.remove('opacity-100');
+                            bookmarkNotification.classList.add('opacity-0');
+                            setTimeout(() => {
+                                bookmarkNotification.classList.add('pointer-events-none');
+                            }, 500);
+                        }, 2000);
+                    } else {
+                        console.log('User dismissed the A2HS prompt');
+                    }
+                    deferredPrompt = null;
+                });
+            } else {
+                // Fallback for browsers that do not support PWA installation prompt
+                // or if the app is already installed.
+                alert('To add this page to your home screen, use the "Add to Home Screen" option in your browser menu.');
+            }
+        });
+    } else {
+        console.error('Bookmark button or notification element not found.');
+    }
+});

// Note: The `startAutoScroll` function was mentioned but not provided in the code block.
// If you need the product slider to auto-scroll, you'll need to define that function.
// Example (basic, may need refinement):
/*
function startAutoScroll(container) {
    if (!container) return;
    let scrollInterval;
    const scrollSpeed = 0.5; // Pixels per frame

    function scroll() {
        container.scrollLeft += scrollSpeed;

        // If scrolled to the end, reset scroll position
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
            container.scrollLeft = 0;
        }
    }

    // Start scrolling on load
    scrollInterval = setInterval(scroll, 10); // Adjust interval for smoothness/speed

    // Pause scrolling on hover
    container.addEventListener('mouseenter', () => {
        clearInterval(scrollInterval);
    });

    // Resume scrolling on mouse leave
    container.addEventListener('mouseleave', () => {
        scrollInterval = setInterval(scroll, 10);
    });
}
*/

// Note: Ensure the YouTube Iframe API script ('https://www.youtube.com/iframe_api')
// is loaded correctly in your HTML or via the openDescriptionPopup function's logic.
// The current logic in openDescriptionPopup handles loading it if not present. 


