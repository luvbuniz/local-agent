(function () {
  'use strict';

  var config = window.BUNI_GUTTER_DEMO_CONFIG;
  if (!config) return;

  document.querySelectorAll('[data-booking-link]').forEach(function (link) {
    link.setAttribute('href', config.bookingUrl);
  });
})();
