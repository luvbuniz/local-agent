/* Buni HVAC demo configuration.
   Replace bookingUrl here when Amy's public booking page is ready. */
(function () {
  'use strict';

  var config = {
    bookingUrl: 'mailto:amy@bunillc.com?subject=Book%20a%2015-minute%20Buni%20HVAC%20voice%20demo',
    voiceRelayUrl: 'https://grok-voice-relay.sullivanamy75.workers.dev',
    voiceAgentKey: 'hvac',
    voiceProvider: 'retell'
  };

  window.BUNI_HVAC_DEMO_CONFIG = Object.freeze(config);
  window.VOICE_RELAY_URL = config.voiceRelayUrl;
  window.VOICE_AGENTS = { hvac: config.voiceProvider };
  window.CHAT_AGENTS = { hvac: true };
  window.CHAT_AGENT_KEY = 'hvac';
})();
