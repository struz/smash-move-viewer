import React from 'react';
import {
  HashRouter as Router,
  Route,
  Redirect
} from 'react-router-dom';

import Move from './Move';
import * as Env from './Env';

// Always render the move, we just need the router to get URL props
const App = () => (
  <Router>
    <div>
      <Route exact path="/" render={() => (
        <Redirect to={Env.CURRENT_VERSION}/>
      )}/>
      <Route path={Env.CURRENT_VERSION} component={Move}/>
    </div>
  </Router>
);


export default App;
