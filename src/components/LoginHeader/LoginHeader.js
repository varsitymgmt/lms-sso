import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Link from '../Link';
import s from './LoginHeader.css';

class LoginHeader extends React.Component {
  render() {
    return (
      <div id="page-header">
        <div className={s.header}>
          <Link to="/login">
            <img
              src="/images/egnify-logo.png"
              width="155"
              height="35"
              alt="Egnify Logo"
            />
          </Link>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(LoginHeader);
