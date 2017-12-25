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

  componentDidMount() {
    // We have to do height stuff in here because the height is computed
    // Because we use box-sizing we have to do this maths
    var styles = window.getComputedStyle(this.refs.modalDiv);
    var padding = parseFloat(styles.paddingTop) +
                  parseFloat(styles.paddingBottom);
    var modalHeight = this.refs.modalDiv.clientHeight - padding;

    // if top + height is off the viewport, move it up to above the button
    if ((parseFloat(styles.top) + modalHeight) > (window.scrollY + window.innerHeight)) {
      this.refs.modalDiv.style.top = (this.props.anchor.offsetTop - this.props.anchor.offsetHeight - modalHeight) + 'px';
    }
  }

  render() {
    const anchor = this.props.anchor;
    const MODAL_WIDTH_DESKTOP = 400;
    const MODAL_WIDTH_MOBILE = 300;

    var divStyles = {
      top: anchor.offsetTop + anchor.offsetHeight,
      left: anchor.offsetLeft + anchor.offsetWidth - MODAL_WIDTH_DESKTOP,
      position: 'absolute'
    };

    // Assumption: if left goes negative then we're on a small mobile device
    divStyles.left = (divStyles.left < 0) ? 0 : divStyles.left;
    divStyles.marginLeft = (divStyles.left === 0) ? 30 : 0;
    divStyles.width = (divStyles.left === 0) ? MODAL_WIDTH_MOBILE : MODAL_WIDTH_DESKTOP;

    return (
      <div className="Share-modal" style={divStyles} ref="modalDiv">
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
