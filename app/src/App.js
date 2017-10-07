import React from 'react';
import {
  HashRouter as Router,
  Route,
  Link
} from 'react-router-dom';

import Move from './Move';

// Always render the move, we just need the router to get URL props
const App = () => (
  <Router>
    <Route component={Move}/>
  </Router>
);


export default App;
