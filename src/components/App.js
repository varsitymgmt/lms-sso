import React from 'react';
import ReactGA from 'react-ga';
import PropTypes from 'prop-types';
import AccessDenied from 'components/access-denied';
import { detect } from 'utils/browserDetect';
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
  // API Accounts Gateway URL
  API_EGNIFY_IO_URL: PropTypes.string.isRequired,
  // auth module
  auth: PropTypes.object.isRequired,
  // hostname for dev environment
  hostNameForDev: PropTypes.string.isRequired,
  // googleTrackingId for google analytics
  googleTrackingId: PropTypes.string.isRequired,
  // institute details
  instituteDetails: PropTypes.object.isRequired,
  // institute details
  commonHost: PropTypes.object.isRequired,
};

class App extends React.PureComponent {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    children: PropTypes.element.isRequired,
  };

  static childContextTypes = ContextType;

  constructor(props) {
    super(props);
    this.state = {};
    ReactGA.initialize(config.analytics.googleTrackingId, {
      debug: false,
    });
  }

  getChildContext() {
    return this.props.context;
  }

  componentDidMount() {
    this.checkBrowserVarient();
  }

  checkBrowserVarient = () => {
    const browserInfo = detect();
    const checkIfBrowserAllowed = browser =>
      ['chrome'].includes(browser);
    if (browserInfo && checkIfBrowserAllowed(browserInfo.name.toLowerCase())) {
      this.setState({ isBrowserAllowed: true });
    }
  };

  render() {
    if (!this.state.isBrowserAllowed) {
      return (
        <AccessDenied
          warning="Sorry!"
          message={`Rankguru can only be accessed through Google Chrome`}
        />
      );
    }
    // NOTE: If you need to add or modify header, footer etc. of the app,
    // please do that inside the Layout component.
    return React.Children.only(this.props.children);
  }
}

export default App;
