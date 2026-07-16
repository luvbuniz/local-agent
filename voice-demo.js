/* Buni — in-page voice demo (Grok realtime via the Cloudflare Worker relay).
   Buttons with [data-voice-agent] stay hidden until GROK_RELAY_URL is set
   in index.html, so the site works fine before the worker is deployed. */
(function () {
  'use strict';

  var RELAY_URL = window.GROK_RELAY_URL || '';
  var RATE = 24000; // PCM16 sample rate the realtime API speaks

  if (!RELAY_URL) return; // not configured yet — leave buttons hidden

  document.querySelectorAll('[data-voice-agent]').forEach(function (btn) {
    btn.hidden = false;
    btn.addEventListener('click', function () { start(btn); });
  });

  var active = null; // one session at a time

  function start(btn) {
    if (active) { stop(); return; }

    var card = btn.closest('.demo-card');
    var panel = card.querySelector('.voice-panel');
    var statusEl = panel.querySelector('.voice-status');
    var transcriptEl = panel.querySelector('.voice-transcript');
    panel.hidden = false;
    transcriptEl.textContent = '';
    setStatus('Asking for your microphone…');
    btn.textContent = '⏹ End the voice demo';

    var session = {
      btn: btn, panel: panel, ws: null, ctx: null, stream: null,
      proc: null, playHead: 0, sources: [], closed: false,
    };
    active = session;

    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    session.ctx = new AudioCtx();
    session.ctx.resume();

    navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    }).then(function (stream) {
      if (session.closed) { stream.getTracks().forEach(function (t) { t.stop(); }); return; }
      session.stream = stream;
      connect(session);
    }).catch(function () {
      setStatus('Microphone blocked — allow it in your browser and try again.');
      cleanup(session, true);
    });

    function setStatus(msg) { statusEl.textContent = msg; }

    function connect(s) {
      setStatus('Connecting…');
      var agent = s.btn.getAttribute('data-voice-agent');
      var ws = new WebSocket(RELAY_URL.replace(/^http/, 'ws') + '?agent=' + agent);
      s.ws = ws;

      ws.onopen = function () {
        setStatus('🎙 Connected — say hello!');
        sendMic(s);
      };

      ws.onmessage = function (raw) {
        var ev;
        try { ev = JSON.parse(raw.data); } catch (e) { return; }
        if (window.console && console.debug) console.debug('[voice]', ev.type, ev);

        if (ev.type === 'response.output_audio.delta') {
          playDelta(s, ev.delta);
        } else if (ev.type === 'response.output_audio_transcript.delta') {
          transcriptEl.textContent += ev.delta;
          transcriptEl.scrollTop = transcriptEl.scrollHeight;
        } else if (ev.type === 'response.output_audio_transcript.done') {
          transcriptEl.textContent += '\n';
        } else if (ev.type === 'input_audio_buffer.speech_started') {
          bargeIn(s); // caller started talking — hush the agent
        } else if (ev.type === 'error') {
          setStatus('Something hiccuped — try again in a moment.');
        }
      };

      ws.onclose = function () {
        if (!s.closed) { setStatus('Demo ended. Thanks for trying it!'); cleanup(s, false); }
      };
      ws.onerror = function () {
        setStatus('Could not connect — please try again later.');
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
        s.ws.send(JSON.stringify({
          type: 'input_audio_buffer.append',
          audio: b64FromPcm16(f32),
        }));
      };
      src.connect(proc);
      proc.connect(s.ctx.destination); // required for onaudioprocess to fire
    }

    function playDelta(s, b64) {
      var i16 = pcm16FromB64(b64);
      var f32 = new Float32Array(i16.length);
      for (var i = 0; i < i16.length; i++) f32[i] = i16[i] / 32768;
      var buf = s.ctx.createBuffer(1, f32.length, RATE);
      buf.getChannelData(0).set(f32);
      var srcNode = s.ctx.createBufferSource();
      srcNode.buffer = buf;
      srcNode.connect(s.ctx.destination);
      s.playHead = Math.max(s.ctx.currentTime, s.playHead);
      srcNode.start(s.playHead);
      s.playHead += buf.duration;
      s.sources.push(srcNode);
      srcNode.onended = function () {
        var idx = s.sources.indexOf(srcNode);
        if (idx > -1) s.sources.splice(idx, 1);
      };
    }

    function bargeIn(s) {
      s.sources.forEach(function (n) { try { n.stop(); } catch (e) {} });
      s.sources = [];
      s.playHead = 0;
    }
  }

  function stop() { if (active) cleanup(active, true); }

  function cleanup(s, closeWs) {
    if (s.closed) return;
    s.closed = true;
    if (closeWs && s.ws) { try { s.ws.close(); } catch (e) {} }
    if (s.proc) { try { s.proc.disconnect(); } catch (e) {} }
    if (s.stream) s.stream.getTracks().forEach(function (t) { t.stop(); });
    if (s.ctx) { try { s.ctx.close(); } catch (e) {} }
    s.btn.textContent = '🎙 Or talk to it right here';
    active = null;
  }

  document.addEventListener('click', function (e) {
    if (e.target.classList && e.target.classList.contains('voice-end')) stop();
  });

  /* ---- audio helpers ---- */

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
