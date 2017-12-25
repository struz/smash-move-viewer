import React, { Component } from 'react';
import { withRouter } from 'react-router';
import ReactGA from 'react-ga';
import axios from 'axios';

import Slider from 'rc-slider/lib/Slider';
import 'rc-slider/assets/index.css';


import ShareModal from './ShareModal.js';

import logo from './img/logo_transparent.png';
import loadingGif from './img/BowserSpin2.gif';
import iconShare from './img/share.svg';

// Gif control icons
import iconPlay from './img/icons/play.png';
import iconPause from './img/icons/pause.png'; //YEET
import iconFirst from './img/icons/first.png';
import iconLast from './img/icons/last.png';
import iconPrevious from './img/icons/previous.png';
import iconNext from './img/icons/next.png';
//import iconLoop from './img/icons/302-loop.svg';

import {HOTKEY_HELP, isIphoneUserAgent} from './Common.js';
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
      videoBlobUrl: null,
      video: null,
      paused: true,
      loading: false,
      loop: props.loop,  // same as frameIndex
      showShare: false,
      initDone: false
    };

    // Bindings
    this.frameTextChanged = this.frameTextChanged.bind(this);
    this.frameChanged = this.frameChanged.bind(this);

    this.playPauseHandler = this.playPauseHandler.bind(this);
    this.nextFrameHandler = this.nextFrameHandler.bind(this);
    this.prevFrameHandler = this.prevFrameHandler.bind(this);
    this.lastFrameHandler = this.lastFrameHandler.bind(this);
    this.firstFrameHandler = this.firstFrameHandler.bind(this);

    this.speedChanged = this.speedChanged.bind(this);

    this.videoEventHandler = this.videoEventHandler.bind(this);
    this.pauseEventHandler = this.pauseEventHandler.bind(this);
    this.timeEventHandler = this.timeEventHandler.bind(this);
    this.keyDownHandler = this.keyDownHandler.bind(this);
    this.loopHandler = this.loopHandler.bind(this);

    this.toggleShareModal = this.toggleShareModal.bind(this);
    this.closeShareModal = this.closeShareModal.bind(this);
    this.videoInit = this.videoInit.bind(this);
  }

  toggleShareModal(e) {
    ReactGA.event({
      category: 'Share',
      action: 'Share toggled',
      label: this.props.fighter + '_' + this.props.move
    });
    this.setState(function(prevState, props) {
      prevState.showShare = !prevState.showShare;
    });
  }

  closeShareModal(e) {
    // If we are targeting the share button, do nothing because then the toggle
    // function will handle the close event for us
    if (e.target.className.includes('Share-image'))
      return;

    ReactGA.event({
      category: 'Share',
      action: 'Share closed',
      label: this.props.fighter + '_' + this.props.move
    });
    this.setState(function(prevState, props) {
      prevState.showShare = false;
    });
  }

  loadVideo(url, defaultFrame) {
    if (!url)
      return;
    var _this = this;
    var beginLoadTime = new Date().getTime();
    _this.setState(function(prevState, props) {
      prevState.loading = true;
      prevState.video = null;
      return prevState;
    });

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

      // We have to set the src before we process the video with VideoFrame
      _this.refs.moveVideo.src = blob;
      // Now we initialize our frame-by-frame processing object
      var video = new VideoFrame.VideoFrame({
        id: _this.refs.moveVideo.id,
        frameRate: VideoFrame.FrameRates.high,
        callback : function(response) {
          console.log('callback response: ' + response);
        }
      });

      _this.setState(function(prevState, props) {
        if (prevState.videoBlobUrl) {
          // Clean up after ourselves
          URL.revokeObjectURL(prevState.videoBlobUrl);
        }

        prevState.videoBlobUrl = blob;
        prevState.video = video;
        prevState.loading = false;
        prevState.frameIndex = defaultFrame;
        prevState.paused = true;
        prevState.initDone = false;
        return prevState;
      });

      // Set up some defaults with the video
      _this.refs.moveVideo.playbackRate = _this.state.playbackSpeed;
      _this.refs.moveVideo.loop = _this.state.loop;
      sendVideoLoadAnalytics();

    }).catch(function (error) {
      console.error('Error downloading move video: ' + error);
    });
  }

  componentDidMount() {
    this.loadVideo(this.props.url, this.props.frameIndex);

    // Bind the arrow keys to frame-by-frame controls
    document.body.addEventListener('keydown', this.keyDownHandler);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.url !== nextProps.url) {
      this.loadVideo(nextProps.url, nextProps.frameIndex);
    }
    if (this.props.loop !== nextProps.loop) {
      this.refs.moveVideo.loop = nextProps.loop;
      this.setState(function(prevState, props) {
        prevState.loop = nextProps.loop;
        return prevState;
      })
    }
  }

  componentWillUnmount() {
    // Unbind the arrow keys from frame-by-frame controls
    document.body.removeEventListener('keydown', this.keyDownHandler);
  }

  videoInit() {
    // Do initialization seeking to the video
    if (!this.state.initDone) {
      if (isIphoneUserAgent()) {
        // We set autoplay to show the first frame, so we stop it here
        this.refs.moveVideo.pause();
        // We do the below bit in the
      } else {
        this.videoInitSeek();
      }
    }
  }

  // Seek to the currently desired frame and then log that init was performed
  videoInitSeek() {
    this.moveFrameAbsolute(this.state.frameIndex, this.state.video);
    this.setState(function(prevState, props) {
      prevState.initDone = true;
      return prevState;
    });
  }

  render() {
    const frameTooltip = "The current frame of the move being shown"
    const playSpeedTooltip = "How fast to play the move. 1x is in-game speed (60fps)"
    const loopTooltip = "Tick to make the move repeat playing until you pause"
    const frameFirstTooltip = "Skip to the first frame of the move"
    const framePrevTooltip = "Show the previous frame of the move"
    const playTooltip = "Play the move"
    const pauseTooltip = "Pause the move to view hitbox information"
    const frameNextTooltip = "Show the next frame of the move"
    const frameLastTooltip = "Skip to the last frame of the move"

    const uuid = this.state.uuid;
    const videoSrc = this.state.videoBlobUrl ? this.state.videoBlobUrl : '';
    const vidLoaded = this.state.video !== null;
    const isLoading = this.state.loading;
    const videoWidth = vidLoaded ? null : "100%";
    const loop = this.state.loop;

    const playIcon = this.state.paused ? iconPlay : iconPause;
    const playPauseTooltip = this.state.paused ? playTooltip : pauseTooltip;
    // Logic around being able to delete the entire contents of the frame box
    // Also has the added bonus of stopping text being entered
    var displayFrame = parseInt(this.state.frameIndex, 10);
    if (isNaN(displayFrame)) {
      displayFrame = this.state.frameIndex;
    } else {
      displayFrame = displayFrame + 1;
    }

    // The video is initially hidden just to keep the ref around
    // to avoid bugs and crashes.
    var videoElement = (
      <div className="Move-video-container">
        <video className="Move-video" id={uuid} ref="moveVideo"

         preload={isIphoneUserAgent() ? "metadata" : "auto"}
         autoPlay={isIphoneUserAgent() ? true : false}

         width={videoWidth}
         onEnded={this.videoEventHandler}
         onPause={this.pauseEventHandler}
         onPlay={this.videoEventHandler}
         onCanPlayThrough={this.videoInit}
         onTimeUpdate={this.timeEventHandler}

         src={videoSrc}
         style={(!vidLoaded) ? {'display': 'none'} : {}} playsInline muted>
        </video>

        <Slider className="Player-slider-control" value={this.state.frameIndex}
          max={this.props.numFrames - 1} onChange={this.frameChanged}
          style={(!vidLoaded) ? {'display': 'none'} : {}}
          handleStyle={{
            height: 16,
            width: 16,
            marginLeft: -6,
            marginTop: -6,
            backgroundColor: '#6a6a79',
            borderRadius: '100%',
            'border': '0'
          }}
          trackStyle={{
            backgroundColor: '#6a6a79'
          }}
          railStyle={{
            backgroundColor: '#c6c6c6'
          }}/>
      </div>
    );

    var vidPlaceholder = null;
    if (!vidLoaded) {
      // We have to use inline style here unfortunately because divs don't have
      // a "width" property
      var placeholderInlineStyles = {width: videoWidth}
      if (!isLoading) {
        placeholderInlineStyles['backgroundImage'] = `url(${logo})`;
      }
      vidPlaceholder = (
        <div className="Move-video-placeholder"
         style={placeholderInlineStyles}>
         <div className="Move-video-placeholder-inner">
            {!isLoading &&
              <div className="Move-video-instruction">
                Select a character and a move to get started.
              </div>
            }
            {isLoading &&
              <div className="Move-video-loading">
                <img src={loadingGif} alt="loading" className="Loading-gif" />
                <p>Loading...</p>
              </div>
            }
          </div>
        </div>
      );
    }

    var showControls = (vidLoaded || isLoading);
    return (
      <div className="Move-gif">
        {videoElement}
        {vidPlaceholder}
        <div className="Move-controls" style={(!showControls) ? {display: 'none'} : {}}>

          <div className="Player-controls">

            <button onClick={isLoading ? null : this.firstFrameHandler} className="Image-button">
              <img src={iconFirst} alt="first" title={frameFirstTooltip}/>
            </button>

            <button onClick={isLoading ? null : this.prevFrameHandler} className="Image-button">
              <img src={iconPrevious} alt="prev" title={framePrevTooltip}/>
            </button>

            <button onClick={isLoading ? null : this.playPauseHandler} className="Image-button">
              <img src={playIcon} alt="play/pause" title={playPauseTooltip}/>
            </button>

            <button onClick={isLoading ? null : this.nextFrameHandler} className="Image-button">
              <img src={iconNext} alt="next" title={frameNextTooltip}/>
            </button>

            <button onClick={isLoading ? null : this.lastFrameHandler} className="Image-button">
              <img src={iconLast} alt="last" title={frameLastTooltip}/>
            </button>

            <div className="Help-icon Bold-label" data-tip={HOTKEY_HELP}>?</div>

          </div>
          <div>
            <hr />
          </div>
          <div className="Frame-controls">

            <label title={playSpeedTooltip}>Play speed:</label>
            <select onChange={this.speedChanged} value={this.state.playbackSpeed}
             className="Dropdown" title={playSpeedTooltip} disabled={isLoading}>
              <option value="2">2x</option>
              <option value="1">1x</option>
              <option value="0.5">0.5x</option>
              <option value="0.25">0.25x</option>
              <option value="0.1">0.1x</option>
            </select>

            <label title={frameTooltip}>Frame:</label>
            <input readOnly ref="frameNum" type="number"
             onChange={this.frameTextChanged}
             value={displayFrame}
             title={frameTooltip}
             className="Move-frame Text-input"
             disabled={isLoading}/>

            <div id="Frame-loop">
              <input type="checkbox" id="chkLoop" onChange={this.loopHandler}
               checked={loop} title={loopTooltip} />
              <label title={loopTooltip} htmlFor="chkLoop">Loop</label>
              <span onClick={this.toggleShareModal}>
                <img src={iconShare} alt="share" className="Share-image"
                 title="Share this move with others"
                 ref="shareImage"/>
              </span>
            </div>

          </div>
    		  <div>
            <hr />
    		  </div>
        </div>
        {
          this.state.showShare &&
          <ShareModal anchor={this.refs.shareImage}
           closeHandler={this.closeShareModal} fighter={this.props.fighter}
           move={this.props.move}/>
        }
      </div>
    );
  }

  keyDownHandler(e) {
    // Player hotkeys
    if (e.shiftKey) {
      if (e.keyCode === 37) {  // Left
        this.moveFrameRelative(-10, this.state.video, true);
        e.preventDefault();
      } else if (e.keyCode === 39) { // right
        this.moveFrameRelative(10, this.state.video, true);
        e.preventDefault();
      }
    } else if (e.ctrlKey) {
      if (e.keyCode === 37) {  // Left
        this.moveFrameAbsolute(0, this.state.video, true);
        e.preventDefault();
      } else if (e.keyCode === 39) { // right
        this.moveFrameAbsolute(this.props.numFrames - 1, this.state.video, true);
        e.preventDefault();
      }
    } else {
      if (e.keyCode === 37) {  // Left
        this.moveFrameRelative(-1, this.state.video, true);
        e.preventDefault();
      } else if (e.keyCode === 39) { // right
        this.moveFrameRelative(1, this.state.video, true);
        e.preventDefault();
      }
    }

    if (e.keyCode === 32) { // return / enter
      this.playPauseHandler();
      e.preventDefault();
    }
  }

  loopHandler(e) {
    this.props.onLoopChange(e.target.checked);
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
    // without this check this callback messes with the initial frame seeking
    // on iOS for some reason
    if (!this.state.initDone)
      return;

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

  // More specific handler for pause so we can do iOS browsers properly
  pauseEventHandler() {
    // FIXME: this kinda works but we still warp back to the start of the video
    if (!this.state.initDone) {
      this.videoInitSeek();
    } else {
      this.videoEventHandler();
    }
  }

  // More specific handler for timing updates
  timeEventHandler() {
    var moveFrame = this.getMoveFrame(this.state.video);

    // We need to only do this after init is done, else the first seek will be
    // intercepted by this event handler and fail to move us to the requested frame
    if (this.state.initDone && moveFrame !== this.state.frameIndex) {
      // Notify parent of changes
      this.props.onFrameChange(moveFrame, true);

      this.setState(function(prevState, props) {
        prevState.frameIndex = moveFrame;
        return prevState;
      });
    }
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
      // Hacky fix for desynced video & frame display on-pause
      this.moveFrameRelative(1, this.state.video, true);
    }
  }

  moveFrameRelative(num, video, updateUrl = false) {
    if (!video)  // No crashing if this is called at weird times
      return;

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
    if (!video)  // No crashing if this is called at weird times
      return;

    // Num here is the 0-indexed frame number
    if (num >= this.props.numFrames) {
      num = this.props.numFrames - 1;
    } else if (num < 0) {
      num = 0;
    }

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

  frameChanged(frameIndex) {
    // Don't spam events
    if (frameIndex !== this.state.frameIndex) {
      ReactGA.event({
        category: 'Player',
        action: 'Frame Number Changed',
        label: 'Slider'
      });
      this.moveFrameAbsolute(frameIndex, this.state.video, true);
    }
  }

  frameTextChanged(e) {
    // We store the raw frame index in state so that the control can be updated
    // freely, and we perform validation on the input before we use it.
    var rawFrameIndex = e.target.value;
    var frameIndex = parseInt(rawFrameIndex, 10);

    ReactGA.event({
      category: 'Player',
      action: 'Frame Number Changed',
      label: 'Textbox'
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
