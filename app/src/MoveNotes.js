import React, { Component } from 'react';
import axios from 'axios';


/* MoveNotes component
   - loads the note JSON relevant to this fighter/move combo
   - displays the notes in a nice format
   - render only updates if a new fighter or move are provided
*/
class MoveNotes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      moveNotes: [],
      fighterMoveNotes: [],
      fighterNotes: [],
    };
    this.moveNoteData = null;
    this.fighterNoteData = null;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.move !== nextProps.move) {
      return true;
    }
    if (this.props.fighter !== nextProps.fighter) {
      return true;
    }
    if ((this.state.moveNotes !== nextState.moveNotes) ||
        (this.state.fighterMoveNotes !== nextState.fighterMoveNotes) ||
        (this.state.fighterNotes !== nextState.fighterNotes)) {
      return true;
    }
    return false;
  }

  componentDidMount() {
    // Do this once and once only
    var url = process.env.PUBLIC_URL + "/notes/moves.json";
    var _this = this;
    axios.get(url).then(function(response) {
      _this.moveNoteData = response.data;
      _this.updateMoveNotes(_this.props.move);
    });
    this.downloadFighterData(this.props.fighter);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.fighter !== this.props.fighter) {
      this.downloadFighterData(nextProps.fighter);
      this.updateFighterMoveNotes(nextProps.fighter, this.props.move);
    }
    if (nextProps.move !== this.props.move) {
      this.updateMoveNotes(nextProps.move);
      this.updateFighterMoveNotes(nextProps.fighter, nextProps.move);
    }
  }

  updateMoveNotes(move) {
    // General move notes shared across fighters
    if (!move || !this.moveNoteData) {
      return;
    }
    var moveNotes = [];
    Object.entries(this.moveNoteData.moves).forEach(([key, value]) => {
      let regex = new RegExp(key);
      if ((move.search(regex) > -1)) {
        moveNotes.push(<p className="Note" key={value}>{value}</p>);
      }
    });
    this.setState(function(prevState, props) {
      prevState.moveNotes = moveNotes;
      return prevState;
    });
  }

  updateFighterMoveNotes(fighter, move) {
    // Fighter specific move notes
    console.log(this.fighterNoteData);
    console.log(this.fighter);
    console.log(this.move);
    console.log('===');
    if (!fighter || !this.fighterNoteData || !move) {
      return;
    }
    console.log('updating moves for ' + fighter + ' ' + move);
    var fighterMoveNotes = [];
    Object.entries(this.fighterNoteData.moves).forEach(([key, value]) => {
      let regex = new RegExp(key);
      if ((move.search(regex) > -1)) {
        fighterMoveNotes.push(<p className="Note" key={value}>{value}</p>);
      }
    });
    this.setState(function(prevState, props) {
      prevState.fighterMoveNotes = fighterMoveNotes;
      return prevState;
    });
  }

  updateFighterNotes(fighter) {
    // Fighter specific notes
    if (!fighter || !this.fighterNoteData) {
      return;
    }
    var fighterNotes = [];
    Object.entries(this.fighterNoteData.notes).forEach(([key, value]) => {
      fighterNotes.push(<p className="Note" key={value}>{value}</p>);
    });
    this.setState(function(prevState, props) {
      prevState.fighterNotes = fighterNotes;
      return prevState;
    });
  }

  downloadFighterData(fighter) {
    if (!fighter) {
      return;
    }
    var url = process.env.PUBLIC_URL + "/notes/" + fighter + ".json";
    var _this = this;
    axios.get(url).catch(function (error) {
      // No notes file exists for character
    }).then(function(response) {
      _this.fighterNoteData = response.data;
      _this.updateFighterMoveNotes(fighter, _this.props.move);
      _this.updateFighterNotes(fighter);
    });
  }

  render() {
    if (!this.state.moveNotes.length && !this.state.fighterMoveNotes.length && !this.state.fighterNotes.length)
      return <div className="Notes-container"></div>;

    return (
      <div className="Notes-container">
        <hr/>
        <span className="Bold-label">Move Notes</span>
        {this.state.moveNotes.map((note, index) => {
          return note;
        })}
        {this.state.fighterMoveNotes.map((note, index) => {
          return note;
        })}
      </div>
    );
  }
}

export default MoveNotes;
