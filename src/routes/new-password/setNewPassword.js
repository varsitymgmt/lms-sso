import React from 'react';
// import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import axios from 'axios';
import s from './setNewPassword.css';

function getParameterByName(name, url) {
  const param = name.replace(/[[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${param}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function checkPassValidity(email) {
  if (email.length < 6) {
    return false;
  }
  const boolVal = /[a-z]/.test(email) && /[A-Z]/.test(email);
  return boolVal;
}

class SetNewPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      emailState: '0',
      passwordState: '0',
      emailClass: s.textbox,
      passwordClass: s.textbox,
      incorrectPasswordClass: s.hide,
      inValidEmailClass: s.hide,
      emailImgSrc: '/images/icons/password.svg',
      passwordImgSrc: '/images/icons/password.svg',
      passTyped: false,
      showPassword: false,
      rememberMe: false,
      validNewPassword: false,
      showpswdMwssage: 'show password',
      passwordLength: '',
      passwordUpperCase: '',
      checkCondFailure: false,
    };
    this.switchShowPassword = this.switchShowPassword.bind(this);
    this.monitorPassword = this.monitorPassword.bind(this);
    this.monitorEmail = this.monitorEmail.bind(this);
    this.changeRemeberUser = this.changeRemeberUser.bind(this);
    this.emailFocusHandler = this.emailFocusHandler.bind(this);
    this.emailBlurHandler = this.emailBlurHandler.bind(this);
    this.passwordBlurHandler = this.passwordBlurHandler.bind(this);
    this.passwordFocusHandler = this.passwordFocusHandler.bind(this);
    this.setNewPassword = this.setNewPassword.bind(this);
  }

  componentDidMount() {
    const windowHeight = window.innerHeight;
    const headerHeight = document.getElementById('page-header').offsetHeight;
    const height = windowHeight - (headerHeight + 60);
    document.getElementById('signInCard').style.minHeight = `${height}px`;
    // document.getElementById('rememberMe').click();
  }

  setNewPassword() {
    const emailState = this.state.emailState;
    const passwordState = this.state.passwordState;
    if (emailState === '2' || passwordState === '2') return;
    const passValue = this.state.email;
    const cnfrmPassValue = this.state.password;
    if (passValue !== cnfrmPassValue) {
      this.setState({
        emailImgSrc: '/images/icons/password-selected.svg',
        passwordImgSrc: '/images/icons/password-selected.svg',
        emailClass: s.invalidtextBox,
        passwordClass: s.invalidtextBox,
        incorrectPasswordClass: s.invalidPasswordText,
        passwordState: '2',
        emailState: '2',
      });
    } else {
      const url = window.location.href;
      const token = getParameterByName('token', url);
      const dataJson = {
        hashToken: token,
        newPassword: this.state.email,
      };
      axios.post('/changePassword', dataJson).then(response => {
        if (response.data.Updation === true) {
          const pathArray = location.href.split('/');
          const host = pathArray[2];
          let Url = `http://${host}`;
          Url = `${Url}/login`;
          window.location = Url;
        }
      });
    }
  }

  checkPasswordValidity(email, blurStatus) {
    if (email.length === 0 && blurStatus === true) return true;
    let firstCond = true;
    if (email.length < 6) {
      firstCond = false;
    }
    const secondCond = /[a-z]/.test(email) && /[A-Z]/.test(email);
    if (firstCond === false && secondCond === false) {
      this.setState({
        passwordLength: s.fontRed,
        passwordUpperCase: s.fontRed,
        checkCondFailure: true,
      });
    } else if (firstCond === true && secondCond === false) {
      this.setState({
        passwordLength: '',
        passwordUpperCase: s.fontRed,
        checkCondFailure: true,
      });
    } else if (firstCond === false && secondCond === true) {
      this.setState({
        passwordLength: s.fontRed,
        passwordUpperCase: '',
        checkCondFailure: true,
      });
    } else {
      this.setState({
        passwordLength: '',
        passwordUpperCase: '',
        checkCondFailure: false,
      });
    }
    const boolVal = firstCond && secondCond;
    return boolVal;
  }

  changeRemeberUser() {
    const stateVal = !this.state.rememberMe;
    this.setState({
      rememberMe: stateVal,
    });
  }

  monitorPassword = event => {
    if (event.target.value.length > 0) {
      this.setState({
        passTyped: true,
      });
    } else {
      this.setState({
        passTyped: false,
      });
    }
    this.setState({
      password: event.target.value,
    });
    // Update the Text Box after validation.
    const stateValue = this.state.passwordState;
    if (stateValue === '2') {
      const passValue = this.state.email;
      const cnfrmPassValue = event.target.value;
      if (passValue === cnfrmPassValue) {
        this.setState({
          emailImgSrc: '/images/icons/password.svg',
          passwordImgSrc: '/images/icons/password-selected.svg',
          emailClass: s.textbox,
          passwordClass: s.textbox,
          passwordState: '0',
          emailState: '0',
          incorrectPasswordClass: s.hide,
        });
      }
    }
  };

  monitorEmail = event => {
    this.setState({
      email: event.target.value,
    });
    const stateVal = this.state.passwordState;
    const mainBool = this.state.validNewPassword;
    if (mainBool === false) {
      const switchBool = this.state.checkCondFailure;
      let bool;
      if (switchBool === false) {
        bool = checkPassValidity(event.target.value);
      } else {
        bool = this.checkPasswordValidity(event.target.value, true);
      }
      if (bool === true) {
        this.setState({
          emailClass: s.textbox,
          emailImgSrc: '/images/icons/password-selected.svg',
          emailState: '0',
          validNewPassword: true,
        });
      }
    }
    if (stateVal === '2') {
      const passValue = event.target.value;
      const cnfrmPassValue = this.state.password;
      if (passValue === cnfrmPassValue) {
        this.setState({
          emailImgSrc: '/images/icons/password-selected.svg',
          passwordImgSrc: '/images/icons/password.svg',
          emailClass: s.textbox,
          passwordClass: s.textbox,
          passwordState: '0',
          emailState: '0',
          incorrectPasswordClass: s.hide,
        });
      }
    }
  };

  emailFocusHandler() {
    const emailState = this.state.emailState;
    if (emailState !== '2') {
      this.setState({
        emailImgSrc: '/images/icons/password-selected.svg',
      });
    }
  }

  emailBlurHandler() {
    const emailState = this.state.emailState;
    const checkPass = this.checkPasswordValidity(this.state.email, true);
    if (checkPass === false && this.state.email.length !== 0) {
      this.setState({
        validNewPassword: false,
        emailImgSrc: '/images/icons/password-selected.svg',
        emailClass: s.invalidtextBox,
        emailState: '2',
      });
      return;
    }
    if (emailState !== '2') {
      this.setState({
        emailImgSrc: '/images/icons/password.svg',
      });
    }
  }

  passwordBlurHandler() {
    const passwordState = this.state.passwordState;
    if (passwordState !== '2') {
      this.setState({
        passwordImgSrc: '/images/icons/password.svg',
      });
    }
  }

  passwordFocusHandler() {
    const passwordState = this.state.passwordState;
    if (passwordState !== '2') {
      this.setState({
        passwordImgSrc: '/images/icons/password-selected.svg',
      });
    }
  }

  switchShowPassword() {
    if (!this.state.showPassword) {
      this.setState({
        showPassword: true,
        showpswdMwssage: 'show password',
      });
    } else {
      this.setState({
        showPassword: false,
        showpswdMwssage: 'hide password',
      });
    }
  }

  render() {
    return (
      <div className={`row`}>
        <div className={`col m12`}>
          <div className={`card ${s.container} row`} id="signInCard">
            <div className={`col m12 ${s.bodyContainer}`}>
              <div className={`row ${s.headingRow}`}>
                <div className={`col m12 ${s.heading}`} />
              </div>

              <div className={`row`}>
                <div className={`col m12 ${s.wishMessage}`}>
                  Change Password
                </div>
                <div className={`col m12 ${s.signInMessage}`}>
                  Please Enter a New Password.
                </div>
              </div>

              <div className={`row ${s.emailEntrySection}`}>
                <div className={`col m12`}>New Password</div>
                <div className={`col m12 ${s.email}`}>
                  <img
                    src={this.state.emailImgSrc}
                    width="19"
                    height="19"
                    alt="email"
                    className={`${s.emailImg}`}
                  />
                  <input
                    placeholder="Enter new password"
                    id="nameIdSearch"
                    type="password"
                    onChange={this.monitorEmail}
                    onFocus={this.emailFocusHandler}
                    onBlur={this.emailBlurHandler}
                    className={this.state.emailClass}
                  />
                  <div className={this.state.inValidEmailClass}>
                    {' '}Email has not been Registered
                  </div>
                </div>
              </div>

              <div className={`row ${s.passwordEntrySection}`}>
                <div className={`col m12`}>Confirm Password</div>
                <div className={`col m12 ${s.email}`}>
                  <img
                    src={this.state.passwordImgSrc}
                    width="19"
                    height="19"
                    alt="email"
                    className={`${s.emailImg}`}
                  />
                  <input
                    placeholder="Retype new password"
                    id="nameIdSearch"
                    onFocus={this.passwordFocusHandler}
                    onBlur={this.passwordBlurHandler}
                    onChange={this.monitorPassword}
                    type={`text`}
                    className={this.state.passwordClass}
                  />
                  <div className={this.state.incorrectPasswordClass}>
                    Passwords didnt match
                  </div>
                </div>
              </div>

              <div className={`row`}>
                <div className={`col m12 ${s.warnMsg}`}>
                  <div className={this.state.passwordLength}>
                    Password must at least be 6 characters. <br />
                  </div>
                  <div className={this.state.passwordUpperCase}>
                    Password must contain both Uppercase and Lowercase Letters.
                  </div>
                </div>
              </div>

              <div className={`row`}>
                <div className={`col m6 offset-m3`}>
                  <button
                    className={`btn ${s.loginBtn}`}
                    onClick={this.setNewPassword}
                  >
                    CONTINUE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(SetNewPassword);
