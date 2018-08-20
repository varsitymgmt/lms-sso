import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Modal.scss';

class Modal extends React.Component {
  static contextTypes = { fetch: PropTypes.func.isRequired };

  /** Library Variable for verifying props from the parent component */
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
    };
  }

  toggleMarksRangesModal = () => {
    this.setState({ showModal: !this.state.showModal });
  };

  handleKeyDonwEvent = e => {
    if (e.which === 27) {
      this.toggleMarksRangesModal();
    }
  };

  render() {
    return (
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
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Modal);
