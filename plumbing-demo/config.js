/* Buni plumbing demo configuration. */
(function () {
  'use strict';

  var config = {
    voiceRelayUrl: 'https://grok-voice-relay.sullivanamy75.workers.dev',
    voiceAgentKey: 'plumbing',
    voiceProvider: 'retell'
  };

  window.BUNI_PLUMBING_DEMO_CONFIG = Object.freeze(config);
  window.VOICE_RELAY_URL = config.voiceRelayUrl;
  window.VOICE_AGENTS = { plumbing: config.voiceProvider, buni: 'retell' };
  window.CHAT_AGENTS = { plumbing: true, buni: true };
  window.CHAT_AGENT_KEY = 'plumbing';
})();
