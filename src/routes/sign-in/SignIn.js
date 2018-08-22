import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
// import Link from 'components/Link/Link';
import {
  getURLParams,
  toggleLoader,
  setCookie,
  getCookie,
} from 'utils/HelperMethods';
import Loader from 'components/Loader';
import welcomeImg from './welcome.svg';
import s from './SignIn.scss';

class SignIn extends React.Component {
  static contextTypes = {
    // GRAPHQL_API_URL: PropTypes.string.isRequired,
    API_URL: PropTypes.string.isRequired,
    // hostName for dev environment
    hostNameForDev: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      formData: { email: '', password: '', rememberMe: false },
      emailImgSrc: '/images/icons/username.svg',
      emailValidationCompleted: false,
      doneSrc: '/images/institute-setup/done.svg',
      emailSrc: '/images/icons/mail.png',
      passwordImgSrc: '/images/icons/password.svg',
      showPassword: false,
      wlcmMsg: '',
      formFieldsError: {},
      forgotPasswordEmaiID: '',
      forgotPasswordError: null,
      isForgotPasswordLoading: false,
      showForgotPassword: false,
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.setWelcomeMesage = this.setWelcomeMesage.bind(this);
    this.validateEmail = this.validateEmail.bind(this);
  }

  componentDidMount() {
    this.setWelcomeMesage();
    this.setIntialFields();
  }

  setIntialFields = () => {
    let host = getURLParams('host');
    if (host) {
      host = new URL(host);
      if (
        getCookie(`token`) &&
        getCookie(`accessControlToken`) &&
        getCookie(`email`) &&
        getCookie('hostID') === host.hostname.split('.')[0]
      ) {
        window.location = host.href;
      }
    }
    this.setState({
      formData: {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        rememberMe: false,
        hostname: __DEV__ ? this.context.hostNameForDev : host.hostname,
      },
      host,
    });
  };

  setWelcomeMesage() {
    const hrs = new Date().getHours();
    let wlcmMsg = 'Good Evening!';
    // Set the Welcome Message based on the timing.
    if (hrs < 12) {
      wlcmMsg = 'Good Morning!';
    } else if (hrs >= 12 && hrs <= 17) {
      wlcmMsg = 'Good Afternoon!';
    }
    this.setState({ wlcmMsg });
  }

  displaySignIn = () => {
    const view = (
      <div className={s.signInSection}>
        <div className={`${s.headingRow}`} style={{ minHeight: '49px' }}>
          <img src="/images/egnify-logo.svg" alt="logo" />
        </div>
        <div style={{ minHeight: '53px' }}>
          <div className={`col m12 ${s.wishMessage}`}>{this.state.wlcmMsg}</div>
          <div className={`col m12 ${s.signInMessage}`}>
            Sign into your account
          </div>
        </div>
        <form onSubmit={this.handleLogin} action="#">
          <div className={`row ${s.emailEntrySection}`}>
            <div className={`row ${s.email}`}>
              <img
                src={this.state.emailImgSrc}
                alt="email"
                className={`${s.emailImg}`}
              />
              <input
                placeholder="Username"
                id="email"
                type="text"
                className={`${s.textbox}
                  ${this.state.formFieldsError.email ? s.invalidTextBox : ''}`}
                value={this.state.formData.email || ''}
                onChange={e => this.handleFormFieldChanges(e, 'email')}
              />
              {this.displayFormFieldError('email')}
            </div>
          </div>
          <div className={`row ${s.passwordEntrySection}`}>
            <div className={`row ${s.email}`}>
              <img
                src={this.state.passwordImgSrc}
                alt="password"
                className={`${s.emailImg}`}
              />
              <input
                placeholder="Password"
                id="password"
                type={this.state.showPassword ? `text` : `password`}
                className={`${s.textbox} ${
                  this.state.formFieldsError.password ? s.invalidTextBox : ''
                }`}
                value={this.state.formData.password || ''}
                onChange={e => this.handleFormFieldChanges(e, 'password')}
              />
              {this.displayFormFieldError('password')}
            </div>
          </div>
          <div className={`row ${s.postEntrySection}`}>
            <div className={`col m6 ${s.keepSignedIn}`}>
              <label htmlFor="indeterminate-checkbox">
                <input
                  type="checkbox"
                  id="indeterminate-checkbox"
                  onClick={() => {
                    this.setState({
                      rememberMe: !this.state.rememberMe,
                    });
                  }}
                />
                <div className={`checkbox ${s.checkbox}`} />
                Keep me signed in
              </label>
            </div>
            <div
              className={`col m6 ${s.showPassword}`}
              onClick={() => {
                if (
                  this.state.formData.password &&
                  this.state.formData.password.length > 0
                ) {
                  this.setState({
                    showPassword: !this.state.showPassword,
                  });
                }
              }}
              role="presentation"
            >
              {this.state.showPassword ? 'Hide Password' : 'Show password'}
            </div>
          </div>
          <div className={`row`}>
            <button className={`btn ${s.loginBtn}`} onClick={this.handleLogin}>
              Get Started
            </button>
          </div>
          <div className={`row`}>
            <div className={s.forgotPassword}>
              <div
                role="presentation"
                onClick={() => {
                  this.resetForgotPasswordChanges();
                }}
              >
                Forgot password?
              </div>
            </div>
          </div>
        </form>
      </div>
    );
    return view;
  };

  displayWelcome = () => {
    const view = (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <div style={{ fontSize: '30px', color: 'white', textAlign: 'center' }}>
          Insightful Analysis is just a click away!
        </div>
        <img src={welcomeImg} alt="welcome" />
      </div>
    );
    return view;
  };

  displayFormFieldError = field => {
    const div = (
      <div className={s.errorMessage}>{this.state.formFieldsError[field]}</div>
    );
    return div;
  };

  displayForgotPassowrd = () => {
    const view = (
      <div
        className={`body-overlay ${s.bodyOverlay}`}
        role="presentation"
        onKeyDown={this.handleKeyDonwEvent}
        tabIndex="-1"
        ref={ref => {
          this.modalOverlay = ref;
        }}
      >
        <div className={s.marksModal}>
          {!this.state.emailValidationCompleted ? (
            <div className={s.closeContianer}>
              <img
                className={s.closeIcon}
                src="/images/icons/testNametestName.svg"
                alt="password-lock"
                role="presentation"
                onClick={() => {
                  this.resetForgotPasswordChanges();
                }}
              />
            </div>
          ) : (
            <div className={s.closeContianer} />
          )}
          <div className={`${s.modalContent}`}>
            <div>
              <img
                className={s.emailIcon}
                src={
                  this.state.emailValidationCompleted
                    ? this.state.doneSrc
                    : this.state.emailSrc
                }
                alt="password-lock"
                title="password-lock"
                role="presentation"
              />
              {this.state.emailValidationCompleted ? (
                <div className={s.doneText}>
                  The password change link has been sent to your emailId.
                </div>
              ) : (
                <div>
                  <div className={s.emailText}>Enter Registered Email Id</div>
                  <div
                    style={{
                      display: 'inline-block',
                    }}
                  >
                    <input
                      id="email"
                      type="text"
                autoFocus //eslint-disable-line
                      onKeyDown={this.keyUp}
                      onChange={this.handleFortgotPasswordEmailID}
                      onFocus={this.handleFocus}
                      value={this.state.forgotPasswordEmaiID}
                    />
                    {this.state.forgotPasswordError
                      ? this.displayForgotPassowrdError()
                      : null}
                  </div>
                </div>
              )}
            </div>
            <div
              style={{
                margin: '40px 0 20px 0',
              }}
            >
              <button
                id="passcheck"
                onClick={this.validateForgotPasswordEmail}
                className={`btn ${s.emailBtn}`}
              >
                {this.state.emailValidationCompleted ? (
                  <span>Done</span>
                ) : (
                  <span>
                    Submit
                    {this.state.isForgotPasswordLoading ? (
                      <i className="fa fa-circle-o-notch fa-spin" />
                    ) : null}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
    return view;
  };

  displayForgotPassowrdError = () => {
    const view = (
      <div id="error" className={s.error}>
        <img
          className={s.errorIcon}
          src="/images/icons/error.svg"
          alt="error"
          title="error"
          role="presentation"
        />
        <p id="name_error" className={s.errorMessage}>
          {this.state.forgotPasswordError}
        </p>
      </div>
    );
    return view;
  };

  handleFormFieldChanges = (event, field) => {
    const formData = this.state.formData;
    const formFieldsError = this.state.formFieldsError;

    formData[field] = event.target.value;
    formFieldsError[field] = null;
    this.setState({ formData, formFieldsError });
  };

  handleLogin = event => {
    event.preventDefault();
    // Validation before sending Credentials
    if (!this.validateDetails()) {
      return;
    }
    toggleLoader(true);
    axios
      .post(
        `https://accounts.dev.hydra.egnify.io/auth/local`,
        this.state.formData,
      )
      .then(response => {
        toggleLoader(false);
        if (response.data) {
          const token = response.data.token;
          const accessControlToken = response.data.accessControlToken;
          if (token && accessControlToken) {
            this.redirectBackToHost(
              this.state.host,
              token,
              accessControlToken,
              this.state.formData.email,
            );
          }
        }
      })
      .catch(err => {
        toggleLoader(false);
        if (err.response && err.response.data) {
          const data = err.response.data;
          if (data && data.code) {
            const formFieldsError = this.state.formFieldsError;
            if (data.code === 'AU01') {
              formFieldsError.email = data.message;
            } else if (data.code === 'AU02') {
              formFieldsError.password = data.message;
            }
            this.setState({ formFieldsError });
          }
        } else {
          console.error(err);
        }
      });
  };

  validateDetails() {
    let validity = true;
    const formFieldsError = {};
    if (!this.validateEmail()) {
      formFieldsError.email = 'Invalid Email';
      validity = false;
    }
    if (this.state.formData.password.length === 0) {
      formFieldsError.password = 'Password cannot be empty';
      validity = false;
    }
    this.setState({ formFieldsError });
    return validity;
  }

  validateEmail() {
    const email = this.state.formData.email;
    const List = email.split('@');
    if (List.length > 1) {
      const tmpList = List[1].split('.');
      if (tmpList.length === 1) {
        return false;
      }
    } else {
      return false;
    }
    return true;
  }

  redirectBackToHost = (host, token, accessControlToken, email) => {
    if (host) {
      const expires = 24 * 60 * 60 * 1000;
      const domain = __DEV__ ? 'localhost' : '.egnify.io';
      setCookie({ key: 'token', value: token, expires, domain });
      setCookie({
        key: 'accessControlToken',
        value: accessControlToken,
        expires,
        domain,
      });
      setCookie({ key: 'email', value: email, expires, domain });
      setCookie({
        key: 'hostID',
        value: host.hostname.split('.')[0],
        expires,
        domain,
      });
      window.location = host.href;
    }
  };

  /**
    @description
     This method called when text changes in passowrd feild
    @return [void]
    @author janardhan
  */
  handleFortgotPasswordEmailID = event => {
    if (event.target.value) {
      this.setState({
        forgotPasswordEmaiID: event.target.value,
        forgotPasswordError: null,
      });
    } else {
      this.setState({
        forgotPasswordEmaiID: '',
        forgotPasswordError: null,
      });
    }
  };

  resetForgotPasswordChanges = () => {
    this.setState({
      showForgotPassword: !this.state.showForgotPassword,
      emailValidationCompleted: false,
    });
  };

  validateForgotPasswordEmail = async () => {
    if (this.state.emailValidationCompleted) {
      this.resetForgotPasswordChanges();
    } else if (
      this.state.forgotPasswordEmaiID &&
      this.state.forgotPasswordEmaiID.length > 0
    ) {
      this.setState(
        {
          forgotPasswordError: null,
          isForgotPasswordLoading: true,
        },
        () => {
          // console.log(this.state.forgotPasswordEmaiID);
          // const forgotPasswordFormData = new FormData();
          // forgotPasswordFormData.email = this.state.forgotPasswordEmaiID;
          axios
            .post(`${this.context.API_URL}/api/v1/users/sendResetLink`, {
              email: this.state.forgotPasswordEmaiID,
              hostname: window.location.hostname,
            })
            .then(response => {
              this.setState({ isForgotPasswordLoading: false });
              if (response.data) {
                const usersFound = response.data.usersFound;
                if (usersFound) {
                  this.setState({ emailValidationCompleted: true });
                } else {
                  this.setState({
                    forgotPasswordError: 'Something went wrong',
                  });
                }
              }
            })
            .catch(err => {
              console.error(err);
              this.setState({
                isForgotPasswordLoading: false,
                forgotPasswordError: 'Something went wrong',
              });
            });
        },
      );
    } else {
      this.setState({ forgotPasswordError: 'EmailId is empty' });
    }
  };

  handleKeyDonwEvent = e => {
    if (e.which === 27) {
      this.resetForgotPasswordChanges();
    }
  };

  render() {
    return (
      <div className="cover-full-container">
        <div className={`col no-padding ${s.signInContainer}`}>
          {this.displaySignIn()}
        </div>
        <div className={`col no-padding ${s.welcomeContainer}`}>
          {this.displayWelcome()}
        </div>
        {this.state.showForgotPassword ? this.displayForgotPassowrd() : null}
        <Loader />
      </div>
    );
  }
}

export default withStyles(s)(SignIn);
