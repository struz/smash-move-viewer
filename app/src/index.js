import React from 'react';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';

import './index.css';
import Header from './Header';
import App from './App';


ReactGA.initialize('UA-107697636-1');
ReactGA.pageview('/');

//import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Header />, document.getElementById('root'));
ReactDOM.render(<App />, document.getElementById('container'));
//registerServiceWorker();
