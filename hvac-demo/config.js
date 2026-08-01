/* Buni HVAC demo configuration. */
(function () {
  'use strict';

  var config = {
    voiceRelayUrl: 'https://grok-voice-relay.sullivanamy75.workers.dev',
    voiceAgentKey: 'hvac',
    voiceProvider: 'retell'
  };

  window.BUNI_HVAC_DEMO_CONFIG = Object.freeze(config);
  window.VOICE_RELAY_URL = config.voiceRelayUrl;
  window.VOICE_AGENTS = { hvac: config.voiceProvider, buni: 'retell' };
  window.CHAT_AGENTS = { hvac: true, buni: true };
  window.CHAT_AGENT_KEY = 'hvac';
})();
