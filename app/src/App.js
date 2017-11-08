import React from 'react';
import {
  HashRouter as Router,
  Route,
  Redirect
} from 'react-router-dom';

import Move from './Move';
import About from './About';
import * as Env from './Env';

const AppRedirect = <Redirect to={Env.CURRENT_VERSION}/>;

// Always render the move unless we are pointing at some very specific strings.
// We mainly use the router to get URL props

// /v<version>/<move_url> is the standard for rendering moves

// Everything else either redirects there, or points to specific info pages.

// TODO: add analytics to the different routes to track page views / time spent
const App = () => (
  <Router>
    <div>
      <Route path="/about" component={About}/>
      <Route exact path="/" render={() => (
        AppRedirect
      )}/>
      <Route path={Env.CURRENT_VERSION} component={Move}/>
    </div>
  </Router>
);


export default App;
