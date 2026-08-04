/* Buni auto-repair demo configuration. */
(function () {
  'use strict';

  var config = {
    voiceRelayUrl: 'https://grok-voice-relay.sullivanamy75.workers.dev',
    voiceAgentKey: 'mechanic',
    voiceProvider: 'retell'
  };

  window.BUNI_MECHANIC_DEMO_CONFIG = Object.freeze(config);
  window.VOICE_RELAY_URL = config.voiceRelayUrl;
  window.VOICE_AGENTS = { mechanic: 'retell', buni: 'retell' };
  window.CHAT_AGENTS = { mechanic: true, buni: true };
  window.CHAT_AGENT_KEY = 'buni';
})();
