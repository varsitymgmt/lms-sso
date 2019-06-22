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
import s from './SignIn.scss';

const inputString = ['*', '*', '*', '*'];
const confirmPasswordString = ['*', '*', '*', '*'];
class SignIn extends React.Component {
  static contextTypes = {
    API_URL: PropTypes.string.isRequired,
    API_EGNIFY_IO_URL: PropTypes.string.isRequired,
    hostNameForDev: PropTypes.string.isRequired,
    commonHost: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      formData: { hostName: 'luke.dev.lms.egnify.io', email: '' },
      emailImgSrc: '/images/icons/username.svg',
      doneSrc: '/images/institute-setup/done.svg',
      emailSrc: '/images/icons/mail.png',
      passwordImgSrc: '/images/icons/password.svg',
      page: 'SignIn',
      mainPage: 'SignIn',
      formFieldsError: {},
      admissionId: '',
      otp: '',
      hashToken: '',
      showInvalidPasswordError: false,
      showOtpSendError: false,
      showCombinationError: false,
      otpSent: false,
      mobileNumber: null,
    };
  }

  componentDidMount() {
    this.setInitialFormFields();
  }

  /**
    @description
      This function sets the initial form fields
    @author Shounak, Divya
  */
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

  /**
    @description
      This function sets new password and then redirects user
    @author Shounak, Divya
  */
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

  /**
    @description
      This function displays confirm password holder part of sign in/up page
    @author Shounak, Divya
  */
  displayConfirmPasswordHolder = () => (
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
        onKeyDown={e => {
          const pattern = /[0-9]/g;
          if (e.keyCode === 8 && !e.target.value.match(pattern)) {
            document.getElementById('Cbox1').focus();
          }
        }}
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
        onKeyDown={e => {
          const pattern = /[0-9]/g;
          if (e.keyCode === 8 && !e.target.value.match(pattern)) {
            document.getElementById('Cbox2').focus();
          }
        }}
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
        onKeyDown={e => {
          const pattern = /[0-9]/g;
          if (e.keyCode === 8 && !e.target.value.match(pattern)) {
            document.getElementById('Cbox3').focus();
          }
          if (e.keyCode === 13) {
            if (
              JSON.stringify(inputString) ===
              JSON.stringify(confirmPasswordString)
            ) {
              this.setState({ showCombinationError: false }, () =>
                this.setPassword(),
              );
            } else {
              this.setState({ showCombinationError: true });
            }
          }
        }}
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
  );

  /**
    @description
      This function displays the set password part of sign in/up page
    @author Shounak, Divya
  */
  displaySetPasswordPage = () => (
    <div>
      <div className={s.welcomeSetPassword}>Set Password</div>
      <div>
        <div className={s.enterPwd}>Enter Password</div>
        {this.displayPasswordHolder()}
        <div className={s.enterPwd}>Confirm Password</div>
        {this.displayConfirmPasswordHolder()}
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

  /**
    @description
      This function returns error if otp entered is incorrect
    @author Shounak, Divya
  */
  validateOtp = otp => {
    let validOtp = true;
    if (otp.length !== 4) {
      validOtp = false;
      const { formFieldsError } = this.state;
      formFieldsError.password = 'Invalid OTP';
      this.setState({ formFieldsError });
    }
    return validOtp;
  };

  /**
    @description
      This function checks if otp entered is correct or not
    @author Shounak, Divya
  */
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
            });
          } else if (data && !data.success) {
            const { formFieldsError } = this.state;
            formFieldsError.otp = data.message;
            this.setState({ formFieldsError });
          }
          // this.handleVerifyUserResponse(response);
        })
        .catch(err => {
          // this.setState({ showLoader: false });
          if (err.response && err.response.data) {
            const { formFieldsError } = this.state;
            formFieldsError.otp = err.response.data.message;
            this.setState({ formFieldsError });
          }
          console.error('handleVerifyUser', err.response);
        });
    }
    // navigation.navigate(ROUTE_NAMES.setPassword, { activeTab });
  };

  /**
    @description
      This function checks if otp is received or not
    @author Shounak, Divya
  */
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
        this.setState({ showOtpSendError: true });
        console.error('verifyUser', err.response);
      });
  };

  /**
    @description
      This function displays otp part of sign in/up page
    @author Shounak, Divya
  */
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
    if (!this.state.otpSent)
      return (
        <div className={s.loader}>
          <img src="/images/loader.svg" alt="loader" />
        </div>
      );
    return (
      <div className={s.lowerBox}>
        {this.state.mobileNumber ? (
          <div>
            <div className={s.otpVerification}>OTP Verification</div>
            <div className={s.otpText}>
              {this.state.showOtpSendError
                ? 'Something went wrong, please try resend otp option'
                : null}
              {!this.state.showOtpSendError
                ? `Enter the 4-digit OTP we’ve just sent to ${
                    this.state.mobileNumber
                  }`
                : null}
            </div>
          </div>
        ) : null}
        {this.displayPasswordHolder()}
        {this.displayFormFieldError('otp')}
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

  /**
    @description
      This function redirects user if password is correct
    @author Shounak, Divya
  */
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

  /**
    @description
      This function checks if password is correct or not for sign in page
    @author Shounak, Divya
  */
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
          const { formFieldsError } = this.state;
          if (data.code === 'AU02') {
            formFieldsError.password = data.message;
          }
          this.setState({ formFieldsError, showInvalidPasswordError: true });
        } else {
          console.error(err);
        }
      });
  };

  /**
    @description
      This function returns the errors if sign in fails
    @author Shounak, Divya
  */
  displayFormFieldError = field => (
    <div className={s.error}>
      <div>
        {this.state.formFieldsError[field]
          ? this.state.formFieldsError[field]
          : ''}
      </div>
    </div>
  );

  /**
    @description
      This function displays the password holder part of sign in/up page
    @author Shounak, Divya
  */
  displayPasswordHolder = () => (
    <div className={s.textInputOtpContainer}>
      <input
        type="text"
        name="sign"
        maxLength="1"
        id="box1"
        autoFocus //eslint-disable-line
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
        onKeyDown={e => {
          const pattern = /[0-9]/g;
          if (e.keyCode === 8 && !e.target.value.match(pattern)) {
            document.getElementById('box1').focus();
          }
        }}
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
        onKeyDown={e => {
          const pattern = /[0-9]/g;
          if (e.keyCode === 8 && !e.target.value.match(pattern)) {
            document.getElementById('box2').focus();
          }
        }}
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
        onKeyDown={e => {
          const pattern = /[0-9]/g;
          if (e.keyCode === 8 && !e.target.value.match(pattern)) {
            document.getElementById('box3').focus();
          }
          if (e.keyCode === 13) {
            if (this.state.page === 'EnterPassword') {
              const formData = this.state.formData;
              formData.password = inputString.toString().replace(/,/g, '');
              this.setState({ formData }, () => this.handleSignIn());
            }
            if (this.state.page === 'Otp') {
              this.setState(
                {
                  otp: inputString.toString().replace(/,/g, ''),
                },
                () => this.handleVerifyOTP(),
              );
            }
            if (this.state.page === 'SetPassword') {
              document.getElementById('Cbox1').focus();
            }
          }
        }}
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
  );

  /**
    @description
      This function displays the enter password part of sign in/up page
    @author Shounak, Divya
  */
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
          {this.displayPasswordHolder()}
          {this.displayFormFieldError('password')}
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
              this.setState({ page: 'Otp' }, () => this.receiveOtp());
            }}
            role="presentation"
          >
            Forgot password?
          </div>
        </div>
      </div>
    );
  };

  /**
    @description
      This function validates the admission id entered by the user
    @author Shounak, Divya
  */
  validateSignInID = () => {
    if (!this.state.formData.email) {
      const { formFieldsError } = this.state;
      formFieldsError.email = 'Admission ID cannot be empty';
      this.setState({ formFieldsError });
      return;
    }
    axios
      .post(
        `${this.context.API_EGNIFY_IO_URL}/auth/verifyUser`,
        this.state.formData,
      )
      .then(response => {
        const { formFieldsError, page } = this.state;
        if (response.data && response.data.authorized) {
          if (page === 'SignIn' && response.data.firstTimeLogin) {
            formFieldsError.email = response.data.message;
          } else if (page === 'SignUp' && !response.data.firstTimeLogin) {
            formFieldsError.email =
              'Admission ID is already registered, please Sign In.';
          } else if (page === 'SignIn') {
            this.setState({ page: 'EnterPassword' });
          } else {
            this.setState({ page: 'Otp' }, () => this.receiveOtp());
          }
        } else if (response.data && !response.data.authorized) {
          formFieldsError.email = response.data.message;
        } else {
          formFieldsError.email = 'Something went wrong, please try again';
        }
        this.setState({ formFieldsError });
      })
      .catch(err => {
        const { formFieldsError } = this.state;
        if (err.response && err.response.data) {
          formFieldsError.email = err.response.data.message;
        } else {
          formFieldsError.email = 'Something went wrong, please try again';
        }
        this.setState({ formFieldsError });
        console.error(err);
      });
  };

  /**
    @description
      This function displays the enter admission id part of sign in/up page
    @author Shounak, Divya
  */
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
      <div className="row" style={{ width: '100%' }}>
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
          autoFocus //eslint-disable-line
          onKeyDown={e => {
            const { formData, formFieldsError } = this.state;
            formData.email = document.getElementById('admissionId').value;
            if (formData.email) {
              formFieldsError.email = null;
            }
            if (e.keyCode === 13) {
              this.setState(
                {
                  formData,
                  formFieldsError,
                  admissionId: formData.email,
                },
                () => this.validateSignInID(),
              );
            }
            this.setState({ formFieldsError });
          }}
        />
        {this.displayFormFieldError('email')}
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

  /**
    @description
      This function displays the left side view in sign in/up page
    @author Shounak, Divya
  */
  displayLogInPage = () => (
    <div className={`${s.mainContainer} row`}>
      <div className={s.signInBody}>
        <div className={s.logoContainer}>
          <img
            src="/images/rankguru-evidya-logo.png"
            alt=""
            className={s.logo}
          />
        </div>
        {this.state.page === 'SignIn' || this.state.page === 'SignUp'
          ? this.displaySignInPage()
          : null}
        {this.state.page === 'EnterPassword'
          ? this.displayEnterPasswordPage()
          : null}
        {this.state.page === 'Otp' ? this.displayOtpVerification() : null}
        {this.state.page === 'SetPassword'
          ? this.displaySetPasswordPage()
          : null}
        <div className={s.bottom}>
          <div className={s.bottomText}>
            {this.state.mainPage === 'SignIn'
              ? 'Are you logging in for first time?'
              : 'Already a registered user?'}
          </div>
          <div
            className={s.bottomSignUpBtn}
            role="presentation"
            onClick={() => {
              this.setState({
                page: this.state.mainPage === 'SignUp' ? 'SignIn' : 'SignUp',
                mainPage:
                  this.state.mainPage === 'SignUp' ? 'SignIn' : 'SignUp',
              });
            }}
          >
            <div className={s.signUpBtnText}>
              {this.state.mainPage === 'SignUp' ? 'SIGN IN' : 'SIGN UP'}
            </div>
          </div>
        </div>
      </div>
      <div className={`row ${s.customerInfo}`}>
        <div className={s.query}>
          For sign in/sign up queries, please contact us on
        </div>
        <div className={s.number}>040-71045045</div>
      </div>
    </div>
  );

  /**
    @description
      This function displays the right side view in sign in/up page
    @author Shounak, Divya
  */
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
          Welcome to Rankguru eVidya!
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
      </div>
    );
  }
}

export default withStyles(s)(SignIn);
