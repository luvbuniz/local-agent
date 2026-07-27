/* Buni — in-page voice demo (Retell web call via the Cloudflare Worker relay).
   The worker mints a short-lived access token so the Retell API key never
   reaches the browser. Buttons stay hidden unless their agent key is listed
   in window.VOICE_AGENTS, so an unbuilt agent never shows a broken button. */
(function () {
  'use strict';

  var RELAY_URL = window.VOICE_RELAY_URL || '';
  var LIVE_AGENTS = window.VOICE_AGENTS || [];
  // Overridable so the page can be tested with a stub SDK.
  var SDK_URL = window.RETELL_SDK_URL || 'https://esm.sh/retell-client-js-sdk@2';

  if (!RELAY_URL) return;

  document.querySelectorAll('[data-voice-agent]').forEach(function (btn) {
    if (LIVE_AGENTS.indexOf(btn.getAttribute('data-voice-agent')) === -1) return;
    btn.hidden = false;
    btn.addEventListener('click', function () { start(btn); });
  });

  var active = null; // one call at a time

  function start(btn) {
    if (active) { stop(); return; }

    var card = btn.closest('.demo-card');
    var panel = card.querySelector('.voice-panel');
    var statusEl = panel.querySelector('.voice-status');
    var transcriptEl = panel.querySelector('.voice-transcript');
    var agentKey = btn.getAttribute('data-voice-agent');

    panel.hidden = false;
    transcriptEl.textContent = '';
    setStatus('Connecting…');
    btn.textContent = '⏹ End the voice demo';

    var session = { btn: btn, client: null, closed: false };
    active = session;

    function setStatus(msg) { statusEl.textContent = msg; }

    function renderTranscript(turns) {
      if (!turns || !turns.length) return;
      transcriptEl.textContent = turns.map(function (t) {
        var who = t.role === 'agent' ? 'Receptionist' : 'You';
        return who + ': ' + t.content;
      }).join('\n');
      transcriptEl.scrollTop = transcriptEl.scrollHeight;
    }

    fetch(RELAY_URL.replace(/\/+$/, '') + '/web-call?agent=' + encodeURIComponent(agentKey), {
      method: 'POST',
    }).then(function (res) {
      if (!res.ok) throw new Error('relay ' + res.status);
      return res.json();
    }).then(function (data) {
      if (session.closed) return;
      return import(SDK_URL).then(function (mod) {
        var RetellWebClient = mod.RetellWebClient;
        var client = new RetellWebClient();
        session.client = client;

        client.on('call_started', function () {
          setStatus('🎙 Connected — the receptionist is answering…');
        });
        client.on('update', function (update) {
          renderTranscript(update && update.transcript);
        });
        client.on('call_ended', function () {
          setStatus('Demo ended. Thanks for trying it!');
          cleanup(session, false);
        });
        client.on('error', function (err) {
          if (window.console) console.error('[voice]', err);
          setStatus('Something hiccuped — try again in a moment.');
          cleanup(session, true);
        });

        return client.startCall({ accessToken: data.access_token });
      });
    }).catch(function (err) {
      if (window.console) console.error('[voice]', err);
      setStatus('Could not connect — please try again later.');
      cleanup(session, false);
    });
  }

  function stop() { if (active) cleanup(active, true); }

  function cleanup(s, stopCall) {
    if (s.closed) return;
    s.closed = true;
    if (stopCall && s.client) {
      try { s.client.stopCall(); } catch (e) {}
    }
    s.btn.textContent = '🎙 Or talk to it right here';
    active = null;
  }

  document.addEventListener('click', function (e) {
    if (e.target.classList && e.target.classList.contains('voice-end')) stop();
  });
})();
