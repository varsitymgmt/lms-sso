import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {
  getURLParams,
  getCookie,
  setCookie,
  toggleLoader,
  decriptedAccessToken,
} from 'utils/HelperMethods';
import Loader from 'components/Loader';
import s from './SignIn.scss';

// const steps = {
//   SignIn: { label: this.displayMainPage() },
//   SignUp: { label: this.displayOtpVerification() },
//   Otp: {},
//   SetPassword: {},
// };
const inputString = ['*', '*', '*', '*'];
const confirmPasswordString = ['*', '*', '*', '*'];
class SignIn extends React.Component {
  static contextTypes = {
    // GRAPHQL_API_URL: PropTypes.string.isRequired,
    API_URL: PropTypes.string.isRequired,
    API_EGNIFY_IO_URL: PropTypes.string.isRequired,
    // hostName for dev environment
    hostNameForDev: PropTypes.string.isRequired,
    // common host
    commonHost: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      formData: { hostName: 'luke.dev.lms.egnify.io', email: '' },
      emailImgSrc: '/images/icons/username.svg',
      emailValidationCompleted: false,
      doneSrc: '/images/institute-setup/done.svg',
      emailSrc: '/images/icons/mail.png',
      passwordImgSrc: '/images/icons/password.svg',
      showPassword: false,
      page: 'SignIn',
      mainPage: 'SignIn',
      formFieldsError: {},
      admissionId: '',
      otp: '',
      hashToken: '',
      showEmptyIdError: false,
      showIvalidIdError: false,
      showUnregisteredUserError: false,
      showAlreadyRegisteredUserError: false,
      showInvalidPasswordError: false,
      showOtpSendError: false,
      showInvalidOtpError: false,
      showCombinationError: false,
      otpSent: false,
      mobileNumber: null,
    };
  }

  componentDidMount() {
    this.setInitialFormFields();
  }

  setInitialFormFields = () => {
    let host = getURLParams('host');
    if (host) {
      // if the login source is different host then validate user exits
      host = new URL(host);
      if (
        getCookie(`token`) &&
        getCookie(`email`) &&
        getCookie('hostID') === host.hostname.split('.')[0]
      ) {
        // redirect back to host if valid
        window.location = host.href;
      }
    }
    this.setState({
      formData: {
        email: document.getElementById('admissionId').value,
        rememberMe: false,
        hostname: __DEV__ ? this.context.hostNameForDev : host.hostname,
      },
      host,
    });
  };

  setPassword = () => {
    let host = getURLParams('host');
    if (host) {
      // if the login source is different host then validate user exits
      host = new URL(host);
      if (
        getCookie(`token`) &&
        getCookie(`email`) &&
        getCookie('hostID') === host.hostname.split('.')[0]
      ) {
        // redirect back to host if valid
        window.location = host.href;
      }
    }
    this.setState({
      formData: {
        email: document.getElementById('admissionId').value,
        rememberMe: false,
        hostname: __DEV__ ? this.context.hostNameForDev : host.hostname,
      },
      host,
    });
  };

  setPassword = () => {
    let host = getURLParams('host');
    if (host) {
      // if the login source is different host then validate user exits
      host = new URL(host);
      if (
        getCookie(`token`) &&
        getCookie(`email`) &&
        getCookie('hostID') === host.hostname.split('.')[0]
      ) {
        // redirect back to host if valid
        window.location = host.href;
      }
    }
    axios
      .post(`${this.context.API_EGNIFY_IO_URL}/api/v1/users/resetpassword`, {
        hashToken: this.state.hashToken,
        newPassword: confirmPasswordString.toString().replace(/,/g, ''),
      })
      .then(() => {
        const formData = this.state.formData;
        formData.password = confirmPasswordString.toString().replace(/,/g, '');
        this.setState({ formData }, () => this.handleSignIn());
      })
      .catch(err => {
        console.error('handleVerifyUser', err.response);
      });

    // navigation.navigate(ROUTE_NAMES.setPassword, { activeTab });
  };

  displaySetPasswordPage = () => (
    <div>
      <div className={s.welcomeSetPassword}>Set Password</div>
      <div>
        <div className={s.enterPwd}>Enter Password</div>
        <div className={s.textInputOtpContainer}>
          <input
            type="text"
            name="sign"
            maxLength="1"
            id="box1"
            onChange={e => {
              const pattern = /[0-9]/g;
              if (e.target.value.match(pattern)) {
                document.getElementById('box1').value = e.target.value;
                inputString[0] = e.target.value;
                document.getElementById('box2').focus();
              } else {
                document.getElementById('box1').value = '';
                inputString[0] = '*';
              }
            }}
            className={s.textInputOtp}
          />
          <input
            type="text"
            name="sign"
            maxLength="1"
            id="box2"
            onChange={e => {
              const pattern = /[0-9]/g;
              if (e.target.value.match(pattern)) {
                inputString[1] = e.target.value;
                document.getElementById('box2').value = e.target.value;
                document.getElementById('box3').focus();
              } else {
                document.getElementById('box2').value = '';
                inputString[1] = '*';
              }
            }}
            className={s.textInputOtp}
          />
          <input
            type="text"
            name="sign"
            maxLength="1"
            id="box3"
            onChange={e => {
              const pattern = /[0-9]/g;
              if (e.target.value.match(pattern)) {
                inputString[2] = e.target.value;
                document.getElementById('box3').value = e.target.value;
                document.getElementById('box4').focus();
              } else {
                document.getElementById('box3').value = '';
                inputString[2] = '*';
              }
            }}
            className={s.textInputOtp}
          />
          <input
            type="text"
            name="sign"
            maxLength="1"
            id="box4"
            onChange={e => {
              const pattern = /[0-9]/g;
              if (e.target.value.match(pattern)) {
                inputString[3] = e.target.value;
                document.getElementById('Cbox1').focus();
              } else {
                document.getElementById('box4').value = '';
                inputString[3] = '*';
              }
            }}
            className={s.textInputOtp}
          />
        </div>
        <div className={s.enterPwd}>Confirm Password</div>
        <div className={s.textInputOtpContainer}>
          <input
            type="text"
            name="sign"
            maxLength="1"
            id="Cbox1"
            onChange={e => {
              const pattern = /[0-9]/g;
              if (e.target.value.match(pattern)) {
                document.getElementById('Cbox1').value = e.target.value;
                confirmPasswordString[0] = e.target.value;
                document.getElementById('Cbox2').focus();
              } else {
                document.getElementById('Cbox1').value = '';
                confirmPasswordString[0] = '*';
              }
            }}
            className={s.textInputOtp}
          />
          <input
            type="text"
            name="sign"
            maxLength="1"
            id="Cbox2"
            onChange={e => {
              const pattern = /[0-9]/g;
              if (e.target.value.match(pattern)) {
                confirmPasswordString[1] = e.target.value;
                document.getElementById('Cbox2').value = e.target.value;
                document.getElementById('Cbox3').focus();
              } else {
                document.getElementById('Cbox2').value = '';
                confirmPasswordString[1] = '*';
              }
            }}
            className={s.textInputOtp}
          />
          <input
            type="text"
            name="sign"
            maxLength="1"
            id="Cbox3"
            onChange={e => {
              const pattern = /[0-9]/g;
              if (e.target.value.match(pattern)) {
                confirmPasswordString[2] = e.target.value;
                document.getElementById('Cbox3').value = e.target.value;
                document.getElementById('Cbox4').focus();
              } else {
                document.getElementById('Cbox3').value = '';
                confirmPasswordString[2] = '*';
              }
            }}
            className={s.textInputOtp}
          />
          <input
            type="text"
            name="sign"
            maxLength="1"
            id="Cbox4"
            onChange={e => {
              const pattern = /[0-9]/g;
              if (e.target.value.match(pattern)) {
                confirmPasswordString[3] = e.target.value;
              } else {
                document.getElementById('Cbox4').value = '';
                confirmPasswordString[3] = '*';
              }
            }}
            className={s.textInputOtp}
          />
        </div>
        <div className={s.error}>
          {this.state.showCombinationError ? 'Password did not match' : null}
        </div>
        <div
          className={s.btn}
          role="presentation"
          onClick={() => {
            if (
              JSON.stringify(inputString) ===
              JSON.stringify(confirmPasswordString)
            ) {
              this.setState(
                {
                  showCombinationError: false,
                },
                () => this.setPassword(),
              );
            } else this.setState({ showCombinationError: true });
          }}
        >
          <div className={s.btnText}>SIGN UP</div>
        </div>
      </div>
    </div>
  );

  validateOtp = otp => {
    let validOtp = true;
    if (otp.length !== 4) {
      validOtp = false;
      this.setState({
        formFieldsError: { password: 'Invalid OTP' },
      });
    }
    return validOtp;
  };

  handleVerifyOTP = () => {
    if (this.validateOtp(this.state.otp)) {
      axios
        .post(`${this.context.API_EGNIFY_IO_URL}/api/v1/users/verifyOTP`, {
          email: this.state.admissionId,
          otp: this.state.otp,
        })
        .then(async response => {
          const data = response.data;
          if (data && data.success) {
            // localStorage.setItem('hashToken', data.hashToken);
            this.setState({
              page: 'SetPassword',
              hashToken: data.hashToken,
              showInvalidOtpError: false,
            });
          } else if (data && !data.success) {
            this.setState({
              formFieldsError: data.message,
              showInvalidOtpError: true,
            });
          }
          // this.handleVerifyUserResponse(response);
        })
        .catch(err => {
          // this.setState({ showLoader: false });
          if (err.response && err.response.data) {
            this.setState({
              formFieldsError: err.response.data.message,
              showInvalidOtpError: false,
            });
          }
          console.error('handleVerifyUser', err.response);
        });
    }
    // navigation.navigate(ROUTE_NAMES.setPassword, { activeTab });
  };

  receiveOtp = () => {
    this.setState({ otpSent: false });
    axios
      .post(`${this.context.API_EGNIFY_IO_URL}/api/v1/users/sendOTP`, {
        email: this.state.admissionId.toUpperCase(),
      })
      .then(response => {
        if (response.data && response.data.status === 'success') {
          this.setState({
            otpSent: true,
            mobileNumber: response.data.mobileno,
          });
        }
      })
      .catch(err => {
        this.setState({
          showOtpSendError: true,
        });
        console.error('verifyUser', err.response);
      });
  };

  displayOtpVerification = () => {
    let host = getURLParams('host');
    if (host) {
      // if the login source is different host then validate user exits
      host = new URL(host);
      if (
        getCookie(`token`) &&
        getCookie(`email`) &&
        getCookie('hostID') === host.hostname.split('.')[0]
      ) {
        // redirect back to host if valid
        window.location = host.href;
      }
    }
    return (
      <div className={s.lowerBox}>
        <div>
          <div className={s.otpVerification}>OTP Verification</div>
          <div className={s.otpText}>
            {this.state.showOtpSendError
              ? 'Something went wrong, please try resend otp option'
              : null}
            {!this.state.showOtpSendError && this.state.mobileNumber
              ? `Enter the 4-digit OTP we’ve just sent to ${
                  this.state.mobileNumber
                }`
              : null}
          </div>
        </div>
        <div className={s.textInputOtpContainer}>
          <input
            type="text"
            name="sign"
            maxLength="1"
            id="box1"
            onChange={e => {
              const pattern = /[0-9]/g;
              if (e.target.value.match(pattern)) {
                document.getElementById('box1').value = e.target.value;
                inputString[0] = e.target.value;
                document.getElementById('box2').focus();
              } else {
                document.getElementById('box1').value = '';
                inputString[0] = '*';
              }
            }}
            className={s.textInputOtp}
          />
          <input
            type="text"
            name="sign"
            maxLength="1"
            id="box2"
            onChange={e => {
              const pattern = /[0-9]/g;
              if (e.target.value.match(pattern)) {
                inputString[1] = e.target.value;
                document.getElementById('box2').value = e.target.value;
                document.getElementById('box3').focus();
              } else {
                document.getElementById('box2').value = '';
                inputString[1] = '*';
              }
            }}
            className={s.textInputOtp}
          />
          <input
            type="text"
            name="sign"
            maxLength="1"
            id="box3"
            onChange={e => {
              const pattern = /[0-9]/g;
              if (e.target.value.match(pattern)) {
                inputString[2] = e.target.value;
                document.getElementById('box3').value = e.target.value;
                document.getElementById('box4').focus();
              } else {
                document.getElementById('box3').value = '';
                inputString[2] = '*';
              }
            }}
            className={s.textInputOtp}
          />
          <input
            type="text"
            name="sign"
            maxLength="1"
            id="box4"
            onChange={e => {
              const pattern = /[0-9]/g;
              if (e.target.value.match(pattern)) {
                inputString[3] = e.target.value;
              } else {
                document.getElementById('box4').value = '';
                inputString[3] = '*';
              }
            }}
            className={s.textInputOtp}
          />
        </div>
        <div className={s.errorOtp}>
          {this.state.showInvalidOtpError ? this.state.formFieldsError : null}
        </div>
        <div
          className={s.resend}
          onClick={() => () => {
            const formData = this.state.formData;
            formData.email = this.state.admissionId;
            this.setState({ formData }, () => this.handleSignIn());
          }}
          role="presentation"
        >
          Resend OTP
        </div>
        <div
          className={s.btn}
          role="presentation"
          onClick={() =>
            this.setState(
              {
                otp: inputString.toString().replace(/,/g, ''),
              },
              () => this.handleVerifyOTP(),
            )
          }
        >
          <div
            className={s.btnText}
            onClick={() =>
              this.setState(
                {
                  otp: inputString.toString().replace(/,/g, ''),
                },
                () => this.handleVerifyOTP(),
              )
            }
            role="presentation"
          >
            CONFIRM OTP
          </div>
        </div>
      </div>
    );
  };

  redirectBackToHost = (host, token, accessControlToken, email) => {
    if (host) {
      const expires = 24 * 60 * 60 * 1000;
      const domain = this.context.commonHost;
      console.info('domain ', domain);
      const { roleName } = decriptedAccessToken(accessControlToken);
      setCookie({ key: 'token', value: token, expires, domain });
      setCookie({ key: 'email', value: email, expires, domain });
      setCookie({ key: 'roleName', value: roleName, expires, domain });
      setCookie({
        key: 'hostID',
        value: host.hostname.split('.')[0],
        expires,
        domain,
      });
      window.location = host.href;
    }
  };

  handleSignIn = () => {
    toggleLoader(true);
    axios
      .post(`${this.context.API_EGNIFY_IO_URL}/auth/local`, this.state.formData)
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
          this.setState({ showInvalidPasswordError: false });
        }
      })
      .catch(err => {
        toggleLoader(false);
        if (err.response && err.response.data) {
          const data = err.response.data;
          const formFieldsError = this.state.formFieldsError;
          if (data.code === 'AU02') {
            formFieldsError.password = data.message;
          }
          this.setState({ formFieldsError, showInvalidPasswordError: true });
        } else {
          console.error(err);
        }
      });
  };

  displayFormFieldError = () => {
    const div = <div>{this.state.formFieldsError.password}</div>;
    return div;
  };

  displayEnterPasswordPage = () => {
    let host = getURLParams('host');
    if (host) {
      // if the login source is different host then validate user exits
      host = new URL(host);
      if (
        getCookie(`token`) &&
        getCookie(`email`) &&
        getCookie('hostID') === host.hostname.split('.')[0]
      ) {
        // redirect back to host if valid
        window.location = host.href;
      }
    }
    return (
      <div>
        <div className={s.welcomeSetPassword}>Password</div>
        <div>
          <div className={s.enterPwdSignInPage}>Enter your password</div>
          <div className={s.textInputOtpContainer}>
            <input
              type="text"
              name="sign"
              maxLength="1"
              id="box1"
              onChange={e => {
                const pattern = /[0-9]/g;
                if (e.target.value.match(pattern)) {
                  document.getElementById('box1').value = e.target.value;
                  inputString[0] = e.target.value;
                  document.getElementById('box2').focus();
                } else {
                  document.getElementById('box1').value = '';
                  inputString[0] = '*';
                }
              }}
              className={s.textInputOtp}
            />
            <input
              type="text"
              name="sign"
              maxLength="1"
              id="box2"
              onChange={e => {
                const pattern = /[0-9]/g;
                if (e.target.value.match(pattern)) {
                  inputString[1] = e.target.value;
                  document.getElementById('box2').value = e.target.value;
                  document.getElementById('box3').focus();
                } else {
                  document.getElementById('box2').value = '';
                  inputString[1] = '*';
                }
              }}
              className={s.textInputOtp}
            />
            <input
              type="text"
              name="sign"
              maxLength="1"
              id="box3"
              onChange={e => {
                const pattern = /[0-9]/g;
                if (e.target.value.match(pattern)) {
                  inputString[2] = e.target.value;
                  document.getElementById('box3').value = e.target.value;
                  document.getElementById('box4').focus();
                } else {
                  document.getElementById('box3').value = '';
                  inputString[2] = '*';
                }
              }}
              className={s.textInputOtp}
            />
            <input
              type="text"
              name="sign"
              maxLength="1"
              id="box4"
              onChange={e => {
                const pattern = /[0-9]/g;
                if (e.target.value.match(pattern)) {
                  inputString[3] = e.target.value;
                } else {
                  document.getElementById('box4').value = '';
                  inputString[3] = '*';
                }
              }}
              className={s.textInputOtp}
            />
          </div>
          <div className={s.error}>
            {this.state.showInvalidPasswordError
              ? this.displayFormFieldError()
              : null}
          </div>
          <div className={s.lowerBox}>
            <div
              className={s.btn}
              role="presentation"
              onClick={() => {
                const formData = this.state.formData;
                formData.password = inputString.toString().replace(/,/g, '');
                this.setState({ formData }, () => this.handleSignIn());
              }}
            >
              <div className={s.btnText} role="presentation">
                SIGN IN
              </div>
            </div>
          </div>
          <div
            className={s.forgotPassword}
            onClick={() => {
              this.setState(
                {
                  page: 'Otp',
                  showEmptyIdError: false,
                  showIvalidIdError: false,
                  showUnregisteredUserError: false,
                  showAlreadyRegisteredUserError: false,
                },
                () => this.receiveOtp(),
              );
            }}
            role="presentation"
          >
            Forgot password?
          </div>
        </div>
      </div>
    );
  };

  validateSignInID = () => {
    axios
      .post(
        `${this.context.API_EGNIFY_IO_URL}/auth/verifyUser`,
        this.state.formData,
      )
      .then(response => {
        if (this.state.admissionId.length !== 0) {
          if (this.state.page === 'SignIn' && response.data.firstTimeLogin)
            this.setState({
              showEmptyIdError: false,
              showIvalidIdError: false,
              showUnregisteredUserError: true,
              showAlreadyRegisteredUserError: false,
            });
          else if (
            this.state.page === 'SignUp' &&
            !response.data.firstTimeLogin
          ) {
            // this.setState({
            //   showEmptyIdError: false,
            //   showIvalidIdError: false,
            //   showUnregisteredUserError: false,
            //   showAlreadyRegisteredUserError: true,
            // });
            this.setState(
              {
                page: 'Otp',
                showEmptyIdError: false,
                showIvalidIdError: false,
                showUnregisteredUserError: false,
                showAlreadyRegisteredUserError: false,
              },
              () => this.receiveOtp(),
            );
          } else if (this.state.page === 'SignIn') {
            this.setState({
              page: 'EnterPassword',
              showEmptyIdError: false,
              showIvalidIdError: false,
              showUnregisteredUserError: false,
              showAlreadyRegisteredUserError: false,
            });
          } else {
            this.setState(
              {
                page: 'Otp',
                showEmptyIdError: false,
                showIvalidIdError: false,
                showUnregisteredUserError: false,
                showAlreadyRegisteredUserError: false,
              },
              () => this.receiveOtp(),
            );
          }
        }
      })
      .catch(err => {
        if (this.state.admissionId.length !== 0) {
          this.setState({
            showEmptyIdError: false,
            showIvalidIdError: true,
            showUnregisteredUserError: false,
            showAlreadyRegisteredUserError: false,
          });
        } else
          this.setState({
            showEmptyIdError: true,
            showIvalidIdError: false,
            showUnregisteredUserError: false,
            showAlreadyRegisteredUserError: false,
          });
        console.error(err);
      });
  };

  displaySignInPage = () => {
    let host = getURLParams('host');
    if (host) {
      // if the login source is different host then validate user exits
      host = new URL(host);
      if (
        getCookie(`token`) &&
        getCookie(`email`) &&
        getCookie('hostID') === host.hostname.split('.')[0]
      ) {
        // redirect back to host if valid
        window.location = host.href;
      }
    }
    return (
      <div>
        <div>
          <div className={s.welcome}>
            {this.state.page === 'SignIn' ? 'Sign In' : 'Sign Up'}
          </div>
          <div className={s.signInText}>Enter your Admission ID</div>
        </div>

        <div className={s.admissionId}>Admission ID</div>
        <input
          className={s.textInput}
          type="text"
          name="sign"
          id="admissionId"
        />
        <div className={s.error}>
          {this.state.showEmptyIdError ? 'Admission Id cannot be empty.' : null}
          {this.state.showIvalidIdError ? 'Admission Id is invalid.' : null}
          {this.state.showUnregisteredUserError
            ? 'Admission Id is unregistered.'
            : null}
          {this.state.showAlreadyRegisteredUserError
            ? 'Admission Id is already registered.'
            : null}
        </div>
        <div className={s.lowerBox}>
          <div
            className={s.btn}
            role="presentation"
            onClick={() => {
              const formData = this.state.formData;
              formData.email = document.getElementById('admissionId').value;
              this.setState(
                {
                  formData,
                  admissionId: document.getElementById('admissionId').value,
                },
                () => this.validateSignInID(),
              );
            }}
          >
            <div className={s.btnText}>NEXT</div>
          </div>
        </div>
      </div>
    );
  };

  displayLogInPage = () => (
    <div>
      <img
        src="/images/guru.png"
        alt=""
        className={s.logo}
        width="50px"
        height="60px"
      />
      <div className={s.mainContainer}>
        {/* <div className={s.mainContainer}>{this.displayOtpVerification()}</div> */}
        {this.state.page === 'SignIn' || this.state.page === 'SignUp'
          ? this.displaySignInPage()
          : null}
        {this.state.page === 'Otp' ? this.displayOtpVerification() : null}
        {this.state.page === 'SetPassword'
          ? this.displaySetPasswordPage()
          : null}
        {this.state.page === 'EnterPassword'
          ? this.displayEnterPasswordPage()
          : null}
      </div>

      <div className={s.bottom}>
        <div className={s.bottomText}>
          {this.state.mainPage === 'SignIn'
            ? 'Don’t have an account?'
            : 'Already have an account?'}
        </div>
        <div
          className={s.bottomSignUpBtn}
          role="presentation"
          onClick={() => {
            this.setState({
              page: this.state.mainPage === 'SignUp' ? 'SignIn' : 'SignUp',
              mainPage: this.state.mainPage === 'SignUp' ? 'SignIn' : 'SignUp',
              showEmptyIdError: false,
              showIvalidIdError: false,
              showUnregisteredUserError: false,
              showAlreadyRegisteredUserError: false,
            });
          }}
        >
          <div className={s.signUpBtnText}>
            {this.state.mainPage === 'SignUp' ? 'SIGN IN' : 'SIGN UP'}
          </div>
        </div>
      </div>
    </div>
  );

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
        <img src="/images/welcome.svg" alt="welcome" />
        <div
          style={{
            fontSize: '36px',
            color: '#3e3e5f',
            textAlign: 'center',
            fontWeight: 300,
            marginTop: '30px',
          }}
        >
          Welcome to Rankguru!
        </div>
      </div>
    );
    return view;
  };

  render() {
    return (
      <div className="cover-full-container">
        <div className={`col no-padding ${s.logInContainer}`}>
          {this.displayLogInPage()}
        </div>
        <div className={`col no-padding ${s.welcomeContainer}`}>
          {this.displayWelcome()}
        </div>
        <Loader />
      </div>
    );
  }
}

export default withStyles(s)(SignIn);
