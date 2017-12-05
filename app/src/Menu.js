import React, { Component } from 'react';
import ReactGA from 'react-ga';


ReactGA.initialize('UA-107697636-1');

class Menu extends Component {
  render() {
    // TODO: make sure analytics are collected around these page views
    return (
      <div className="menu-container">
    		<a className="menu" href="#/">Move&nbsp;Viewer</a>
    		<span className="menu-spacer">&#124;</span>
    		<a className="menu" href="#/help">Help</a>
    		<span className="menu-spacer">&#124;</span>
    		<a className="menu" href="#/about">About</a>
    		<span className="menu-spacer">&#124;</span>
        <ReactGA.OutboundLink className="menu" eventLabel="Twitter" to="https://twitter.com/StruzSmash" target="_blank" rel="noopener noreferrer">
          &#64;StruzSmash
        </ReactGA.OutboundLink>
    	</div>
    );
  }
}

export default Menu;
