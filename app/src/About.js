import React, { Component } from 'react';

import './Help.css';
import './MoveInfo.css';

import ryuExample from './img/ryu_example.png';
import moveViewerExample from './img/MoveViewerInstructional.png';

import * as MoveInfo from './MoveInfo.js';
const hurtboxColor = '#FFE119';
const superArmorColor = '#730A43';
const invincibleColor = '#FFFFFF';

class Help extends Component {
  render() {
    return (
      <div className="prose">
        <h2>About</h2>
        Watch this space!
        <br /><br />
    		<hr />
    	</div>
    );
  }
}

export default Help;
