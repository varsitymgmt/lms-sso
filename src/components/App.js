import React from 'react';
import axios from 'axios';
import ReactGA from 'react-ga';
import PropTypes from 'prop-types';
import history from '../history';
import { config } from '../config/environment';
// const actions = 0;

const ContextType = {
  // Enables critical path CSS rendering
  insertCss: PropTypes.func.isRequired,
  // Universal HTTP client
  fetch: PropTypes.func.isRequired,
  // API Gateway URL
  API_URL: PropTypes.string.isRequired,
  // API GraphQL Gateway URL
  GRAPHQL_API_URL: PropTypes.string.isRequired,
  // url of the  crux api gateway.
  API_CRUX_URL: PropTypes.string.isRequired,
  // auth module
  auth: PropTypes.object.isRequired,
  // hostname for dev environment
  hostNameForDev: PropTypes.string.isRequired,
  // googleTrackingId for google analytics
  googleTrackingId: PropTypes.string.isRequired,
  // institute details
  instituteDetails: PropTypes.object.isRequired,
};

/**
 * The top-level React component setting context (global) variables
 * that can be accessed from all the child components.
 *
 * https://facebook.github.io/react/docs/context.html
 *
 * Usage example:
 *
 *   const context = {
 *     history: createBrowserHistory(),
 *     store: createStore(),
 *   };
 *
 *   ReactDOM.render(
 *     <App context={context}>
 *       <Layout>
 *         <LandingPage />
 *       </Layout>
 *     </App>,
 *     container,
 *   );
 */
class App extends React.PureComponent {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    children: PropTypes.element.isRequired,
  };

  static childContextTypes = ContextType;

  constructor(props) {
    super(props);
    ReactGA.initialize(config.analytics.googleTrackingId, {
      debug: false,
    });
  }

  getChildContext() {
    return this.props.context;
  }

  componentWillMount() {
    axios.interceptors.request.use(
      configuration => {
        const token = localStorage.getItem('token');
        if (token != null) {
          configuration.headers.Authorization = `Bearer ${token}`; // eslint-disable-line
        }
        return configuration;
      },
      err => Promise.reject(err),
    );
    let redirectTo = null;
    axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          let url = error.response.request
            ? error.response.request.responseURL
            : null;
          if (url) {
            url = new URL(url);
            if (url && url.pathname !== '/auth/local') {
              if (!redirectTo) {
                const currentURL = new URL(window.location);
                if (currentURL.pathname !== '/login') {
                  redirectTo = currentURL.pathname + currentURL.search;
                }
              }
              localStorage.removeItem('token');
              history.push(
                `/login?redirectTo=${encodeURIComponent(redirectTo || '/')}`,
              );
              setTimeout(() => {
                redirectTo = null;
              }, 1500);
            }
          }
          return Promise.reject(error);
        }
        return Promise.reject(error);
      },
    );
  }

  render() {
    // NOTE: If you need to add or modify header, footer etc. of the app,
    // please do that inside the Layout component.
    return React.Children.only(this.props.children);
  }
}

export default App;
