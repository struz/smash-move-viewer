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

import GIF from './gifuct.js';

class PlayPauseButton extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.state = {src: this.props.isPlaying ? iconPlay : iconPause};
  }

  handleClick(e) {
    var state = this.state;
    state.src = this.props.isPlaying ? iconPlay : iconPause;
    this.setState(state);
    this.props.playPauseChange();
  }

  render() {
    return (
      <img src={this.state.src} className="Frame-control-icon" alt="play-pause" onClick={ this.handleClick } />
    );
  }
}

// TODO: do some frame preprocessing as soon as we load to reduce burden when user clicks "lastFrame" button raw
class Move extends Component {
  constructor(props) {
    super(props);
    this.state = {
      frameIndex: 0,
      gif: null,
      frames: [],
      frameWidth: 1,
      frameHeight: 1
    };

    // Required for drawing patch updates to the gif
    this.tempCanvas = document.createElement('canvas');
    this.tempCtx = this.tempCanvas.getContext('2d');
    this.renderedFrames = {};  // For speedy frame transitions later

    // Required for playing / pausing the gif
    this.timerID = undefined;

    // Bindings
    this.frameTextChanged = this.frameTextChanged.bind(this);
    this.playPauseHandler = this.playPauseHandler.bind(this);
    this.nextFrameHandler = this.nextFrameHandler.bind(this);
    this.prevFrameHandler = this.prevFrameHandler.bind(this);
    this.lastFrameHandler = this.lastFrameHandler.bind(this);
    this.firstFrameHandler = this.firstFrameHandler.bind(this);

    this.loadGIF();
  }

  componentDidMount() {
    // TODO: autoplay stuff goes here
  }

  componentWillUnmount() {
    if (this.timerID !== undefined) {
      clearInterval(this.timerID);
      this.timerID = undefined;
    }
  }
  componentWillUpdate() {

  }

  // Play / pause
  playPauseHandler(e) {
    this.playPause();
  }
  playPause() {
    if (this.timerID === undefined) {
      // 60fps frame updates
      this.timerID = setInterval(
        () => this.tick(),
        1000 / 60
      );
    } else {
      clearInterval(this.timerID);
      this.timerID = undefined;
    }
  }

  tick() {
    this.setState(function(prevState, props) {
      var newState = prevState;
      newState.frameIndex = newState.frameIndex + 1;
      if (newState.frameIndex >= newState.frames.length) {
        newState.frameIndex = 0;
      }
      return newState;
    });

    var context = this.refs.canvas.getContext('2d');
    this.renderPatchFrame(context, this.state.frameIndex);
  }

  render() {
    // TODO: make me a state bool so that i don't break
    const isPlaying = (this.timerID === undefined);

    return (
      <div className="Move">
        <canvas ref="canvas" width={this.state.frameWidth} height={this.state.frameHeight} className="Move-anim"/>
        <div className="Move-controls">
          <label className="Frame-label">Frame:</label>
          <input type="text" onChange={this.frameTextChanged} value={this.state.frameIndex} className="Move-frame"/>
          <img src={iconFirst} alt="first" onClick={this.firstFrameHandler}/>
          <img src={iconPrevious} alt="previous" onClick={this.prevFrameHandler}/>
          <PlayPauseButton playPauseChange={this.playPauseHandler} isPlaying={isPlaying} />
          <img src={iconNext} alt="next" onClick={this.nextFrameHandler}/>
          <img src={iconLast} alt="last" onClick={this.lastFrameHandler}/>
        </div>
      </div>
    );
  }

  loadGIF() {
  	var oReq = new XMLHttpRequest();
  	oReq.open("GET", this.props.url, true);
  	oReq.responseType = "arraybuffer";

    var _this = this;
  	oReq.onload = function (oEvent) {
  	    var arrayBuffer = oReq.response; // Note: not oReq.responseText
  	    if (arrayBuffer) {
            var gif = new GIF(arrayBuffer);
            var frames = gif.decompressFrames(true);
            _this.setState({
              frameIndex: 0,
              gif: gif,
              frames: frames,
              frameWidth: frames[0].dims.width,
              frameHeight: frames[0].dims.height
            });

            // Render initial frame
            var context = _this.refs.canvas.getContext('2d');
            _this.renderPatchFrame(context, 0);
  	    } else {
          console.error('Could not load gif');
        }
  	};

  	oReq.send(null);
  }

  nextFrameHandler(e) {
    this.renderToFrame(this.state.frameIndex + 1);
  }
  prevFrameHandler(e) {
    this.renderToFrame(this.state.frameIndex - 1);
  }
  lastFrameHandler(e) {
    this.renderToFrame(this.state.frames.length);
  }
  firstFrameHandler(e) {
    this.renderToFrame(0);
  }
  frameTextChanged(e) {
    this.renderToFrame(e.target.value);
  }
  renderToFrame(frame) {
    // TODO: memoize the frames so that switching around is easier
    if (frame === this.state.frameIndex) {
      return;
    }
    if (frame < 0) {
      frame = 0;
    }
    if (frame >= this.state.frames.length) {
      frame = this.state.frames.length - 1;
    }

    var context = this.refs.canvas.getContext('2d');
    var startFrame = this.state.frameIndex;  // Current frame
    if (frame < startFrame) {
      // Going backwards, so we need to reset the gif to frame 0
      // and patch our way back up to the requested frame
      context.clearRect(0, 0, this.state.frameWidth, this.state.frameHeight);
      startFrame = 0;
    }

    // Try rendering memoized frame first
    if (!this.renderMemoizedFrame(context, frame)) {
      var i;
      for (i = startFrame; i <= frame; i++) {
        // Patch each frame til we get there
        this.renderPatchFrame(context, i);
      }
    }

    this.setState(function(prevState, props) {
      var newState = prevState;
      newState.frameIndex = frame;
      return newState;
    });
  }

  // Assumes the frame being rendered is always the next frame from the last
  // one rendered, or the first frame itself.
  renderPatchFrame(context, frameNum) {
    var frame = this.state.frames[frameNum];
    var dims = frame.dims;
    var frameImageData;

    this.tempCanvas.width = dims.width;
    this.tempCanvas.height = dims.height;
    frameImageData = this.tempCtx.createImageData(dims.width, dims.height);

    // set the patch data as override
    frameImageData.data.set(frame.patch);

    // draw the patch back over the canvas
    this.tempCtx.putImageData(frameImageData, 0, 0);

    // draw the entire frame
    context.drawImage(this.tempCanvas, dims.left, dims.top);

    // memoize the frame data if it doesn't exist
    if (!(frameNum in this.renderedFrames)) {
      this.renderedFrames[frameNum] = context.getImageData(0, 0, dims.width, dims.height);
    }
  }

  // Returns false if the memoized frame was not able to be rendered
  renderMemoizedFrame(context, frameNum) {
    if (frameNum in this.renderedFrames) {
      var dims = this.state.frames[frameNum].dims;
      this.tempCtx.putImageData(this.renderedFrames[frameNum], 0, 0);
      context.drawImage(this.tempCanvas, dims.left, dims.top);
      return true;
    }
    return false;
  }
}

export default Move;
