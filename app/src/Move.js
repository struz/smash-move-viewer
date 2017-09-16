import React, { Component } from 'react';
import './App.css';

var gifuct = require("./gifuct.js")

class Move extends Component {
  constructor(props) {
    super(props);
    this.loadGIF();
  }

  componentDidMount() {
    this.updateCanvas();
  }
  updateCanvas() {
    const ctx = this.refs.canvas.getContext('2d');
    ctx.fillRect(0,0, 100, 100);
  }

  render() {
    return (
      <div className="Move">
        <canvas ref="canvas" width={300} height={300} className="Move-anim"/>
      </div>
    );
  }

  loadGIF() {
  	var oReq = new XMLHttpRequest();
  	oReq.open("GET", this.props.url, true);
  	oReq.responseType = "arraybuffer";

  	oReq.onload = function (oEvent) {
  	    var arrayBuffer = oReq.response; // Note: not oReq.responseText
  	    if (arrayBuffer) {
  	        this.gif = new gifuct.GIF(arrayBuffer);
  	        var frames = this.gif.decompressFrames(true);
  	        console.log(this.gif);
  	    }
  	};

  	oReq.send(null);
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

function renderFrame(canvasId, frames) {

}

export default Move;
