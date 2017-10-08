import React, { Component } from 'react';
import { withRouter } from 'react-router'
import ReactGA from 'react-ga';

import SuperGif from './libgif.js';
import logo from './img/SmashBall.svg';

// Gif control icons
import iconPlay from './img/icons/285-play3.svg';
import iconPause from './img/icons/286-pause2.svg';
import iconBackward from './img/icons/288-backward2.svg';
import iconForward from './img/icons/289-forward3.svg';
import iconFirst from './img/icons/290-first.svg';
import iconLast from './img/icons/291-last.svg';
import iconPrevious from './img/icons/292-previous2.svg';
import iconNext from './img/icons/293-next2.svg';
import iconLoop from './img/icons/302-loop.svg';

import './Player.css';


ReactGA.initialize('UA-107697636-1');

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
      <img src={this.props.isPlaying ? iconPause : iconPlay} alt="play-pause" onClick={this.handleClick} className="Player-control" />
    );
  }
}

class Player extends Component {
  constructor(props) {
    super(props);
    this.state = {
      frameIndex: this.props.frameIndex,  // STATE is the canonical location for frameIndex, we just take it from props
      isPlaying: false,
      timerID: undefined,
      gif: null,
      fps: this.props.fps,  // same as frameIndex
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

    // Analytics
    this.beginLoadTime = undefined;
  }

  /* Load a gif, optionally starting display on a given frame */
  loadGif(url, frameIndex = 1) {
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
    this.beginLoadTime = new Date().getTime();
    // TODO: if mobile, max_width = fits_in_screen_size


    gif.load(() => { this.gifLoaded(frameIndex); });

    this.setState(function(prevState, props) {
      prevState.gif = gif;
      prevState.loaded = false;
      prevState.isPlaying = false;
      prevState.timerID = undefined;
      prevState.frameIndex = frameIndex;
      return prevState;
    });
  }

  gifLoaded(frameIndex) {
    var endLoadTime = new Date().getTime();
    var timeSpent = endLoadTime - this.beginLoadTime;
    ReactGA.timing({
      category: 'Player',
      variable: 'Load GIF',
      value: timeSpent
    });
    this.setState(function(prevState, props) {
      prevState.loaded = true;
      return prevState;
    });
    this.moveFrameAbsolute(frameIndex, true);
  }

  componentDidMount() {
    this.loadGif(this.props.url, this.state.frameIndex);
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
    const small = this.props.small;

    return (
      <div className="Move-gif" style={{display: 'inline-block'}}>
        <img ref="gif" alt="move-gif" className={small ? "Plain-move-gif-small" : "Plain-move-gif-large"} src={logo}/>
        <div className="Move-controls" style={!gifLoaded ? {display: 'none'} : {}}>
          <label>Play FPS:</label>
          <input ref="fpsNum" type="number"
           onChange={this.fpsTextChanged}
           value={this.state.fps}
           className="Move-frame"/>
          <label>Frame:</label>
          <input ref="frameNum" type="number"
           onChange={this.frameTextChanged}
           value={this.state.frameIndex}
           className="Move-frame"/>
          <img src={iconFirst} alt="first" onClick={this.firstFrameHandler} className="Player-control"/>
          <img src={iconPrevious} alt="previous" onClick={this.prevFrameHandler} className="Player-control"/>
          <PlayPauseButton playPauseChange={this.playPauseHandler} isPlaying={isPlaying} />
          <img src={iconNext} alt="next" onClick={this.nextFrameHandler} className="Player-control"/>
          <img src={iconLast} alt="last" onClick={this.lastFrameHandler} className="Player-control"/>
        </div>
      </div>
    );
  }

  // Play / pause
  playPauseHandler(e) {
    this.playPause(this.state.fps);
  }
  playPause(rawFps) {
    ReactGA.event({
      category: 'Player',
      action: 'Play/Pause'
    });
    this.setState(function(prevState, props) {
      prevState.isPlaying = !prevState.isPlaying;

      if (prevState.timerID === undefined) {
        // 60fps frame updates
        prevState.timerID = setInterval(
          () => this.tick(),
          1000 / this.getUsableFPSNumber(rawFps)
        );
      } else {
        clearInterval(prevState.timerID);
        prevState.timerID = undefined;

        // Purely to trigger a URL frame update
        this.moveFrameAbsolute(prevState.frameIndex, true);
      }

      return prevState;
    });
  }

  tick() {
    this.state.gif.pause();
    this.moveFrameRelative(1, false);
  }

  moveFrameRelative(num, updateUrl = false) {
    this.state.gif.move_relative(num);

    var frameIndex = this.getUsableFrameIndex(this.state.frameIndex) + num;
    this.setState(function(prevState, props) {
      prevState.frameIndex = prevState.frameIndex + num;
      if (prevState.frameIndex > prevState.gif.get_length()) {
        prevState.frameIndex = 1;
      }
      if (prevState.frameIndex < 1) {
        prevState.frameIndex = 1;
      }
      return prevState;
    });

    // Notify parent of changes
    // I don't like duplicating this logic here but until I find a nice way to
    // do both together without race conditions I'm doing it like this.
    if (frameIndex > this.state.gif.get_length()) {
      frameIndex = 1
    }
    if (frameIndex < 1) {
      frameIndex = 1;
    }
    this.props.onFrameChange(frameIndex - 1, updateUrl);
  }

  moveFrameAbsolute(num, updateUrl = false) {
    // 0 indexed in gif lib
    this.state.gif.move_to(num - 1);
    this.setState(function(prevState, props) {
      prevState.frameIndex = num;
      return prevState;
    });

    // Notify parent of changes
    this.props.onFrameChange(num - 1, updateUrl);
  }

  nextFrameHandler(e) {
    ReactGA.event({
      category: 'Player',
      action: 'Next Frame'
    });
    this.moveFrameRelative(1, true);
  }
  prevFrameHandler(e) {
    ReactGA.event({
      category: 'Player',
      action: 'Prev Frame'
    });
    this.moveFrameRelative(-1, true);
  }
  lastFrameHandler(e) {
    ReactGA.event({
      category: 'Player',
      action: 'Last Frame'
    });
    this.moveFrameAbsolute(this.state.gif.get_length(), true);
  }
  firstFrameHandler(e) {
    ReactGA.event({
      category: 'Player',
      action: 'First Frame'
    });
    this.moveFrameAbsolute(1, true);
  }

  frameTextChanged(e) {
    // We store the raw frame index in state so that the control can be updated
    // freely, and we perform validation on the input before we use it.
    var rawFrameIndex = e.target.value;
    var frameIndex = this.getUsableFrameIndex(parseInt(rawFrameIndex, 10));

    ReactGA.event({
      category: 'Player',
      action: 'Frame Number Changed'
    });

    if (!this.isValidFrameIndex(frameIndex)) {
      this.moveFrameAbsolute(frameIndex, true);
    } else {
      // Store the invalid frame index but don't move the frame
      this.setState(function(prevState, props) {
        prevState.frameIndex = rawFrameIndex;
        return prevState;
      });
    }
  }

  fpsTextChanged(e) {
    // We store the raw fps value in state so that the control can be updated
    // freely, and we perform validation on the input before we use it.
    var rawFps = e.target.value;

    ReactGA.event({
      category: 'Player',
      action: 'FPS Number Changed'
    });

    var _this = this;
    this.setState(function(prevState, props) {
      prevState.fps = rawFps;

      if (_this.state.isPlaying) {
        _this.playPause(rawFps);
        _this.playPause(rawFps);  // Hacky way to refresh the frame rate during play
      }
      return prevState;
    });
  }

  // Validation functions since we are potentially storing unusable values in the state
  isValidFrameIndex(frameIndex) {
    if (isNaN(frameIndex) || frameIndex < 1 ||
        frameIndex > this.state.gif.get_length()) {
      return false;
    }
    return true;
  }
  getUsableFrameIndex(frameIndex) {
    if (!this.isValidFrameIndex(frameIndex)) {
      return 1;  // No change
    }
    return frameIndex;
  }
  getUsableFPSNumber(fps) {
    if (isNaN(fps) || fps < 1 || fps > 60) {
      return 60;  // No change
    }
    return fps;
  }
}

export default withRouter(Player);
