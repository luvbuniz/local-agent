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
  buni: 'agent_aa080b4913c0076ee8fb5e2211',  // Bree - Buni Questions and Scheduler
  law: 'agent_e1baa529b6316a3e2d2ee1c46c',   // Meridian Family Law Demo
  salon: 'agent_ccbadfffc1b8af1d4a5325ec14',  // Aster & Ash Salon Demo
  hvac: 'agent_af80256e0fca866e3d35d3418e',  // Coastal Comfort HVAC Demo
  electrical: 'agent_62f9b39fd5563191203e61e7fa',  // Brightline Electric Demo
  gutter: 'agent_74158d6d3b4e9ed6e31e76e04f',  // Coastal Catch Gutters Demo
  plumbing: 'agent_d16a844d76bd59505a00092b7e',  // Harbor Flow Plumbing Demo
  remodeling: 'agent_a17421f7fb1ff23a8d31863fab',  // Coastal Craft Remodeling Demo
  mechanic: 'agent_0a1a876cf271220374539f3cf9',  // Bayline Auto Care Demo
  dental: 'agent_25d4054798f5020e37eabea045',  // Harbor Smile Dental Demo
  roofing: 'agent_48deacf6eeb9b85ad57e6b2a04',  // Suncoast Roofing Demo
  insurance: 'agent_fd6462aa808fb206a445768896',  // Harborlight Insurance Demo
};

// Retell chat agents, used by the text-only website chat.
const CHAT_AGENTS = {
  buni: 'agent_eb56371e0caeb7fbb734a84999',  // Bree - Buni Website Chat
  law: 'agent_bb3b3bc5dc1cecab334cb21c91',  // Meridian Family Law Text Chat
  salon: 'agent_ca006d2cb1d654773f742b9dcc',  // Aster & Ash Salon Text Chat
  hvac: 'agent_4da492dd5554162c71807049a9',  // Coastal Comfort HVAC Text Chat
  electrical: 'agent_e5affa32c56da8c5dadb4f3cd7',  // Brightline Electric Text Chat
  gutter: 'agent_860b479a0e1e76bbfa95647c4f',  // Coastal Catch Gutters Text Chat
  plumbing: 'agent_badd924a15721dbdc4a67d58cd',  // Harbor Flow Plumbing Text Chat
  remodeling: 'agent_8e5e4677493f7012aa11f1a40d',  // Coastal Craft Remodeling Text Chat
  mechanic: 'agent_bc5e14e060d663d129a98a6cfd',  // Bayline Auto Care Text Chat
  dental: 'agent_35b2c25a9356a39d294c180911',  // Harbor Smile Dental Text Chat
  roofing: 'agent_863274eb8a64e80d0b8a2557e9',  // Suncoast Roofing Text Chat
  insurance: 'agent_277aeaf686af4cd2ed3d87bdd4',  // Harborlight Insurance Text Chat
};

// Grok agent IDs.
const GROK_AGENTS = {
  roofing: 'agent_Boxggw1E8dEMdNcv',
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

async function retellRequest(path, env, init = {}) {
  const headers = {
    Authorization: `Bearer ${env.RETELL_API_KEY}`,
    'Content-Type': 'application/json',
    ...(init.headers || {}),
  };
  return fetch(`https://api.retellai.com${path}`, { ...init, headers });
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

    /* ---------------- Retell text chat ---------------- */
    if (path === '/chat/start' || path === '/chat/message') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders(origin || '*') });
      }
      if (request.method !== 'POST') {
        return json({ error: 'method not allowed' }, origin || '*', 405);
      }
      if (!ALLOWED_ORIGINS.includes(origin)) {
        console.log(`[relay] REJECTED chat: origin not allowed: ${origin}`);
        return json({ error: 'forbidden' }, origin || '*', 403);
      }
      if (!env.RETELL_API_KEY) {
        console.log('[relay] RETELL_API_KEY missing at runtime');
        return json({ error: 'not configured' }, origin, 500);
      }

      const chatAgentId = CHAT_AGENTS[agentKey];
      if (!chatAgentId) {
        return json({ error: 'unknown agent' }, origin, 404);
      }

      let payload = {};
      try {
        payload = await request.json();
      } catch (e) {
        return json({ error: 'invalid json' }, origin, 400);
      }

      if (path === '/chat/start') {
        const resp = await retellRequest('/create-chat', env, {
          method: 'POST',
          body: JSON.stringify({
            agent_id: chatAgentId,
            metadata: { source: 'buni_web_demo', vertical: agentKey },
          }),
        });
        if (!resp.ok) {
          const detail = (await resp.text()).slice(0, 300);
          console.log(`[relay] Retell create-chat failed: status=${resp.status} body=${detail}`);
          return json({ error: 'upstream', status: resp.status }, origin, 502);
        }
        const data = await resp.json();
        return json({ chat_id: data.chat_id }, origin, 201);
      }

      const chatId = typeof payload.chat_id === 'string' ? payload.chat_id.trim() : '';
      const content = typeof payload.content === 'string' ? payload.content.trim() : '';
      if (!chatId || !content || content.length > 2000) {
        return json({ error: 'invalid message' }, origin, 400);
      }

      const resp = await retellRequest('/create-chat-completion', env, {
        method: 'POST',
        body: JSON.stringify({ chat_id: chatId, content }),
      });
      if (!resp.ok) {
        const detail = (await resp.text()).slice(0, 300);
        console.log(`[relay] Retell chat completion failed: status=${resp.status} body=${detail}`);
        return json({ error: 'upstream', status: resp.status }, origin, 502);
      }
      const data = await resp.json();
      const messages = Array.isArray(data.messages)
        ? data.messages
            .filter((message) => message && message.role === 'agent')
            .map((message) => ({ role: 'agent', content: String(message.content || '') }))
        : [];
      return json({ messages }, origin);
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

