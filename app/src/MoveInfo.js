import React, { Component } from 'react';
import axios from 'axios';

import './Move.css';
import './MoveInfo.css';

const hitboxIdColors = [
  '#E6194B',
  '#3CB44B',
  '#000080',
  '#0082C8',
  '#F58231',
  '#911EB4',
  '#46F0F0',
  '#D2F53C',
  '#008080',
  '#AA6E28'
]

// TODO: make a concrete class to use, that parses the JSON rather than just
// assuming the files are in the right format.

class MoveInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {moveData: null};
  }

  componentDidMount() {
    this.fetchMoveData(this.props.url);
  }

  componentWillReceiveProps(nextProps) {
    // Reload the json only if the url has changed
    if (this.props.url !== nextProps.url) {
      this.fetchMoveData(nextProps.url);
    }
  }

  fetchMoveData(url) {
    if (!url) {
      return;
    }

    var _this = this;
    axios.get(url).then(function(response) {
      var json = response.data;  // JSON is auto parsed by axios
      _this.setState({moveData: json});
    });
  }

  getIntangibilityRange() {
    if (this.state.moveData.intangibilityStart === 0 ||
        this.state.moveData.intangibilityEnd < this.state.moveData.intangibilityStart) {
      return 'N/A'
    }
    // Intangibility end is the *frame on which* the intangibility ends i.e. the frame
    // that you are once again vulnerable so we subtract one to make more sense
    return '' + this.state.moveData.intangibilityStart + '-' + (this.state.moveData.intangibilityEnd - 1);
  }

  getHitboxRanges() {
    var rangeString = [];

    var currentFrameStart = -1;
    for (var i = 0; i < this.state.moveData.frames.length; i++) {
      if (this.state.moveData.frames[i].hitboxes.length) {
        if (currentFrameStart < 0) {
          currentFrameStart = i;
        }
      } else if (currentFrameStart >= 0) {
        // If we have a range in flight, this is the end of it
        if (i - currentFrameStart < 2) {
          // 1 frame range
          rangeString.push('' + (currentFrameStart + 1));
        } else {
          // 2+ frame range
          rangeString.push('' + (currentFrameStart + 1) + '-' + i);
        }
        currentFrameStart = -1;
      }
    }

    return rangeString.reduce(function(pre, next) {
      return pre + ', ' + next;
    })
  }

  render() {
    var frame = this.props.frameIndex;

    if (!this.state.moveData) {
      return(
        <div className="Move-info">
        </div>
      );
    }

    const intangibilityRange = this.getIntangibilityRange();
    const hitboxRanges = this.getHitboxRanges();

    return(
      <div className="Move-info">
        <p><span className='Bold-label'>FAF:</span> {this.state.moveData.faf === 0 ? 'N/A' : this.state.moveData.faf}</p>
        <p><span className='Bold-label'>Intangible frames:</span> {intangibilityRange}</p>
        <p><span className='Bold-label'>Hitbox active:</span> {hitboxRanges}</p>
        <table className='Hitbox-info-table'>
          <thead>
            <tr>
              <th>Color</th>
              <th>ID</th>
              <th>Damage</th>
              <th>Angle</th>
              <th>KBG</th>
              <th>BKB</th>
              <th>WBKB</th>
            </tr>
          </thead>
          <tbody>
            {this.state.moveData.frames[frame].hitboxes.map(function(hitbox) {
              return <HitboxInfo key={hitbox.id} hitboxData={hitbox}/>;
            })}
          </tbody>
        </table>
      </div>
    );
    // TODO: camera details displayed nicely, in a hideable box
  }
}


class HitboxInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {hitboxData: props.hitboxData};
  }

  render() {
    const hitboxData = this.state.hitboxData;

    // Example data:
    // "id": 0,
    // "damage": 1.5,
    // "angle": 92.0,
    // "knockbackGrowth": 100.0,
    // "knockbackBase": 0.0,
    // "weightBasedKnockback": 23.0,
    // "type": 0,
    // "extended": false,
    // "ignoreThrow": false,
    // "part": 0,
    // "bone": 0,
    // "size": 3.0,
    // "x": 0.0,
    // "y": 12.0,
    // "z": 13.0,
    // "x2": 0.0,
    // "y2": 0.0,
    // "z2": 0.0

    return(
      <tr id={"hitbox-" + hitboxData.id}>
        <td style={{'textAlign': 'center'}}>
          <div className="Hitbox-color" style={{'background': hitboxIdColors[hitboxData.id]}}></div>
        </td>
        <td>{hitboxData.id}</td>
        <td>{hitboxData.damage}</td>
        <td>{hitboxData.angle}</td>
        <td>{hitboxData.knockbackGrowth}</td>
        <td>{hitboxData.knockbackBase}</td>
        <td>{hitboxData.weightBasedKnockback}</td>
      </tr>
    );
  }
}

export default MoveInfo;
