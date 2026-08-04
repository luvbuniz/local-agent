/* Buni — text-only Retell demos.
   The browser talks only to the Cloudflare Worker. Retell API keys and
   chat-agent IDs stay server-side. */
(function () {
  'use strict';

  var relayUrl = (window.VOICE_RELAY_URL || '').replace(/\/+$/, '');
  var availableAgents = window.CHAT_AGENTS || { roofing: true };
  var defaultAgent = window.CHAT_AGENT_KEY || 'roofing';
  var panel = document.getElementById('chatPanel');
  var messagesEl = document.getElementById('chatMessages');
  var statusEl = document.getElementById('chatStatus');
  var form = document.getElementById('chatForm');
  var input = document.getElementById('chatInput');
  var submit = form && form.querySelector('button[type="submit"]');
  var bubble = document.querySelector('.chat-bubble');
  var nameEl = document.getElementById('chatAgentName');
  var subtitleEl = document.getElementById('chatAgentSubtitle');
  var noticeEl = document.getElementById('chatNotice');
  var inputLabel = document.getElementById('chatInputLabel');
  var chatOpener = null;

  if (!relayUrl || !panel || !messagesEl || !statusEl || !form || !input || !submit) return;

  document.querySelectorAll('[data-chat-agent]').forEach(function (button) {
    button.hidden = !availableAgents[button.getAttribute('data-chat-agent')];
  });

  var agentCopy = {
    buni: {
      name: 'Bree · Buni questions',
      subtitle: 'Buni AI assistant · voice or text',
      notice: 'Bree can answer practical questions about Buni. Do not share passwords, payment details, or sensitive customer information.',
      label: 'Ask Bree a question about Buni',
      placeholder: 'Ask a question about Buni…',
      greeting: "Hi, I'm Bree, Buni's AI assistant. What questions can I help with?"
    },
    gutter: {
      name: 'Coastal Catch Gutters demo',
      subtitle: 'Text chat · fictional gutter company',
      notice: 'Please use made-up details. This demo cannot inspect a property, provide an estimate, confirm an appointment, take payment, or dispatch a crew.',
      label: 'Message the fictional gutter receptionist',
      placeholder: 'Describe overflow, damage, cleaning, guards, or another gutter concern…',
      greeting: "Thanks for trying the Coastal Catch Gutters demo. I'm Riley, an AI receptionist for a fictional gutter company, so please use made-up contact details. Is water entering the building, is anything loose or hanging, or is this a cleaning or estimate question?"
    },
    plumbing: {
      name: 'Harbor Flow Plumbing demo',
      subtitle: 'Text chat · fictional plumbing company',
      notice: 'Please use made-up details. This demo cannot dispatch a plumber, confirm an appointment, take payment, or update a real customer record.',
      label: 'Message the fictional plumbing receptionist',
      placeholder: 'Describe a leak, clog, water-heater, or other plumbing problem…',
      greeting: "Thanks for trying the Harbor Flow Plumbing demo. I'm Maya, an AI receptionist for a fictional plumbing company, so please use made-up contact details. Is water actively leaking right now, or is this another plumbing problem?"
    },
    hvac: {
      name: '💬 Coastal Comfort HVAC demo',
      subtitle: 'Text chat · fictional HVAC company',
      notice: 'Please use made-up details. This demo cannot dispatch a real technician, confirm an appointment, take payment, or provide repair and replacement quotes.',
      label: 'Message the fictional HVAC receptionist',
      placeholder: 'Ask about no cooling, repair, maintenance, or replacement…',
      greeting: "Thanks for trying the Coastal Comfort Heating & Air demo. I'm Casey, an AI receptionist for a fictional HVAC company, so please use made-up contact details. Is this about no cooling, a repair or maintenance visit, replacing a system, or something else?"
    },
    mechanic: {
      name: 'Bayline Auto Care demo',
      subtitle: 'Text chat · fictional auto shop · English or Spanish',
      notice: 'Please use made-up details. This demo cannot diagnose a vehicle, arrange a tow, quote a repair, confirm an appointment, take payment, or update a real shop record.',
      label: 'Message the fictional auto-shop receptionist',
      placeholder: 'Describe an example vehicle problem…',
      greeting: "Thanks for trying the fictional Bayline Auto Care demo. Is the vehicle in a safe place right now?"
    },
    dental: {
      name: 'Harbor Smile Dental demo',
      subtitle: 'Text chat · fictional dental office · English or Spanish',
      notice: 'Please use made-up details. Do not share real patient, insurance, payment, or medical information. This demo cannot diagnose, book, verify benefits, prescribe, or access records.',
      label: 'Message the fictional dental receptionist',
      placeholder: 'Try a routine, appointment, or dental-concern question…',
      greeting: 'Thanks for trying this fictional Buni dental demo. Please use made-up details. Is this a routine question, an appointment question, or a dental concern?'
    },
    insurance: {
      name: '💬 Harborlight Insurance demo',
      subtitle: 'Text chat · fictional insurance agency',
      notice: 'Please use made-up details. Do not share real policy, claim, payment, identity, or contact information. This demo cannot quote, change coverage, file a claim, or place a real transfer.',
      label: 'Message the fictional insurance receptionist',
      placeholder: 'Ask about intake, policy service, claims, or documents…',
      greeting: "Thanks for trying the Harborlight Insurance demo. I'm Jamie, an AI receptionist for a fictional agency, so please use made-up details and no real policy numbers. Are you asking about a new policy, an existing policy, a claim or loss, or a document request?"
    },
    salon: {
      name: '💬 Aster & Ash salon demo',
      subtitle: 'Text chat · fictional high-end salon',
      notice: 'Please use made-up contact details. This demo cannot create a real appointment, deposit, or client record.',
      label: 'Message the fictional salon guest coordinator',
      placeholder: 'Ask about services, prices, or stylists…',
      greeting: "Thanks for trying the Aster & Ash salon demo. I'm Poppy, an AI guest coordinator for a fictional salon, so please use made-up contact details. Are you looking for a cut, color, or help choosing the right stylist?"
    },
    law: {
      name: '💬 Meridian Family Law demo',
      subtitle: 'Text chat · fictional law firm',
      notice: 'Please use made-up details. This public demo is not legal advice and cannot create a real appointment or attorney-client relationship.',
      label: 'Message the fictional law intake coordinator',
      placeholder: 'Ask a family-law intake question…',
      greeting: "Thanks for trying the Meridian Family Law demo. I'm Morgan, an AI intake coordinator for a fictional firm, so please don't share sensitive real-case details. What kind of family-law issue would you like to use for the demo?"
    },
    roofing: {
      name: '💬 Suncoast Roofing demo',
      subtitle: 'Text chat · fictional business',
      notice: 'Please use made-up contact details. This demo cannot book, text, or dispatch a real crew.',
      label: 'Message the fictional roofing receptionist',
      placeholder: 'Type a roofing question…',
      greeting: 'Hi! I’m the AI receptionist for this fictional roofing demo. Is water actively coming in right now, or can I help with a general roofing question?'
    }
  };

  var agentKey = availableAgents[defaultAgent] ? defaultAgent : Object.keys(availableAgents)[0];
  var states = {};

  function stateFor(key) {
    if (!states[key]) states[key] = { chatId: null, startPromise: null, greeted: false };
    return states[key];
  }

  function activeCardAgent() {
    var cards = document.querySelectorAll('.demo-card');
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].hidden) continue;
      var button = cards[i].querySelector('[data-voice-agent]');
      var key = button && button.getAttribute('data-voice-agent');
      if (key && availableAgents[key]) return key;
    }
    return null;
  }

  function setStatus(message) {
    statusEl.textContent = message || '';
  }

  function applyAgentUi() {
    var copy = agentCopy[agentKey] || agentCopy[defaultAgent] || agentCopy.roofing;
    if (nameEl) nameEl.textContent = copy.name;
    if (subtitleEl) subtitleEl.textContent = copy.subtitle;
    if (noticeEl) noticeEl.textContent = copy.notice;
    if (inputLabel) inputLabel.textContent = copy.label;
    input.placeholder = copy.placeholder;
    panel.setAttribute('aria-label', copy.name.replace(/^💬\s*/, '') + ' text chat');
    if (bubble) bubble.setAttribute('aria-label', 'Open ' + copy.name.replace(/^💬\s*/, '') + ' text chat');
  }

  function selectAgent(requested) {
    var next = requested && availableAgents[requested] ? requested : activeCardAgent();
    if (!next || !availableAgents[next]) next = defaultAgent;
    if (next === agentKey) {
      applyAgentUi();
      return;
    }
    agentKey = next;
    messagesEl.textContent = '';
    setStatus('');
    applyAgentUi();
  }

  function addMessage(role, content) {
    var row = document.createElement('div');
    row.className = 'chat-message chat-message-' + role;
    var label = document.createElement('strong');
    label.textContent = role === 'user' ? 'You' : (agentKey === 'buni' ? 'Bree' : 'Receptionist');
    var text = document.createElement('p');
    text.textContent = content;
    row.appendChild(label);
    row.appendChild(text);
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function greet() {
    var state = stateFor(agentKey);
    if (state.greeted) return;
    state.greeted = true;
    addMessage('agent', (agentCopy[agentKey] || agentCopy.roofing).greeting);
  }

  function startChat() {
    var key = agentKey;
    var state = stateFor(key);
    if (state.chatId) return Promise.resolve(state.chatId);
    if (state.startPromise) return state.startPromise;

    setStatus('Connecting securely…');
    state.startPromise = fetch(relayUrl + '/chat/start?agent=' + encodeURIComponent(key), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    })
      .then(function (response) {
        if (!response.ok) throw new Error('chat start ' + response.status);
        return response.json();
      })
      .then(function (data) {
        if (!data.chat_id) throw new Error('missing chat id');
        state.chatId = data.chat_id;
        setStatus('');
        return state.chatId;
      })
      .catch(function (error) {
        if (window.console) console.error('[chat]', error);
        state.startPromise = null;
        setStatus('The chat could not connect. Please try again.');
        throw error;
      });
    return state.startPromise;
  }

  function setBusy(busy) {
    input.disabled = busy;
    submit.disabled = busy;
    submit.textContent = busy ? '…' : 'Send';
  }

  function sendMessage(content) {
    var key = agentKey;
    var state = stateFor(key);
    addMessage('user', content);
    setBusy(true);
    setStatus('Receptionist is typing…');

    return startChat()
      .then(function () {
        return fetch(relayUrl + '/chat/message?agent=' + encodeURIComponent(key), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: state.chatId, content: content })
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

  window.openChat = function (requestedAgent) {
    chatOpener = document.activeElement;
    selectAgent(requestedAgent);
    panel.hidden = false;
    if (bubble) bubble.setAttribute('aria-expanded', 'true');
    greet();
    startChat().catch(function () {});
    input.focus();
  };

  window.closeChat = function () {
    panel.hidden = true;
    if (bubble) bubble.setAttribute('aria-expanded', 'false');
    if (chatOpener && typeof chatOpener.focus === 'function') chatOpener.focus();
    else if (bubble) bubble.focus();
  };

  window.toggleChat = function () {
    if (panel.hidden) window.openChat();
    else window.closeChat();
  };

  document.addEventListener('demo-agent-change', function (event) {
    if (!panel.hidden && event.detail && availableAgents[event.detail.key]) {
      selectAgent(event.detail.key);
      greet();
      startChat().catch(function () {});
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !panel.hidden) window.closeChat();
  });

  applyAgentUi();
})();

