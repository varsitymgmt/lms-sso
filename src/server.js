/**
   @description This file contains server configuration.
   @author Rahul Islam
   @date    22/09/2017
   @version 1.0.0.0
*/

// module.exports = require("newrelic"); /* eslint-disable import/first */

/* eslint consistent-return: 0 */
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';

import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import fetch from 'node-fetch';
import React from 'react';
import ReactDOM from 'react-dom/server';
import PrettyError from 'pretty-error';
import compression from 'compression';
import helmet from 'helmet';

import App from './components/App';
import Html from './components/Html';
import { ErrorPageWithoutStyle } from './routes/error/ErrorPage';
import errorPageStyle from './routes/error/ErrorPage.css';
import createFetch from './createFetch';
import router from './router';
import assets from './assets.json'; // eslint-disable-line import/no-unresolved
import { config } from './config/environment';
import schema from './api/graphql/schema';
import { isAuthenticated, isAdmin } from './api/auth/auth.service';

const app = express();

// enable compression
app.use(compression());
// enable helmet
app.use(helmet());

mongoose.Promise = require('bluebird');

// Connect to MongoDB
mongoose.connect(
  config.mongo.uri,
  config.mongo.options,
);
mongoose.connection.on('connected', () => {
  console.info('Mongoose connected to', config.mongo.uri);
  // User.find().then(docs => {
  //   console.info(docs);
  // });
});

mongoose.connection.on('error', err => {
  console.info(`MongoDB connection error: ${err}`);
  process.exit(-1); // eslint-disable-line no-process-exit
});

// mongoose.set('debug', true)

app.get('/status', (req, res) => res.send('Oh!! Yeah.'));

//
// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(cors());
app.use(morgan('combined'));
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true, limit: '32mb' }));
app.use(bodyParser.json({ limit: '32mb' }));

// app.use(
//   '/auth/local',
//   morgan((token, req, res) => morganCtrl.morganMessageLogger(token, req, res)),
// );

app.use('/consumer', (req, res, next) => {
  const token = '208b9605-b7f3-4d15-b609-d95eefabb53e';
  if (!req.body.token || req.body.token !== token)
    return res.status('401').send();
  req.user = {
    instituteId: 'Egni_u001',
    hostname: ['rankguru.com', 'www.rankguru.com'],
  };
  next();
});

require('./api/api/v1').default(app);

app.use(
  '/graphiql',
  graphiqlExpress({
    endpointURL: '/graphql',
    passHeader:
      "'Authorization': localStorage.getItem('login_token'),'AccessControlToken': localStorage.getItem('access_token')",
  }),
);
app.use(
  '/graphql',
  isAuthenticated(),
  bodyParser.json(),
  isAdmin(),
  graphqlExpress(req => {
    // Some sort of auth function
    // const userForThisRequest = getUserFromRequest(req);
    console.info('Yay!! GraphQL Initilized');
    return {
      schema,
      context: { user: req.user },
      tracing: true,
      cacheControl: true,
    };
  }),
);

// app.use(
//   '/graphql',
//   expressGraphQL(req => ({
//     schema,
//     graphiql: __DEV__,
//     rootValue: { request: req },
//     pretty: __DEV__,
//   })),
// );

// if (__DEV__) {
//   app.enable('trust proxy');
// }

app.get('*', async (req, res, next) => {
  try {
    const css = new Set();
    // Global (context) variables that can be easily accessed from any React component
    // https://facebook.github.io/react/docs/context.html
    const context = {
      // Enables critical path CSS rendering
      insertCss: (...styles) => {
        // eslint-disable-next-line no-underscore-dangle
        styles.forEach(style => css.add(style._getCss()));
      },
      // Universal HTTP client
      fetch: createFetch(fetch, {
        baseUrl: config.api.serverUrl,
        cookie: req.headers.cookie,
      }),
    };

    const route = await router.resolve({
      ...context,
      path: req.path,
      query: req.query,
    });

    if (route.redirect) {
      res.redirect(route.status || 302, route.redirect);
      return;
    }

    const data = { ...route };
    data.children = ReactDOM.renderToString(
      <App context={context}>{route.component}</App>,
    );
    data.styles = [{ id: 'css', cssText: [...css].join('') }];
    data.scripts = [assets.vendor.js];
    if (route.chunks) {
      data.scripts.push(...route.chunks.map(chunk => assets[chunk].js));
    }
    data.scripts.push(assets.client.js);
    data.app = {
      apiEgnifyIoUrl: config.api.apiEgnifyIoUrl,
      hostNameForDev: config.api.hostNameForDev,
      googleTrackingId: config.analytics.googleTrackingId,
      commonHost: config.commonHost,
    };
    const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);
    res.status(route.status || 200);
    res.send(`<!doctype html>${html}`);
  } catch (err) {
    next(err);
  }
});

//
// Error handling
// -----------------------------------------------------------------------------
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(pe.render(err));
  const html = ReactDOM.renderToStaticMarkup(
    <Html
      title="Internal Server Error"
      description={err.message}
      styles={[{ id: 'css', cssText: errorPageStyle._getCss() }]} // eslint-disable-line no-underscore-dangle
    >
      {ReactDOM.renderToString(<ErrorPageWithoutStyle error={err} />)}
    </Html>,
  );
  res.status(err.status || 500);
  res.send(`<!doctype html>${html}`);
});

//
// Launch the server
// -----------------------------------------------------------------------------
if (!module.hot) {
  app.listen(config.port, () => {
    console.info(`The server is running at http://localhost:${config.port}/`);
  });
}

//
// Hot Module Replacement
// -----------------------------------------------------------------------------
if (module.hot) {
  app.hot = module.hot;
  module.hot.accept('./router');
}

export default app;
