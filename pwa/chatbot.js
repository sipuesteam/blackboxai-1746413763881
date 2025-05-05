/**
 * Chatbot JavaScript logic extracted from index.html.
 * This module initializes the chatbot functionality on window load.
 */

function createChatbotBubble() {
  console.log('Attempting to create chatbot bubble.');
  if (document.getElementById('chatbot-bubble')) {
      console.log('Chatbot bubble element with ID #chatbot-bubble already exists, skipping creation.');
      return;
  }
  const bubble = document.createElement('button');
  bubble.id = 'chatbot-bubble';
  bubble.setAttribute('aria-label', 'Open chat');
  bubble.className = 'fixed bottom-4 right-4 w-14 h-14 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white cursor-pointer z-50 focus:outline-none focus:ring-2 focus:ring-indigo-500';

  bubble.innerHTML = '<span class="material-icons">chat</span>';

  bubble.addEventListener('click', () => {
    console.log('Chatbot bubble clicked. Initiating main chatbot widget display.');
    const chatbot = document.getElementById('chatbot');
    if (chatbot) {
        chatbot.style.display = 'flex';
        chatbot.classList.add('expanded');

        const chatbotHeader = document.getElementById('chatbot-header');
        if(chatbotHeader) {
             chatbotHeader.setAttribute('aria-expanded', 'true');
        } else {
             console.warn('Chatbot header element (#chatbot-header) not found. Cannot update aria-expanded attribute.');
        }

        bubble.style.display = 'none';
        console.log('Main chatbot widget displayed. Chatbot bubble hidden.');

        const chatbotMessages = document.getElementById('chatbot-messages');
        if(chatbotMessages) {
             chatbotMessages.scrollTo({
                 top: chatbotMessages.scrollHeight,
                 behavior: 'smooth'
             });
             console.log('Scrolled chatbot messages to bottom upon opening.');
        } else {
             console.warn('Chatbot messages container (#chatbot-messages) not found. Cannot scroll messages on open.');
        }

    } else {
        console.error('Main chatbot element (#chatbot) not found in the DOM. Cannot open chatbot.');
    }
  });

  document.body.appendChild(bubble);
  console.log('Chatbot bubble element appended to document body.');
}

function appendChatMessage(sender, message) {
  const chatbotMessages = document.getElementById('chatbot-messages');
  if (!chatbotMessages) {
      console.error('Chatbot messages container (#chatbot-messages) not found. Cannot append message.');
      return;
  }
  const msgDiv = document.createElement('div');

  msgDiv.className = sender === 'user'
    ? 'inline-block bg-indigo-100 text-indigo-900 rounded-lg px-3 py-2 max-w-[80%] break-words animate-fadeIn shadow-sm'
    : 'inline-block bg-gray-200 text-gray-800 rounded-lg px-3 py-2 max-w-[80%] break-words animate-fadeIn shadow-sm';

  msgDiv.textContent = message;

  chatbotMessages.appendChild(msgDiv);

  chatbotMessages.scrollTo({
      top: chatbotMessages.scrollHeight,
      behavior: 'smooth'
  });
  console.log(`Appended '${sender}' message to chatbot messages.`);
}

function showTypingIndicator() {
  const chatbotMessages = document.getElementById('chatbot-messages');
  if (!chatbotMessages) {
      console.error('Chatbot messages container (#chatbot-messages) not found for displaying typing indicator.');
      return;
  }
  const typingIndicatorId = 'typing-indicator';
  if (!document.getElementById(typingIndicatorId)) {
    const typingDiv = document.createElement('div');
    typingDiv.id = typingIndicatorId;
    typingDiv.className = 'mr-auto mb-2 text-gray-500 italic animate-pulse px-3 py-2';
    typingDiv.textContent = 'Chatbot is typing...';
    chatbotMessages.appendChild(typingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    console.log('Displayed chatbot typing indicator.');
  }
}

function hideTypingIndicator() {
  const typingDiv = document.getElementById('typing-indicator');
  if (typingDiv) {
    typingDiv.remove();
    console.log('Hid chatbot typing indicator.');
  }
}

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
  if (msg.includes('thank you') || msg.includes('thanks')) {
    return 'You\'re welcome!';
  }
  if (msg.includes('about us') || msg.includes('what is this site')) {
    return 'This is an affiliate store showcasing hygiene and cleaning products available on Amazon. We earn a commission from qualifying purchases when you buy through our links.';
  }
  if (msg.includes('return policy') || msg.includes('returns')) {
    return 'Returns are handled by Amazon. Please refer to Amazon\'s return policy on their website.';
  }

  return 'Sorry, I am still learning and cannot fully understand your request. Please ask about specific products, categories, or the general buying process.';
}

window.addEventListener('load', () => {
  const chatbot = document.getElementById('chatbot');
  const chatbotHeader = document.getElementById('chatbot-header');
  const chatbotClose = document.getElementById('chatbot-close');
  const chatbotMessages = document.getElementById('chatbot-messages');
  const chatbotForm = document.getElementById('chatbot-form');
  const chatbotInput = document.getElementById('chatbot-input');

  if (chatbot && chatbotHeader && chatbotClose && chatbotMessages && chatbotForm && chatbotInput) {
    console.log('All required chatbot elements found on load. Setting up chatbot interaction listeners.');

    chatbotHeader.addEventListener('click', () => {
      chatbot.classList.toggle('expanded');
      const isExpanded = chatbot.classList.contains('expanded');
      chatbotHeader.setAttribute('aria-expanded', isExpanded);
      console.log(`Chatbot header clicked. Expanded state toggled to: ${isExpanded}.`);

      if (isExpanded) {
        if (chatbotMessages) {
          chatbotMessages.scrollTo({
            top: chatbotMessages.scrollHeight,
            behavior: 'smooth'
          });
          console.log('Chatbot expanded, scrolled messages to bottom.');
        } else {
          console.warn('Chatbot messages container (#chatbot-messages) not found. Cannot scroll messages after expansion.');
        }
      }
    });

    chatbotClose.addEventListener('click', () => {
      console.log('Chatbot close button clicked. Initiating chatbot close animation and hiding.');
      chatbot.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      chatbot.style.opacity = '0';
      chatbot.style.transform = 'translateY(20px)';

      setTimeout(() => {
        chatbot.style.display = 'none';
        chatbot.style.opacity = '';
        chatbot.style.transform = 'translateY(0)';
        chatbot.style.transition = '';

        chatbot.classList.remove('expanded');
        chatbotHeader.setAttribute('aria-expanded', 'false');

        const bubble = document.getElementById('chatbot-bubble');
        if (bubble) {
          bubble.style.display = 'flex';
          console.log('Chatbot closed via button. Chatbot bubble shown.');
        } else {
          console.warn('Chatbot bubble element (#chatbot-bubble) not found.');
        }
      }, 300);
    });

    chatbotForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const userMessage = chatbotInput.value.trim();

      if (!userMessage) {
        console.log('Attempted to send empty message in chatbot form.');
        return;
      }

      appendChatMessage('user', userMessage);
      chatbotInput.value = '';
      showTypingIndicator();

      setTimeout(() => {
        const botResponse = getBotResponse(userMessage);
        appendChatMessage('bot', botResponse);
        hideTypingIndicator();
        console.log('Chatbot responded to user message after simulated delay.');
      }, 1500);
    });

    chatbot.style.display = 'none';
    chatbot.classList.remove('expanded');
    chatbotHeader.setAttribute('aria-expanded', 'false');

  } else {
    console.error('One or more required chatbot elements not found on window load (#chatbot, #chatbot-header, #chatbot-close, #chatbot-messages, #chatbot-form, or #chatbot-input). Chatbot functionality will be disabled.');
  }

  createChatbotBubble();
});
