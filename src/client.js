import 'whatwg-fetch';
import React from 'react';
import Raven from 'raven-js';
import ReactDOM from 'react-dom';
import deepForceUpdate from 'react-deep-force-update';
import queryString from 'query-string';
import { toggleLoader } from 'utils/HelperMethods';
// import { createPath } from 'history/PathUtils';
import ReactGA from 'react-ga';
import { config } from './config/environment';
import App from './components/App';
import createFetch from './createFetch';
import history from './history';
import { updateMeta } from './DOMUtils';
import router from './router';
import { auth } from './auth';

/* eslint-disable global-require */

Raven.config(
  'https://6cfc03ceb1fc4998aae5e2c9dbf60efc@sentry.io/1491470',
).install();

// Global (context) variables that can be easily accessed from any React component
// https://facebook.github.io/react/docs/context.html
const context = {
  // Enables critical path CSS rendering
  insertCss: (...styles) => {
    // eslint-disable-next-line no-underscore-dangle
    const removeCss = styles.map(x => x._insertCss());
    return () => {
      removeCss.forEach(f => f());
    };
  },
  // Universal HTTP client
  fetch: createFetch(self.fetch, {
    baseUrl: window.App.apiUrl,
  }),
  // url of the api gateway.
  API_URL: window.App.apiEgnifyIoUrl, // 'https://api.egnify.io/graphql',
  // url of the graphql api gateway.
  GRAPHQL_API_URL: `${window.App.apiEgnifyIoUrl}/graphql`, // 'https://api.egnify.io/graphql',
  // url of the accounts api gateway.
  API_EGNIFY_IO_URL: window.App.apiEgnifyIoUrl,
  auth,
  // hostname for dev environment
  hostNameForDev: window.App.hostNameForDev,
  // googleTrackingId for google analytics
  googleTrackingId: window.App.googleTrackingId,
  // common host
  commonHost: window.App.commonHost,
  // institute details
  instituteDetails: {},
};

// Switch off the native scroll restoration behavior and handle it manually
// https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration
const scrollPositionsHistory = {};
if (window.history && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

let onRenderComplete = function initialRenderComplete() {
  const elem = document.getElementById('css');
  if (elem) elem.parentNode.removeChild(elem);
  onRenderComplete = async function renderComplete(route, location) {
    // document.title = route.title;
    updateMeta('description', route.description);
    // Update necessary tags in <head> at runtime here, ie:
    let scrollX = 0;
    let scrollY = 0;
    const pos = scrollPositionsHistory[location.key];
    if (pos) {
      scrollX = pos.scrollX;
      scrollY = pos.scrollY;
    } else {
      const targetHash = location.hash.substr(1);
      if (targetHash) {
        const target = document.getElementById(targetHash);
        if (target) {
          scrollY = window.pageYOffset + target.getBoundingClientRect().top;
        }
      }
    }
    ReactGA.initialize(config.analytics.googleTrackingId, {
      debug: false,
    });
    // Restore the scroll position if it was saved into the state
    // or scroll to the given #hash anchor
    // or scroll to top of the page
    window.scrollTo(scrollX, scrollY);
    // Google Analytics tracking. Don't send 'pageview' event after
    // the initial rendering, as it was already sent
    if (window.ga) {
      // ReactGA.pageview(window.location.href);
      window.ga('send', 'pageview', window.location.href);
    }
  };
};

const container = document.getElementById('app');
let appInstance;
let currentLocation = history.location;

// Re-render the app when window.location changes
async function onLocationChange(location, action) {
  // Remember the latest scroll position for the previous location
  scrollPositionsHistory[currentLocation.key] = {
    scrollX: window.pageXOffset,
    scrollY: window.pageYOffset,
  };
  // Delete stored scroll position for next page if any
  if (action === 'PUSH') {
    delete scrollPositionsHistory[location.key];
  }
  currentLocation = location;
  try {
    toggleLoader(true, 'client');
    if (
      !localStorage.getItem('token') &&
      ![
        '/signin',
        '/admin-signin',
        '/signout',
        '/admin-signout',
        '/resetPassword',
        '/forgotPassword',
      ].includes(location.pathname)
    ) {
      const path = `/signin`;
      location.pathname = path;
      history.replace(path);
    }
    const route = await router.resolve({
      ...context,
      path: location.pathname,
      query: queryString.parse(location.search),
    });
    // Prevent multiple page renders during the routing process
    if (currentLocation.key !== location.key) {
      return;
    }
    if (route.redirect) {
      history.replace(route.redirect);
      return;
    }
    appInstance = ReactDOM.render(
      <App context={context}>{route.component}</App>,
      container,
      () => {
        toggleLoader(false, 'client');
        onRenderComplete(route, location);
      },
    );
  } catch (error) {
    toggleLoader(false, 'client');
    if (__DEV__) {
      throw error;
    } else {
      Raven.captureException(error);
    }
    // Do a full page reload if error occurs during client-side navigation
    if (action && currentLocation.key === location.key) {
      window.location.reload();
    }
  }
  // hide loader once the page loads
  document.getElementById('page-loader').style.display = 'none';
  // axios.post('/refreshToken');
}

// Handle client-side navigation by using HTML5 History API
// For more information visit https://github.com/mjackson/history#readme
history.listen(onLocationChange);
onLocationChange(currentLocation);

// Enable Hot Module Replacement (HMR)
if (module.hot) {
  module.hot.accept('./router', () => {
    if (appInstance) {
      // Force-update the whole tree, including components that refuse to update
      deepForceUpdate(appInstance);
    }
    onLocationChange(currentLocation);
  });
}
