(function () {
  'use strict';

  // Public booking page. Replaces the previous Cal.com embed.
  var BOOKING_URL = 'https://calendar.app.google/28cgSSKEuwE3B3qs8';

  var links = document.querySelectorAll('[data-booking-link]');
  for (var i = 0; i < links.length; i++) {
    links[i].setAttribute('href', BOOKING_URL);
  }

  var target = document.querySelector('[data-buni-scheduler]');
  if (!target || target.querySelector('[data-booking-link]')) return;

  target.classList.add('is-booking-link');
  var note = document.createElement('p');
  note.textContent = 'Pick a time on Buni’s booking page. It opens in a new tab.';
  var link = document.createElement('a');
  link.className = 'booking-button';
  link.href = BOOKING_URL;
  link.target = '_blank';
  link.rel = 'noopener';
  link.setAttribute('data-booking-link', '');
  link.textContent = 'Book a 15-minute intro call';
  target.appendChild(note);
  target.appendChild(link);
})();
