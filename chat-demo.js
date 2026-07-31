/* Buni — text-only Retell roofing demo.
   The browser talks only to the Cloudflare Worker. The Retell API key and
   chat-agent ID stay server-side. */
(function () {
  'use strict';

  var relayUrl = (window.VOICE_RELAY_URL || '').replace(/\/+$/, '');
  var agentKey = window.CHAT_AGENT_KEY || 'roofing';
  var panel = document.getElementById('chatPanel');
  var messagesEl = document.getElementById('chatMessages');
  var statusEl = document.getElementById('chatStatus');
  var form = document.getElementById('chatForm');
  var input = document.getElementById('chatInput');
  var submit = form && form.querySelector('button[type="submit"]');
  var bubble = document.querySelector('.chat-bubble');

  if (!relayUrl || !panel || !messagesEl || !statusEl || !form || !input || !submit) return;

  var chatId = null;
  var startPromise = null;
  var greeted = false;

  function setStatus(message) {
    statusEl.textContent = message || '';
  }

  function addMessage(role, content) {
    var row = document.createElement('div');
    row.className = 'chat-message chat-message-' + role;

    var label = document.createElement('strong');
    label.textContent = role === 'user' ? 'You' : 'Receptionist';

    var text = document.createElement('p');
    text.textContent = content;

    row.appendChild(label);
    row.appendChild(text);
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function greet() {
    if (greeted) return;
    greeted = true;
    addMessage(
      'agent',
      'Hi! I’m the AI receptionist for this fictional roofing demo. Is water actively coming in right now, or can I help with a general roofing question?'
    );
  }

  function startChat() {
    if (chatId) return Promise.resolve(chatId);
    if (startPromise) return startPromise;

    setStatus('Connecting securely…');
    startPromise = fetch(relayUrl + '/chat/start?agent=' + encodeURIComponent(agentKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
      .then(function (response) {
        if (!response.ok) throw new Error('chat start ' + response.status);
        return response.json();
      })
      .then(function (data) {
        if (!data.chat_id) throw new Error('missing chat id');
        chatId = data.chat_id;
        setStatus('');
        return chatId;
      })
      .catch(function (error) {
        if (window.console) console.error('[chat]', error);
        startPromise = null;
        setStatus('The chat could not connect. Please try again.');
        throw error;
      });

    return startPromise;
  }

  function setBusy(busy) {
    input.disabled = busy;
    submit.disabled = busy;
    submit.textContent = busy ? '…' : 'Send';
  }

  function sendMessage(content) {
    addMessage('user', content);
    setBusy(true);
    setStatus('Receptionist is typing…');

    return startChat()
      .then(function () {
        return fetch(relayUrl + '/chat/message?agent=' + encodeURIComponent(agentKey), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, content: content }),
        });
      })
      .then(function (response) {
        if (!response.ok) throw new Error('chat message ' + response.status);
        return response.json();
      })
      .then(function (data) {
        var replies = Array.isArray(data.messages) ? data.messages : [];
        if (!replies.length) throw new Error('empty reply');
        replies.forEach(function (message) {
          if (message && message.content) addMessage('agent', String(message.content));
        });
        setStatus('');
      })
      .catch(function (error) {
        if (window.console) console.error('[chat]', error);
        setStatus('That message did not go through. Please try again.');
      })
      .then(function () {
        setBusy(false);
        input.focus();
      });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var content = input.value.trim();
    if (!content) return;
    input.value = '';
    sendMessage(content);
  });

  window.openChat = function () {
    panel.hidden = false;
    if (bubble) bubble.setAttribute('aria-expanded', 'true');
    greet();
    startChat().catch(function () {});
    input.focus();
  };

  window.closeChat = function () {
    panel.hidden = true;
    if (bubble) bubble.setAttribute('aria-expanded', 'false');
    if (bubble) bubble.focus();
  };

  window.toggleChat = function () {
    if (panel.hidden) window.openChat();
    else window.closeChat();
  };

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !panel.hidden) window.closeChat();
  });
})();
