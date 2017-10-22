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


const VideoFrame = require('./VideoFrame.js');
const uuidv4 = require('uuid/v4');

const DEFAULT_MOVE_VIDEO_FPS = 60;

ReactGA.initialize('UA-107697636-1');

class Player extends Component {
  constructor(props) {
    super(props);
    this.state = {
      frameIndex: this.props.frameIndex,  // STATE is the canonical location for frameIndex, we just take it from props
      fps: this.props.fps,  // same as frameIndex
      loaded: false,
      uuid: uuidv4(),
      video: null,
      paused: true
    };

    // Bindings
    this.frameTextChanged = this.frameTextChanged.bind(this);
    this.playPauseHandler = this.playPauseHandler.bind(this);
    this.nextFrameHandler = this.nextFrameHandler.bind(this);
    this.prevFrameHandler = this.prevFrameHandler.bind(this);
    this.lastFrameHandler = this.lastFrameHandler.bind(this);
    this.firstFrameHandler = this.firstFrameHandler.bind(this);

    this.fpsTextChanged = this.fpsTextChanged.bind(this);

    this.videoEventHandler = this.videoEventHandler.bind(this);
  }

  componentDidMount() {
    var video = new VideoFrame.VideoFrame({
      id : this.state.uuid,
      frameRate: VideoFrame.FrameRates.high,
      callback : function(response) {
        console.log('callback response: ' + response);
      }
    });
    this.setState(function(prevState, props) {
      prevState.video = video;
      return prevState;
    });
  }

  componentWillReceiveProps(nextProps) {
    // TODO: they selected a different move, load it
  }

  componentWillUnmount() {
  }

  render() {
    const gifLoaded = true;
    const small = this.props.small;
    const uuid = this.state.uuid;

    const playIcon = this.state.paused ? iconPlay : iconPause;

    return (
      <div className="Move-gif" style={{display: 'inline-block'}}>
        <video id={uuid} ref="moveVideo"
         onEnded={this.videoEventHandler}
         onPause={this.videoEventHandler}
         onPlay={this.videoEventHandler}>
          <source src={this.props.url} type="video/mp4"></source>
        </video>
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
          <img src={playIcon} alt="play/pause" onClick={this.playPauseHandler} className="Player-control" />
          <img src={iconNext} alt="next" onClick={this.nextFrameHandler} className="Player-control"/>
          <img src={iconLast} alt="last" onClick={this.lastFrameHandler} className="Player-control"/>
        </div>
      </div>
    );
  }

  // Get the move frame for the video, bounded to be inside the range of frames
  // that actually define the move
  getMoveFrame(video) {
    var realFrame = video.get();

    if (realFrame > this.props.numFrames) {
      realFrame = this.props.numFrames;
    } else if (realFrame < 1) {
      realFrame = 1;
    }
    return realFrame;
  }

  // Generic handler for all video events
  videoEventHandler() {
    this.setState(function(prevState, props) {
      prevState.paused = this.refs.moveVideo.paused;
      prevState.frameIndex = this.getMoveFrame(prevState.video);
      return prevState;
    });
  }

  // Play / pause
  playPauseHandler() {
    ReactGA.event({
      category: 'Player',
      action: 'Play/Pause'
    });
    var video = this.refs.moveVideo;
    if (video.paused) {
      video.play();
      this.setState(function(prevState, props) {
        prevState.paused = false;
        return prevState;
      });
    } else {
      video.pause();
      this.setState(function(prevState, props) {
        prevState.paused = true;
        return prevState;
      });
    }
  }

  moveFrameRelative(num, updateUrl = false) {
    if (num > 0) {
      if (this.state.frameIndex + num > this.props.numFrames)
        return;
      this.state.video.seekForward(num);
    } else {
      if (this.state.frameIndex + num < 1)
        return;
      this.state.video.seekBackward(-num);
    }

    var frameIndex = this.getUsableFrameIndex(this.state.frameIndex) + num;
    this.setState(function(prevState, props) {
      prevState.frameIndex = this.getMoveFrame(prevState.video);
      return prevState;
    });

    this.props.onFrameChange(this.state.video.get() - 1, updateUrl);
  }

  moveFrameAbsolute(num, updateUrl = false) {
    this.state.video.seekTo({frame: num});
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
    this.moveFrameAbsolute(this.props.numFrames, true);
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
    var frameIndex = parseInt(rawFrameIndex, 10);

    ReactGA.event({
      category: 'Player',
      action: 'Frame Number Changed'
    });

    if (this.isValidFrameIndex(frameIndex)) {
      this.moveFrameAbsolute(this.getUsableFrameIndex(frameIndex), true);
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

    // e.g. 1.0 for 60, 0.5 for 30, 2.0 for 120
    this.refs.moveVideo.playbackRate = rawFps / DEFAULT_MOVE_VIDEO_FPS;
    this.setState(function(prevState, props) {
      prevState.fps = rawFps;
      return prevState;
    });
  }

  // Validation functions since we are potentially storing unusable values in the state
  isValidFrameIndex(frameIndex) {
    if (isNaN(frameIndex) || frameIndex < 1 ||
        frameIndex > this.props.numFrames) {
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
