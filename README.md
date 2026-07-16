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

## Turn on the in-page voice demo (Grok)

The law demo card has a hidden "🎙 Or talk to it right here" button. It talks
to your Grok voice agent through a tiny Cloudflare Worker relay so your xAI
API key never appears in the site code. Two steps:

1. **Deploy the relay** (one time, ~3 minutes):
   - Cloudflare dashboard → **Workers & Pages → Create → Worker**
   - Paste the contents of `worker/grok-voice-relay.js` and **Deploy**
   - **Settings → Variables and Secrets** → add a **secret** named
     `XAI_API_KEY` with your xAI API key
   - Copy the worker's URL (looks like `https://grok-voice-relay.YOURNAME.workers.dev`)
2. **Point the site at it:** in `index.html`, find
   `window.GROK_RELAY_URL = ""` near the bottom and paste the worker URL
   between the quotes. Push — the button appears.

Notes:
- The relay only accepts connections from bunillc.com and only exposes the
  agents whitelisted in `worker/grok-voice-relay.js` (add more to the
  `AGENTS` map — e.g. a roofing agent — and give the card's button a
  matching `data-voice-agent` attribute).
- Sessions are hard-capped at 5 minutes each to protect your xAI bill.
- Never paste the xAI API key itself into `index.html` or anywhere in this
  repo — it belongs only in the Worker secret.

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
