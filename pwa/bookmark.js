/**
 * Bookmark and PWA Installation Logic
 * This script handles the "Add to Home Screen" functionality for the PWA.
 */

document.addEventListener('DOMContentLoaded', () => {
  const bookmarkButton = document.getElementById('bookmark-button');
  const notification = document.getElementById('bookmark-notification');

  if (!bookmarkButton || !notification) {
    console.error('Bookmark button or notification element not found.');
    return;
  }

  // This script relies on `window.deferredPrompt` being captured by `main.js`.
  // The 'beforeinstallprompt' event listener is now centralized in main.js.

  bookmarkButton.addEventListener('click', () => {
    // Check if the PWA installation prompt is available
    if (window.deferredPrompt) {
      // Show the installation prompt
      window.deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      window.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA installation prompt');
          showNotification('App installed successfully!');
        } else {
          console.log('User dismissed the PWA installation prompt');
        }
        // The prompt can only be used once, so we clear it.
        window.deferredPrompt = null;
        // Optionally hide the button after the prompt is shown to prevent re-triggering
        // bookmarkButton.style.display = 'none';
      });
    } else {
      // Fallback for browsers that do not support the prompt,
      // or if the app is already installed.
      showNotification('To install, use the "Add to Home Screen" option in your browser menu.');
    }
  });

  function showNotification(message) {
    notification.textContent = message;
    notification.classList.remove('opacity-0', 'pointer-events-none');
    notification.classList.add('opacity-100');

    // Hide notification after 3 seconds
    setTimeout(() => {
      notification.classList.remove('opacity-100');
      notification.classList.add('opacity-0');
      // Ensure it's not clickable after hiding
      setTimeout(() => {
        notification.classList.add('pointer-events-none');
      }, 500); // Match transition duration
    }, 3000);
  }
});