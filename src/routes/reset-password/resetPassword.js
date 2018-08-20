import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import axios from 'axios';
import { toggleLoader } from 'utils/HelperMethods';
import s from './resetPassword.css';

function getParameterByName(name, url) {
  const param = name.replace(/[[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${param}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// function checkPassValidity(email) {
//   if (email.length < 6) {
//     return false;
//   }
//   const boolVal = /[a-z]/.test(email) && /[A-Z]/.test(email);
//   return boolVal;
// }

class resetPassword extends React.Component {
  static contextTypes = {
    // GRAPHQL_API_URL: PropTypes.string.isRequired,
    API_URL: PropTypes.string.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      passwordClass: s.textbox,
      password: '',
      confirmPassword: '',
      passwordError: null,
      passwordImgSrc: '/images/icons/password.svg',
      hash: null,
      ischangedSuccessfully: false,
    };
  }

  componentDidMount() {
    this.gethashCode();
  }

  gethashCode = () => {
    const url = window.location.href;
    const hash = getParameterByName('token', url);
    this.setState({ hash }, () => {
      this.checkHashCode();
    });
  };

  checkHashCode = () => {
    toggleLoader(true);
    axios
      .post(
        `${this.context.API_URL}/api/v1/users/validateForgotPassSecureHash`,
        {
          hashToken: this.state.hash,
        },
      )
      .then(response => {
        toggleLoader(false);
        if (!response.data.isValid) {
          window.location = `${window.location.origin}/login`;
        }
      })
      .catch(err => {
        toggleLoader(false);
        console.error(err);
        window.location = `${window.location.origin}/login`;
      });
  };

  changeNewPassword = () => {
    if (this.state.ischangedSuccessfully) {
      window.location = `${window.location.origin}/login`;
    } else if (!this.state.passwordError) {
      if (
        this.state.password.length > 0 &&
        this.state.confirmPassword.length > 0
      ) {
        toggleLoader(true);
        axios
          .post(`${this.context.API_URL}/api/v1/users/resetpassword`, {
            hashToken: this.state.hash,
            password: this.state.confirmPassword,
          })
          .then(() => {
            toggleLoader(false);
            this.setState({ ischangedSuccessfully: true });
          })
          .catch(err => {
            toggleLoader(false);

            console.error(err);
            this.setState({});
          });
      } else {
        this.setState({ passwordError: 'Fields are empty' });
      }
    }
  };

  handlePassword = (event, from) => {
    if (from === 1 && event.target.value.length > 0) {
      this.setState({ password: event.target.value, confirmPassword: '' });
    } else if (event.target.value.length > 0) {
      this.setState({ confirmPassword: event.target.value }, () => {
        if (this.state.password !== this.state.confirmPassword) {
          this.setState({ passwordError: 'Password not matched' });
        } else {
          this.setState({ passwordError: null });
        }
      });
    } else {
      this.setState({ passwordError: null, password: '', confirmPassword: '' });
    }
  };

  /**
    @description This method toggles status modal
    @return [void]
    @author Janardhan
  */
  toggleStatusModal = () => {
    if (this.state.showStatusModal) {
      this.setState({ showStatusModal: !this.state.showStatusModal });
    }
  };

  render() {
    return (
      <div className={`row`}>
        <div className={`col m12`}>
          <div className={`card ${s.container} row`} id="signInCard">
            {this.state.ischangedSuccessfully
              ? <div className={` ${s.bodyContainer}`}>
                  <img
                    className={s.doneIcon}
                    src="/images/institute-setup/done.svg"
                    alt="Done"
                    title="Done"
                  />
                  <div className={s.doneText}>
                    The password changed successfully
                  </div>
                </div>
              : <div className={` ${s.bodyContainer}`}>
                  <div className={`${s.wishMessage}`}>Reset Your Password</div>
                  <div className={`${s.signInMessage}`}>
                    Almost done, just enter your new password below.
                  </div>
                  <div className={s.passwordContainer}>
                    <div className={`${s.passwordEntrySection}`}>
                      <div>New Password</div>
                      <div className={`${s.passowrd}`}>
                        <img
                          src={this.state.passwordImgSrc}
                          width="19"
                          height="19"
                          alt="email"
                          className={`${s.passowrdImg}`}
                        />
                        <input
                          placeholder="Enter new password"
                          id="nameIdSearch"
                          type="password"
                          value={this.state.password}
                          onChange={e => this.handlePassword(e, 1)}
                          className={this.state.passwordClass}
                        />
                      </div>
                    </div>

                    <div className={`${s.passwordEntrySection}`}>
                      <div>Confirm Password</div>
                      <div className={`${s.passowrd}`}>
                        <img
                          src={this.state.passwordImgSrc}
                          width="19"
                          height="19"
                          alt="email"
                          className={`${s.passowrdImg}`}
                        />
                        <input
                          placeholder="Retype new password"
                          id="nameIdSearch"
                          value={this.state.confirmPassword}
                          onChange={e => this.handlePassword(e, 2)}
                          type="password"
                          className={this.state.passwordClass}
                        />
                        {this.state.passwordError
                          ? <div className={s.invalidPasswordText}>
                              {this.state.passwordError}
                            </div>
                          : null}
                      </div>
                    </div>
                  </div>
                </div>}
            <div className={s.buttonContainer}>
              <button
                className={`btn ${s.loginBtn}`}
                onClick={this.changeNewPassword}
              >
                {this.state.ischangedSuccessfully ? 'LOGIN' : 'RESET PASSWORD'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(resetPassword);
