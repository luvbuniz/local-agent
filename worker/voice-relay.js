/**
 * Cloudflare Worker: keeps voice-provider API keys out of the browser.
 *
 * Two routes:
 *   POST /web-call?agent=<key>     → Retell web call (what the site uses today).
 *                                    Mints a short-lived access token.
 *   WebSocket upgrade ?agent=<key> → Grok realtime relay (kept as a fallback).
 *
 * Secrets live in the Cloudflare dashboard under
 *   Settings → Variables and secrets  (the RUNTIME section, not Build):
 *     RETELL_API_KEY   — required for the Retell route
 *     XAI_API_KEY      — only needed for the Grok fallback route
 */

// Retell agent IDs, one per demo card. Fill in as each agent is published.
const RETELL_AGENTS = {
  law: 'agent_4c77c6a8a5521ac1123fda3cec',   // Legal Intake Screener
  // salon: 'agent_...',
  // painter: 'agent_...',
  // roofing: 'agent_...',
  // insurance: 'agent_...',
};

// Grok agent IDs (fallback path).
const GROK_AGENTS = {
  law: 'agent_m9bI9TNJojkS84SO',
};

const ALLOWED_ORIGINS = [
  'https://bunillc.com',
  'https://www.bunillc.com',
  'https://luvbuniz.github.io',
];

const MAX_SESSION_MS = 5 * 60 * 1000;

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(body, origin, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const path = url.pathname.replace(/\/+$/, '');
    const agentKey = url.searchParams.get('agent');

    /* ---------------- Retell web call ---------------- */
    if (path === '/web-call') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders(origin || '*') });
      }
      if (!ALLOWED_ORIGINS.includes(origin)) {
        console.log(`[relay] REJECTED web-call: origin not allowed: ${origin}`);
        return json({ error: 'forbidden' }, origin || '*', 403);
      }
      const agentId = RETELL_AGENTS[agentKey];
      if (!agentId) {
        console.log(`[relay] REJECTED web-call: no Retell agent id for "${agentKey}"`);
        return json({ error: 'unknown agent' }, origin, 404);
      }
      if (!env.RETELL_API_KEY) {
        console.log('[relay] RETELL_API_KEY missing at runtime — add it under Settings → Variables and secrets (runtime, not Build)');
        return json({ error: 'not configured' }, origin, 500);
      }

      const resp = await fetch('https://api.retellai.com/v2/create-web-call', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RETELL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agent_id: agentId }),
      });

      if (!resp.ok) {
        let detail = '';
        try { detail = (await resp.text()).slice(0, 300); } catch (e) {}
        console.log(`[relay] Retell create-web-call failed: status=${resp.status} body=${detail}`);
        return json({ error: 'upstream', status: resp.status }, origin, 502);
      }

      const data = await resp.json();
      console.log(`[relay] web call created agent=${agentKey} call_id=${data.call_id}`);
      return json({ access_token: data.access_token, call_id: data.call_id }, origin);
    }

    /* ---------------- Grok realtime relay (fallback) ---------------- */
    // Accept either secret name — the dashboard secret is named X_API_KEY.
    const xaiKey = env.XAI_API_KEY || env.X_API_KEY;
    console.log(
      `[relay] upgrade=${request.headers.get('Upgrade')} origin=${origin} ` +
      `agent=${agentKey} keyPresent=${Boolean(xaiKey)}`,
    );

    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected a WebSocket connection.', { status: 426 });
    }
    if (!ALLOWED_ORIGINS.includes(origin)) {
      console.log(`[relay] REJECTED: origin not allowed: ${origin}`);
      return new Response('Forbidden', { status: 403 });
    }
    const grokId = GROK_AGENTS[agentKey];
    if (!grokId) {
      console.log(`[relay] REJECTED: unknown agent: ${agentKey}`);
      return new Response('Unknown agent', { status: 404 });
    }
    if (!xaiKey) {
      console.log('[relay] REJECTED: XAI_API_KEY / X_API_KEY missing at runtime');
      return new Response('Voice service not configured.', { status: 500 });
    }

    const upstreamResp = await fetch(
      `https://api.x.ai/v1/realtime?agent_id=${grokId}`,
      { headers: { Upgrade: 'websocket', Authorization: `Bearer ${xaiKey}` } },
    );
    const upstream = upstreamResp.webSocket;
    if (!upstream) {
      let body = '';
      try { body = (await upstreamResp.text()).slice(0, 300); } catch (e) {}
      console.log(`[relay] UPSTREAM FAILED: xAI status=${upstreamResp.status} body=${body}`);
      return new Response('Could not reach the voice service.', { status: 502 });
    }
    upstream.accept();

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();

    const closeBoth = () => {
      try { upstream.close(); } catch (e) {}
      try { server.close(); } catch (e) {}
    };
    server.addEventListener('message', (e) => {
      try { upstream.send(e.data); } catch (err) { closeBoth(); }
    });
    upstream.addEventListener('message', (e) => {
      try { server.send(e.data); } catch (err) { closeBoth(); }
    });
    server.addEventListener('close', closeBoth);
    server.addEventListener('error', closeBoth);
    upstream.addEventListener('close', closeBoth);
    upstream.addEventListener('error', closeBoth);
    setTimeout(closeBoth, MAX_SESSION_MS);

    return new Response(null, { status: 101, webSocket: client });
  },
};
