import React, { Component } from 'react';
import ReactGA from 'react-ga';


ReactGA.initialize('UA-107697636-1');

class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleChange = this.handleChange.bind(this);
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
    // TODO: make sure analytics are collected around these page views
    return (
      <div className="menus-container">
        <div className="small-menu-container">
          <select onChange={this.handleChange}
           className="Dropdown Main-dropdown"
           title="Navigate between pages">
            <option value="">Navigation</option>
            <option value="#/">Move&nbsp;Viewer</option>
            <option value="#/help">Help</option>
            <option value="#/about">About</option>
            <option value="https://twitter.com/StruzSmash">&#64;StruzSmash</option>
          </select>
        </div>
        <div className="large-menu-container">
          <a className="menu" href="#/">Move&nbsp;Viewer</a>
          <span className="menu-spacer">&#124;</span>
          <a className="menu" href="#/help" target="_blank" rel="noopener noreferer">Help</a>
          <span className="menu-spacer">&#124;</span>
          <a className="menu" href="#/about" target="_blank" rel="noopener noreferer">About</a>
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
