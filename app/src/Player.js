import React, { Component } from 'react';
import { withRouter } from 'react-router';
import ReactGA from 'react-ga';
import axios from 'axios';

import Slider from 'rc-slider/lib/Slider';
import 'rc-slider/assets/index.css';


import ShareModal from './ShareModal.js';

import logo from './img/logo_transparent_lowfi.png';
import loadingGif from './img/BowserSpin3.gif';
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


// Placeholder / loading splash to use when a video is being updated or loaded
class VideoPlaceholder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showLoading: props.showLoading,
      showSplash: props.showSplash
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.showLoading !== this.state.showLoading) {
      this.setState(function(prevState, props) {
        prevState.showLoading = nextProps.showLoading;
        return prevState;
      });
    }
    if (nextProps.showSplash !== this.state.showSplash) {
      this.setState(function(prevState, props) {
        prevState.showSplash = nextProps.showSplash;
        return prevState;
      });
    }
  }

  render() {
    const showLoading = this.state.showLoading;
    const showSplash = this.state.showSplash;

    var placeholderInlineStyles = {};
    if (showSplash) {  // Splash screen only when no videos have been loaded in a session
      placeholderInlineStyles['backgroundImage'] = `url(${logo})`;
    }
    if (!showSplash && !showLoading) {
      placeholderInlineStyles['display'] = 'none';
    }

    return (
      <div className="Move-video-placeholder"
       style={placeholderInlineStyles}>
       <div className="Move-video-placeholder-inner">
          <div className="Move-video-instruction" style={showLoading ? {display: 'none'} : {}}>
            Select a character and a move to get started.
          </div>
          <div className="Move-video-loading" style={showLoading ? {} : {display: 'none'}}>
            <div>
              <img src={loadingGif} alt="loading" className="Loading-gif" />
            </div>
            <div className="Move-video-instruction">Loading...</div>
          </div>
        </div>
      </div>
    );
  }
}


// Placeholder / loading splash to use when a video is being updated or loaded
class PlayerControls extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hidden: this.props.hidden,
      disabled: this.props.disabled,
      playbackSpeed: this.props.playbackSpeed,
      loop: this.props.loop,
      displayFrame: this.props.displayFrame,
      paused: this.props.paused,

      showShare: false
    }

    this.toggleShareModal = this.toggleShareModal.bind(this);
    this.closeShareModal = this.closeShareModal.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(function(prevState, props) {
      prevState.hidden = nextProps.hidden;
      prevState.disabled = nextProps.disabled;
      prevState.playbackSpeed = nextProps.playbackSpeed;
      prevState.loop = nextProps.loop;
      prevState.displayFrame = nextProps.displayFrame;
      prevState.paused = nextProps.paused;
      return prevState;
    });
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

  render() {
    /* Tooltips for frame controls */
    const frameTooltip = "The current frame of the move being shown"
    const playSpeedTooltip = "How fast to play the move. 1x is in-game speed (60fps)"
    const loopTooltip = "Tick to make the move repeat playing until you pause"
    const frameFirstTooltip = "Skip to the first frame of the move (CTRL + Left arrow)"
    const framePrevTooltip = "Show the previous frame of the move (Left arrow)"
    const playTooltip = "Play the move (Spacebar)"
    const pauseTooltip = "Pause the move to view hitbox information (Spacebar)"
    const frameNextTooltip = "Show the next frame of the move (Right arrow)"
    const frameLastTooltip = "Skip to the last frame of the move (CTRL + Right arrow)"

    const playIcon = this.state.paused ? iconPlay : iconPause;
    const playPauseTooltip = this.state.paused ? playTooltip : pauseTooltip;

    const hidden = this.state.hidden;
    const disabled = this.state.disabled;
    const loop = this.state.loop;
    const displayFrame = this.state.displayFrame;

    return (
      <div className="Move-controls" style={hidden ? {display: 'none'} : {}}>
        <div className="Player-controls">
          <button type="button" onClick={disabled ? null : this.props.firstFrameHandler} className="Image-button">
            <img src={iconFirst} alt="first" title={frameFirstTooltip}/>
          </button>
          <button type="button" onClick={disabled ? null : this.props.prevFrameHandler} className="Image-button">
            <img src={iconPrevious} alt="prev" title={framePrevTooltip}/>
          </button>
          <button type="button" onClick={disabled ? null : this.props.playPauseHandler} className="Image-button">
            <img src={playIcon} alt="play/pause" title={playPauseTooltip}/>
          </button>
          <button type="button" onClick={disabled ? null : this.props.nextFrameHandler} className="Image-button">
            <img src={iconNext} alt="next" title={frameNextTooltip}/>
          </button>
          <button type="button" onClick={disabled ? null : this.props.lastFrameHandler} className="Image-button">
            <img src={iconLast} alt="last" title={frameLastTooltip}/>
          </button>
          <div className="Help-icon Bold-label" data-tip={HOTKEY_HELP}>?</div>
        </div>

        <div>
          <hr />
        </div>

        <div className="Frame-controls">
          <label title={playSpeedTooltip}>Play speed:</label>
          <select onChange={this.props.speedChanged} value={this.state.playbackSpeed}
           className="Dropdown" title={playSpeedTooltip} disabled={disabled}>
            <option value="2">2x</option>
            <option value="1">1x</option>
            <option value="0.5">0.5x</option>
            <option value="0.25">0.25x</option>
            <option value="0.1">0.1x</option>
          </select>

          <label title={frameTooltip}>Frame:</label>
          <input readOnly ref="frameNum" type="number"
           value={this.state.paused ? displayFrame : ''}
           title={frameTooltip}
           className="Move-frame Text-input"
           disabled={disabled || !this.state.paused}/>

          <div id="Frame-loop">
            <input type="checkbox" id="chkLoop" onChange={this.props.loopHandler}
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
        {this.state.showShare &&
          <ShareModal anchor={this.refs.shareImage}
           closeHandler={this.closeShareModal} fighter={this.props.fighter}
           move={this.props.move}/>}
      </div>
    );
  }
}


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
      loop: props.loop,  // same as frameIndex
      initDone: false,

      videoHeight: 0,
      videoWidth: 0,

      // >= 0 means we use this as the slider value instead of frame, and we
      // don't pass it up to parents
      fudgeSlider: -1
    };
    // Outside of state because we don't want to trigger renders on it, but
    // we do potentially want the values accessible during a render.
    this.loading = false;
    this.fudgeSliderInterval = null;
    this.fudgeUpdateSpeed = 1000 / 30;


    // Bindings
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

    this.videoViewInit = this.videoViewInit.bind(this);
    this.videoFrameInit = this.videoFrameInit.bind(this);

    this.seekInitHandler = this.seekInitHandler.bind(this);

    this.fudgeSliderStep = this.fudgeSliderStep.bind(this);
  }

  /* === React lifecycle handlers === */

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
      });
    }

    // Handle pausing from outside. Don't update the parent from in here or
    // we end up in a render storm.
    if (nextProps.sendPause && !this.state.paused) {
      this.playPauseHandler();
    }

    // If we check this while playing we get an event storm that ruins playback speed
    if (this.state.paused || nextProps.sendPause) {
      if (this.props.frameIndex !== nextProps.frameIndex) {
        // We say "false" to updating the URL because if we are being passed in
        // a new frame, our parent should have already updated the URL.
        this.moveFrameAbsolute(nextProps.frameIndex, this.state.video, false);
      }
    }
  }

  componentWillUnmount() {
    // Unbind the arrow keys from frame-by-frame controls
    document.body.removeEventListener('keydown', this.keyDownHandler);
  }

  /* === End react lifecycle handlers === */


  /* === Video event handlers === */

  // Generic handler for most video events
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
      let pauseStateChanged = this.refs.moveVideo.paused !== prevState.paused;

      prevState.paused = this.refs.moveVideo.paused;
      if (prevState.paused === false) {
        // if video is playing, playing don't update frame so we can fudge a nice slider
        prevState.frameIndex = moveFrame;
      }

      // This will only fire if for some reason they played the video through
      // the browser default controls instead of ours. Here to stop idiocy
      if (pauseStateChanged) {
        if (this.refs.moveVideo.paused) {
          this.endFudgeSlider();
        } else {
          this.beginFudgeSlider();
        }
      }
      return prevState;
    });
  }

  // More specific handler for pause so we can do iOS browsers properly
  pauseEventHandler() {
    if (!this.state.initDone) {
      this.videoInitSeek();
    } else {
      this.videoEventHandler();
    }
  }

  // Handler for any time the video currentTime attribute changes
  timeEventHandler() {
    var moveFrame = this.getMoveFrame(this.state.video);

    // We only want do this after init is done, else the first seek will be
    // intercepted by this event handler and fail to move us to the requested frame
    if (this.state.initDone && moveFrame !== this.state.frameIndex) {
      // Notify parent of changes
      this.props.onFrameChange(moveFrame, true);

      this.setState(function(prevState, props) {
        prevState.frameIndex = moveFrame;
        if (prevState.fudgeSlider > -1) {
          // Keep track of how much the drift was and use this to try and play at
          // the right speed for the processor
          this.fudgeFrameDrift = moveFrame - prevState.fudgeSlider;
          // Note that if we are looping this number could be large so we
          // need to discount particularly large numbers until we converge on
          // the real amount
          if (Math.abs(this.fudgeFrameDrift) < (this.props.numFrames - this.props.numFrames * 0.4)) {
            if (this.fudgeFrameDrift < -2 || this.fudgeFrameDrift > 2) {
              // Use the drift difference to assert what the real FPS we should be updating at is
              var adjustedFrameDrift = this.fudgeFrameDrift > 0 ? this.fudgeFrameDrift - 2 : this.fudgeFrameDrift + 2;
              this.fudgeUpdateSpeed = (1000 / ((1000 / this.fudgeUpdateSpeed) + adjustedFrameDrift)) * 2;  // *2 because we skip 2 frames in the fudge
            }
            // TODO: Old heuristic based convergence method. Delete if not used after a while.
            // if (this.fudgeFrameDrift > 4) {
            //   // Try adjusting the drift speed
            //   this.fudgeUpdateSpeed -= 0.3;
            //   console.log('decreasing update speed ' + this.fudgeUpdateSpeed);
            // } else if (this.fudgeFrameDrift < -4) {
            //   this.fudgeUpdateSpeed += 0.3;
            //   console.log('increasing update speed ' + this.fudgeUpdateSpeed);
            // }
          }
          if (this.fudgeUpdateSpeed > (1000 / 25) || this.fudgeUpdateSpeed < (1000 / 35)) {
            this.fudgeUpdateSpeed = (1000 / 30);  // Prevent runaway logic
          }
          // Sync the fudge number with the real one where possible
          prevState.fudgeSlider = moveFrame;
        }
        return prevState;
      });
    }
  }

  // The reason we use an on-seek for the init and nowhere else is because we
  // want this to fire only after we explicitly *seek* to the first frame we
  // care about. Time updates capture a lot more noise.
  seekInitHandler() {
    if (!this.state.initDone && this.state.video && this.state.frameIndex === this.getMoveFrame(this.state.video)) {
      this.setState(function(prevState, props) {
        prevState.videoHeight = this.refs.moveVideo.videoHeight;
        prevState.videoWidth = this.refs.moveVideo.videoWidth;
        prevState.initDone = true;
        return prevState;
      });
      return;
    }
  }

  /* === End video event handlers === */


  /* === Player control handlers === */

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
      this.beginFudgeSlider();
    } else {
      video.pause();
      this.setState(function(prevState, props) {
        prevState.paused = true;
        return prevState;
      });
      this.endFudgeSlider();
      // Hacky fix for desynced video & frame display on-pause
      this.moveFrameRelative(1, this.state.video, true);
    }
    this.props.onPlayPause();  // Cancel sendPause if exists
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
    if (this.fudgeSliderInterval) {
      this.endFudgeSlider();
      this.beginFudgeSlider();
    }

    // Notify parent of change
    this.props.onSpeedChange(playbackSpeed);
  }

  loopHandler(e) {
    this.props.onLoopChange(e.target.checked);
  }

  /* === End player control handlers === */


  /* === Frame seeking functions === */

  beginFudgeSlider() {
    // FIXME: this doubles our scripting time spent, I wonder if there's a way to make
    // the render calls less costly
    this.setState(function(prevState, props) {
      prevState.fudgeSlider = this.state.frameIndex;
      return prevState;
    });

    this.fudgeSliderInterval = setTimeout(
      this.fudgeSliderStep,
      this.fudgeUpdateSpeed / this.state.playbackSpeed);  // 60fps (with error margin) / playback speed
  }

  fudgeSliderStep() {
    if (this.state.fudgeSlider > -1) {
      this.setState(function(prevState, props){
        // We fudge 2 frames at a time to save render cycles
        prevState.fudgeSlider = prevState.fudgeSlider + 2;
        if (prevState.fudgeSlider >= props.numFrames) {
          if (prevState.loop) {
            prevState.fudgeSlider = 0;
          } else {
            prevState.fudgeSlider = props.numFrames - 1;
          }
        }
        return prevState;
      });
      this.fudgeSliderInterval = setTimeout(this.fudgeSliderStep, this.fudgeUpdateSpeed / this.state.playbackSpeed);
    }
  }

  endFudgeSlider() {
    this.setState(function(prevState, props) {
      prevState.fudgeSlider = -1;
      return prevState;
    });
    if (this.fudgeSliderInterval) {
      clearInterval(this.fudgeSliderInterval);
      this.fudgeSliderInterval = null;
    }
  }

  // Get the move frame for the video, bounded to be inside the range of frames
  // that actually define the move
  getMoveFrame(video) {
    if (!video)  // No crashing at dumb times
      return;

    var realFrame = video.get();

    if (realFrame >= this.props.numFrames) {
      realFrame = this.props.numFrames - 1;
    } else if (realFrame < 0) {
      realFrame = 0;
    }
    return realFrame;
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

  /* === End frame seeking functions === */


  /* === Video object handling functions === */
  loadVideo(url, defaultFrame) {
    if (!url)
      return;
    var _this = this;
    var beginLoadTime = new Date().getTime();
    _this.loading = true;
    _this.setState(function(prevState, props) {
      prevState.video = null;
      prevState.initDone = false;
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

      _this.loading = false;
      _this.setState(function(prevState, props) {
        if (prevState.videoBlobUrl) {
          // Clean up after ourselves
          URL.revokeObjectURL(prevState.videoBlobUrl);
        }

        prevState.videoBlobUrl = blob;
        prevState.video = video;
        prevState.frameIndex = defaultFrame;
        prevState.paused = true;
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

  videoViewInit() {
    // Do viewport initialization for the video
    // Make sure we never touch these values except on this callback otherwise
    // we will waste renders
    this.setState(function(prevState, props) {
      prevState.videoHeight = this.refs.moveVideo.videoHeight;
      prevState.videoWidth = this.refs.moveVideo.videoWidth;
    });
  }

  videoFrameInit(target) {
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

  // Seek to the currently desired frame. The initDone flag will be set by
  // an onSeeked callback in the video
  videoInitSeek() {
    this.moveFrameAbsolute(this.state.frameIndex, this.state.video);
  }

  /* === End video object handling functions === */


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
    } else if (e.ctrlKey || e.metaKey) {
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


  render() {
    const uuid = this.state.uuid;
    const videoSrc = this.state.videoBlobUrl ? this.state.videoBlobUrl : '';
    const initDone = this.state.initDone;
    const hasMoveAndFighter = this.props.fighter && this.props.move;
    const showSplash = !hasMoveAndFighter && !this.state.videoHeight;
    const displayFrame = parseInt(this.state.frameIndex, 10) + 1;

    var videoClass = "Video-loaded";
    var videoStyles = {};
    // If not yet done initializing, use the height and width of the old video
    // as a guide to make sure the layout doesn't jerk around
    if (showSplash) {
      // If there was no previous video and the init is not done yet then use
      // a style that makes a placeholder splash screen
      videoClass = "Video-not-loaded";
    } else if (!this.state.initDone && (this.state.videoHeight && this.state.videoWidth)) {
      // FIXME: this is a very ugly hack, I wonder if there's a better way
      // FIXME: also this is imperfect and doesn't exactly preserve the video aspect ratio on mobile devices
      if (window.innerHeight < 500) {
        // Landscape, only set height so width matches aspect ratio
        videoStyles.height = this.state.videoHeight;
      } else if (window.innerWidth < 1024) {
        // The opposite for portrait
        videoStyles.width = this.state.videoWidth;
      } else {
        // Desktop is large and in charge so who cares
        videoStyles.height = this.state.videoHeight;
        videoStyles.width = this.state.videoWidth;
      }
    } else if (!this.state.initDone) {
      // If there was no previous video and the init is not done yet then use
      // a style that makes a placeholder splash screen
      videoClass = "Video-not-loaded";
    }

    // We never remove any of the components of this render so that the layout
    // doesn't jump around. Instead, we just display: none it. This has the added
    // bonus of keeping refs around and avoiding null references.
    return (
      <div className="Move-gif">
        <div className={"Move-video-outer-container " + videoClass}>
          <VideoPlaceholder showLoading={!initDone && !showSplash && hasMoveAndFighter} showSplash={showSplash} />
          <div className="Move-video-background" style={!initDone && !showSplash ? {} : {display: 'none'} }></div>

          <div className="Move-video-container">
            <video className={"Move-video " + videoClass} id={uuid} ref="moveVideo"
             style={videoStyles}

             // We set preload to metadata because we are async loading the video elsewhere
             preload="metadata"
             autoPlay={isIphoneUserAgent() ? true : false}

             onEnded={this.videoEventHandler}
             onPause={this.pauseEventHandler}
             onPlay={this.videoEventHandler}
             onTimeUpdate={this.timeEventHandler}
             onSeeked={this.seekInitHandler}

             /* Init related callbacks */
             onCanPlayThrough={this.videoFrameInit}
             onLoadedMetadata={this.videoViewInit}

             src={videoSrc} playsInline muted>
            </video>

            <div style={{'width': '95%', 'display': 'inline-block'}}>
              <Slider className="Player-slider-control" max={this.props.numFrames - 1}
                // If we are fudging we use the fudge value instead
                value={this.state.fudgeSlider > -1 ? this.state.fudgeSlider : this.state.frameIndex}
                // We do not want to send any updates if we are fudging
                onChange={this.state.fudgeSlider > -1 ? null : this.frameChanged}

                style={showSplash ? {'display': 'none'} : {}}
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
          </div>
        </div>

        <PlayerControls hidden={showSplash} paused={this.state.paused}
          disabled={!initDone}

          fighter={this.props.fighter}
          move={this.props.move}

          firstFrameHandler={this.firstFrameHandler}
          prevFrameHandler={this.prevFrameHandler}
          playPauseHandler={this.playPauseHandler}
          nextFrameHandler={this.nextFrameHandler}
          lastFrameHandler={this.lastFrameHandler}

          speedChanged={this.speedChanged}
          playbackSpeed={this.state.playbackSpeed}
          displayFrame={displayFrame}
          loopHandler={this.loopHandler}
          loop={this.state.loop}
          />
      </div>
    );
  }
}

export default withRouter(Player);
