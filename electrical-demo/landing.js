(function () {
  'use strict';

  var config = window.BUNI_ELECTRICAL_DEMO_CONFIG;
  if (!config) return;

  document.querySelectorAll('[data-booking-link]').forEach(function (link) {
    link.setAttribute('href', config.bookingUrl);
  });
})();
