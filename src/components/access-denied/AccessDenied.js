import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './AccessDenied.css';

class AccessDenied extends React.Component {
  static propTypes = {
    message: PropTypes.string,
    warning: PropTypes.string,
  };

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <img alt="AcessDenied" src="/images/access-denied.svg" />
          <span className={s.textHolder}>
            <b>{this.props.warning} </b>
            {this.props.message}
          </span>
        </div>
      </div>
    );
  }
}

AccessDenied.defaultProps = {
  warning: 'Access denied! ',
  message: ' Please contact your administrator for more details',
};

export default withStyles(s)(AccessDenied);
