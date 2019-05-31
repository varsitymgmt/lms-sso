/* eslint-disable */

import path from 'path';
import _ from 'lodash';

// function requiredProcessEnv(name) {
//   if(!process.env[name]) {
//     throw new Error('You must set the ' + name + ' environment variable');
//   }
//   return process.env[name];
// }

// All configurations will extend these options
// ============================================
const all = {
  env: process.env.NODE_ENV,
  
  // Storage
  GCLOUD_STORAGE_BUCKET: process.env.GCLOUD_STORAGE_BUCKET || 'vega-demo-cdn',

  // // Root path of server
  // root: path.normalize(`${__dirname}/../../..`),

  // // Browser-sync port
  // browserSyncPort: process.env.BROWSER_SYNC_PORT || 9000,

  // APP_ENGINE
  app_enigne: process.env.APP_ENGINE || false,

  // Server port
  port: process.env.PORT || 3000,

  //Host Name for Accounts service
  hostNameForAccounts : process.env.HOST_NAME_FOR_ACCOUNTS||'accounts.dev.hydra.egnify.io',

  // API Gateway
  api: {
    // API URL to be used in the client-side code
    clientUrl: process.env.API_CLIENT_URL || '',

    // apiEgnifyIoUrl to be used in the client-side code
    apiEgnifyIoUrl: process.env.API_EGNIFY_IO_URL || 'https://accounts.dev.hydra.egnify.io',

    // hostNameForDev to be used login details where hostname is attached
    hostNameForDev: 'luke.qa.sso.egnify.io',


    // curxParserUrl to be used in the client-side code
    curxParserUrl: process.env.CRUX_PARSER_URL || 'https://crux-parser-v1.egnify.com',

    // API URL to be used in the server-side code
    serverUrl:
      process.env.API_SERVER_URL ||
      `http://localhost:${process.env.PORT || 3000}`,
  },

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'vega-secret',
  },

  // Database
  databaseUrl: process.env.DATABASE_URL || 'sqlite:database.sqlite',

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true,
      },
    },
  },

  // Web analytics
  analytics: {
    // https://analytics.google.com/
    googleTrackingId: process.env.GOOGLE_TRACKING_ID || 'UA-111355148-1', // UA-XXXXX-X
  },

  // Authentication
  auth: {
    jwt: { secret: process.env.JWT_SECRET || 'React Sxsxtarter Kits' },

    // https://developers.facebook.com/
    facebook: {
      id: process.env.FACEBOOK_APP_ID || '186244551745631',
      secret:
        process.env.FACEBOOK_APP_SECRET || 'a970ae3240ab4b9b8aae0f9f0661c6fc',
    },

    // https://cloud.google.com/console/project
    google: {
      id:
        process.env.GOOGLE_CLIENT_ID ||
        '251410730550-ahcg0ou5mgfhl8hlui1urru7jn5s12km.apps.googleusercontent.com',
      secret: process.env.GOOGLE_CLIENT_SECRET || 'Y8yR9yZAhm9jQ8FKAL8QIEcd',
    },

    // https://apps.twitter.com/
    twitter: {
      key: process.env.TWITTER_CONSUMER_KEY || 'Ie20AZvLJI2lQD5Dsgxgjauns',
      secret:
        process.env.TWITTER_CONSUMER_SECRET ||
        'KTZ6cxoKnEakQCeSpZlaUCJWGAlTEBJj0y2EMkUBujA7zWSvaQ',
    },
  },
  emailTranspoter :{
    service: process.env.EMAIL_SERVICE ||'gmail',
    host: process.env.EMAIL_HOST ||'smtp.gmail.com',
    auth: {
      user: process.env.EMAIL_USER ||'support@egnify.com',
      pass: process.env.EMAIL_PASS ||'$dew$008',
    },
  },
  // emailAuth: {
  //   user: process.env.MAILJET_API_KEY || 'email-api-key',
  //   pass: process.env.MAILJET_API_SECRETKEY || 'email-api-secretKey',
  // },
  studentRole: 'Egni_u001_student',
  smsApiUrl: 'https://srichaitanyaschool.in/varna_api/sendotpsms_api.php?token=chaitanya',
};

// Export the config object based on the NODE_ENV
// ==============================================
export const config = _.merge(
  all,
  require('./shared'),
  require(`./${process.env.NODE_ENV}.js`) || {},
);

export default { config };
