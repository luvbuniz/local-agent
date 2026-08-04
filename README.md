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

## Trade outreach landing pages

The focused prospect pages are:

- `https://bunillc.com/roofing-demo/`
- `https://bunillc.com/plumbing-demo/`
- `https://bunillc.com/hvac-demo/`
- `https://bunillc.com/gutter-demo/`
- `https://bunillc.com/electrical-demo/`
- `https://bunillc.com/remodeling-demo/`
- `https://bunillc.com/mechanic-demo/`
- `https://bunillc.com/dental-demo/`

They reuse the Retell browser-call and text-chat implementations in `voice-demo.js` and `chat-demo.js`. The Cloudflare Worker maps each trade key to the matching published Retell voice and chat agents while keeping the API key and agent IDs out of browser code.

Each page has one small `config.js` file containing its relay and trade-agent settings. A manual Buni scheduler appears immediately before the closing panel, followed by the softer option to ask Bree a question by voice or text. The public event is `https://cal.com/amy-sullivan-xfxic7/buni-walkthrough`; its one browser-side configuration value is `SCHEDULER_LINK` in `scheduler.js`. Update that value and the visible fallback links if the public event changes.

The shared Buni assistant prompt and conservative reference are `agents/buni-bree-scheduler-prompt.md` and `agents/buni-bree-knowledge-base.md`. Agent IDs remain server-side in `worker/voice-relay.js` under the `buni` key. Bree must never name the underlying voice, chat, calendar, or model vendors to a visitor.

The Buni voice and website-chat agents use Retell's built-in Cal.com availability and booking tools with the 15-minute `Free 15-minute Buni walkthrough` event connected to Amy's Google Calendar. The booking function is deliberately named `book_only_after_explicit_yes`: Bree must state the weekday and full numbered date and wait for an explicit yes before checking availability, ask whether mornings or afternoons are better when no time preference was provided, treat either answer as enough information to check the calendar, turn any returned free interval into one valid 15-minute start-time suggestion without describing Amy's full availability window, offer a second specific time only if the visitor declines the first, collect and read back a visitor-provided phone number, spell or display and confirm the exact email, collect the remaining business details, repeat the full booking recap, ask for final confirmation, and receive an explicit yes before booking. The availability check, explicit-confirmation gate, booking creation, Google-connected Cal.com record, cancellation cleanup, and post-rotation availability check were tested end to end on August 1, 2026. The added date, phone, and email read-back behavior was separately tested through controlled Retell simulations without creating another appointment. The strict date-first flow, morning-or-afternoon question, single exact time offer, and one-at-a-time alternate were also verified in controlled Retell simulations without creating an appointment on August 1, 2026.

The Cal.com API key is stored only inside the two Retell agents and remains absent from this repository and browser code. If the Cal.com event or key is replaced, update both Bree agents, publish new versions, and repeat the guarded booking test before describing scheduling as live. If either tool fails, Bree is instructed to say that she could not confirm the calendar and collect details for Amy's follow-up instead.

Successful bookings send separate confirmation emails to the Buni organizer address and the visitor-provided email address. The visitor copy includes a calendar event and downloadable ICS invitations, plus reschedule and cancellation links; Cal.com's confirmation screen also offers Google Calendar, Outlook, Microsoft 365, and ICS add-to-calendar options. This host-and-guest email flow was verified in the `amy@bunillc.com` Workspace inbox using a controlled guest alias on August 1, 2026. Bree may describe the calendar invitation only after the booking tool returns success.

The public Cal.com form requires name, email, and phone number. Retell supports SMS, but Buni's appointment-text workflow is not configured or verified yet, so Bree must not promise a text confirmation. Sending from Buni's own number requires an SMS-capable Retell/Twilio number and the applicable A2P approval; Retell's shared approved-number option is in-call only and uses a fixed message template.

The plumbing source prompt and safety reference are in `agents/harbor-flow-plumbing-prompt.md` and `agents/harbor-flow-plumbing-knowledge-base.md`. The gutter equivalents are in `agents/coastal-catch-gutters-prompt.md` and `agents/coastal-catch-gutters-knowledge-base.md`. The HVAC page reuses the existing published Coastal Comfort agent and its files in `agents/coastal-comfort-hvac-*`.

The electrical demo uses `agents/brightline-electric-prompt.md` and `agents/brightline-electric-knowledge-base.md`. The remodeling demo uses `agents/coastal-craft-remodeling-prompt.md` and `agents/coastal-craft-remodeling-knowledge-base.md`. Both are fictional, reusable examples and avoid promising booking, CRM delivery, texting, estimates, or dispatch.

The mechanic demo uses `agents/bayline-auto-care-prompt.md` and
`agents/bayline-auto-care-knowledge-base.md`. It is a fictional auto-shop
intake example with safety-first handling for crashes, roadway danger, smoke,
overheating, brakes, and steering. Its published voice agent is configured for
exactly English (US) and Spanish (Latin America), mapped server-side by the
Worker's `mechanic` key, and enabled in `mechanic-demo/config.js`. The separate
mechanic text demo uses `agents/bayline-auto-care-chat-prompt.md`; its published
chat agent is mapped server-side by the Worker's `mechanic` key and enabled in
`mechanic-demo/config.js`.

The dental demo uses `agents/harbor-smile-dental-prompt.md`,
`agents/harbor-smile-dental-chat-prompt.md`, and
`agents/harbor-smile-dental-knowledge-base.md`. It is a fictional public demo
for overflow and after-hours intake. The voice and chat agents are configured
for English (US) and Spanish (Latin America), keep replies to two short
sentences, and do not diagnose, book, verify benefits, access records, or accept
real patient information. Published agent IDs remain server-side under the
Worker's `dental` key and are enabled in `dental-demo/config.js`.

Retell states that a signed BAA is required before transmitting PHI; sign it at
`https://click-agreements.retellai.com/` and then follow Retell's current
compliance configuration guide. A production dental deployment also needs a
BAA with the dental practice and appropriate agreements and secure configuration
for every service that will handle PHI. The public demo must remain fictional
until those requirements and the complete workflow are reviewed and tested.

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

## Main-site Buni chat

The main-site `Questions?` bubble opens the `buni` text agent through the same Cloudflare relay as the trade demos. The browser receives only a short-lived chat ID; the Retell API key and agent ID remain in the Worker.

## Point a custom domain at GitHub Pages

1. **Settings → Pages → Custom domain** → enter `www.yourdomain.com` → Save
   (this creates a `CNAME` file in the repo).
2. At your domain registrar, add a **CNAME record**: `www` → `luvbuniz.github.io`.
3. For the bare domain (`yourdomain.com`), add **A records** pointing to
   GitHub Pages' IPs: `185.199.108.153`, `185.199.109.153`,
   `185.199.110.153`, `185.199.111.153`.
4. Back in Settings → Pages, tick **Enforce HTTPS** once the certificate is ready
   (can take up to an hour).
