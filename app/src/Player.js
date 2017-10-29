import React, { Component } from 'react';
import { withRouter } from 'react-router'
import ReactGA from 'react-ga';
import axios from 'axios';

//import logo from './img/SmashBall.svg';

// Gif control icons
import iconPlay from './img/icons/285-play3.svg';
import iconPause from './img/icons/286-pause2.svg';
import iconFirst from './img/icons/290-first.svg';
import iconLast from './img/icons/291-last.svg';
import iconPrevious from './img/icons/292-previous2.svg';
import iconNext from './img/icons/293-next2.svg';
//import iconLoop from './img/icons/302-loop.svg';

import './Player.css';


const VideoFrame = require('./VideoFrame.js');
const uuidv4 = require('uuid/v4');

ReactGA.initialize('UA-107697636-1');

class Player extends Component {
  constructor(props) {
    super(props);
    this.state = {
      frameIndex: this.props.frameIndex,  // STATE is the canonical location for frameIndex, we just take it from props
      playbackSpeed: this.props.playbackSpeed,  // same as frameIndex
      uuid: uuidv4(),
      videoData: null,
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

    this.speedChanged = this.speedChanged.bind(this);

    this.videoEventHandler = this.videoEventHandler.bind(this);
  }

  loadVideo(url, defaultFrame) {
    if (!url)
      return;
    var _this = this;
    var beginLoadTime = new Date().getTime();

    var sendVideoLoadAnalytics = function() {
      var endLoadTime = new Date().getTime();
      var timeSpent = endLoadTime - beginLoadTime;
      ReactGA.timing({
        category: 'Player',
        variable: 'Load video',
        value: timeSpent
      });
    }

    axios.request({
      'url': url,
      'responseType': 'blob'
    }).then(function(response) {
      var blob = URL.createObjectURL(response.data);
      _this.setState(function(prevState, props) {
        prevState.videoData = blob;
        prevState.video = null;  // to force refresh in next render
        prevState.frameIndex = defaultFrame;
        return prevState;
      });
      sendVideoLoadAnalytics();

    }).catch(function (error) {
      console.error('Error downloading move video: ' + error);
    });
  }

  processVideo() {
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

    // Set up some defaults with the video
    this.moveFrameAbsolute(this.state.frameIndex, video);
  }

  componentDidMount() {
    this.loadVideo(this.props.url, this.props.frameIndex);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.url !== nextProps.url) {
      this.loadVideo(nextProps.url, nextProps.frameIndex);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.videoData && !this.state.video) {
      // Make sure we have an up to date video object after each render
      this.processVideo();
    }
  }

  componentWillUnmount() {
  }

  render() {
    const uuid = this.state.uuid;
    const videoSrc = this.state.videoData ? this.state.videoData : '';
    const vidLoaded = this.state.video !== null;

    const playIcon = this.state.paused ? iconPlay : iconPause;

    return (
      <div className="Move-gif" style={{display: 'inline-block'}}>
        <video id={uuid} ref="moveVideo"
         onEnded={this.videoEventHandler}
         onPause={this.videoEventHandler}
         onPlay={this.videoEventHandler}
         src={videoSrc}>
        </video>
        <div className="Move-controls" style={!vidLoaded ? {display: 'none'} : {}}>
          <div className="Player-controls">
            <img src={iconFirst} alt="first" onClick={this.firstFrameHandler} className="Player-control"/>
            <img src={iconPrevious} alt="previous" onClick={this.prevFrameHandler} className="Player-control"/>
            <img src={playIcon} alt="play/pause" onClick={this.playPauseHandler} className="Player-control" />
            <img src={iconNext} alt="next" onClick={this.nextFrameHandler} className="Player-control"/>
            <img src={iconLast} alt="last" onClick={this.lastFrameHandler} className="Player-control"/>
          </div>

          <div className="Frame-controls">
            <label>Play speed:</label>
            <select onChange={this.speedChanged} value={this.state.playbackSpeed} className="Dropdown">
              <option value="2">2x</option>
              <option value="1">1x</option>
              <option value="0.5">0.5x</option>
              <option value="0.25">0.25x</option>
              <option value="0.1">0.1x</option>
            </select>
            <label>Frame:</label>
            <input ref="frameNum" type="number"
             onChange={this.frameTextChanged}
             value={this.state.frameIndex}
             className="Move-frame Text-input"/>
          </div>
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
    var moveFrame = this.getMoveFrame(this.state.video);

    if (moveFrame !== this.state.frameIndex) {
      // Notify parent of changes
      this.props.onFrameChange(moveFrame - 1, true);
    }

    this.setState(function(prevState, props) {
      prevState.paused = this.refs.moveVideo.paused;
      prevState.frameIndex = moveFrame;
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

    this.setState(function(prevState, props) {
      prevState.frameIndex = this.getMoveFrame(prevState.video);
      return prevState;
    });

    this.props.onFrameChange(this.state.video.get() - 1, updateUrl);
  }

  moveFrameAbsolute(num, video, updateUrl = false) {
    if (num > this.props.numFrames) {
      num = this.props.numFrames;
    } else if (num < 1) {
      num = 1;
    }

    video.seekTo({frame: num});
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
    this.moveFrameAbsolute(this.props.numFrames, this.state.video, true);
  }
  firstFrameHandler(e) {
    ReactGA.event({
      category: 'Player',
      action: 'First Frame'
    });
    this.moveFrameAbsolute(1, this.state.video, true);
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
      this.moveFrameAbsolute(this.getUsableFrameIndex(frameIndex), this.state.video, true);
    } else {
      // Store the invalid frame index but don't move the frame
      this.setState(function(prevState, props) {
        prevState.frameIndex = rawFrameIndex;
        return prevState;
      });
    }
  }

  speedChanged(e) {
    // We store the raw fps value in state so that the control can be updated
    // freely, and we perform validation on the input before we use it.
    var playbackSpeed = e.target.value;

    ReactGA.event({
      category: 'Player',
      action: 'Playback Speed Changed'
    });

    this.refs.moveVideo.playbackRate = playbackSpeed;
    this.setState(function(prevState, props) {
      prevState.playbackSpeed = playbackSpeed;
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
