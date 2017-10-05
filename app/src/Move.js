import React, { Component } from 'react';
import axios from 'axios';
import _ from 'lodash';

import Player from './Player.js';
import MoveInfo from './MoveInfo.js';

import './Move.css';

// General icons
import cross from './img/icons/272-cross.svg'

const gifStore = "https://s3-us-west-1.amazonaws.com/smash-move-viewer/fighters/";

class GifSizeCheckbox extends Component {
  constructor(props) {
    super(props);
    this.state = {id: null};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onGifSizeChange(e.target.checked);
  }

  componentWillMount() {
    const id = _.uniqueId("gsc-");
    this.setState({id: id});
  }

  render() {
    return(
      <div className="Form-element GifSizeCheckbox">
        <input type="checkbox" id={this.state.id} checked={this.props.checked} onChange={this.handleChange}/>
        <label htmlFor={this.state.id}>Smaller viewport (loads faster)</label>
      </div>
    );
  }
}

class ViewPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onViewChange(e.target.value);
  }

  render() {
    return(
      <div className="Form-element View-picker">
        <select onChange={this.handleChange}  className="Dropdown">
          <option value="game_view">Game View</option>
          <option value="top_view">Top-down View</option>
          <option value="front_view">Front-on View</option>
        </select>
      </div>
    );
  }
}

class FighterPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {options: []};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onFighterChange(e.target.value);
  }

  render() {
    return(
      <div className="Form-element Fighter-picker">
        <select onChange={this.handleChange}  className="Dropdown">
          <option value="">Character</option>
          {this.state.options}
        </select>
      </div>
    );
  }

  componentDidMount() {
    var _this = this;
    axios.get(this.props.url).then(function(response) {
      var json = response.data;  // JSON is auto parsed by axios
      var options = [];
      json.fighters.forEach(function(fighter) {
        options.push(<option key={fighter.key} value={fighter.key}>{fighter.name}</option>);
      });
      _this.setState({options: options});
    });
  }
}

class MovePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {options: []};

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onMoveChange(e.target.value);
  }

  render() {
    const options = this.state.options;
    const disabled = !this.props.url;

    return(
      <div className="Form-element Move-picker">
        <select onChange={this.handleChange} className="Dropdown" disabled={disabled}>
          <option value="">Move</option>
          {options}
        </select>
      </div>
    );
  }

  componentDidMount() {
    this.updateOptions(this.props.url);
  }

  componentWillReceiveProps(nextProps) {
    // Reload the json only if they selected a new option and not the same one again
    if (this.props.url !== nextProps.url) {
      this.updateOptions(nextProps.url);
    }
  }

  updateOptions(url) {
    if (!url) {
      return;
    }

    var _this = this;
    axios.get(url).then(function(response) {
      var json = response.data;  // JSON is auto parsed by axios
      var options = [];
      json.moves.forEach(function(move) {
        options.push(<option key={move} value={move}>{move}</option>);
      });
      _this.setState({options: options});
    });
  }
}

class Move extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fighter: '',
      move: '',
      view: 'game_view',
      small: true,
      frameIndex: 0
    };

    this.fighterSelected = this.fighterSelected.bind(this);
    this.moveSelected = this.moveSelected.bind(this);
    this.viewSelected = this.viewSelected.bind(this);
    this.gifSizeChanged = this.gifSizeChanged.bind(this);
    this.frameChanged = this.frameChanged.bind(this);
  }

  fighterSelected(fighter) {
    this.setState(function(prevState, props) {
      prevState.fighter = fighter;
      return prevState;
    });
  }
  moveSelected(move) {
    this.setState(function(prevState, props) {
      prevState.move = move;
      return prevState;
    });
  }
  viewSelected(view) {
    this.setState(function(prevState, props) {
      prevState.view = view;
      return prevState;
    });
  }
  gifSizeChanged(small) {
    this.setState(function(prevState, props) {
      prevState.small = small;
      return prevState;
    });
  }
  frameChanged(frame) {
    this.setState(function(prevState, props) {
      prevState.frameIndex = frame;
      return prevState;
    });
  }

  // Gets the list of moves for a character
  static makeMoveIndexUrl(fighter) {
    if (!fighter) {
      return '';
    }
    return window.location.href + "fighters/" + fighter + ".json";
  }

  // Gets move info to be displayed about the move
  static makeMoveDataUrl(fighter, move) {
    if (!fighter || !move) {
      return '';
    }
    return window.location.href + "fighters/" + fighter + "/" + move + ".json";
  }

  // Gets gif url to display move
  static makeGifUrl(fighter, move, view, size) {
    if (!fighter || !move) {
      return '';
    }
    return gifStore + fighter + "/" + size + "/" + view + "/" + move + ".gif";
  }

  render() {
    const fighterIndexUrl = window.location.href + "fighters/index.json";
    const fighter = this.state.fighter;
    const move = this.state.move;
    const view = this.state.view;
    const size = this.state.small ? 'small' : 'large';
    const frameIndex = this.state.frameIndex;

    const moveIndexUrl = Move.makeMoveIndexUrl(fighter);
    const moveDataUrl = Move.makeMoveDataUrl(fighter, move);
    const gifUrl = Move.makeGifUrl(fighter, move, view, size);

    return(
      <div className="Move" style={{display: 'inline-block'}}>
        <ViewPicker onViewChange={this.viewSelected}/>
        <GifSizeCheckbox onGifSizeChange={this.gifSizeChanged} checked={this.state.small}/>
        <FighterPicker url={fighterIndexUrl} onFighterChange={this.fighterSelected}/>
        <MovePicker url={moveIndexUrl} onMoveChange={this.moveSelected}/>
        <Player url={gifUrl} small={this.state.small} onFrameChange={this.frameChanged}/>
        <MoveInfo frameIndex={frameIndex} url={moveDataUrl}/>
      </div>
    );
  }
}

export default Move;
