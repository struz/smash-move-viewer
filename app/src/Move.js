import React, { Component } from 'react';
import ReactGA from 'react-ga';

import axios from 'axios';
import _ from 'lodash';

import * as Common from './Common';
import Player from './Player.js';
import MoveInfo from './MoveInfo.js';

import './Move.css';

// General icons
import cross from './img/icons/272-cross.svg';

const gifStore = "https://s3-us-west-1.amazonaws.com/smash-move-viewer/fighters/";


ReactGA.initialize('UA-107697636-1');

class GifSizeCheckbox extends Component {
  constructor(props) {
    super(props);
    this.state = {id: null};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onGifSizeChange(e.target.checked);
  }

  componentWillMount() {
    const id = _.uniqueId("gsc-");
    this.setState({id: id});
  }

  render() {
    return(
      <div className="Form-element GifSizeCheckbox">
        <input type="checkbox" id={this.state.id} checked={this.props.checked} onChange={this.handleChange}/>
        <label htmlFor={this.state.id}>Smaller viewport (loads faster)</label>
      </div>
    );
  }
}

class ViewPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onViewChange(e.target.value);
  }

  render() {
    const currentView = this.props.view;

    return(
      <div className="Form-element View-picker">
        <select onChange={this.handleChange} value={currentView} className="Dropdown">
          <option value="">Select a view</option>
          <option value="game_view">Game View</option>
          <option value="top_view">Top-down View</option>
          <option value="front_view">Front-on View</option>
        </select>
      </div>
    );
  }
}

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
        <select onChange={this.handleChange} value={currentFighter} className="Dropdown">
          <option value="">Character</option>
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

class MovePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {options: []};

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onMoveChange(e.target.value);
  }

  render() {
    const options = this.state.options;
    const disabled = !this.props.url;
    const currentMove = this.props.move;

    return(
      <div className="Form-element Move-picker">
        <select onChange={this.handleChange} value={currentMove} className="Dropdown" disabled={disabled}>
          <option value="">Move</option>
          {options}
        </select>
      </div>
    );
  }

  componentDidMount() {
    this.updateOptions(this.props.url);
  }

  componentWillReceiveProps(nextProps) {
    // Reload the json only if they selected a new option and not the same one again
    if (this.props.url !== nextProps.url) {
      this.updateOptions(nextProps.url);
    }
  }

  updateOptions(url) {
    if (!url) {
      return;
    }

    var _this = this;
    axios.get(url).then(function(response) {
      var json = response.data;  // JSON is auto parsed by axios
      var options = [];
      json.moves.forEach(function(move) {
        options.push(<option key={move} value={move}>{move}</option>);
      });
      _this.setState({options: options});
    });
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

    var [view, fighter, move, fps, frame, frameEnd, small] = Common.parsePath(
      this.props.location.pathname, this.props.location.search
    );
    // TODO: hookup fps onwards -->
    // TODO: make all the select boxes auto populated, even if the move list json hasn't been loaded yet
    // TODO: make the move info appear when parsing from a URL
    // TODO: make the URL update as you move through the site, or alternatively have a box that provides the copy/paste URL
    // TODO: add frame box for specifying loop frame ranges

    this.state = {
      view: view,
      fighter: fighter,
      move: move,
      fps: fps,
      frameIndex: frame,
      frameEnd: frameEnd,
      small: small,
      moveData: null
    };

    this.fighterSelected = this.fighterSelected.bind(this);
    this.moveSelected = this.moveSelected.bind(this);
    this.viewSelected = this.viewSelected.bind(this);
    this.gifSizeChanged = this.gifSizeChanged.bind(this);
    this.frameChanged = this.frameChanged.bind(this);
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
      prevState.frameIndex = 0;

      var [location, search] = Common.generateAppUrl({
        path: this.props.location.pathname,
        search: this.props.location.search,
        fighter: fighter
      });
      this.props.history.push({
        pathname: location,
        search: search
      });
      return prevState;
    });
    this.fetchFighterMoveData(fighter);
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
      prevState.frameIndex = 0;

      var [location, search] = Common.generateAppUrl({
        path: this.props.location.pathname,
        search: this.props.location.search,
        move: move
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
      prevState.frameIndex = 0;

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
  gifSizeChanged(small) {
    ReactGA.event({
      category: 'Move',
      action: 'Toggle GIF size',
      label: '' + small
    });
    this.setState(function(prevState, props) {
      prevState.small = small;
      prevState.frameIndex = 0;

      var [location, search] = Common.generateAppUrl({
        path: this.props.location.pathname,
        search: this.props.location.search,
        small: small
      });
      this.props.history.push({
        pathname: location,
        search: search
      });
      return prevState;
    });
  }
  frameChanged(frame) {
    // We deliberately do not update the URL for this because it would be spammy
    this.setState(function(prevState, props) {
      prevState.frameIndex = frame;
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
  makeGifUrl(fighter, move, view, size) {
    if (!fighter || !move) {
      return '';
    }
    return gifStore + fighter + "/" + size + "/" + view + "/" + move + ".gif";
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
    const fps = this.state.fps;
    const frameIndex = this.state.frameIndex;
    const frameEnd = this.state.frameEnd;
    const size = this.state.small ? 'small' : 'large';

    const moveIndexUrl = this.makeMoveIndexUrl(fighter);
    const gifUrl = this.makeGifUrl(fighter, move, view, size);

    const moveData = this.state.moveData;

    return(
      <div className="Move" style={{display: 'inline-block'}}>
        <ViewPicker view={view} onViewChange={this.viewSelected}/>
        <GifSizeCheckbox onGifSizeChange={this.gifSizeChanged} checked={this.state.small}/>
        <FighterPicker fighter={fighter} url={fighterIndexUrl} onFighterChange={this.fighterSelected}/>
        <MovePicker move={move} url={moveIndexUrl} onMoveChange={this.moveSelected}/>
        <Player url={gifUrl}
                fps={fps}
                frameIndex={frameIndex}
                small={this.state.small}
                onFrameChange={this.frameChanged}/>
        <MoveInfo frameIndex={frameIndex} moveData={moveData}/>
      </div>
    );
  }
}

export default Move;
