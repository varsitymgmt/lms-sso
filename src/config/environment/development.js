/* eslint no-process-env:0 */

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost:27017/tenantregistry-lms-dev',
  },
  // Seed database on startup
  seedDB: true,
  services: {
    settings: 'http://localhost:5001',
    sso: 'http://localhost:3002',
  },
  encriptedToken: true,
  encriptedTokenKey: 'a-very-secretive-secret',
  apolloEngineKey: 'service:egnify-jeet-dev:-aBvwR1LrRIp5ym1C6gVPQ',
  // COMMON HOST USED TO SET COOKIE
  commonHost: 'localhost',
};
