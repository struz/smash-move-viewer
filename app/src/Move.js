import React, { Component } from 'react';
import ReactGA from 'react-ga';

import axios from 'axios';

import * as Common from './Common';
import * as Env from './Env';
import Player from './Player.js';
import MoveInfo from './MoveInfo.js';
import MovePicker from './MovePicker.js';

import './Move.css';

const GIF_STORE_PREFIX = "https://s3-us-west-1.amazonaws.com/smash-move-viewer/fighters/";
const KH_URL_PREFIX = "http://kuroganehammer.com/Smash4/"


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
    var fighterName = e.nativeEvent.target[e.target.selectedIndex].text;
    this.props.onFighterChange(e.target.value, fighterName);
  }

  render() {
    const currentFighter = this.props.fighter;

    return(
      <div className="Form-element Fighter-picker">
        <select onChange={this.handleChange} value={currentFighter}
         className="Dropdown Main-dropdown"
         title="Pick the character you want to view">
          <option value="">Select a Character</option>
          {this.state.options}
        </select>
      </div>
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.fighterIndexData !== this.props.fighterIndexData) {
      var options = [];
      nextProps.fighterIndexData.fighters.forEach(function(fighter) {
        if (!(fighter.hasOwnProperty('secret') && fighter.secret)) {
          let disabled = fighter.hasOwnProperty('disabled') && fighter.disabled;
          let name = disabled ? fighter.name + ' [Coming Soon]' : fighter.name;
          options.push(
            <option key={fighter.key} value={fighter.key} disabled={disabled}>
              {name}
            </option>
          );
        }
      });
      this.setState({options: options});
    }
  }
}

class MoveOptions extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onShowAllChange(e.target.value === "allmoves");
  }

  render() {
    const showAllMoves = this.props.showAllMoves;
    const commonlyViewedTooltip = "Select to limit move selector to the most commonly viewed moves for a character";
    const allTooltip = "Select to view every move for a character";

    return(
      // ShowUseful true means ShowAll is false
      <div className="Form-element">
        <div className="Radio-buttons">
          <label htmlFor="radioShowUseful2" title={allTooltip}>
            <input type="radio" name="radioShowUseful" id="radioShowUseful2"
             value="allmoves" checked={showAllMoves} title={allTooltip}
             onChange={this.handleChange}/>
            All moves
          </label>
        </div>
        <div className="Radio-buttons">
          <label htmlFor="radioShowUseful1" title={commonlyViewedTooltip}>
            <input type="radio" name="radioShowUseful" id="radioShowUseful1"
             value="commonmoves" checked={!showAllMoves} title={commonlyViewedTooltip}
             onChange={this.handleChange}/>
            Commonly viewed moves
          </label>
        </div>
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
      loop: true,
      sendPause: false
    };

    this.fighterSelected = this.fighterSelected.bind(this);
    this.moveSelected = this.moveSelected.bind(this);
    this.viewSelected = this.viewSelected.bind(this);
    this.frameChanged = this.frameChanged.bind(this);
    this.speedChanged = this.speedChanged.bind(this);
    this.showAllChanged = this.showAllChanged.bind(this);
    this.loopChanged = this.loopChanged.bind(this);
    this.playPause = this.playPause.bind(this);

    this.props.onMoveUpdated(this.props.location.pathname, this.props.location.search);
  }

  /* Callback handlers */
  fighterSelected(fighter, fighterName) {
    ReactGA.event({
      category: 'Move',
      action: 'Fighter selected',
      label: fighter
    });

    this.setState(function(prevState, props) {
      prevState.fighter = fighter;
      prevState.move = '';
      prevState.frameIndex = 1;
      prevState.khUrl = KH_URL_PREFIX + fighterName;

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
      this.props.onMoveUpdated(location, search);
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
      // We don't set move data to null so that we don't un-render the move data pane
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
      this.props.onMoveUpdated(location, search);
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
      this.props.onMoveUpdated(location, search);
      return prevState;
    });
  }
  frameChanged(frame, updateUrl = false, pauseVideo = false) {
    // Note that any frame coming from within will be 0-indexed
    this.setState(function(prevState, props) {
      prevState.frameIndex = frame + 1;
      if (pauseVideo) {
        prevState.sendPause = true;
      }
      return prevState;
    });
  }
  speedChanged(speed) {
    // Speed is a string like '1x' or '0.25x'
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
      this.props.onMoveUpdated(location, search);

      return prevState;
    });
  }
  loopChanged(loop) {
    this.setState(function(prevState, props) {
      prevState.loop = loop;
      return prevState;
    });
  }
  playPause() {
    this.setState(function(prevState, props) {
      prevState.sendPause = false;
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
    return GIF_STORE_PREFIX + fighter + "/videos/" + view + "/" + move + ".mp4?" + Env.VIDEO_VERSION;
  }
  /* End data management */

  componentWillMount() {
    // One time get and store fighter index data
    var _this = this;
    axios.get(this.makeFighterIndexUrl()).then(function(response) {
      var json = response.data;  // JSON is auto parsed by axios
      _this.setState(function(prevState, props) {
        prevState.fighterIndexData = json;
        if (_this.state.fighter) {
          prevState.khUrl = KH_URL_PREFIX + json.fighters.find(function(element) {
            return element.key === _this.state.fighter;
          }).name;
        }
        return prevState;
      });
    });

    // Handle the edge case where on first-load there is a move/fighter selected
    this.fetchMoveData(this.state.fighter, this.state.move);
  }

  render() {
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
        <FighterPicker fighter={fighter} fighterIndexData={this.state.fighterIndexData}
          onFighterChange={this.fighterSelected}/>
        <MovePicker move={move} url={moveIndexUrl} onMoveChange={this.moveSelected}
          showAllMoves={showAllMoves}/>
        <Player url={gifUrl}
                playbackSpeed={speed}
                frameIndex={frameIndex - 1}
                numFrames={numFrames}
                loop={loop}
                sendPause={this.state.sendPause}
                onPlayPause={this.playPause}
                onFrameChange={this.frameChanged}
                onSpeedChange={this.speedChanged}
                onLoopChange={this.loopChanged}
                // Below is just for analytics
                fighter={fighter} move={move}
                // Just for sharing
                showAllMoves={showAllMoves}/>
        <MoveInfo frameIndex={frameIndex - 1} moveData={moveData}
          onFrameChange={this.frameChanged} khUrl={this.state.khUrl} />
      </div>
    );
  }
}

export default Move;
