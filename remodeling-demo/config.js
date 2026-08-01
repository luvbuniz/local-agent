/* Buni remodeling demo configuration. */
(function () {
  'use strict';

  var config = {
    voiceRelayUrl: 'https://grok-voice-relay.sullivanamy75.workers.dev',
    voiceAgentKey: 'remodeling',
    voiceProvider: 'retell'
  };

  window.BUNI_REMODELING_DEMO_CONFIG = Object.freeze(config);
  window.VOICE_RELAY_URL = config.voiceRelayUrl;
  window.VOICE_AGENTS = { remodeling: config.voiceProvider, buni: 'retell' };
  window.CHAT_AGENTS = { remodeling: true, buni: true };
  window.CHAT_AGENT_KEY = 'remodeling';
})();
