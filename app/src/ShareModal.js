import React, { Component } from 'react';
import ReactGA from 'react-ga';
import onClickOutside from "react-onclickoutside";
import copy from 'copy-to-clipboard';

import './ShareModal.css';

class ShareModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copyStatus: ''
    };
    this.copyLink = this.copyLink.bind(this);
  }

  handleClickOutside = evt => {
    this.props.closeHandler(evt);
  };

  onFocusShareLink(e) {
    e.target.select();
    ReactGA.event({
      category: 'Share',
      action: 'Link text focused',
      label: this.props.fighter + '_' + this.props.move
    });
  }

  copyLink(e) {
    this.refs.shareLink.select();
    if (copy(this.refs.shareLink.value, {message: 'Press #{key} to copy'})) {
      this.setState(function(prevState, props) {
        prevState.copyStatus = 'Copied to clipboard';
        return prevState;
      });
      ReactGA.event({
        category: 'Share',
        action: 'Copy button pressed',
        label: this.props.fighter + '_' + this.props.move
      });
    }
  }

  render() {
    const anchor = this.props.anchor;

    var divStyles = {
      top: anchor.offsetTop + anchor.offsetHeight,
      left: anchor.offsetLeft + anchor.offsetWidth - 400,
      position: 'absolute'
    };

    // Assumption: if left goes negative then we're on a small mobile device
    divStyles.left = (divStyles.left < 0) ? 0 : divStyles.left;
    divStyles.marginLeft = (divStyles.left === 0) ? 30 : 0;
    divStyles.width = (divStyles.left === 0) ? 300 : 400;

    return (
      <div className="Share-modal" style={divStyles}>
        <span className="Bold-label">Share</span>
        <div>
          <input type="text" ref="shareLink" className="Text-input Share-link"
           defaultValue={window.location.href} onFocus={this.onFocusShareLink} />
        </div>
        <hr/>
        <div>
        <div className="Share-copy-status">
          {this.state.copyStatus}
        </div>
        <div className="Share-action-buttons">
          <span className="Share-copy-button" onClick={this.copyLink}>COPY</span>
        </div>
        </div>
      </div>
    );
  }
}

export default onClickOutside(ShareModal);
