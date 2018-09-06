/* eslint no-process-env:0 */

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost:27017/tenantregistry',
  },
  // Seed database on startup
  seedDB: true,
  services: {
    settings: 'http://localhost:5001',
    test: 'http://localhost:5002',
    sso: 'http://localhost:3002',
  },
  encriptedToken: false,
  encriptedTokenKey: 'a-very-secretive-secret',
  apolloEngineKey: 'service:egnify-jeet-dev:-aBvwR1LrRIp5ym1C6gVPQ',
  celery: {
    CELERY_BROKER_URL:
      process.env.CELERY_BROKER_URL || 'redis://localhost:6379/0',
    CELERY_RESULT_BACKEND:
      process.env.CELERY_RESULT_BACKEND || 'redis://localhost:6379/0',
  },
};
