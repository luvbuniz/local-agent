/* Buni — in-page voice demos.
   Supports two providers, chosen per card in window.VOICE_AGENTS:
     { law: "retell", roofing: "grok" }
   Retell runs a web call via its SDK; Grok streams audio over the relay's
   WebSocket. Either way the API key stays in the Cloudflare Worker.
   A card's button stays hidden unless its key appears in VOICE_AGENTS. */
(function () {
  'use strict';

  var RELAY_URL = (window.VOICE_RELAY_URL || '').replace(/\/+$/, '');
  var AGENTS = window.VOICE_AGENTS || {};
  var SDK_URL = window.RETELL_SDK_URL || 'https://esm.sh/retell-client-js-sdk@2';
  var RATE = 24000; // PCM16 sample rate Grok's realtime API speaks

  if (!RELAY_URL) return;

  // Accept a plain array (all Retell) as well as a {key: provider} map.
  function providerFor(key) {
    if (Array.isArray(AGENTS)) return AGENTS.indexOf(key) === -1 ? null : 'retell';
    return AGENTS[key] || null;
  }

  document.querySelectorAll('[data-voice-agent]').forEach(function (btn) {
    if (!providerFor(btn.getAttribute('data-voice-agent'))) return;
    btn.hidden = false;
    btn.addEventListener('click', function () { start(btn); });
  });

  var active = null; // one call at a time
  var feedbackCtx = null;

  function playClick() {
    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      feedbackCtx = feedbackCtx || new AudioCtx();
      if (feedbackCtx.state === 'suspended') feedbackCtx.resume();
      var now = feedbackCtx.currentTime;
      var oscillator = feedbackCtx.createOscillator();
      var gain = feedbackCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(560, now);
      oscillator.frequency.exponentialRampToValueAtTime(390, now + 0.055);
      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      oscillator.connect(gain);
      gain.connect(feedbackCtx.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.065);
    } catch (e) {}
  }

  function start(btn) {
    if (active) { requestStop(); return; }

    var card = btn.closest('.demo-card');
    var panel = card.querySelector('.voice-panel');
    var statusEl = panel.querySelector('.voice-status');
    var transcriptEl = panel.querySelector('.voice-transcript');
    var agentKey = btn.getAttribute('data-voice-agent');

    var defaultLabel = btn.textContent;
    panel.hidden = false;
    transcriptEl.setAttribute('role', 'log');
    transcriptEl.setAttribute('aria-live', 'polite');
    transcriptEl.setAttribute('aria-relevant', 'additions text');
    transcriptEl.textContent = 'Live captions will appear here as you and the receptionist speak.';
    btn.textContent = '⏹ End the voice demo';

    var s = {
      btn: btn, panel: panel, endBtn: panel.querySelector('.voice-end'),
      defaultLabel: defaultLabel, closed: false,
      provider: providerFor(agentKey), agentKey: agentKey,
      statusEl: statusEl, transcriptEl: transcriptEl,
      client: null, ws: null, ctx: null, stream: null, proc: null,
      playHead: 0, sources: [], retellTurns: [],
    };
    active = s;

    setStatus(s, 'Connecting…');
    if (s.provider === 'grok') startGrok(s); else startRetell(s);
  }

  function setStatus(s, msg) { s.statusEl.textContent = msg; }

  function scrollTranscript(s) { s.transcriptEl.scrollTop = s.transcriptEl.scrollHeight; }

  /* ---------------- Retell ---------------- */

  function startRetell(s) {
    fetch(RELAY_URL + '/web-call?agent=' + encodeURIComponent(s.agentKey), { method: 'POST' })
      .then(function (res) {
        if (!res.ok) throw new Error('relay ' + res.status);
        return res.json();
      })
      .then(function (data) {
        if (s.closed) return;
        return import(SDK_URL).then(function (mod) {
          var client = new mod.RetellWebClient();
          s.client = client;

          client.on('call_started', function () {
            setStatus(s, '🎙 Connected — the receptionist is answering…');
          });
          client.on('update', function (update) {
            var turns = update && update.transcript;
            if (!turns || !turns.length) return;
            mergeRetellTranscript(s, turns);
          });
          client.on('call_ended', function () {
            setStatus(s, 'Demo ended. Thanks for trying it!');
            cleanup(s, false);
          });
          client.on('error', function (err) {
            if (window.console) console.error('[voice]', err);
            setStatus(s, 'Something hiccuped — try again in a moment.');
            cleanup(s, true);
          });

          return client.startCall({ accessToken: data.access_token });
        });
      })
      .catch(function (err) {
        if (window.console) console.error('[voice]', err);
        setStatus(s, 'Could not connect — please try again later.');
        cleanup(s, false);
      });
  }


  function mergeRetellTranscript(s, incoming) {
    incoming.forEach(function (turn) {
      if (!turn || !turn.content) return;
      var role = turn.role === 'agent' ? 'agent' : 'user';
      var content = String(turn.content).trim();
      if (!content) return;
      var words = Array.isArray(turn.words) ? turn.words : [];
      var start = words.length && typeof words[0].start === 'number' ? words[0].start : null;
      var key = start === null ? null : role + ':' + start.toFixed(3);
      var match = -1;
      if (key) match = s.retellTurns.findIndex(function (saved) { return saved.key === key; });
      if (match === -1) {
        match = s.retellTurns.findIndex(function (saved) {
          return saved.role === role && saved.content === content;
        });
      }
      if (match === -1) {
        for (var i = s.retellTurns.length - 1; i >= Math.max(0, s.retellTurns.length - 3); i--) {
          var saved = s.retellTurns[i];
          if (saved.role === role && (content.indexOf(saved.content) === 0 || saved.content.indexOf(content) === 0)) {
            match = i;
            break;
          }
        }
      }
      var normalized = { key: key, role: role, content: content };
      if (match === -1) s.retellTurns.push(normalized);
      else s.retellTurns[match] = normalized;
    });
    if (s.retellTurns.length > 30) s.retellTurns = s.retellTurns.slice(-30);
    renderRetellTranscript(s);
  }

  function renderRetellTranscript(s) {
    var fragment = document.createDocumentFragment();
    s.retellTurns.forEach(function (turn) {
      var row = document.createElement('div');
      row.className = 'voice-turn voice-turn-' + turn.role;
      var label = document.createElement('strong');
      label.textContent = turn.role === 'agent' ? 'Receptionist' : 'You';
      var text = document.createElement('span');
      text.textContent = turn.content;
      row.appendChild(label);
      row.appendChild(text);
      fragment.appendChild(row);
    });
    s.transcriptEl.textContent = '';
    s.transcriptEl.appendChild(fragment);
    scrollTranscript(s);
  }

  /* ---------------- Grok realtime ---------------- */

  function startGrok(s) {
    setStatus(s, 'Asking for your microphone…');
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    s.ctx = new AudioCtx();
    s.ctx.resume();

    navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    }).then(function (stream) {
      if (s.closed) { stream.getTracks().forEach(function (t) { t.stop(); }); return; }
      s.stream = stream;
      connectGrok(s);
    }).catch(function () {
      setStatus(s, 'Microphone blocked — allow it in your browser and try again.');
      cleanup(s, true);
    });
  }

  function connectGrok(s) {
    setStatus(s, 'Connecting…');
    var ws = new WebSocket(RELAY_URL.replace(/^http/, 'ws') + '?agent=' + encodeURIComponent(s.agentKey));
    s.ws = ws;
    var agentLineOpen = false;

    function appendAgent(delta) {
      if (!agentLineOpen) {
        s.transcriptEl.textContent += (s.transcriptEl.textContent ? '\n' : '') + 'Receptionist: ';
        agentLineOpen = true;
      }
      s.transcriptEl.textContent += delta;
      scrollTranscript(s);
    }
    function appendCaller(text) {
      if (!text) return;
      agentLineOpen = false;
      s.transcriptEl.textContent += (s.transcriptEl.textContent ? '\n' : '') + 'You: ' + text;
      scrollTranscript(s);
    }

    // Don't leave the visitor staring at "Connecting…" if the socket stalls.
    var connectTimer = setTimeout(function () {
      if (!s.closed && ws.readyState !== 1) {
        setStatus(s, 'Could not connect — please try again later.');
        cleanup(s, true);
      }
    }, 15000);

    ws.onopen = function () {
      clearTimeout(connectTimer);
      setStatus(s, '🎙 Connected — the receptionist is about to greet you…');
      sendMic(s);
      ws.send(JSON.stringify({
        type: 'conversation.item.create',
        item: { type: 'message', role: 'user', content: [{ type: 'input_text', text: 'Hello!' }] },
      }));
      ws.send(JSON.stringify({ type: 'response.create' }));
    };

    ws.onmessage = function (raw) {
      var ev;
      try { ev = JSON.parse(raw.data); } catch (e) { return; }
      if (window.console && console.debug) console.debug('[voice]', ev.type);

      if (ev.type === 'response.output_audio.delta') {
        playDelta(s, ev.delta);
      } else if (ev.type === 'response.output_audio_transcript.delta') {
        appendAgent(ev.delta);
      } else if (ev.type === 'response.output_audio_transcript.done') {
        agentLineOpen = false;
      } else if (ev.type === 'conversation.item.input_audio_transcription.completed' ||
                 ev.type === 'conversation.item.input_audio_transcription.done') {
        appendCaller(ev.transcript);
      } else if (ev.type === 'input_audio_buffer.speech_started') {
        bargeIn(s);
      } else if (ev.type === 'error') {
        setStatus(s, 'Something hiccuped — try again in a moment.');
      }
    };

    ws.onclose = function () {
      clearTimeout(connectTimer);
      if (!s.closed) { setStatus(s, 'Demo ended. Thanks for trying it!'); cleanup(s, false); }
    };
    ws.onerror = function () {
      clearTimeout(connectTimer);
      setStatus(s, 'Could not connect — please try again later.');
      cleanup(s, false);
    };
  }

  function sendMic(s) {
    var src = s.ctx.createMediaStreamSource(s.stream);
    var proc = s.ctx.createScriptProcessor(4096, 1, 1);
    s.proc = proc;
    var inRate = s.ctx.sampleRate;
    proc.onaudioprocess = function (e) {
      if (!s.ws || s.ws.readyState !== 1) return;
      var f32 = resample(e.inputBuffer.getChannelData(0), inRate, RATE);
      s.ws.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: b64FromPcm16(f32) }));
    };
    src.connect(proc);
    proc.connect(s.ctx.destination);
  }

  function playDelta(s, b64) {
    var i16 = pcm16FromB64(b64);
    var f32 = new Float32Array(i16.length);
    for (var i = 0; i < i16.length; i++) f32[i] = i16[i] / 32768;
    var buf = s.ctx.createBuffer(1, f32.length, RATE);
    buf.getChannelData(0).set(f32);
    var node = s.ctx.createBufferSource();
    node.buffer = buf;
    node.connect(s.ctx.destination);
    s.playHead = Math.max(s.ctx.currentTime, s.playHead);
    node.start(s.playHead);
    s.playHead += buf.duration;
    s.sources.push(node);
    node.onended = function () {
      var i = s.sources.indexOf(node);
      if (i > -1) s.sources.splice(i, 1);
    };
  }

  function bargeIn(s) {
    s.sources.forEach(function (n) { try { n.stop(); } catch (e) {} });
    s.sources = [];
    s.playHead = 0;
  }

  /* ---------------- shared ---------------- */

  function stop() { if (active) cleanup(active, true); }

  function requestStop() {
    if (!active || active.closed) return;
    var s = active;
    s.btn.classList.add('is-pressed');
    s.btn.setAttribute('aria-busy', 'true');
    s.btn.textContent = 'Ending demo...';
    if (s.endBtn) {
      s.endBtn.classList.add('is-pressed');
      s.endBtn.setAttribute('aria-busy', 'true');
      s.endBtn.textContent = 'Ending...';
    }
    setStatus(s, 'Ending demo...');
    playClick();
    window.setTimeout(function () {
      if (active === s) stop();
    }, 120);
  }

  function cleanup(s, hangUp) {
    if (s.closed) return;
    s.closed = true;
    if (hangUp && s.client) { try { s.client.stopCall(); } catch (e) {} }
    if (hangUp && s.ws) { try { s.ws.close(); } catch (e) {} }
    if (s.proc) { try { s.proc.disconnect(); } catch (e) {} }
    if (s.stream) s.stream.getTracks().forEach(function (t) { t.stop(); });
    if (s.ctx) { try { s.ctx.close(); } catch (e) {} }
    s.btn.classList.remove('is-pressed');
    s.btn.removeAttribute('aria-busy');
    s.btn.textContent = s.defaultLabel;
    if (s.endBtn) {
      s.endBtn.classList.remove('is-pressed');
      s.endBtn.removeAttribute('aria-busy');
      s.endBtn.textContent = 'End demo';
    }
    active = null;
  }

  document.addEventListener('click', function (e) {
    if (e.target.classList && e.target.classList.contains('voice-end')) requestStop();
  });

  /* ---------------- audio helpers (Grok path) ---------------- */

  function resample(f32, from, to) {
    if (from === to) return f32;
    var ratio = from / to;
    var out = new Float32Array(Math.floor(f32.length / ratio));
    for (var i = 0; i < out.length; i++) {
      var pos = i * ratio, lo = Math.floor(pos), hi = Math.min(lo + 1, f32.length - 1);
      out[i] = f32[lo] + (f32[hi] - f32[lo]) * (pos - lo);
    }
    return out;
  }

  function b64FromPcm16(f32) {
    var i16 = new Int16Array(f32.length);
    for (var i = 0; i < f32.length; i++) {
      var v = Math.max(-1, Math.min(1, f32[i]));
      i16[i] = v < 0 ? v * 0x8000 : v * 0x7FFF;
    }
    var bytes = new Uint8Array(i16.buffer), bin = '';
    for (var j = 0; j < bytes.length; j += 0x8000) {
      bin += String.fromCharCode.apply(null, bytes.subarray(j, j + 0x8000));
    }
    return btoa(bin);
  }

  function pcm16FromB64(b64) {
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Int16Array(bytes.buffer);
  }
})();
