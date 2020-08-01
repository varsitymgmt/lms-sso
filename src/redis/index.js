const redis = require('redis');
const config = require('../config/environment').config;

const client = redis.createClient({
  url: config.redis_auth_db,
});

client.on('connect', () => {
  console.info(`Redis Connected at ${config.redis_auth_db}`);
});

client.on('error', err => {
  console.error(`Error ${err}`);
  process.exit(-1);
});

module.exports = client;
