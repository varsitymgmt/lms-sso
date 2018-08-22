import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

// external-global styles must be imported in your JS.
import s from './LoginLayout.css';
import LoginHeader from '../LoginHeader';
import Loader from '../Loader';

class LoginLayout extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  render() {
    return (
      <div style={{ position: 'relative', height: '100%' }}>
        <LoginHeader />
        <div>{this.props.children}</div>
        <Loader />
      </div>
    );
  }
}

export default withStyles(s)(LoginLayout);
