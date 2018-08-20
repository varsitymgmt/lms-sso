import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './SimpleStatusModal.scss';

class SimpleStatusModal extends React.Component {
  static propTypes = {
    handleClickOnOKButton: PropTypes.func.isRequired,
    statusInfo: PropTypes.object.isRequired, // eslint-disable-line
    handleEscDown: PropTypes.func.isRequired,
  };
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDownEvent, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDownEvent, false);
  }

  handleKeyDownEvent = e => {
    if (e.which === 27) {
      this.props.handleEscDown();
    }
  };

  render() {
    return (
      <div className={`body-overlay ${s.bodyOverlay}`} role="presentation">
        <div className={s.marksModal}>
          <div className={s.statusContainer}>
            <div className={`${s.messageCotainer}`}>
              <div className="row">
                <span>
                  <img
                    src={
                      this.props.statusInfo.status
                        ? '/images/icons/success.svg'
                        : '/images/icons/error.svg'
                    }
                    width="20px"
                    height="20px"
                    alt={this.props.statusInfo.status ? 'Success' : 'Error'}
                  />
                </span>
                <span>
                  {this.props.statusInfo.message}
                </span>
              </div>
              <div className="row">
                <button
                  className={`${s.btn}`}
                  onClick={this.props.handleClickOnOKButton}
                >
                  Ok
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(SimpleStatusModal);
