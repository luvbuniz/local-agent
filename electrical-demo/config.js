/* Buni electrical demo configuration. */
(function () {
  'use strict';

  var config = {
    voiceRelayUrl: 'https://grok-voice-relay.sullivanamy75.workers.dev',
    voiceAgentKey: 'electrical',
    voiceProvider: 'retell'
  };

  window.BUNI_ELECTRICAL_DEMO_CONFIG = Object.freeze(config);
  window.VOICE_RELAY_URL = config.voiceRelayUrl;
  window.VOICE_AGENTS = { electrical: config.voiceProvider, buni: 'retell' };
  window.CHAT_AGENTS = { electrical: true, buni: true };
  window.CHAT_AGENT_KEY = 'electrical';
})();
