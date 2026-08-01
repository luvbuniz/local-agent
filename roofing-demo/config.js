/* Buni roofing demo configuration. */
(function () {
  'use strict';

  var config = {
    voiceRelayUrl: 'https://grok-voice-relay.sullivanamy75.workers.dev',
    voiceAgentKey: 'roofing',
    voiceProvider: 'retell',
  };

  window.BUNI_ROOFING_DEMO_CONFIG = Object.freeze(config);
  window.VOICE_RELAY_URL = config.voiceRelayUrl;
  window.VOICE_AGENTS = {};
  window.VOICE_AGENTS[config.voiceAgentKey] = config.voiceProvider;
  window.VOICE_AGENTS.buni = 'retell';
  window.CHAT_AGENTS = { roofing: true, buni: true };
  window.CHAT_AGENT_KEY = 'roofing';
})();
