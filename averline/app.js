(function () {
  'use strict';

  var config = window.AVERLINE_CONFIG || {};
  var header = document.querySelector('[data-site-header]');
  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-primary-nav]');

  function setHeaderState() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }

  function closeNavigation() {
    if (!navToggle || !nav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      nav.classList.toggle('is-open', !isOpen);
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNavigation);
    });
  }

  window.addEventListener('scroll', setHeaderState, { passive: true });
  setHeaderState();

  var demoBaseUrl = String(config.demoBaseUrl || '').replace(/\/+$/, '');
  if (demoBaseUrl) {
    document.querySelectorAll('[data-demo-path]').forEach(function (link) {
      link.href = demoBaseUrl + '/' + String(link.getAttribute('data-demo-path') || '').replace(/^\/+/, '');
    });
  }

  var email = config.contactEmail || 'amy@bunillc.com';
  document.querySelectorAll('[data-contact-link]').forEach(function (link) {
    link.href = 'mailto:' + email + '?subject=' + encodeURIComponent('Averline pilot inquiry');
  });

  var checkoutUrls = config.checkoutUrls || {};
  document.querySelectorAll('[data-plan]').forEach(function (link) {
    var plan = link.getAttribute('data-plan');
    var checkoutUrl = checkoutUrls[plan];
    if (checkoutUrl) {
      link.href = checkoutUrl;
      link.textContent = 'Choose ' + plan;
      link.rel = 'noopener';
    } else {
      link.href = 'mailto:' + email + '?subject=' + encodeURIComponent('Averline ' + plan + ' pilot');
    }
  });

  document.querySelectorAll('[data-current-year]').forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });
})();

