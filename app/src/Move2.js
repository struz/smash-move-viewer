import React, { Component } from 'react';

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

import SuperGif from './libgif.js';
//const libgif = require('./libgif.js');

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

// TODO: do some frame preprocessing as soon as we load to reduce burden when user clicks "lastFrame" button raw
class Move extends Component {
  constructor(props) {
    super(props);
    this.state = {
      frameIndex: 1,
      isPlaying: false,
      timerID: undefined,
      gif: null,
      fps: 60
    };

    // Bindings
    this.frameTextChanged = this.frameTextChanged.bind(this);
    this.playPauseHandler = this.playPauseHandler.bind(this);
    this.nextFrameHandler = this.nextFrameHandler.bind(this);
    this.prevFrameHandler = this.prevFrameHandler.bind(this);
    this.lastFrameHandler = this.lastFrameHandler.bind(this);
    this.firstFrameHandler = this.firstFrameHandler.bind(this);

    this.fpsTextChanged = this.fpsTextChanged.bind(this);
  }

  componentDidMount() {
    // Set some custom elements to tell the gif how to behave on load
    var gif = new SuperGif({
      gif: this.refs.gif,
      auto_play: false,
      progressbar_height: 5
    });
    gif.load();
    this.setState(function(prevState, props) {
      prevState.gif = gif;
      return prevState;
    });
  }
  componentWillUnmount() {
    if (this.state.timerID !== undefined) {
      clearInterval(this.state.timerID);
    }
  }
  componentWillUpdate() {

  }

  render() {
    const isPlaying = this.state.isPlaying;

    return (
      <div className="Move" style={{display: 'inline-block'}}>
        <img ref="gif" src={this.props.url} alt="move-gif"/>
        <div className="Move-controls">
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
