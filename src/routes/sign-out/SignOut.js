import React from 'react';
import PropTypes from 'prop-types';
// import withStyles from 'isomorphic-style-loader/lib/withStyles';
// import Link from 'components/Link/Link';
import { getURLParams, toggleLoader, deleteCookie } from 'utils/HelperMethods';
import Loader from 'components/Loader';

class SignOut extends React.Component {
  static contextTypes = {
    // GRAPHQL_API_URL: PropTypes.string.isRequired,
    API_URL: PropTypes.string.isRequired,
    // hostName for dev environment
    hostNameForDev: PropTypes.string.isRequired,
  };

  componentDidMount() {
    this.setIntialFields();
  }

  setIntialFields = () => {
    toggleLoader(true);
    let host = getURLParams('host');
    const domain = __DEV__ ? 'localhost' : '.egnify.io';
    deleteCookie({ key: 'token', domain });
    deleteCookie({ key: 'accessControlToken', domain });
    deleteCookie({ key: 'email', domain });
    deleteCookie({ key: 'hostID', domain });
    if (host) {
      host = new URL(host);
      window.location.href = `/signin?host=${encodeURIComponent(host.href)}`;
    } else {
      window.location.href = '/signin';
    }
    toggleLoader(false);
  };

  render() {
    return (
      <div className="cover-full-container">
        <Loader />
      </div>
    );
  }
}

export default SignOut;
