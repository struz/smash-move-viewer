import React, { Component } from 'react';
import {
  HashRouter as Router,
  Route,
  Redirect
} from 'react-router-dom';

import Header from './Header';
import Menu from './Menu';
import Move from './Move';

import Help from './Help';
import About from './About';
import * as Env from './Env';

const AppRedirect = <Redirect to={Env.CURRENT_VERSION}/>;

// Always render the move unless we are pointing at some very specific strings.
// We mainly use the router to get URL props

// /v<version>/<move_url> is the standard for rendering moves

// Everything else either redirects there, or points to specific info pages.

// TODO: add analytics to the different routes to track page views / time spent
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      moveViewerLink: '#/'
    };

    this.moveViewerUpdated = this.moveViewerUpdated.bind(this);
  }

  moveViewerUpdated(location, search) {
    var currentLink = '#' + location;
    if (search.length > 1) {  // Search is always at least '?'
      currentLink = currentLink + search;
    }

    if (currentLink !== this.state.moveViewerLink) {
      this.setState(function(prevState, props) {
        prevState.moveViewerLink = currentLink;
        return prevState;
      });
    }
  }

  render() {
    const moveViewerLink = this.state.moveViewerLink;

    return (
      <div>
        <Header />
        <Menu moveViewerLink={moveViewerLink} />
        <Router>
          <div>
            <Route path="/help" component={Help}/>
            <Route path="/about" component={About}/>
            <Route exact path="/" render={() => (
              AppRedirect
            )}/>
            <Route path={Env.CURRENT_VERSION} render={props => (
              <Move onMoveUpdated={this.moveViewerUpdated} {...props}/>
            )}/>
          </div>
        </Router>
      </div>
    );
  }
}


export default App;
