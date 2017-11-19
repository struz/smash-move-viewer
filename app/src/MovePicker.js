import React, { Component } from 'react';

import axios from 'axios';

// Order of regexes in this list is the order that moves will be placed
// into the move move picker
const RELEVANT_MOVE_REGEXES = {
  'Ground Attacks': [/^Attack(?!Air).*$/],
  'Aerial Attacks': [
    /^AttackAir.*$/,
    /^LandingAttackAir.*$/
  ],
  'Specials': [/^Special.*$/],
  'Grabs and Throws': [
    /^Catch.*$/,
    /^Throw.*$/
  ],
  'Dodging': [/^Escape.*$/],
  'Tech Options': [/^Passive.*$/],
  'Ledge Options': [/^Cliff.*$/]
}

const OTHER_MOVE_REGEXES = {
  'Crouching': [/^Squat.*$/],
  'Standing and Walking': [
    /^Wait.*$/,
    /^Walk.*$/
  ],
  'Dashing and Running': [
    /^Dash.*$/,
    /^Run.*$/,
    /^Turn.*$/
  ],
  'Jumping': [/^Jump.*$/],
  'Footstools': [/^Step.*$/],
  'Falling': [/^(Damage)?Fall.*$/],
  'Landing': [
    /^Landing.*$/,  // Won't get landing aerials because we match them earlier
    /^DownBound.*$/
  ],
  'Missed Tech Options': [
    /^Down(?!Damage|Spot).*$/
  ],
  'Floor Damage Received': [/^DownDamage.*$/],
  'Slipping': [/^Slip.*$/],
  'Grabbed': [/^Capture.*$/],
  'Misc Grounded Animations': [/^.*$/]
}


class MovePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: []
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onMoveChange(e.target.value);
  }

  render() {
    const options = this.state.options;
    const disabled = !this.props.url;
    const defaultOptionDisabled = this.state.options.length > 0;
    const currentMove = this.props.move;

    return(
      <div className="Form-element Move-picker">
        <select onChange={this.handleChange} value={currentMove} className="Dropdown Main-dropdown" disabled={disabled}>
          <option value="" disabled={defaultOptionDisabled}>Select a Move</option>
          {options}
        </select>
      </div>
    );
  }

  componentDidMount() {
    this.updateOptions(this.props.url, this.props.showAllMoves);
  }

  componentWillReceiveProps(nextProps) {
    // Reload the json only if they selected a new option and not the same one again
    if (this.props.url !== nextProps.url ||
       this.props.showAllMoves !== nextProps.showAllMoves) {
      this.updateOptions(nextProps.url, nextProps.showAllMoves);
    }
    // this.setState(function(prevState, props) {
    //   prevState.showAllMoves = nextProps.showAllMoves;
    //   return prevState;
    // });
  }

  updateOptions(url, showAllMoves) {
    if (!url) {
      return;
    }

    var _this = this;
    axios.get(url).then(function(response) {
      var json = response.data;  // JSON is auto parsed by axios
      var options = [];

      // To give them all unique keys
      var headerKeyIndex = 0;
      headerKeyIndex = processHeaderRegexes(RELEVANT_MOVE_REGEXES, headerKeyIndex, options, json.moves);

      if (showAllMoves) {
        processHeaderRegexes(OTHER_MOVE_REGEXES, headerKeyIndex, options, json.moves);
      }

      _this.setState({options: options});
    });
  }
}

function processHeaderRegexes(headerRegexDict, headerKeyIndex, options, moves) {
  Object.keys(headerRegexDict).forEach(function(key) {
    var regexList = headerRegexDict[key];


    options.push(makeHeaderOption('----- ' + key + ' -----', headerKeyIndex));
    headerKeyIndex++;
    regexList.forEach(function(regex) {
      extractMoves(options, moves, regex);
    });
  });
  return headerKeyIndex;
}

function makeHeaderOption(text, key) {
  return <option key={"header-" + key} value='' disabled>{text}</option>;
}

function moveToOption(move) {
  return <option key={move.rawName} value={move.rawName}>{move.prettyName}</option>;
}

function extractMoves(optionsList, moveList, regex) {
  // FIXME: This is obscenely ugly
  var moveListLength = moveList.length;
  var i = 0;
  while (i < moveList.length) {
    if (moveList[i].rawName.search(regex) > -1) {
      optionsList.push(moveToOption(moveList[i]));
      moveList.splice(i, 1);
      moveListLength--;
      continue;
    }
    i++;
  }
}

export default MovePicker;
