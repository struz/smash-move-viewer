import React, { Component } from 'react';
import ReactGA from 'react-ga';


ReactGA.initialize('UA-107697636-1');

class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      moveViewerLink: this.props.moveViewerLink
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.moveViewerLink !== this.state.moveViewerLink) {
      this.setState(function(prevState, props) {
        prevState.moveViewerLink = nextProps.moveViewerLink;
        return prevState;
      });
    }
  }

  handleChange(e) {
    var url = e.target.value;
    if (!url)
      return;

    if (url.startsWith("#")) {
      window.location.hash = url;
    } else if (url.includes("twitter.com")) {
      /* Track twitter clicks */
      ReactGA.outboundLink({
        label: 'Twitter'
      }, function () {
        // Out of site links, open in another tab
        window.opener = null;
        window.open(url, '_blank');
      });
    } else {
      // Out of site links, open in another tab
      window.opener = null;
      window.open(url, '_blank');
    }
  }

  render() {
    const moveViewerLink = this.state.moveViewerLink;

    // Dropdown menu (for mobile) default highlighted option
    var optionValue = '';
    if (window.location.hash.startsWith('#/help'))
      optionValue = '#/help';
    else if (window.location.hash.startsWith('#/about'))
      optionValue = '#/about';
    else
      optionValue = moveViewerLink;


    // TODO: make sure analytics are collected around these page views
    return (
      <div className="menus-container">
        <div className="small-menu-container">
          <select onChange={this.handleChange}
           className="Dropdown Main-dropdown"
           title="Navigate between pages"
           defaultValue={optionValue}>
            <option value={moveViewerLink}>Move&nbsp;Viewer</option>
            <option value="#/help">Help</option>
            <option value="#/about">About</option>
            <option value="https://twitter.com/StruzSmash">&#64;StruzSmash</option>
          </select>
        </div>
        <div className="large-menu-container">
          <a className="menu" href={moveViewerLink}>Move&nbsp;Viewer</a>
          <span className="menu-spacer">&#124;</span>
          <a className="menu" href="#/help">Help</a>
          <span className="menu-spacer">&#124;</span>
          <a className="menu" href="#/about">About</a>
          <span className="menu-spacer">&#124;</span>
          <ReactGA.OutboundLink className="menu" eventLabel="Twitter" to="https://twitter.com/StruzSmash" target="_blank" rel="noopener noreferrer">
            &#64;StruzSmash
          </ReactGA.OutboundLink>
        </div>
      </div>
    );
  }
}

export default Menu;
