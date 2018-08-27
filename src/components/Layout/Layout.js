import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

// external-global styles must be imported in your JS.
// import normalizeCss from 'normalize.css';
import s from './Layout.css';
import Header from '../Header';
import Loader from '../Loader';

class Layout extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    activePage: PropTypes.string,
    showNavigation: PropTypes.bool,
    showSearchBar: PropTypes.bool,
    navigationMenu: PropTypes.arrayOf(PropTypes.object),
    showSettingIcon: PropTypes.bool,
    showTestsIcon: PropTypes.bool,
    enableLogoOnClick: PropTypes.bool,
  };

  render() {
    return (
      <div>
        <Header
          activePage={this.props.activePage}
          showNavigation={this.props.showNavigation}
          showSearchBar={this.props.showSearchBar}
          navigationMenu={this.props.navigationMenu}
          showTestsIcon={this.props.showTestsIcon}
          showSettingIcon={this.props.showSettingIcon}
          enableLogoOnClick={this.props.enableLogoOnClick}
        />
        <div className={s.childContainer}>{this.props.children}</div>
        <Loader />
      </div>
    );
  }
}

Layout.defaultProps = {
  activePage: '',
  showNavigation: true,
  showSearchBar: true,
  navigationMenu: [
    { label: 'Tests', value: 'test', path: '/test', active: true },
    { label: 'Reports', value: 'reports', path: '/reports', active: true },
    { label: 'Analysis', value: 'analysis', path: '/analysis', active: true },
  ],
  showTestsIcon: false,
  showSettingIcon: true,
  enableLogoOnClick: true,
};

export default withStyles(s)(Layout);
