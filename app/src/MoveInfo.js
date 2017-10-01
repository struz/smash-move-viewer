import React, { Component } from 'react';
import axios from 'axios';

import './Move.css';

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

  render() {
    const frame = this.props.frameIndex;

    if (this.state.moveData === null) {
      return(
        <div className="Move-info">
        </div>
      );
    }

    const intangibilityRange = this.getIntangibilityRange();
    return(
      <div className="Move-info">
        <p>FAF: {this.state.moveData.faf === 0 ? 'N/A' : this.state.moveData.faf}</p>
        <p>Intangible frames: {intangibilityRange}</p>
      </div>
    );
    // TODO: camera details displayed nicely
    // TODO: hitbox legend
  }
}

export default MoveInfo;
