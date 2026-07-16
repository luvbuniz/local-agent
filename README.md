# Buni — Local Business Site

Single-page static site for Buni LLC. No build step — just `index.html` + `style.css`.

## Put it on GitHub Pages

1. Copy `index.html`, `style.css`, and this `README.md` into the root of your repo (e.g. `luvbuniz/local-agent`).
2. Commit and push (or drag the files into the repo on github.com → "Add file → Upload files").
3. On github.com: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / root → Save.**
4. Your site appears at `https://luvbuniz.github.io/local-agent/` in a minute or two.

## Swap the placeholder phone number

The demo number `941-555-0100` appears in two forms:
- Display text: `941-555-0100`
- Links: `tel:9415550100`

Find & replace **both** in `index.html` (any text editor: Ctrl/Cmd+H).

## Swap the booking link

Find & replace `https://calendly.com/PLACEHOLDER` with your real Calendly URL (3 places).

## Add a Loom video to a demo card

In a demo card, replace the placeholder line inside `.video-slot`:

```html
<div class="video-slot">loom demo video — salon &amp; spa</div>
```

with:

```html
<div class="video-slot">
  <iframe src="https://www.loom.com/embed/YOUR_VIDEO_ID" allowfullscreen></iframe>
</div>
```

(Get the ID from Loom's Share → Embed.)

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
