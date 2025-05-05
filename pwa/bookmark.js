document.addEventListener('DOMContentLoaded', () => {
  const bookmarkButton = document.getElementById('bookmark-button');
  const notification = document.getElementById('bookmark-notification');

  if (!bookmarkButton || !notification) {
    console.error('Bookmark button or notification element not found.');
    return;
  }

  bookmarkButton.addEventListener('click', () => {
    // Show initial notification
    showNotification('Page bookmarked!');
    
    // Try to add to browser bookmarks
    addBrowserBookmark();
    
    // Try to prompt for PWA installation if available
    promptAddToHomeScreen();
  });

  function showNotification(message) {
    notification.textContent = message;
    notification.classList.remove('opacity-0', 'pointer-events-none');
    notification.classList.add('opacity-100', 'pointer-events-auto');

    // Hide notification after 2 seconds
    setTimeout(() => {
      notification.classList.remove('opacity-100', 'pointer-events-auto');
      notification.classList.add('opacity-0', 'pointer-events-none');
    }, 2000);
  }

  function addBrowserBookmark() {
    const title = document.title || 'Current Page';
    const url = window.location.href;

    // Check if the browser supports the bookmark API
    if (window.sidebar && window.sidebar.addPanel) { // Firefox
      window.sidebar.addPanel(title, url, '');
    } else if (window.external && ('AddFavorite' in window.external)) { // IE
      window.external.AddFavorite(url, title);
    } else if (window.chrome && window.chrome.webstore) { // Chrome
      // Chrome doesn't have a direct API, so we'll show instructions
      showNotification('Press Ctrl+D to bookmark this page');
    } else {
      // For other browsers, show instructions
      showNotification('Use your browser\'s menu to bookmark this page');
    }
  }

  function promptAddToHomeScreen() {
    // Check if PWA installation is available
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      
      window.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          showNotification('App added to home screen!');
        } else {
          showNotification('App not added to home screen');
        }
        window.deferredPrompt = null;
      });
    }
  }

  // Store the beforeinstallprompt event for later use
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    window.deferredPrompt = e;
  });
});