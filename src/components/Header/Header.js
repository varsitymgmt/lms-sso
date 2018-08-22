import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import PropTypes from 'prop-types';
// import axios from 'axios';
import s from './Header.scss'; //eslint-disable-line
import Link from '../Link';
// import Navigation from '../Navigation';
import StudentSearch from './StudentSearch';

class Header extends React.Component {
  static propTypes = {
    // activePage: PropTypes.string.isRequired,
    enableLogoOnClick: PropTypes.bool.isRequired,
    // navigationMenu: PropTypes.arrayOf(PropTypes.object).isRequired,
    showSearchBar: PropTypes.bool.isRequired,
    // showNavigation: PropTypes.bool.isRequired,
    showSettingIcon: PropTypes.bool.isRequired,
    showTestsIcon: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      a: '2',
      showDropDown: false,
      showSearch: true,
      userName: '',
    };
    this.setUserName = this.setUserName.bind(this);
    this.toggleDropDown = this.toggleDropDown.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.setUserName();
  }

  setUserName() {
    this.setState({
      userName: localStorage.getItem('username'),
    });
  }

  displayLogo = () => {
    const div = (
      <div className={s.logoContainer}>
        {this.props.enableLogoOnClick ? (
          <Link to="/">
            <img
              src="/images/egnify.png"
              alt="Egnify"
              style={{ width: '110px' }}
            />
          </Link>
        ) : (
          <img
            src="/images/egnify.png"
            alt="Egnify"
            style={{ width: '110px' }}
          />
        )}
      </div>
    );
    return div;
  };

  displayProfile = () => {
    const div = (
      <div>
        <div style={{ float: 'right' }}>
          <img
            src="/images/user.png"
            width="30px"
            height="30px"
            className={s.userImg}
            style={{ cursor: 'pointer' }}
            alt="User"
            onClick={() => this.handleClick()}
            ref={node => {
              this.node = node;
            }}
            role="presentation"
          />
        </div>
        <div className={this.state.showDropDown ? s.showUp : s.hidden}>
          <div className={`card ${s.dropDownCard}`}>
            <ul>
              <li
                className={`${s.accountIcon} ${s.droplinks}`}
                role="presentation"
                onClick={() => {
                  window.location.href = '/my-account';
                }}
              >
                <div className={`${s.icons}`} /> Account
              </li>
              <li
                className={`${s.logoutIcon} ${s.droplinks}`}
                role="presentation"
                onClick={() => this.logOut()}
              >
                <div className={`${s.icons}`} />
                Log out
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
    return div;
  };

  displayTestsAndSettingsIcon = () => {
    const div = (
      <span className={s.testAndSettingsIcon}>
        {this.props.showSettingIcon ? (
          <Link to="/settings">
            <img
              src="/images/icons/settings.svg"
              style={{
                height: '18px',
                width: '18px',
              }}
              alt="settings"
            />
          </Link>
        ) : null}
        {this.props.showTestsIcon ? (
          <img
            src="/images/icons/apps.svg"
            alt="apps"
            title="Tests"
            style={{
              height: '18px',
              width: '18px',
            }}
            className={s.settingsIcon}
          />
        ) : null}
      </span>
    );
    return div;
  };

  handleClick() {
    // attach/remove event handler
    if (!this.state.showDropDown) {
      document.addEventListener('click', this.handleOutsideClick, false);
    } else {
      document.removeEventListener('click', this.handleOutsideClick, false);
    }

    this.setState(prevState => ({
      showDropDown: !prevState.showDropDown,
    }));
  }

  handleOutsideClick(e) {
    // ignore clicks on the component itself
    if (this.node.contains(e.target)) {
      return;
    }

    this.handleClick();
  }

  toggleDropDown() {
    const showStatus = !this.state.showDropDown;
    this.setState({
      showDropDown: showStatus,
    });
  }

  toggleSearch = () => {
    this.setState({
      showSearch: !this.state.showSearch,
    });
  };

  logOut = () => {
    // axios.post('/logOut').then(() => {
    //   const pathArray = location.href.split('/');
    //   const protocol = pathArray[0];
    //   const host = pathArray[2];
    //   const url = `${protocol}//${host}/login`;
    //   window.location = url;
    //   this.setState({
    //     a: '2',
    //   });
    // });
    localStorage.setItem('token', '');
    const pathArray = location.href.split('/');
    const protocol = pathArray[0];
    const host = pathArray[2];
    const url = `${protocol}//${host}/login`;
    window.location = url;
  };

  render() {
    return (
      <div id="page-header">
        <div className={`${s.header} row`}>
          {this.displayLogo()}
          {/* <div className={s.navContainer}>
            {this.props.showNavigation
              ? <Navigation
                  activePage={this.props.activePage}
                  navigationMenu={this.props.navigationMenu}
                />
              : null}
          </div> */}
          <div className={s.searchAndProfile}>
            {this.displayProfile()}
            {this.displayTestsAndSettingsIcon()}
            <div className={s.studentSearchContainer}>
              {this.props.showSearchBar ? <StudentSearch /> : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Header);
