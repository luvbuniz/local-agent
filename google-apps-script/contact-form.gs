/**
 * bunillc.com contact form -> Buni's Google Workspace inbox.
 *
 * Setup (once, signed in to the Buni Google Workspace account):
 *   1. Go to https://script.google.com -> New project. Name it "bunillc.com contact form".
 *   2. Replace the editor contents with this file and click Save.
 *   3. Deploy -> New deployment -> type "Web app".
 *        Execute as: Me    Who has access: Anyone
 *   4. Approve the permission prompt (it only needs to send email as you).
 *   5. Copy the Web app URL (ends in /exec) and put it in index.html:
 *        <form ... id="contact-form" data-endpoint="PASTE_URL_HERE" ...>
 *
 * Until data-endpoint is set, the form falls back to opening a pre-filled email.
 */
var TO = 'contact@bunillc.com';

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.website) return json_({ ok: true }); // honeypot: bots fill hidden field

  var required = ['name', 'organization', 'email', 'topic', 'message'];
  for (var i = 0; i < required.length; i++) {
    if (!String(p[required[i]] || '').trim()) return json_({ ok: false, error: 'Missing ' + required[i] });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) return json_({ ok: false, error: 'Invalid email' });

  var body = [
    'Name: ' + clip_(p.name, 200),
    'Organization: ' + clip_(p.organization, 200),
    'Email: ' + clip_(p.email, 200),
    'Phone: ' + clip_(p.phone, 50),
    'Role: ' + clip_(p.role, 100),
    'Topic: ' + clip_(p.topic, 100),
    '',
    clip_(p.message, 5000),
    '',
    '(Sent from the contact form on bunillc.com)'
  ].join('\n');

  MailApp.sendEmail({
    to: TO,
    replyTo: clip_(p.email, 200),
    subject: 'Website inquiry: ' + clip_(p.topic, 80) + ' (' + clip_(p.organization, 120) + ')',
    body: body,
    name: 'bunillc.com contact form'
  });
  return json_({ ok: true });
}

function clip_(value, max) {
  return String(value || '').replace(/[\r\n]+/g, max > 1000 ? '\n' : ' ').slice(0, max);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
