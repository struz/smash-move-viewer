import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';

import './Move.css';
import './MoveInfo.css';

const hitboxIdColors = [
  '#E6194B',
  '#3CB44B',
  '#000080',
  '#0082C8',
  '#F58231',
  '#911EB4',
  '#46F0F0',
  '#D2F53C',
  '#008080',
  '#AA6E28'
]

// Hitbox types, matches Smash-Forge types
const HITBOX_TYPE = {
  0: {name: 'Hitbox', tooltip: 'Damage hitbox<br />When this collides with a hurtbox a special effect may happen based on the "effect" type of the hitbox.<br />The victim will have their % increased by it\'s "damage"'},
  1: {name: 'Grabbox', tooltip: 'Grab hitbox<br />When this collides with a hurtbox the victim will be grabbed, allowing them to be thrown soon afterwards'},
  2: {name: 'Windbox', tooltip: 'Wind hitbox<br />When this collides with a hurtbox the victim will be pushed away based on the "angle" and other knockback properties of the hitbox'},
  3: {name: 'Searchbox', tooltip: 'Searchbox<br />Depending on the character scripts this can do many different things.<br />Generally it will search for hitboxes or hurtboxes and perform an action if any are found'}
}

// Effect types, see https://docs.google.com/spreadsheets/d/1FgOsGYfTD4nQo4jFGJ22nz5baU1xihT5lreNinY5nNQ
const EFFECT_TYPE = {
  0: {name: 'Normal', tooltip: 'Regular move'},
  1: {name: 'Detect', tooltip: 'Detect hurtbox and transit to next action'},
  2: {name: 'Slash', tooltip: '?'},
  3: {name: 'Electric', tooltip: 'Causes 1.5x hitlag<br />Gives +1frame hitstun<br />Untechable with grounded meteor (due to hitlag multiplier)<br />Deals no damage to yellow pikmin'},
  4: {name: 'Freezing', tooltip: 'Puts opponents to "freezing" state when deals more than 52.5 KB<br />Freeze time = (12 * damage)'},
  5: {name: 'Flame', tooltip: 'Thaws out frozen character<br />Deals no damage to red pikmin'},
  6: {name: 'Coin', tooltip: '?'},
  7: {name: 'Reverse', tooltip: 'Puts opponent to reversed state for 25 frames<br />Opponent gets super armor for 8 frames<br />Boosts momentum to airborne opponents'},
  8: {name: 'Slip', tooltip: 'Puts grounded opponent to "tripping" state<br />Moves that deal 0 damage cause soft trip<br />Can\'t suffer another trip for 60 frames after tripping'},
  9: {name: 'Sleep', tooltip: 'Puts opponents to "sleep" state<br />Sleep time = (10 + (10 * 6) + (25 * KB) + (1 * Opponent\'s % after hit))'},
  10: {name: 'Unused', tooltip: 'Unused'},
  11: {name: 'Bury', tooltip: 'Puts grounded opponents to "buried" state<br />Bury time = (10 + (15 * 3) + (1.5 * KB) + (0.5 * Opponent\'s % after hit))'},
  12: {name: 'Stun', tooltip: 'Puts opponents to "stun" state<br />Does no KB/hitlag for certain frames after "stun" and "disable" state<br />Stun time = (76 + (15 * 3) + (1 * KB))'},
  13: {name: 'Unused', tooltip: 'Unused'},
  14: {name: 'Flower', tooltip: 'Puts opponents to "flower" state'},
  15: {name: 'Unused', tooltip: 'Unused'},
  16: {name: 'Death', tooltip: 'Puts opponents to KO\'d state'},
  17: {name: 'Unused', tooltip: 'Unused'},
  18: {name: 'Water', tooltip: 'Deals no damage to blue pikmin'},
  19: {name: 'Darkness', tooltip: '?'},
  20: {name: 'Paralyze', tooltip: 'Puts opponents to "paralyzing" state<br />No hitlag<br />Ignores opponent\'s weight, set it to 100 instead<br />Paralyze time = ((((Damage * 0.3846154 + 14) * HitlagMult.) * CrouchingMult. * 0.025) * KB)'},
  21: {name: 'Aura', tooltip: '?'},
  22: {name: 'Plunge', tooltip: 'Puts opponent to "burying" state (always)'},
  23: {name: 'Down', tooltip: 'Puts opponents to lying down on their back'},
  24: {name: 'Adhesion', tooltip: 'e.g. Crash bomb (Megaman)'},
  25: {name: 'Stab', tooltip: 'Cosmetic Slash variant, no known effects'},
  26: {name: 'Magic', tooltip: '?'},
  27: {name: 'Flinchless1', tooltip: 'No hitlag, no knockback'},
  28: {name: 'Flinchless2', tooltip: 'No hitlag, no knockback'},
  29: {name: 'Solar', tooltip: 'Sun Salutation (Wii Fit Trainer)'},
  30: {name: 'Crumple', tooltip: 'Puts opponents to lying down on their front<br />Doesn\'t occur on uncharged Focus Attack despite element being present on the hitbox'},
  31: {name: 'Disable', tooltip: 'Puts opponents to "disable" state<br />Does no KB/hitlag for certain frames after "stun" and "disable" state<br />Disable time = ((1 * KB) + (1.1 * Opponent\'s % after hit))'},
  32: {name: 'Pin', tooltip: 'Puts opponents to "pinned" state'},
  33: {name: 'Unused', tooltip: 'Unused'},
  34: {name: 'Unused', tooltip: 'Unused'},
  35: {name: 'Unused', tooltip: 'Unused'},
  36: {name: 'Bullet Arts', tooltip: 'Bayonetta specific'},
  37: {name: 'Unused', tooltip: 'Unused'},
}

// See: https://docs.google.com/spreadsheets/d/1FgOsGYfTD4nQo4jFGJ22nz5baU1xihT5lreNinY5nNQ
const FACING_RESTRICTION = {
  0: {name: 'Same direction attacker is facing', tooltip: 'Same direction attacker is facing'},
  1: {name: 'Opposite direction attacker is facing', tooltip: 'Opposite direction attacker is facing'},
  2: {name: 'Same direction victim is facing', tooltip: 'Same direction victim is facing'},
  3: {name: 'Opposite direction attacker is facing', tooltip: 'Opposite direction attacker is facing'},
  4: {name: 'Same direction attacker is facing', tooltip: 'Same direction attacker is facing'},
  5: {name: 'Centre of hitbox', tooltip: 'Centre of hitbox'},
  6: {name: 'Same direction attacker is facing', tooltip: 'Same direction attacker is facing, but shield pushback is opposite direction to usual'},
  7: {name: 'Left', tooltip: 'Unused'},
  8: {name: 'Right', tooltip: 'Unused'},
  9: {name: 'Front', tooltip: 'Unused'},
}

const TOOLTIPS = {
  faf: 'First Active Frame<br />The first frame on which this animation can be interrupted by another action or input',
  intFrames: 'Intangible frames<br />The range(s) of frames in this move in which all character hurtboxes are disabled',
  hitActive: 'Hitbox active frames<br />The range(s) of frames in this move which have an active hitbox',

  // Table stuff
  props: 'Properties<br />B: Hitbox is ~not~ blockable<br />Rf: Hitbox is reflectable<br />A: Hitbox is absorbable<br />C: Hitbox ~does not~ clang<br/>Rb: Hitbox ~does not~ rebound<br />F: Hitbox is flinchless<br />H: Hitbox has hitlag disabled',
  groundAir: 'Ground/Air<br />Which types of opponent this hitbox can hit',
  direct: 'Direct<br />If "Yes" then the hitbox will put the attacker in hitlag.<br />If "No" then the hitbox will usually not put the attacker in hitlag',
  direction: 'Facing direction<br />Determines which way the hitbox will send the victim.<br />Directions are reversed if the victim\'s TransN bone has passed the attacker\'s TransN bone when the hit registers.<br />Mouse over the individual value for more info',
  hitlag: 'Hitlag modifier<br />Multiplier on how many frames your character will freeze after connecting with this hitbox.<br />>1 means more than usual, <1 means less than usual',
  sdi: 'SDI modifier<br />Multiplier on how far each SDI input will move the victim.<br />>1 means more distance than usual, <1 means less distance than usual',
  trip: 'Tripping chance<br />Percentage chance the hitbox will trip an opponent.<br />Can be negative for some unknown reason',
  rehit: 'Rehit rate<br />If 0 the hitbox does not rehit. If >0 then the hitbox can hit an opponent again after the specified number of frames',
  collateral: 'Throw collateral<br />If "yes" then the hitbox cannot hit the currently grabbed opponent',
  effect: 'Hitbox effect<br />Different effects make hitboxes act differently.<br />Mouse over the effect names to find out more about the specific effect',
  wbkb: 'Weight based knockback<br />If the value is >0 then this hitbox has set knockback based on the weight of the victim',
  bkb: 'Base knockback<br />The base knockback of the hitbox.<br />This is multiplied with other factors like damage, kbg, rage, and victim % to produce the in-game knockback received by the victim',
  kbg: 'Knockback growth<br />The knockback growth of the hitbox.<br />The higher this value is the more the victim\'s % will affect the in-game knockback received by the victim',
  angle: 'Angle<br />The angle at which the opponent will be knocked away by the hitbox.<br />See "Hit direction" column for other factors that affect this',
  damage: 'Damage<br />The amount of % that will be added to the victim\'s total %.<br />In general, higher damage hitboxes will produce more in-game knockback to the victim.<br />Any number shown in brackets is the amount of damage done when the move hits a shield instead of a hurtbox.',
  type: 'Hitbox type<br />The type of hitbox. One of: Hitbox, Grabbox, Windbox, Searchbox.<br />Mouse over the individual type for more info',
  id: 'Hitbox ID<br />The ID of the hitbox. Hitboxes with lower IDs take precedence when calculating which hitbox has hit.<br />Usually only one hitbox from a move can hit the victim in a single frame',
  color: 'Hitbox color<br />The color of the hitbox in the visualization.<br />If you cannot see this colour it is likely hidden behind another hitbox with a lower ID number'
}

// TODO: make a concrete class to use, that parses the JSON rather than just
// assuming the files are in the right format.

class MoveInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {moveData: this.props.moveData};
  }

  componentWillReceiveProps(nextProps) {
    // Reload the json only if the url has changed
    if (this.props.moveData !== nextProps.moveData) {
      this.setState({moveData: nextProps.moveData});
    }
  }

  getIntangibilityRange() {
    if (this.state.moveData.intangibilityStart === 0 ||
        this.state.moveData.intangibilityEnd < this.state.moveData.intangibilityStart) {
      return 'N/A'
    }
    // Intangibility end is the *frame on which* the intangibility ends i.e. the frame
    // that you are once again vulnerable so we subtract one to make more sense
    return '' + this.state.moveData.intangibilityStart + '-' + (this.state.moveData.intangibilityEnd - 1);
  }

  getHitboxRanges() {
    var rangeString = [];

    var currentFrameStart = -1;
    for (var i = 0; i < this.state.moveData.frames.length; i++) {
      if (this.state.moveData.frames[i].hitboxes.length) {
        if (currentFrameStart < 0) {
          currentFrameStart = i;
        }
      } else if (currentFrameStart >= 0) {
        // If we have a range in flight, this is the end of it
        if (i - currentFrameStart < 2) {
          // 1 frame range
          rangeString.push('' + (currentFrameStart + 1));
        } else {
          // 2+ frame range
          rangeString.push('' + (currentFrameStart + 1) + '-' + i);
        }
        currentFrameStart = -1;
      }
    }

    if (!rangeString.length) {
      return '';
    }
    return rangeString.reduce(function(pre, next) {
      return pre + ', ' + next;
    });
  }

  render() {
    if (!this.state.moveData) {
      return(
        <div className="Move-info">
        </div>
      );
    }

    const frame = this.props.frameIndex;
    const hitboxes = this.state.moveData.frames[frame].hitboxes;

    const intangibilityRange = this.getIntangibilityRange();
    const hitboxRanges = this.getHitboxRanges();

    var hitboxTable = null;
    if (hitboxes.length > 0) {
      hitboxTable = (
        <div className='Hitbox-table-container'>
          <table className='Hitbox-info-table'>
            <thead>
              <tr>
                <th data-tip={TOOLTIPS['color']}>Color</th>
                <th data-tip={TOOLTIPS['id']}>ID</th>
                <th data-tip={TOOLTIPS['type']}>Type</th>
                <th data-tip={TOOLTIPS['damage']}>Dmg.</th>
                <th data-tip={TOOLTIPS['angle']}>Angle</th>
                <th data-tip={TOOLTIPS['kbg']}>KBG</th>
                <th data-tip={TOOLTIPS['bkb']}>BKB</th>
                <th data-tip={TOOLTIPS['wbkb']}>WBKB</th>
                <th data-tip={TOOLTIPS['effect']}>Effect</th>
                <th data-tip={TOOLTIPS['direction']}>Dir.</th>
                <th data-tip={TOOLTIPS['groundAir']}>Ground/Air</th>
                <th data-tip={TOOLTIPS['hitlag']}>Hitlag</th>
                <th data-tip={TOOLTIPS['sdi']}>SDI</th>
                <th data-tip={TOOLTIPS['trip']}>Trip</th>
                <th data-tip={TOOLTIPS['rehit']}>Rehit</th>
                <th data-tip={TOOLTIPS['collateral']}>Coll.</th>
                <th data-tip={TOOLTIPS['props']}>Props.</th>
              </tr>
            </thead>
            <tbody>
              {hitboxes.map(function(hitbox) {
                // TODO: ideally this should be a hash function so we don't re-render unless something has changed
                return <HitboxInfo key={frame + "-" + hitbox.id} hitboxData={hitbox}/>;
              })}
            </tbody>
          </table>
          <ReactTooltip multiline={true} delayShow={160} effect={'solid'} place={'right'} />
        </div>);
    }

    return(
      <div className="Move-info">
        <p><span data-tip={TOOLTIPS['faf']}>First Actionable Frame:</span> <span className='Bold-label'>{this.state.moveData.faf === 0 ? 'N/A' : this.state.moveData.faf}</span></p>
        <p><span data-tip={TOOLTIPS['intFrames']}>Intangible frames:</span> <span className='Bold-label'>{intangibilityRange}</span></p>
        <p><span data-tip={TOOLTIPS['hitActive']}>Hitbox active:</span> <span className='Bold-label'>{hitboxRanges}</span></p>
        {hitboxTable}
        <ReactTooltip multiline={true} delayShow={160} effect={'solid'} place={'right'} />
      </div>
    );
    // TODO: camera details displayed nicely, in a hideable box
  }
}


class HitboxInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {hitboxData: props.hitboxData};
  }

  render() {
    const hitboxData = this.state.hitboxData;

    // Example data:
    // See https://docs.google.com/spreadsheets/d/1FgOsGYfTD4nQo4jFGJ22nz5baU1xihT5lreNinY5nNQ
    // public int id;
    // public float damage;
    // public float angle;
    // public float knockbackGrowth;
    // public float knockbackBase;
    // public float weightBasedKnockback;
    // public int type;
    // public bool extended;
    // public bool ignoreThrow;
    // public int part;
    // public int bone;
    // public float size;
    // public float x;
    // public float y;
    // public float z;
    // public float x2;
    // public float y2;
    // public float z2;
    //
    // // Other cool stuff
    // // Regular hitbox attributes
    // public int effect;
    // public float trip;
    // public float hitlag;
    // public float sdi;
    // public int clang;
    // public int rebound;
    // public int shieldDamage;
    // public int groundAir;
    // public int directIndirect;
    // public int gameType;
    //
    // // Special hitbox stuff
    // public int action;
    // public int blockability;
    // public int reflectable;
    // public int absorbable;
    // public int rehit;  // rehit rate, number of frames after which a rehit can occur?
    // public int ignoreInvuln;
    // public int facingRestrict;  // 0x0 whichever side of opponent receiver is on, 0x3 always in attacker facing direction, 0x4 always in opposite direction to attacker  (e.g. bair)
    // public int teamDamage;
    // public int disableHitlag;
    // public int flinchless;

    var damageString = hitboxData.damage;
    if (hitboxData.shieldDamage) {
      damageString += ' (' + hitboxData.shieldDamage + ')';
    }

    var groundAir;
    switch (hitboxData.groundAir) {
      case 1:
        groundAir = 'Ground Only';
        break;
      case 2:
        groundAir = 'Aerial Only';
        break;
      case 3:
        groundAir = 'Both';
        break;
      default:
        groundAir = '?';
    }

    const propsString = this.makePropsString(hitboxData);

    return(
      <tr id={"hitbox-" + hitboxData.id}>
        <td style={{'textAlign': 'center'}}>
          <div className="Hitbox-color" style={{'background': hitboxIdColors[hitboxData.id]}}></div>
        </td>
        <td>{hitboxData.id}</td>
        <td data-tip={HITBOX_TYPE[hitboxData.type].tooltip}>{HITBOX_TYPE[hitboxData.type].name}</td>
        <td>{damageString}</td>
        <td><HitboxAngle angle={hitboxData.angle} size={25}/></td>
        <td>{hitboxData.knockbackGrowth}</td>
        <td>{hitboxData.knockbackBase}</td>
        <td>{hitboxData.weightBasedKnockback}</td>
        <td data-tip={EFFECT_TYPE[hitboxData.effect].tooltip}>{EFFECT_TYPE[hitboxData.effect].name}</td>
        <td data-tip={FACING_RESTRICTION[hitboxData.facingRestrict].tooltip}>{hitboxData.facingRestrict}</td>
        <td>{groundAir}</td>
        <td>{hitboxData.hitlag}</td>
        <td>{hitboxData.sdi}</td>
        <td>{hitboxData.trip * 100 + "%"}</td>
        <td>{hitboxData.rehit}</td>
        <td>{hitboxData.ignoreThrow ? 'Yes' : 'No'}</td>
        <td>{propsString}</td>
      </tr>
    );
  }

  makePropsString(hitboxData) {
    var statusString = '';
    // TODO: re enable these after rebuilding json files with special=true/false
    // since they default to 1 with special=false
    if (hitboxData.special) {
      if (!hitboxData.blockability) {
        statusString += 'B ';
      }
      if (hitboxData.reflectable) {
        statusString += 'Rf ';
      }
      if (hitboxData.absorbable) {
        statusString += 'A ';
      }
    }
    if (!hitboxData.clang) {
      statusString += 'C ';
    }
    if (!hitboxData.rebound) {
      statusString += 'Rb ';
    }
    if (hitboxData.flinchless) {
      statusString += 'F ';
    }
    if (hitboxData.disableHitlag) {
      statusString += 'H ';
    }
    return statusString;
  }
}


class HitboxAngle extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    if (!HitboxAngle.isRegularAngle(this.props.angle)) {
      return;
    }
    var ctx = this.refs.canvas.getContext('2d');
    this.renderCircleIndicator(ctx, this.props.angle);
  }

  componentDidUpdate() {
    if (!HitboxAngle.isRegularAngle(this.props.angle)) {
      return;
    }
    var ctx = this.refs.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.props.size, this.props.size);
    this.renderCircleIndicator(ctx, this.props.angle);
  }

  static isMeteorSmash(angleDegrees) {
    return (angleDegrees > 245 && angleDegrees < 295);
  }

  static isRegularAngle(angleDegrees) {
    // 360+ is special angles, although 360 itself is never used
    // 361 is sakurai and the rest are auto link
    return (angleDegrees >= 0 && angleDegrees < 360);
  }

  renderCircleIndicator(ctx, angleDegrees) {
    var angleRadians = -(Math.PI / 180) * angleDegrees;

    // TODO: make the maths in here not completely reliant on a 50x50 canvas
    // Draw angle indicator
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = HitboxAngle.isMeteorSmash(angleDegrees) ? 'red' : 'black';
    ctx.moveTo(this.props.size / 2, this.props.size / 2);
    ctx.arc(this.props.size / 2, this.props.size / 2, (this.props.size / 2) - 2, angleRadians, angleRadians);
    ctx.stroke();

    // Draw circle
    ctx.beginPath();
    ctx.lineWidth = 1.75;
    ctx.strokeStyle = 'black';
    ctx.arc(this.props.size / 2, this.props.size / 2, (this.props.size / 2) - 2, angleRadians, (Math.PI / 180) * 360 + angleRadians);
    ctx.stroke();
  }

  render() {
    const angle = this.props.angle;

    let angleCanvas = null;
    if (HitboxAngle.isRegularAngle(angle)) {
      angleCanvas = <canvas ref="canvas" className="Angle-canvas" width={this.props.size} height={this.props.size}/>;
    }

    return(
      // height and lineHeight required together with vertical-align to make
      // things sit in the middle of the cell vertically
      <div className="Angle-container" style={{'height': this.props.size, 'lineHeight': this.props.size + 'px'}}>
        {angleCanvas}
        <span className="Angle-text">  {angle}&deg;</span>
      </div>
    );
  }
}

export default MoveInfo;
