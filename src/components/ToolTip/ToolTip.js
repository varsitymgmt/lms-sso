/**
  @description
    This component returns the view
      which contains tabular view of any particular report
  @author Janardhan
  @version 1.0
*/
import React from 'react';
import PropTypes from 'prop-types';
import MappleToolTip from 'reactjs-mappletooltip';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ToolTip.scss';

class ToolTip extends React.Component {
  /** Library Variable for verifying props from the parent component */
  static propTypes = {
    children: PropTypes.node,
    messageDetails: PropTypes.object, // eslint-disable-line
    align: PropTypes.string,
  };

  displayBody = () => {
    const view = (
      <div className={s.bodyContent}>
        {/*  <strong>
          {this.props.messageDetails.heading}
        </strong> */}
        <div>
          {this.props.messageDetails.body}
        </div>
      </div>
    );
    return view;
  };
  render() {
    return (
      <span className={s.root}>
        <MappleToolTip
          backgroundColor={'#232B35'}
          shadow
          width={'100px'}
          direction={this.props.align}
        >
          <img
            className={s.infoIcon}
            src="/images/icons/info-outline.svg"
            alt="info"
          />
          <div className={s.textContent}>
            {this.props.messageDetails &&
            Object.prototype.hasOwnProperty.call(
              this.props.messageDetails,
              'heading',
            )
              ? this.displayBody()
              : this.props.children}
          </div>
        </MappleToolTip>
      </span>
    );
  }
}

ToolTip.defaultProps = {
  align: 'right',
  messageDetails: {},
  children: <div />,
};

export default withStyles(s)(ToolTip);
