/* eslint no-process-env:0 */

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri:
      'mongodb://lms:WQPVnRNtXY7CqKGUYR2qg23RPItVXf5mGs9twASm@uat.db.rankguru.com:27017/tenantregistry-lms-uat',
  },
  // Seed database on startup
  seedDB: true,
  services: {
    settings: 'http://localhost:5001',
    test: 'http://localhost:5002',
    sso: 'http://localhost:3002',
  },
  encriptedToken: true,
  encriptedTokenKey: 'a-very-secretive-secret',
  apolloEngineKey: 'service:egnify-jeet-dev:-aBvwR1LrRIp5ym1C6gVPQ',
  celery: {
    CELERY_BROKER_URL:
      process.env.CELERY_BROKER_URL || 'redis://localhost:6379/0',
    CELERY_RESULT_BACKEND:
      process.env.CELERY_RESULT_BACKEND || 'redis://localhost:6379/0',
    QUEUE_NS: process.env.QUEUE_NS || 'sso-dev-mq',
  },
  redis_auth_db:
    process.env.REDIS_AUTH_DB || 'redis://:rQsVPF2gbiHi@13.235.245.210:6379/1',
  // COMMON HOST USED TO SET COOKIE
  commonHost: 'localhost',
};
