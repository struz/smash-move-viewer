import React from 'react';
import {
  HashRouter as Router,
  Route,
  Redirect
} from 'react-router-dom';

import Move from './Move';
import * as Env from './Env';

const AppRedirect = <Redirect to={Env.CURRENT_VERSION + '/'}/>;

// Always render the move, we just need the router to get URL props
const App = () => (
  <Router>
    <div>
      <Route exact path="/" render={() => (
        AppRedirect
      )}/>
      <Route path={Env.CURRENT_VERSION} component={Move}/>
    </div>
  </Router>
);


export default App;
