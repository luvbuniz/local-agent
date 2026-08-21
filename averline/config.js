/* Public Averline site configuration. Never place provider or Stripe secrets here. */
(function () {
  'use strict';

  window.AVERLINE_CONFIG = Object.freeze({
    contactEmail: 'amy@bunillc.com',
    legalCompany: 'Buni LLC',
    demoBaseUrl: 'https://bunillc.com',

    /* Add Stripe-hosted checkout URLs only after the full purchase,
       provisioning, cancellation, and failed-payment paths are tested. */
    checkoutUrls: Object.freeze({
      essentials: '',
      growth: '',
      operations: '',
    }),
  });
})();

