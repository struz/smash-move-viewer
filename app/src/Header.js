import React, { Component } from 'react';
import ReactGA from 'react-ga';

import twitter_logo from './img/twitter.svg';
import './Header.css';


ReactGA.initialize('UA-107697636-1');

class App extends Component {
  render() {
    return (
      <div className="App-header">
        <div className="App-intro">
          <h2>Struz Smash</h2>
		  		  <hr />
          <h1>Move Viewer</h1>
        </div>
        {/*<div className="Link">
          <ReactGA.OutboundLink eventLabel="Twitter" to="https://twitter.com/StruzSmash" target="_blank" rel="noopener noreferrer">
            <span className="Link-text">@StruzSmash</span>
          </ReactGA.OutboundLink>
        </div>*/}
      </div>
    );
  }
}

export default App;
