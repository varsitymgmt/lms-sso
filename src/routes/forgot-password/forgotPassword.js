import React from 'react';
// import axios from 'axios';
// import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
// import Link from 'components/Link/Link';
import s from './forgotPassword.scss';

class forgotPassword extends React.Component {
  static contextTypes = {
    // // GRAPHQL_API_URL: PropTypes.string.isRequired,
    // API_URL: PropTypes.string.isRequired,
    // API_EGNIFY_IO_URL: PropTypes.string.isRequired,
    // // hostName for dev environment
    // hostNameForDev: PropTypes.string.isRequired,
    // // common host
    // commonHost: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      getPassword: false,
    };
  }
  displayForgotPassowrdContainer = () => {
    const div = (
      <div className={s.container}>
        <div className={s.forgotCard}>
          <div className={s.forgotIconContainer}>
            <img src="/images/forgot.svg" className={s.iconForgot} alt="" />
          </div>
          <div className={s.forgot}>Forgot Password?</div>
          <div className={s.forgotText}>
            Enter your admission ID and we’ll send you a new password to your
            <span>registered mobile number</span>
          </div>
          <div className={s.inputText}>Admission ID</div>
          <input
            placeholder="Enter Admission ID"
            id="email"
            type="text"
            className={`${s.textbox}`}
            //   ${this.state.formFieldsError.email ? s.invalidTextBox : ''}`}
            // value={this.state.formData.email || ''}
            // onChange={e => this.handleFormFieldChanges(e, 'email')}
          />
          <div className={s.buttons}>
            <button
              className={s.getPassword}
              onClick={() => {
                this.setState({ getPassword: true });
              }}
            >
              GET PASSWORD
            </button>
            <div
              role="presentation"
              className={s.cancel}
              onClick={() => {
                window.open('/signin');
              }}
            >
              CANCEL
            </div>
          </div>
        </div>
      </div>
    );
    return div;
  };
  displaygetPasswordContainer = () => {
    const div = (
      <div className={s.containerGet}>
        <div className={s.getPasswordCard}>
          <div className={s.checkedContainer}>
            <img
              src="/images/checked-icon.svg"
              className={s.iconChecked}
              alt=""
            />
          </div>
          <div className={s.passDescrion}>
            Password has be sent to ******9445
          </div>
          <div className={s.passDescrion}>
            In case you’ve not received it, please contact us on{' '}
            <span>1800-345-1800 </span>
          </div>
          <div className={s.passDescrion}>
            <span
              role="presentation"
              onClick={() => {
                window.open('/signin');
              }}
              className={s.clickHere}
            >
              Click here{' '}
            </span>
            to sign in
          </div>
        </div>
      </div>
    );
    return div;
  };

  render() {
    return (
      <div className="cover-full-container">
        <div className={s.iconContainer}>
          <img src="/images/rankGuru.png" className={s.icon} alt="" />
        </div>
        {this.state.getPassword
          ? this.displaygetPasswordContainer()
          : this.displayForgotPassowrdContainer()}
      </div>
    );
  }
}

export default withStyles(s)(forgotPassword);
