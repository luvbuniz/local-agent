/* Buni website helper.
   Static FAQ answers drawn from the public site, plus a message form.
   Messages go to amy@bunillc.com through FormSubmit. No API keys. */
(function () {
  'use strict';

  var PHONE_DISPLAY = '(941) 646-6325';
  var PHONE_TEL = 'tel:+19416466325';
  var BOOKING_URL = 'https://calendar.app.google/28cgSSKEuwE3B3qs8';
  var INTAKE_URL = '/intake/';
  var MAIL_URL = 'https://formsubmit.co/ajax/amy@bunillc.com';

  var faqs = [
    {
      keys: ['healthcare', 'patient', 'hipaa', 'medical record', 'medical records', 'health information'],
      answer: 'Please do not send healthcare or patient information through this chat or the intake form. That includes medical records, patient names, and insurance details. If the company is in healthcare, describe the business in general terms only, or call ' + PHONE_DISPLAY + ' and we will help you.'
    },
    {
      keys: ['call recording', 'call recordings', 'recordings'],
      answer: 'Call recordings are one of the kinds of records the intake form asks about. You do not need to send any recordings. A short description is enough. Please do not include healthcare or patient information.'
    },
    {
      keys: ['price', 'cost', 'fee', 'charge', 'pricing', 'dollar', 'who pays', 'what do you charge', 'how much do you charge'],
      answer: 'For data-asset work, your organization does not pay Buni. If an introduction goes ahead, the buyer pays Buni, and that arrangement is explained in writing before any introduction. Workflow help is separate and is agreed in a written scope. This site does not list fees. Call or start the intake form and we will talk it through.'
    },
    {
      keys: ['buyer name', 'who buys', 'buyers', 'vetted', 'buyer'],
      answer: 'Before any introduction, Buni reviews a buyer’s identity, what they plan to do with the records, how they protect them, and whether they will accept limits on use, sharing, and how long they keep them. Buyers who do not meet that bar are not introduced. Buyer names are not listed on this website.'
    },
    {
      keys: ['bankrupt', 'chapter 7', 'chapter 11', 'chapter', 'trustee', 'assignee', 'creditor', 'court'],
      answer: 'Often, yes. Selling assets in a bankruptcy or an assignment for the benefit of creditors usually needs approval from the trustee, the assignee, or the court. Buni works alongside the trustee, the attorneys, and the other advisors, and follows the process they set. The intake form has a place for the chapter and case number if you have them.'
    },
    {
      keys: ['closed', 'wound down', 'wind-down', 'wind down', 'shut down', 'ceased', 'out of business'],
      answer: 'Yes. Companies that have closed or are winding down can ask about their archives. Trustees, assignees, and boards often lead that conversation. Approval rules still apply, and nothing is shared without written sign-off.'
    },
    {
      keys: ['still operating', 'still open', 'operating company', 'in business', 'still running'],
      answer: 'Yes. A company that is still operating can take part. Buyers generally look for organizations with about 25 or more employees and a solid set of internal documents. Day-to-day work is not interrupted, and sensitive material is removed before anything is licensed.'
    },
    {
      keys: ['do you access', 'access our', 'hold our', 'see our data', 'look at our', 'store our', 'view our'],
      answer: 'No. Buni does not access, hold, or view your records. Buni works from inventories and descriptions your team prepares. If anything is transferred, it goes directly from your organization to the buyer under the agreement you sign.'
    },
    {
      keys: ['personal information', 'confidential', 'privacy', 'redact', 'customer information'],
      answer: 'Archives often contain personal information and confidential material. Buni raises that early with your attorney. Redaction, de-identification, or leaving records out is agreed before anything moves. Some records should not be shared at all, and Buni will say so.'
    },
    {
      keys: ['law firm', 'legal advice', 'not a lawyer', 'are you a lawyer', 'are you attorneys'],
      answer: 'Buni is not a law firm and does not give legal, tax, or accounting advice. Your own attorney should be involved in every data engagement. If you are an attorney or a trustee, the intake form has a place for your role.'
    },
    {
      keys: ['workflow', 'automation', 'audit'],
      answer: 'The workflow practice is for operating businesses. Buni traces how work moves, finds where it gets stuck or repeated, and recommends the smallest fix that helps. Nothing in a live system changes without an agreed scope and your approval. Please do not send passwords or sensitive customer records.'
    },
    {
      keys: ['workforce video', 'video program', 'employees record'],
      answer: 'Some programs ask employees who choose to take part to record ordinary day-to-day work. Each person must agree. Customer information and sensitive screens stay out of frame.'
    },
    {
      keys: ['what happens', 'the process', 'next step', 'how it works', 'nda'],
      answer: 'First, under a nondisclosure agreement, Buni reviews a high-level inventory your team prepares. Next, Buni introduces you only to pre-qualified buyers and shares descriptions, never the records themselves. Nothing moves until the people who are allowed to approve it sign in writing, including a trustee or the court when that is required. The records go directly from your organization to the buyer.'
    },
    {
      keys: ['where are you', 'where is buni', 'located', 'headquarters', 'florida', 'remote'],
      answer: 'Buni is based in Florida and works remotely with organizations across the United States.'
    },
    {
      keys: ['phone', 'call you', 'phone number', 'talk to a person', 'talk to someone', 'speak to'],
      answer: 'You can call ' + PHONE_DISPLAY + '. If you would rather not fill out a form alone, call and we will go through it with you.'
    },
    {
      keys: ['book', 'schedule', 'appointment', 'calendar', 'meeting', 'intro call'],
      answer: 'You can book a 15-minute intro call on Buni’s calendar. Use the Book a time button below.'
    },
    {
      keys: ['intake', 'the form', 'get started', 'how do i start', 'how to start', 'sign up'],
      answer: 'The intake form is a short set of questions for owners, trustees, and attorneys about the company and the kinds of records it built up. Use the Start intake form button below. If a question is unclear, call ' + PHONE_DISPLAY + '.'
    },
    {
      keys: ['data asset', 'what do you do', 'what does buni', 'your service', 'advisory'],
      answer: 'Buni helps established organizations find out whether their records might be useful for AI training, and connects them with buyers Buni has already reviewed. Nothing is shared without written permission. Buni also helps operating businesses tidy up everyday workflows. Buni never sees the underlying records.'
    },
    {
      keys: ['email', 'contact', 'write to you'],
      answer: 'You can email contact@bunillc.com, call ' + PHONE_DISPLAY + ', book a time, or leave a message in this chat.'
    },
    {
      keys: ['demo', 'fictional', 'hvac', 'plumbing', 'roofing', 'this page'],
      answer: 'The industry pages are demonstrations with fictional businesses. Please use made-up details there. This chat answers questions about Buni itself. To talk with Buni, book a time, start the intake form, or call ' + PHONE_DISPLAY + '.'
    }
  ];

  var fallback = 'I can answer common questions from this website, and I may not have that one. You can book a time, start the intake form, call ' + PHONE_DISPLAY + ', or leave a message and a person will follow up. Please do not include healthcare or patient information.';

  function answerFor(text) {
    var q = text.toLowerCase();
    var best = null;
    var bestScore = 0;
    faqs.forEach(function (faq) {
      var score = 0;
      faq.keys.forEach(function (key) {
        if (q.indexOf(key) !== -1) score += key.length;
      });
      if (score > bestScore) {
        bestScore = score;
        best = faq;
      }
    });
    if (!best || bestScore < 4) return fallback;
    return best.answer;
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === 'class') node.className = attrs[key];
        else if (key === 'text') node.textContent = attrs[key];
        else node.setAttribute(key, attrs[key]);
      });
    }
    (children || []).forEach(function (child) {
      if (child) node.appendChild(child);
    });
    return node;
  }

  var root = el('div', { class: 'buni-assist' });
  var launcher = el('button', {
    class: 'buni-assist-launcher',
    type: 'button',
    'aria-expanded': 'false',
    'aria-controls': 'buni-assist-panel',
    'aria-label': 'Open chat'
  });
  launcher.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 16.5 3.5 20.5 8 18.2A8.5 8.5 0 1 0 5 16.5Z"/><path d="M8.5 10.5h7M8.5 13.5h4.5"/></svg>';

  var panel = el('div', {
    class: 'buni-assist-panel',
    id: 'buni-assist-panel',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': 'buni-assist-title',
    hidden: ''
  });

  var title = el('h2', { id: 'buni-assist-title', class: 'buni-assist-title', text: 'Questions?' });
  var closeBtn = el('button', { type: 'button', class: 'buni-assist-close', 'aria-label': 'Close chat', text: 'Close' });
  var assistScript = document.querySelector('script[src*="site-assist.js"]');
  var assetBase = assistScript ? assistScript.getAttribute('src').replace(/site-assist\.js.*$/, '') : '';
  var logo = el('img', { class: 'buni-assist-logo', src: assetBase + 'logo-gem.svg', alt: '', width: '28', height: '28' });
  var head = el('div', { class: 'buni-assist-head' }, [
    logo,
    el('div', null, [
      title,
      el('p', { class: 'buni-assist-sub', text: 'Buni website helper' })
    ]),
    closeBtn
  ]);

  var log = el('div', { class: 'buni-assist-log', role: 'log', 'aria-live': 'polite', 'aria-relevant': 'additions' });
  var actions = el('div', { class: 'buni-assist-actions', role: 'group', 'aria-label': 'Next steps' });

  function actionLink(label, href, external) {
    var a = el('a', { class: 'buni-assist-action', href: href, text: label });
    if (external) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    }
    return a;
  }

  actions.appendChild(actionLink('Book a time', BOOKING_URL, true));
  actions.appendChild(actionLink('Start intake form', INTAKE_URL, false));
  actions.appendChild(actionLink('Call ' + PHONE_DISPLAY, PHONE_TEL, false));
  var leaveBtn = el('button', { type: 'button', class: 'buni-assist-action', text: 'Leave a message' });
  actions.appendChild(leaveBtn);

  var form = el('form', { class: 'buni-assist-form', hidden: '', novalidate: '' });
  form.noValidate = true;
  var honey = el('input', { type: 'text', name: '_honey', tabindex: '-1', autocomplete: 'off', 'aria-hidden': 'true' });
  honey.className = 'buni-assist-honey';
  form.appendChild(honey);
  form.appendChild(el('p', { class: 'buni-assist-form-note', text: 'This message is emailed to amy@bunillc.com. Please do not include healthcare or patient information.' }));

  function field(id, label, control) {
    var wrap = el('div', { class: 'buni-assist-field' });
    wrap.appendChild(el('label', { for: id, text: label }));
    control.id = id;
    wrap.appendChild(control);
    return wrap;
  }

  var nameInput = el('input', { type: 'text', name: 'name', autocomplete: 'name', required: '' });
  var emailInput = el('input', { type: 'email', name: 'email', autocomplete: 'email', required: '' });
  var phoneInput = el('input', { type: 'tel', name: 'phone', autocomplete: 'tel' });
  var messageInput = el('textarea', { name: 'message', rows: '3', required: '' });
  form.appendChild(field('buni-assist-name', 'Your name', nameInput));
  form.appendChild(field('buni-assist-email', 'Email', emailInput));
  form.appendChild(field('buni-assist-phone', 'Phone (optional)', phoneInput));
  form.appendChild(field('buni-assist-message', 'Message', messageInput));
  var formStatus = el('p', { class: 'buni-assist-status', role: 'status' });
  var sendBtn = el('button', { type: 'submit', class: 'buni-assist-send', text: 'Send message' });
  form.appendChild(sendBtn);
  form.appendChild(formStatus);

  var composer = el('form', { class: 'buni-assist-composer' });
  var question = el('input', { id: 'buni-assist-question', type: 'text', maxlength: '500', autocomplete: 'off', placeholder: 'Type a question' });
  question.setAttribute('aria-label', 'Type a question');
  var askBtn = el('button', { type: 'submit', text: 'Send' });
  composer.appendChild(question);
  composer.appendChild(askBtn);

  var notice = el('p', { class: 'buni-assist-notice', text: 'I answer from this website. I am not a person and not a lawyer. Please do not share healthcare or patient information.' });

  panel.appendChild(head);
  panel.appendChild(log);
  panel.appendChild(actions);
  panel.appendChild(form);
  panel.appendChild(composer);
  panel.appendChild(notice);
  root.appendChild(panel);
  root.appendChild(launcher);
  document.body.appendChild(root);

  function addMessage(text, who) {
    var item = el('div', { class: 'buni-assist-msg buni-assist-msg-' + who });
    item.appendChild(el('p', { text: text }));
    log.appendChild(item);
    log.scrollTop = log.scrollHeight;
  }

  addMessage('Hello. I can answer common questions about Buni from this website. If you would rather talk to a person, call ' + PHONE_DISPLAY + ' and we will help, including with the intake form.', 'bot');

  function focusable() {
    return Array.prototype.slice.call(panel.querySelectorAll('a[href], button:not([disabled]), textarea, input:not([disabled]):not([tabindex="-1"]), select, [tabindex]:not([tabindex="-1"])')).filter(function (node) {
      return !node.closest('[hidden]');
    });
  }

  function setInert(on) {
    Array.prototype.forEach.call(document.body.children, function (child) {
      if (child === root) return;
      if (on) child.setAttribute('inert', '');
      else child.removeAttribute('inert');
    });
  }

  function openPanel() {
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    launcher.setAttribute('aria-label', 'Close chat');
    setInert(true);
    window.setTimeout(function () { question.focus(); }, 0);
  }

  function closePanel() {
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-label', 'Open chat');
    setInert(false);
    launcher.focus();
  }

  launcher.addEventListener('click', function () {
    if (panel.hidden) openPanel();
    else closePanel();
  });
  closeBtn.addEventListener('click', closePanel);

  document.addEventListener('keydown', function (event) {
    if (panel.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closePanel();
      return;
    }
    if (event.key !== 'Tab') return;
    var items = focusable();
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  composer.addEventListener('submit', function (event) {
    event.preventDefault();
    var text = question.value.replace(/\s+/g, ' ').trim();
    if (!text) {
      question.focus();
      return;
    }
    addMessage(text, 'user');
    question.value = '';
    addMessage(answerFor(text), 'bot');
  });

  leaveBtn.addEventListener('click', function () {
    var show = form.hidden;
    form.hidden = !show;
    leaveBtn.setAttribute('aria-expanded', show ? 'true' : 'false');
    if (show) nameInput.focus();
    else question.focus();
  });
  leaveBtn.setAttribute('aria-expanded', 'false');
  leaveBtn.setAttribute('aria-controls', 'buni-assist-message-form');
  form.id = 'buni-assist-message-form';

  function interpret(res) {
    return res.text().then(function (raw) {
      var data = {};
      try { data = raw ? JSON.parse(raw) : {}; } catch (err) { data = { message: raw }; }
      var message = data && typeof data.message === 'string' ? data.message : '';
      var activation = /activat/i.test(message);
      var flag = data && data.success;
      var ok = activation || (res.ok && (flag === true || flag === 'true' || flag === 'True'));
      return { ok: ok, activation: activation };
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    formStatus.textContent = '';
    formStatus.classList.remove('is-error');
    if (honey.value) return;
    if (!form.checkValidity()) {
      formStatus.textContent = 'Please add your name, a valid email, and a short message.';
      formStatus.classList.add('is-error');
      var invalid = form.querySelector(':invalid');
      if (invalid) invalid.focus();
      return;
    }
    sendBtn.disabled = true;
    formStatus.textContent = 'Sending…';
    var payload = {
      _subject: 'Buni website message',
      _template: 'table',
      _captcha: 'false',
      _replyto: emailInput.value.trim(),
      Name: nameInput.value.trim(),
      Email: emailInput.value.trim(),
      Phone: phoneInput.value.trim(),
      Message: messageInput.value.trim(),
      Page: window.location.href
    };
    fetch(MAIL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    }).then(interpret).then(function (result) {
      if (!result.ok) throw new Error('send failed');
      form.reset();
      form.hidden = true;
      leaveBtn.setAttribute('aria-expanded', 'false');
      var thanks = result.activation
        ? 'Thank you. We received your note. If you do not hear back shortly, please call ' + PHONE_DISPLAY + ' so we do not miss you.'
        : 'Thank you. Your message was sent. If you need a person sooner, call ' + PHONE_DISPLAY + '.';
      addMessage(thanks, 'bot');
      formStatus.textContent = '';
    }).catch(function () {
      formStatus.textContent = 'We could not send that just now. Please call ' + PHONE_DISPLAY + ' or email amy@bunillc.com.';
      formStatus.classList.add('is-error');
    }).then(function () {
      sendBtn.disabled = false;
    });
  });

  var demoChat = document.getElementById('chatPanel');
  if (demoChat) {
    var sync = function () {
      root.classList.toggle('buni-assist-yield', !demoChat.hidden);
    };
    if (window.MutationObserver) {
      new MutationObserver(sync).observe(demoChat, { attributes: true, attributeFilter: ['hidden'] });
    }
    sync();
  }
})();
