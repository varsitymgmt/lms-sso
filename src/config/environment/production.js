/* eslint no-process-env:0 */

// Production specific configuration
// =================================
module.exports = {
  // Server port
  port: process.env.PORT || 3000,

  // MongoDB connection options
  mongo: {
    uri:
      process.env.MONGODB_URI ||
      process.env.MONGODB_URL ||
      'mongodb://localhost/hydra-settings-prod',
  },

  services: {
    settings:
      process.env.SVC_SETTINGS ||
      'http://settings-dev-hydra.dev.svc.cluster.local',
    test:
      process.env.SVC_TEST ||
      'http://test-management-dev-hydra.dev.svc.cluster.local',
    sso: process.env.SVC_SSO || 'http://localhost:3002',
  },
  encriptedToken: true,
  encriptedTokenKey: 'a-very-secretive-secret',
  apolloEngineKey: process.env.APOLLO_ENGINE_KEY || 'XXXX',
  celery: {
    CELERY_BROKER_URL:
      process.env.CELERY_BROKER_URL || 'redis://localhost:6379/0',
    CELERY_RESULT_BACKEND:
      process.env.CELERY_RESULT_BACKEND || 'redis://localhost:6379/0',
  },
};
