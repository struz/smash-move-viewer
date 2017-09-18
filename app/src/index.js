import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Move from './Move';
import registerServiceWorker from './registerServiceWorker';

// ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(<Move url="https://s3-us-west-1.amazonaws.com/smash-move-viewer/fighters/szerosuit/game_view/AirCatch.gif"/>, document.getElementById('container'));
registerServiceWorker();
