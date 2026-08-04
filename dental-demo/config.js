/* Buni dental demo configuration. Agent IDs remain in the Worker. */
(function () {
  'use strict';

  var config = {
    voiceRelayUrl: 'https://grok-voice-relay.sullivanamy75.workers.dev',
    voiceAgentKey: 'dental',
    voiceProvider: 'retell'
  };

  window.BUNI_DENTAL_DEMO_CONFIG = Object.freeze(config);
  window.VOICE_RELAY_URL = config.voiceRelayUrl;
  window.VOICE_AGENTS = { dental: 'retell', buni: 'retell' };
  window.CHAT_AGENTS = { dental: true, buni: true };
  window.CHAT_AGENT_KEY = 'buni';
})();
