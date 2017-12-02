import React, { Component } from 'react';
import ReactGA from 'react-ga';

import axios from 'axios';

import * as Common from './Common';
import * as Env from './Env';
import Player from './Player.js';
import MoveInfo from './MoveInfo.js';
import MovePicker from './MovePicker.js';

import './Move.css';

const gifStore = "https://s3-us-west-1.amazonaws.com/smash-move-viewer/fighters/";


ReactGA.initialize('UA-107697636-1');

// class ViewPicker extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {};
//     this.handleChange = this.handleChange.bind(this);
//   }
//
//   handleChange(e) {
//     this.props.onViewChange(e.target.value);
//   }
//
//   render() {
//     const currentView = this.props.view;
//
//     return(
//       <div className="Form-element View-picker">
//         <select onChange={this.handleChange} value={currentView} className="Dropdown">
//           <option value="">Select a view</option>
//           <option value="game_view">Game View</option>
//           <option value="top_view">Top-down View</option>
//           <option value="front_view">Front-on View</option>
//         </select>
//       </div>
//     );
//   }
// }

class FighterPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {options: []};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onFighterChange(e.target.value);
  }

  render() {
    const currentFighter = this.props.fighter;

    return(
      <div className="Form-element Fighter-picker">
        <select onChange={this.handleChange} value={currentFighter} className="Dropdown Main-dropdown">
          <option value="">Select a Character</option>
          {this.state.options}
        </select>
      </div>
    );
  }

  componentDidMount() {
    var _this = this;
    axios.get(this.props.url).then(function(response) {
      var json = response.data;  // JSON is auto parsed by axios
      var options = [];
      json.fighters.forEach(function(fighter) {
        options.push(<option key={fighter.key} value={fighter.key}>{fighter.name}</option>);
      });
      _this.setState({options: options});
    });
  }
}

class MoveOptions extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onShowAllChange(!e.target.checked);
  }

  render() {
    const showAllMoves = this.props.showAllMoves;

    return(
      // ShowUseful true means ShowAll is false
      <div className="Form-element">
        <input type="checkbox" id="chkShowUseful" onChange={this.handleChange}
         checked={!showAllMoves} />
        <label htmlFor="chkShowUseful">Relevant moves only</label>
      </div>
    );
  }
}

/*
 Central component of the app. This is the canonical state store for the app,
 and delegates to sub-components for other important things or state that won't
 be redistributed.

 The idea for this component is to let the user select a fighter/view/move and
 view the resulting animation.
*/
class Move extends Component {
  constructor(props) {
    super(props);

    var [view, fighter, move, speed, frame, frameEnd, showAllMoves] = Common.parsePath(
      this.props.location.pathname, this.props.location.search
    );
    // TODO: add frame box for specifying loop frame ranges

    this.state = {
      view: view,
      fighter: fighter,
      move: move,
      speed: speed,
      frameIndex: frame,
      frameEnd: frameEnd,
      moveData: null,
      showAllMoves: showAllMoves,
      loop: false
    };

    this.fighterSelected = this.fighterSelected.bind(this);
    this.moveSelected = this.moveSelected.bind(this);
    this.viewSelected = this.viewSelected.bind(this);
    this.frameChanged = this.frameChanged.bind(this);
    this.speedChanged = this.speedChanged.bind(this);
    this.showAllChanged = this.showAllChanged.bind(this);
    this.loopChanged = this.loopChanged.bind(this);
  }

  /* Callback handlers */
  fighterSelected(fighter) {
    ReactGA.event({
      category: 'Move',
      action: 'Fighter selected',
      label: fighter
    });

    this.setState(function(prevState, props) {
      prevState.fighter = fighter;
      prevState.move = '';
      prevState.frameIndex = 1;

      var [location, search] = Common.generateAppUrl({
        path: this.props.location.pathname,
        search: this.props.location.search,
        fighter: fighter,
        move: false  // special value, see function for details
      });
      this.props.history.push({
        pathname: location,
        search: search
      });
      return prevState;
    });
    // FIXME: we don't do this anymore to solve the "loading" bug more easily
    // where if you switch between characters from one that has an animation
    // to one who does not, it "loads" indefinitely.
    // If there was a move selected already, load the move data too
    //this.fetchMoveData(fighter, this.state.move);
  }
  moveSelected(move) {
    ReactGA.event({
      category: 'Move',
      action: 'Move selected',
      label: move
    });
    this.setState(function(prevState, props) {
      prevState.move = move;
      prevState.moveData = null;
      prevState.frameIndex = 1;

      var [location, search] = Common.generateAppUrl({
        path: this.props.location.pathname,
        search: this.props.location.search,
        move: move,
        frame: 1
      });
      this.props.history.push({
        pathname: location,
        search: search
      });
      return prevState;
    });
    this.fetchMoveData(this.state.fighter, move);
  }
  viewSelected(view) {
    ReactGA.event({
      category: 'Move',
      action: 'View selected',
      label: view
    });
    this.setState(function(prevState, props) {
      prevState.view = view;
      prevState.frameIndex = 1;

      var [location, search] = Common.generateAppUrl({
        path: this.props.location.pathname,
        search: this.props.location.search,
        view: view
      });
      this.props.history.push({
        pathname: location,
        search: search
      });
      return prevState;
    });
  }
  frameChanged(frame, updateUrl = false) {
    // Note that any frame coming from within will be 0-indexed
    if (updateUrl) {
      var [location, search] = Common.generateAppUrl({
        path: this.props.location.pathname,
        search: this.props.location.search,
        frame: frame + 1
      });
      this.props.history.push({
        pathname: location,
        search: search
      });
    }

    this.setState(function(prevState, props) {
      prevState.frameIndex = frame + 1;
      return prevState;
    });
  }
  speedChanged(speed) {
    // Speed is a string like '1x' or '0.25x'
    var [location, search] = Common.generateAppUrl({
      path: this.props.location.pathname,
      search: this.props.location.search,
      speed: speed
    });
    this.props.history.push({
      pathname: location,
      search: search
    });
    this.setState(function(prevState, props) {
      prevState.speed = speed;
      return prevState;
    });
  }
  showAllChanged(showAllMoves) {
    this.setState(function(prevState, props) {
      prevState.showAllMoves = showAllMoves;

      var [location, search] = Common.generateAppUrl({
        path: this.props.location.pathname,
        search: this.props.location.search,
        showAllMoves: showAllMoves
      });
      this.props.history.push({
        pathname: location,
        search: search
      });

      return prevState;
    });
  }
  loopChanged(loop) {
    this.setState(function(prevState, props) {
      prevState.loop = loop;
      return prevState;
    });
  }
  /* End callback handlers */

  /* Data management */
  /* Gets the avaialble information about a move for a given fighter */
  fetchMoveData(fighter, move) {
    if (!move || !fighter) {
      return;
    }

    // FIXME: there is a problem where the test server is watching the directory
    // we get this from and it updates something enough to make it reload the page.
    var url = this.makeMoveDataUrl(fighter, move);

    var _this = this;
    axios.get(url).then(function(response) {
      var json = response.data;  // JSON is auto parsed by axios
      _this.setState(function(prevState, props) {
        prevState.moveData = json;
        return prevState;
      });
    }).catch(function (error) {
      console.log(error);
    });
  }

  /* Gets the list of moves for a character */
  makeMoveIndexUrl(fighter) {
    if (!fighter) {
      return '';
    }
    return process.env.PUBLIC_URL + "/fighters/" + fighter + ".json";
  }

  /* Gets move info to be displayed about the move */
  makeMoveDataUrl(fighter, move) {
    if (!fighter || !move) {
      return '';
    }
    return process.env.PUBLIC_URL + "/fighters/" + fighter + "/" + move + ".json";
  }

  /* Gets the list of all fighters */
  makeFighterIndexUrl() {
    return process.env.PUBLIC_URL + "/fighters/index.json";
  }

  /* Gets gif url to display move */
  makeGifUrl(fighter, move, view) {
    if (!fighter || !move) {
      return '';
    }
    return gifStore + fighter + "/videos/" + view + "/" + move + ".mp4?" + Env.VIDEO_VERSION;
  }
  /* End data management */

  componentWillMount() {
    // Handle the edge case where on first-load there is a move selected
    this.fetchMoveData(this.state.fighter, this.state.move);
  }

  render() {
    const fighterIndexUrl = this.makeFighterIndexUrl();
    const view = this.state.view;
    const fighter = this.state.fighter;
    const move = this.state.move;
    const speed = this.state.speed;
    const loop = this.state.loop;
    const frameIndex = this.state.frameIndex;
    const showAllMoves = this.state.showAllMoves;

    // TODO: this should be usable to make ranges of frames to play through, eventually
    //const frameEnd = this.state.frameEnd;

    const moveIndexUrl = this.makeMoveIndexUrl(fighter);
    const gifUrl = this.makeGifUrl(fighter, move, view);

    const moveData = this.state.moveData;
    const numFrames = this.state.moveData ? this.state.moveData.frames.length : 1;

    return(
      <div className="Move" style={{display: 'inline-block'}}>
        {/*<ViewPicker view={view} onViewChange={this.viewSelected}/>*/}
        <MoveOptions onShowAllChange={this.showAllChanged} showAllMoves={showAllMoves} />
        <FighterPicker fighter={fighter} url={fighterIndexUrl} onFighterChange={this.fighterSelected}/>
        <MovePicker move={move} url={moveIndexUrl} onMoveChange={this.moveSelected}
         showAllMoves={showAllMoves}/>
        <Player url={gifUrl}
                playbackSpeed={speed}
                frameIndex={frameIndex - 1}
                numFrames={numFrames}
                loop={loop}
                onFrameChange={this.frameChanged}
                onSpeedChange={this.speedChanged}
                onLoopChange={this.loopChanged}/>
        <MoveInfo frameIndex={frameIndex - 1} moveData={moveData}/>
      </div>
    );
  }
}

export default Move;
