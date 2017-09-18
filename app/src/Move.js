import React, { Component } from 'react';
import './App.css';

import GIF from './gifuct.js';

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
    this.frameImageData = null;

    // Bindings
    this.frameChanged = this.frameChanged.bind(this);

    this.loadGIF();
  }

  componentDidMount() {
    // 10fps frame updates
    // this.timerID = setInterval(
    //   () => this.tick(),
    //   100
    // );
  }
  componentWillUnmount() {
    // clearInterval(this.timerID);
  }
  componentWillUpdate() {

  }

  tick() {
    var newState = this.state;
    newState.frameIndex = newState.frameIndex + 1;
    if (newState.frameIndex >= newState.frames.length) {
      newState.frameIndex = 0;
    }
    this.setState(newState);

    var context = this.refs.canvas.getContext('2d');
    this.renderFrame(context, this.state.frames[this.state.frameIndex]);
  }

  // componentDidUpdate() {
  //   var context = this.refs.canvas.getContext('2d');
  //   context.clearRect(0, 0, 100, 100);
  //   this.renderFrame(context, 0);
  // }

  render() {
    return (
      <div className="Move">
        <canvas ref="canvas" width={this.state.frameWidth} height={this.state.frameHeight} className="Move-anim"/>
        <input type="number" onChange={ this.frameChanged } value={ this.state.frameIndex } className="Move-frame"/>
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
            _this.renderFrame(context, frames[0]);
  	    } else {
          console.error('Could not load gif');
        }
  	};

  	oReq.send(null);
  }

  frameChanged(e) {
    this.renderToFrame(e.target.value);
  }

  renderToFrame(frame) {
    if (frame == this.state.frameIndex) {
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

    var i;
    for (i = startFrame; i <= frame; i++) {
      // Patch each frame til we get there
      this.renderFrame(context, this.state.frames[i]);
    }
    var newState = this.state;
    newState.frameIndex = frame;
    this.setState(newState);
  }

  // Assumes the frame being rendered is always the next frame from the last
  // one rendered, or the first frame itself.
  renderFrame(context, frame) {
    var dims = frame.dims;

    if(!this.frameImageData || dims.width != this.frameImageData.width || dims.height != this.frameImageData.height){
      this.tempCanvas.width = dims.width;
      this.tempCanvas.height = dims.height;
      this.frameImageData = this.tempCtx.createImageData(dims.width, dims.height);
    }

    // set the patch data as override
    this.frameImageData.data.set(frame.patch);

    // draw the patch back over the canvas
    this.tempCtx.putImageData(this.frameImageData, 0, 0);

    context.drawImage(this.tempCanvas, dims.left, dims.top);
  }
}


class MoveGif {
  constructor(url, canvasId) {
    this.url = url;
    this.canvasId = canvasId;
  }

  // "https://s3-us-west-1.amazonaws.com/smash-move-viewer/fighters/szerosuit/game_view/AirCatch.gif"
  // loadGIF() {
  // 	var oReq = new XMLHttpRequest();
  // 	oReq.open("GET", url, true);
  // 	oReq.responseType = "arraybuffer";
  //
  // 	oReq.onload = function (oEvent) {
  // 	    var arrayBuffer = oReq.response; // Note: not oReq.responseText
  // 	    if (arrayBuffer) {
  // 	        gif = new GIF(arrayBuffer);
  // 	        var frames = gif.decompressFrames(true);
  // 	        console.log(gif);
  // 	        // render the gif
  // 	        renderGIF(frames);
  // 	    }
  // 	};
  //
  // 	oReq.send(null);
  // }
}

export default Move;
