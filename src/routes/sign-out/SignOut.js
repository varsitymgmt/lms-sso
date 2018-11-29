import React from 'react';
import { getURLParams, toggleLoader, deleteCookie } from 'utils/HelperMethods';
import PropTypes from 'prop-types';
import Loader from 'components/Loader';

class SignOut extends React.Component {
  static contextTypes = {
    // common host
    commonHost: PropTypes.string.isRequired,
  };
  componentDidMount() {
    this.removeTokensAndRedirectToSignIn();
  }

  removeTokensAndRedirectToSignIn = () => {
    toggleLoader(true);
    let host = getURLParams('host');
    const domain = this.context.commonHost;
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
      <div>
        <Loader />
      </div>
    );
  }
}

export default SignOut;
