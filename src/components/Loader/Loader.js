import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Loader.css';

class Loader extends React.Component {
  shouldComponentUpdate() {
    return false;
  }
  render() {
    return (
      <div id="loader" className={s.loader}>
        <img src="/images/loader.svg" alt="loader" />
      </div>
    );
  }
}

export default withStyles(s)(Loader);
