import React, { Component } from 'react';
import axios from 'axios';

import SuperGif from './libgif.js';
import logo from './img/SmashBall.svg';

import './Move.css';

// Gif control icons
import iconPlay from './img/icons/285-play3.svg'
import iconPause from './img/icons/286-pause2.svg'
import iconBackward from './img/icons/288-backward2.svg'
import iconForward from './img/icons/289-forward3.svg'
import iconFirst from './img/icons/290-first.svg'
import iconLast from './img/icons/291-last.svg'
import iconPrevious from './img/icons/292-previous2.svg'
import iconNext from './img/icons/293-next2.svg'
import iconLoop from './img/icons/302-loop.svg'
// General icons
import cross from './img/icons/272-cross.svg'

const gifStore = "https://s3-us-west-1.amazonaws.com/smash-move-viewer/fighters/";

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
      <div className="Fighter-picker">
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
      <div className="Move-picker">
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
      move: ''
    };

    this.fighterSelected = this.fighterSelected.bind(this);
    this.moveSelected = this.moveSelected.bind(this);
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

  // Gets the list of moves for a character
  static makeMoveIndexUrl(fighter) {
    if (!fighter) {
      return '';
    }
    return window.location.href + "fighters/" + fighter + ".json";
  }

  // Gets move info to be displayed about the move
  static makeMoveUrl(fighter, move) {
    if (!fighter || !move) {
      return '';
    }
    return window.location.href + "fighters/" + fighter + "/" + move + ".json";
  }

  // Gets gif url to display move
  static makeGifUrl(fighter, move) {
    if (!fighter || !move) {
      return '';
    }
    return gifStore + fighter + "/game_view/" + move + ".gif";
  }

  render() {
    const fighterIndexUrl = window.location.href + "fighters/index.json";
    const fighter = this.state.fighter;
    const move = this.state.move;
    const moveIndexUrl = Move.makeMoveIndexUrl(fighter);
    const moveUrl = Move.makeMoveUrl(fighter, move);
    const gifUrl = Move.makeGifUrl(fighter, move);

    return(
      <div className="Move" style={{display: 'inline-block'}}>
        <FighterPicker url={fighterIndexUrl} onFighterChange={this.fighterSelected}/>
        <MovePicker url={moveIndexUrl} onMoveChange={this.moveSelected}/>
        <MoveGif url={gifUrl}/>
      </div>
    );
  }
}

class PlayPauseButton extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    this.props.playPauseChange();
  }

  render() {
    return (
      <img src={this.props.isPlaying ? iconPause : iconPlay} className="Frame-control-icon" alt="play-pause" onClick={ this.handleClick } />
    );
  }
}

class MoveGif extends Component {
  constructor(props) {
    super(props);
    this.state = {
      frameIndex: 1,
      isPlaying: false,
      timerID: undefined,
      gif: null,
      fps: 60,
      loaded: false
    };

    // Bindings
    this.frameTextChanged = this.frameTextChanged.bind(this);
    this.playPauseHandler = this.playPauseHandler.bind(this);
    this.nextFrameHandler = this.nextFrameHandler.bind(this);
    this.prevFrameHandler = this.prevFrameHandler.bind(this);
    this.lastFrameHandler = this.lastFrameHandler.bind(this);
    this.firstFrameHandler = this.firstFrameHandler.bind(this);

    this.fpsTextChanged = this.fpsTextChanged.bind(this);

    this.gifLoaded = this.gifLoaded.bind(this);
  }

  loadGif(url) {
    // Destroy any leftover timers
    if (this.state.timerID !== undefined) {
      clearInterval(this.state.timerID);
    }

    if (!url) {
      return;
    }
    if (this.state.gif !== null) {
      // Make sure we clean up the old div before loading a new one
      // TODO: this should also immediately terminate all loading functions going on at the time.
      this.state.gif.destroy();
    }

    this.refs.gif.src = url;
    var gif = new SuperGif({
      gif: this.refs.gif,
      auto_play: false,
      progressbar_height: 5
    });
    gif.load(this.gifLoaded);
    this.setState(function(prevState, props) {
      prevState.gif = gif;
      prevState.loaded = false;
      prevState.isPlaying = false;
      prevState.timerID = undefined;
      return prevState;
    });
  }

  gifLoaded() {
    this.setState(function(prevState, props) {
      prevState.loaded = true;
      return prevState;
    });
  }

  componentDidMount() {
    this.loadGif(this.props.url);
  }

  componentWillReceiveProps(nextProps) {
    // Reload only if they selected a different move and not the same one
    if (this.props.url !== nextProps.url) {
      this.loadGif(nextProps.url);
    }
  }

  componentWillUnmount() {
    if (this.state.timerID !== undefined) {
      clearInterval(this.state.timerID);
    }
    if (this.state.gif !== null) {
      this.state.gif.destroy();
    }
  }

  render() {
    const isPlaying = this.state.isPlaying;
    const gifLoaded = this.state.loaded;

    return (
      <div className="Move-gif" style={{display: 'inline-block'}}>
        <img ref="gif" alt="move-gif" className="Plain-move-gif" src={logo}/>
        <div className="Move-controls" style={!gifLoaded ? {display: 'none'} : {}}>
          <label>Play FPS:</label>
          <input type="number" onChange={this.fpsTextChanged} value={this.state.fps} className="Move-frame"/>
          <label>Frame:</label>
          <input type="number" onChange={this.frameTextChanged} value={this.state.frameIndex} className="Move-frame"/>
          <img src={iconFirst} alt="first" onClick={this.firstFrameHandler}/>
          <img src={iconPrevious} alt="previous" onClick={this.prevFrameHandler}/>
          <PlayPauseButton playPauseChange={this.playPauseHandler} isPlaying={isPlaying} />
          <img src={iconNext} alt="next" onClick={this.nextFrameHandler}/>
          <img src={iconLast} alt="last" onClick={this.lastFrameHandler}/>
        </div>
      </div>
    );
  }

  // Play / pause
  playPauseHandler(e) {
    this.playPause();
  }
  playPause() {
    this.setState(function(prevState, props) {
      prevState.isPlaying = !prevState.isPlaying;

      if (prevState.timerID === undefined) {
        // 60fps frame updates
        prevState.timerID = setInterval(
          () => this.tick(),
          1000 / this.state.fps
        );
      } else {
        clearInterval(prevState.timerID);
        prevState.timerID = undefined;
      }

      return prevState;
    });
  }

  tick() {
    this.state.gif.pause();
    this.state.gif.move_relative(1);
    this.setState(function(prevState, props) {
      prevState.frameIndex = prevState.frameIndex + 1;
      if (prevState.frameIndex > prevState.gif.get_length()) {
        prevState.frameIndex = 1;
      }
      return prevState;
    });
  }

  nextFrameHandler(e) {
    this.state.gif.move_relative(1);
    this.setState(function(prevState, props) {
      prevState.frameIndex = prevState.frameIndex + 1;
      if (prevState.frameIndex > prevState.gif.get_length()) {
        prevState.frameIndex = prevState.gif.get_length();
      }
      return prevState;
    });
  }
  prevFrameHandler(e) {
    this.state.gif.move_relative(-1);
    this.setState(function(prevState, props) {
      prevState.frameIndex = prevState.frameIndex - 1;
      if (prevState.frameIndex < 1) {
        prevState.frameIndex = 1;
      }
      return prevState;
    });
  }
  lastFrameHandler(e) {
    // 0 indexed in gif lib
    this.state.gif.move_to(this.state.gif.get_length() - 1);
    this.setState(function(prevState, props) {
      prevState.frameIndex = prevState.gif.get_length();
      return prevState;
    });
  }
  firstFrameHandler(e) {
    this.state.gif.move_to(0);
    this.setState(function(prevState, props) {
      prevState.frameIndex = 1;
      return prevState;
    });
  }
  frameTextChanged(e) {
    var frameIndex = e.target.value;
    if (frameIndex < 1 || frameIndex > this.state.gif.get_length()) {
      frameIndex = this.state.frameIndex;  // No change
    }
    this.state.gif.move_to(frameIndex - 1);
    this.setState(function(prevState, props) {
      prevState.frameIndex = frameIndex;
      return prevState;
    });
  }

  fpsTextChanged(e) {
    var fps = e.target.value;
    if (fps < 1 || fps > 60) {
      fps = this.state.fps;  // No change
    }
    this.setState(function(prevState, props) {
      prevState.fps = fps;
      return prevState;
    });
    if (this.state.isPlaying) {
      this.playPause();
      this.playPause();  // Hacky way to refresh the frame rate during play
    }
  }
}

export default Move;
