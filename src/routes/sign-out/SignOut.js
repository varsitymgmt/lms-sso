import React from 'react';
import {
  getURLParams,
  toggleLoader,
  deleteCookie,
  getCommonDomain,
} from 'utils/HelperMethods';
import Loader from 'components/Loader';

class SignOut extends React.Component {
  componentDidMount() {
    this.removeTokensAndRedirectToSignIn();
  }

  removeTokensAndRedirectToSignIn = () => {
    toggleLoader(true);
    let host = getURLParams('host');
    const domain = getCommonDomain();
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
