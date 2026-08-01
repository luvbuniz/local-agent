(function () {
  'use strict';

  // Replace this one value if Buni's public scheduling event changes.
  var SCHEDULER_LINK = 'amy-sullivan-xfxic7/buni-walkthrough';
  var target = document.querySelector('[data-buni-scheduler]');

  if (!target) return;

  (function (C, A, L) {
    var push = function (api, args) { api.q.push(args); };
    var doc = C.document;

    C.Cal = C.Cal || function () {
      var cal = C.Cal;
      var args = arguments;

      if (!cal.loaded) {
        cal.ns = {};
        cal.q = cal.q || [];
        doc.head.appendChild(doc.createElement('script')).src = A;
        cal.loaded = true;
      }

      if (args[0] === L) {
        var api = function () { push(api, arguments); };
        var namespace = args[1];
        api.q = api.q || [];

        if (typeof namespace === 'string') {
          cal.ns[namespace] = cal.ns[namespace] || api;
          push(cal.ns[namespace], args);
          push(cal, ['initNamespace', namespace]);
        } else {
          push(cal, args);
        }
        return;
      }

      push(cal, args);
    };
  })(window, 'https://app.cal.com/embed/embed.js', 'init');

  window.Cal('init', 'buni-walkthrough', { origin: 'https://app.cal.com' });
  window.Cal.config = window.Cal.config || {};
  window.Cal.config.forwardQueryParams = true;
  window.Cal.ns['buni-walkthrough']('inline', {
    elementOrSelector: '[data-buni-scheduler]',
    config: {
      layout: 'month_view',
      useSlotsViewOnSmallScreen: 'true'
    },
    calLink: SCHEDULER_LINK
  });
  window.Cal.ns['buni-walkthrough']('ui', {
    hideEventTypeDetails: false,
    layout: 'month_view'
  });
})();
