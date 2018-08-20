import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ConfirmationModal.scss';

class ConfirmationModal extends React.Component {
  static propTypes = {
    confirmationModal: PropTypes.object.isRequired, // eslint-disable-line
    handleOkButton: PropTypes.func.isRequired, // eslint-disable-line
    handleCancelButton: PropTypes.func.isRequired, // eslint-disable-line
  };

  render() {
    return (
      <div id="modal" className={`${s.modal}`}>
        <div className={`${s.modalContent}`}>
          {this.props.confirmationModal.close
            ? <img
                id="close"
                className={s.closeButton}
                role="presentation"
                alt="close"
                title="title"
                onClick={() => {
                  this.props.handleCancelButton();
                }}
                src="/images/icons/close.svg"
              />
            : ''}
          <div id="content" className={s.modalText}>
            {this.props.confirmationModal.text}
          </div>

          <div className={s.modalButtons}>
            {!this.props.confirmationModal.close
              ? <button
                  id="cancel"
                  onClick={() => {
                    this.props.handleCancelButton();
                  }}
                  className={`${s.cancelBtn}`}
                >
                  {this.props.confirmationModal.cancelButtonText}
                </button>
              : ''}
            <button
              id="delete"
              onClick={() => {
                this.props.handleOkButton();
              }}
              className={`${s.deleteBtn}`}
            >
              {this.props.confirmationModal.doneButtonText}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(ConfirmationModal);
