# Buni — Local Business Site

Single-page static site for Buni LLC. No build step — just `index.html` + `style.css`.

## Put it on GitHub Pages

1. Copy `index.html`, `style.css`, and this `README.md` into the root of your repo (e.g. `luvbuniz/local-agent`).
2. Commit and push (or drag the files into the repo on github.com → "Add file → Upload files").
3. On github.com: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / root → Save.**
4. Your site appears at `https://luvbuniz.github.io/local-agent/` in a minute or two.

## Swap the placeholder demo numbers

Every demo number placeholder is `941-555-0100`, in two forms:
- Display text: `941-555-0100`
- Links: `tel:9415550100`

Each demo card has its **own** number in the "Try this demo" link — swap
each card's display text and `tel:` href with that industry's demo line.
The hero button and the final CTA share one general demo number; swap
those two the same way.

## Swap the booking link

Find & replace `https://calendly.com/PLACEHOLDER` with your real Calendly URL (3 places).

## Trade outreach landing pages

The focused prospect pages are:

- `https://bunillc.com/roofing-demo/`
- `https://bunillc.com/plumbing-demo/`
- `https://bunillc.com/hvac-demo/`
- `https://bunillc.com/gutter-demo/`
- `https://bunillc.com/electrical-demo/`
- `https://bunillc.com/remodeling-demo/`

They reuse the Retell browser-call and text-chat implementations in `voice-demo.js` and `chat-demo.js`. The Cloudflare Worker maps each trade key to the matching published Retell voice and chat agents while keeping the API key and agent IDs out of browser code.

Each page has one small `config.js` file containing its walkthrough URL. The CTA currently uses a temporary `mailto:amy@bunillc.com` link. Replace only `bookingUrl` in the applicable page configuration when Amy's real public booking page is ready.

The plumbing source prompt and safety reference are in `agents/harbor-flow-plumbing-prompt.md` and `agents/harbor-flow-plumbing-knowledge-base.md`. The gutter equivalents are in `agents/coastal-catch-gutters-prompt.md` and `agents/coastal-catch-gutters-knowledge-base.md`. The HVAC page reuses the existing published Coastal Comfort agent and its files in `agents/coastal-comfort-hvac-*`.

The electrical demo uses `agents/brightline-electric-prompt.md` and `agents/brightline-electric-knowledge-base.md`. The remodeling demo uses `agents/coastal-craft-remodeling-prompt.md` and `agents/coastal-craft-remodeling-knowledge-base.md`. Both are fictional, reusable examples and avoid promising booking, CRM delivery, texting, estimates, or dispatch.

The gutter intake was researched as its own home-services vertical. Retell does not currently surface a gutter-specific public template; its closest public example is the [High-Intent Lead Screener](https://www.retellai.com/templates/high-intent-lead-screener) for home-services leads. The Buni demo borrows the narrow intake pattern but intentionally does not claim that booking, transfer, CRM updates, texting, estimates, or dispatch work.

## Add or remove a demo vertical

Each vertical is one self-contained block in `index.html` between the
`DEMO CARDS` comments:

```html
<div class="demo-card" data-tab="Roofing">
  ...
</div>
```

- **Remove:** delete the whole block. The tab disappears automatically.
- **Add:** copy any block, paste it next to the others, change `data-tab`
  (that's the tab label), the pain line, blurb, and demo number.

## Edit a "How it works" expander

Each demo card ends with a `<details class="demo-how">` block — the
per-industry expander with the worry line, the four steps, the tools list,
and the safety-rail line. It's plain HTML: edit the text in place. To add
one to a new vertical, copy the whole `<details>` block from any card.

## Add your photo

In the "Hi, I'm Amy" section, replace the placeholder div with:

```html
<img src="amy.jpg" alt="Amy Sullivan">
```

and put `amy.jpg` in the repo root.

## Turn on the in-page voice demo (Retell)

Each demo card has a hidden "🎙 Or talk to it right here" button. It runs a
Retell **web call** in the browser and shows a live transcript. The Retell
API key stays in the Cloudflare Worker — never in the site code.

Three steps per agent:

1. **Publish the agent in Retell** and copy its `agent_id`.
   (An exported JSON has `agent_id: ""` — you only get a real ID once the
   agent is saved/published in the dashboard.)
2. **Add the ID to the relay:** `worker/voice-relay.js` → `RETELL_AGENTS`,
   e.g. `law: 'agent_abc123'`. Pushing redeploys the worker automatically.
3. **Enable the button:** `index.html` → `window.VOICE_AGENTS = ["law"]`.

One-time setup, if not already done:
- Worker → **Settings → Variables and secrets** (the **runtime** section,
  not Build) → add a **Secret** named `RETELL_API_KEY`.
- Confirm `window.VOICE_RELAY_URL` in `index.html` matches the worker URL.

Notes:
- The relay only answers requests from bunillc.com and only for agents
  listed in `RETELL_AGENTS`.
- The browser loads Retell's SDK from esm.sh at call time — the only
  external dependency besides Google Fonts.
- The Grok WebSocket relay is still in `worker/voice-relay.js` as a
  fallback; it needs `XAI_API_KEY` instead.
- Ready-to-paste agent prompts for the other industries live in
  `agents/voice-agent-prompts.md`.
- Never paste an API key into `index.html` or anywhere in this repo — keys
  belong only in the Worker's runtime secrets.

## Wire up the real chat widget

Replace the contents of `<div class="chat-panel-body">` at the bottom of
`index.html` with your widget's embed snippet — or delete the whole
`.chat-panel` + `.chat-bubble` block and let your widget provider's script
add its own bubble.

## Point a custom domain at GitHub Pages

1. **Settings → Pages → Custom domain** → enter `www.yourdomain.com` → Save
   (this creates a `CNAME` file in the repo).
2. At your domain registrar, add a **CNAME record**: `www` → `luvbuniz.github.io`.
3. For the bare domain (`yourdomain.com`), add **A records** pointing to
   GitHub Pages' IPs: `185.199.108.153`, `185.199.109.153`,
   `185.199.110.153`, `185.199.111.153`.
4. Back in Settings → Pages, tick **Enforce HTTPS** once the certificate is ready
   (can take up to an hour).
