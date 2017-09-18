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

    // Required for drawing temporary updates
    this.tempCanvas = document.createElement('canvas');
    this.tempCtx = this.tempCanvas.getContext('2d');
    this.frameImageData = null;
    
    this.loadGIF();
  }

  componentDidMount() {
    // 1fps frame updates
    this.timerID = setInterval(
      () => this.tick(),
      100
    );
  }
  componentWillUnmount() {
    clearInterval(this.timerID);
  }
  tick() {
    var newState = this.state;
    newState.frameIndex = newState.frameIndex + 1;
    if (newState.frameIndex >= newState.frames.length) {
      newState.frameIndex = 0;
    }
    this.setState(newState);

    var context = this.refs.canvas.getContext('2d');
    this.renderFrame(context);
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

            console.log(_this.state);
  	    } else {
          console.error('Could not load gif');
        }
  	};

  	oReq.send(null);
  }

  renderFrame(context) {
    var frame = this.state.frames[this.state.frameIndex];
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
