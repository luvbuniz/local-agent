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

const AGENTS = {
  law: 'agent_m9bI9TNJojkS84SO',
};

const ALLOWED_ORIGINS = [
  'https://bunillc.com',
  'https://www.bunillc.com',
  'https://luvbuniz.github.io',
];

const MAX_SESSION_MS = 5 * 60 * 1000;

export default {
  async fetch(request, env) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected a WebSocket connection.', { status: 426 });
    }

    const origin = request.headers.get('Origin');
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new Response('Forbidden', { status: 403 });
    }

    const agentKey = new URL(request.url).searchParams.get('agent');
    const agentId = AGENTS[agentKey];
    if (!agentId) {
      return new Response('Unknown agent', { status: 404 });
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
