import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Header from './Header';
import Move from './Move';
//import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Header />, document.getElementById('root'));
ReactDOM.render(<Move />, document.getElementById('container'));
//registerServiceWorker();
