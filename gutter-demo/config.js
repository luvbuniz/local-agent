/* Buni gutter demo configuration. */
(function () {
  'use strict';

  var config = {
    voiceRelayUrl: 'https://grok-voice-relay.sullivanamy75.workers.dev',
    voiceAgentKey: 'gutter',
    voiceProvider: 'retell'
  };

  window.BUNI_GUTTER_DEMO_CONFIG = Object.freeze(config);
  window.VOICE_RELAY_URL = config.voiceRelayUrl;
  window.VOICE_AGENTS = { gutter: config.voiceProvider, buni: 'retell' };
  window.CHAT_AGENTS = { gutter: true, buni: true };
  window.CHAT_AGENT_KEY = 'gutter';
})();
