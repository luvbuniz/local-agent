/**
 * Cloudflare Worker: relay between the Buni site and xAI's Grok realtime
 * voice API. Keeps XAI_API_KEY out of the browser.
 *
 * Deploy (Cloudflare dashboard):
 *   Workers & Pages → Create → Worker → paste this file → Deploy
 *   Settings → Variables and Secrets → add secret XAI_API_KEY
 *   Copy the worker URL (https://….workers.dev) into index.html's
 *   GROK_RELAY_URL.
 *
 * The browser connects here with ?agent=<key>; only agents listed in
 * AGENTS below are reachable. Sessions are hard-capped at 5 minutes.
 */

// One entry per live voice agent. As each new agent is created in the
// xAI console, paste its ID here AND add its key to VOICE_AGENTS in
// index.html. Ready-to-paste agent prompts: agents/voice-agent-prompts.md
const AGENTS = {
  law: 'agent_m9bI9TNJojkS84SO',
  // salon: 'agent_...',
  // painter: 'agent_...',
  // roofing: 'agent_...',
  // insurance: 'agent_...',
};

const ALLOWED_ORIGINS = [
  'https://bunillc.com',
  'https://www.bunillc.com',
  'https://luvbuniz.github.io',
];

const MAX_SESSION_MS = 5 * 60 * 1000;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const agentKey = new URL(request.url).searchParams.get('agent');
    console.log(
      `[relay] upgrade=${request.headers.get('Upgrade')} origin=${origin} ` +
      `agent=${agentKey} keyPresent=${Boolean(env.XAI_API_KEY)}`,
    );

    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected a WebSocket connection.', { status: 426 });
    }

    if (!ALLOWED_ORIGINS.includes(origin)) {
      console.log(`[relay] REJECTED: origin not allowed: ${origin}`);
      return new Response('Forbidden', { status: 403 });
    }

    const agentId = AGENTS[agentKey];
    if (!agentId) {
      console.log(`[relay] REJECTED: unknown agent: ${agentKey}`);
      return new Response('Unknown agent', { status: 404 });
    }

    if (!env.XAI_API_KEY) {
      console.log('[relay] REJECTED: XAI_API_KEY missing at runtime — add it under Settings → Variables and secrets (the runtime section, not Build)');
      return new Response('Voice service not configured.', { status: 500 });
    }

    const upstreamResp = await fetch(
      `https://api.x.ai/v1/realtime?agent_id=${agentId}`,
      {
        headers: {
          Upgrade: 'websocket',
          Authorization: `Bearer ${env.XAI_API_KEY}`,
        },
      },
    );
    const upstream = upstreamResp.webSocket;
    if (!upstream) {
      let body = '';
      try { body = (await upstreamResp.text()).slice(0, 300); } catch (e) {}
      console.log(`[relay] UPSTREAM FAILED: xAI answered status=${upstreamResp.status} body=${body}`);
      return new Response('Could not reach the voice service.', { status: 502 });
    }
    console.log('[relay] connected to xAI, piping');
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
