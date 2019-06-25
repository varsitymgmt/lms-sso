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
  hostNameForAccounts : process.env.HOST_NAME_FOR_ACCOUNTS || 'accounts.dev.rankguru.com',

  // API Gateway
  api: {
    // apiEgnifyIoUrl to be used in the client-side code
    apiEgnifyIoUrl: process.env.API_EGNIFY_IO_URL || 'https://accounts.dev.rankguru.com',

    // hostNameForDev to be used login details where hostname is attached
    hostNameForDev: 'luke.dev.rankguru.com',
  },

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'vega-secret',
  },

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
