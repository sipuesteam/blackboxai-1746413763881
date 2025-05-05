document.addEventListener('DOMContentLoaded', () => {
  const subscriptionForm = document.getElementById('subscription-form');
  const subscriptionMessage = document.getElementById('subscription-message');
  const subscriptionModal = document.getElementById('subscription-modal');
  const subscriptionClose = document.getElementById('subscription-close');

  if (!subscriptionForm) {
    console.error('Subscription form not found in DOM.');
    return;
  }

  // Show the subscription modal after a delay (e.g., 5 seconds)
  setTimeout(() => {
    subscriptionModal.classList.remove('hidden');
  }, 5000); // 5000 milliseconds = 5 seconds delay

  subscriptionForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('subscription-email').value.trim();
    const whatsapp = document.getElementById('subscription-whatsapp').value.trim();
    const termsChecked = document.getElementById('subscription-terms').checked;

    if (!email || !whatsapp || !termsChecked) {
      subscriptionMessage.textContent = 'Please fill in all fields and agree to the terms.';
      subscriptionMessage.classList.remove('hidden', 'text-green-600');
      subscriptionMessage.classList.add('text-red-600');
      return;
    }

    fetch('https://script.google.com/macros/s/AKfycbwKeMhsK4EENSkfVGqAQVe7gINERzMdzNNdqPOAHo_r2NxbqoTlBbTOU1JwMjYPmJw8/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        whatsapp: whatsapp,
        terms: termsChecked
      })
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Network response was not ok');
      }
    })
    .then(data => {
      if (data.status === 'success') {
        subscriptionMessage.textContent = 'Thank you for subscribing! You will receive early deals.';
        subscriptionMessage.classList.remove('hidden', 'text-red-600');
        subscriptionMessage.classList.add('text-green-600');
        subscriptionForm.reset();
        setTimeout(() => {
          subscriptionModal.classList.add('hidden');
          subscriptionMessage.classList.add('hidden');
          subscriptionMessage.textContent = '';
        }, 5000);
      } else {
        subscriptionMessage.textContent = 'Subscription failed: ' + data.message;
        subscriptionMessage.classList.remove('hidden', 'text-green-600');
        subscriptionMessage.classList.add('text-red-600');
      }
    })
    .catch(error => {
      subscriptionMessage.textContent = 'Subscription failed: ' + error.message;
      subscriptionMessage.classList.remove('hidden', 'text-green-600');
      subscriptionMessage.classList.add('text-red-600');
    });
  });

  // Add event listener to close button to hide the subscription modal
  if (subscriptionClose) {
    subscriptionClose.addEventListener('click', () => {
      subscriptionModal.classList.add('hidden');
      subscriptionMessage.classList.add('hidden');
      subscriptionMessage.textContent = '';
    });
  }
});
