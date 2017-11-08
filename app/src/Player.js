import React, { Component } from 'react';
import { withRouter } from 'react-router'
import ReactGA from 'react-ga';
import axios from 'axios';

//import logo from './img/SmashBall.svg';

// Gif control icons
import iconPlay from './img/icons/play.png';
import iconPause from './img/icons/pause.png'; //YEET
import iconFirst from './img/icons/first.png';
import iconLast from './img/icons/last.png';
import iconPrevious from './img/icons/previous.png';
import iconNext from './img/icons/next.png';
//import iconLoop from './img/icons/302-loop.svg';

import './Player.css';


const VideoFrame = require('./VideoFrame.js');
const uuidv4 = require('uuid/v4');

ReactGA.initialize('UA-107697636-1');

class Player extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // frameIndex is 0-indexed in this store
      frameIndex: props.frameIndex,  // STATE is the canonical location for frameIndex, we just take it from props
      playbackSpeed: props.playbackSpeed,  // same as frameIndex
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
        if (prevState.videoData) {
          // Clean up after ourselves
          URL.revokeObjectURL(prevState.videoData);
        }

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
    this.refs.moveVideo.playbackRate = this.state.playbackSpeed;
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

    const displayFrame = this.state.frameIndex + 1;

    // 792px is the average width of a video so we use that as a default to make
    // the layout change less jarring to the user when they load their first move
    const videoWidth = vidLoaded ? null : 792;

    return (
      <div className="Move-gif">
        <video className="Move-video" id={uuid} ref="moveVideo"
         width={videoWidth}
         onEnded={this.videoEventHandler}
         onPause={this.videoEventHandler}
         onPlay={this.videoEventHandler}
         //onTimeUpdate={this.videoEventHandler}
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
          <div>
		    <hr />
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
             value={displayFrame}
             className="Move-frame Text-input"/>
          </div>
		  <div>
		    <hr />
		  </div>
        </div>
      </div>
    );
  }

  // Get the move frame for the video, bounded to be inside the range of frames
  // that actually define the move
  getMoveFrame(video) {
    var realFrame = video.get();

    if (realFrame >= this.props.numFrames) {
      realFrame = this.props.numFrames - 1;
    } else if (realFrame < 0) {
      realFrame = 0;
    }
    return realFrame;
  }

  // Generic handler for all video events
  videoEventHandler() {
    var moveFrame = this.getMoveFrame(this.state.video);

    if (moveFrame !== this.state.frameIndex) {
      // Notify parent of changes
      this.props.onFrameChange(moveFrame, true);
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
      // Handle case where we pressed play on the final frame of the video
      // and we want to make sure it starts at the beginning
      if (this.state.frameIndex >= this.props.numFrames - 1) {
        video.currentTime = 0;
      }
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

  moveFrameRelative(num, video, updateUrl = false) {
    if (num > 0) {
      if (this.state.frameIndex + num >= this.props.numFrames)
        return;
      video.seekForward(num);
    } else {
      if (this.state.frameIndex + num < 0)
        return;
      video.seekBackward(-num);
    }

    var frameIndex = this.getMoveFrame(video);
    this.setState(function(prevState, props) {
      prevState.frameIndex = frameIndex;
      return prevState;
    });

    // Notify parent of changes
    this.props.onFrameChange(frameIndex, updateUrl);
  }

  moveFrameAbsolute(num, video, updateUrl = false) {
    // Num here is the 0-indexed frame number
    if (num >= this.props.numFrames) {
      num = this.props.numFrames - 1;
    } else if (num < 0) {
      num = 0;
    }

    // weird edge case hack - library doesn't like going to frame 0
    // if (num === 0) {
    //   video.seekTo({frame: 1});
    //   this.moveFrameRelative(-1, video, updateUrl);
    //   return;
    // }

    video.seekTo({frame: num});
    this.setState(function(prevState, props) {
      prevState.frameIndex = num;
      return prevState;
    });

    // Notify parent of changes
    this.props.onFrameChange(num, updateUrl);
  }

  nextFrameHandler(e) {
    ReactGA.event({
      category: 'Player',
      action: 'Next Frame'
    });
    this.moveFrameRelative(1, this.state.video, true);
  }
  prevFrameHandler(e) {
    ReactGA.event({
      category: 'Player',
      action: 'Prev Frame'
    });
    this.moveFrameRelative(-1, this.state.video, true);
  }
  lastFrameHandler(e) {
    ReactGA.event({
      category: 'Player',
      action: 'Last Frame'
    });
    this.moveFrameAbsolute(this.props.numFrames - 1, this.state.video, true);
  }
  firstFrameHandler(e) {
    ReactGA.event({
      category: 'Player',
      action: 'First Frame'
    });
    this.moveFrameAbsolute(0, this.state.video, true);
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
      this.moveFrameAbsolute(frameIndex - 1, this.state.video, true);
    } else {
      // Store the invalid frame index but don't move the frame
      this.setState(function(prevState, props) {
        prevState.frameIndex = rawFrameIndex;
        return prevState;
      });
    }
  }

  speedChanged(e) {
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

    // Notify parent of change
    this.props.onSpeedChange(playbackSpeed);
  }

  // Validation functions since we are potentially storing unusable values in the state
  isValidFrameIndex(frameIndex) {
    if (isNaN(frameIndex) || frameIndex < 0 ||
        frameIndex >= this.props.numFrames) {
      return false;
    }
    return true;
  }
  getUsableFrameIndex(frameIndex) {
    if (!this.isValidFrameIndex(frameIndex)) {
      return 0;
    }
    return frameIndex;
  }
}

export default withRouter(Player);
