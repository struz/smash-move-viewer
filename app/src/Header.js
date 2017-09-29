import React, { Component } from 'react';
import logo from './img/SmashBall.svg';
import twitter_logo from './img/twitter.svg';
import './Header.css';

class App extends Component {
  render() {
    return (
      <div className="App-header">
        <div className="App-intro">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>Smash Move Viewer</h1>
        </div>
        <div className="Links">
          <div className="Link">
            <a href="https://twitter.com/StruzSmash" target="_blank" rel="noopener noreferrer">
              <img src={twitter_logo} className="Twitter-logo" alt="twitter-logo" />
              <span className="Link-text">@StruzSmash</span>
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
