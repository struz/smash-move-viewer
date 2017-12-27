import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';

import './Move.css';
import './MoveInfo.css';

export const hitboxIdColors = [
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
  0: {name: 'Hitbox', tooltip: '<span class="Bold-label">Damage hitbox</span><p>When this collides with a hurtbox a special effect may happen based on the "effect" type of the hitbox.</p><p>The victim will have their % increased by it\'s "damage"</p>'},
  1: {name: 'Grabbox', tooltip: '<span class="Bold-label">Grab hitbox</span><p>When this collides with a hurtbox the victim will be grabbed, allowing them to be thrown soon afterwards</p>'},
  2: {name: 'Windbox', tooltip: '<span class="Bold-label">Wind hitbox</span><p>When this collides with a hurtbox the victim will be pushed away based on the "angle" and other knockback properties of the hitbox</p>'},
  3: {name: 'Searchbox', tooltip: '<span class="Bold-label">Searchbox</span><p>Depending on the character scripts this can do many different things.</p><p>Generally it will search for hitboxes or hurtboxes and perform an action if any are found</p>'},
  4: {name: 'Special', tooltip: '<span class="Bold-label">Special Bubble</span><p>Mouse over the "effect" for more info</p>'}
}

export const specialBubbleColors = [
  '#000000',
  '#FFFFFF'  // Type 3 (REFLECT) only
]

const SPECIAL_BUBBLE_EFFECT = {
  0: {name: 'Counter', tooltip: '<span class="Bold-label">Counter</span><p>When a non-grab hitbox enters this zone it triggers a counter attack</p>'},
  1: {name: 'Reflect', tooltip: '<span class="Bold-label">Reflect</span><p>Triggers when a hitbox enters this zone and the hitbox is "reflectable".</p><p>The owner of the hitbox (usually a projectile) will have it\'s momentum reversed and will now be able to hit it\'s original owner</p>'},
  2: {name: 'Absorb', tooltip: '<span class="Bold-label">Absorb</span><p>Triggers when a hitbox enters this zone and the hitbox is "absorbable".</p><p>The owner of the hitbox (usually a projectile) will disappear. A character specfic effect will usually trigger too</p>'},
  3: {name: 'Shield', tooltip: '<span class="Bold-label">Shield</span><p>Blocks all damage from attacks. Pushes opponents away if they are near</p>'},
  4: {name: 'Witch Time', tooltip: '<span class="Bold-label">Witchtime Slowdown</span><p>When the Witch Time trigger bubble triggers, if the owner of the triggering hitbox has any hurtbox inside this bubble they will be afflicted with witch time</p>'}
}

// Effect types, see https://docs.google.com/spreadsheets/d/1FgOsGYfTD4nQo4jFGJ22nz5baU1xihT5lreNinY5nNQ
const EFFECT_TYPE = {
  0: {name: 'Normal', tooltip: '<p>Regular move, no known gameplay effect</p>'},
  1: {name: 'Detect', tooltip: '<p>Detects hurtbox and transits to the next action</p>'},
  2: {name: 'Slash', tooltip: '<p>Cosmetic "slash" effect, no known gameplay effect</p>'},
  3: {name: 'Electric', tooltip: '<p>Cosmetic "electric" effect</p><p>Causes 1.5x hitlag</p><p>Gives 1 extra frame of hitstun</p><p>Untechable with grounded meteor due to hitlag multiplier</p><p>Deals no damage to yellow pikmin</p>'},
  4: {name: 'Freezing', tooltip: '<p>Cosmetic "freezing" effect</p><p>Puts opponents into "freezing" state when it deals more than 52.5 knockback</p><p>Freeze time = (12 * damage)</p>'},
  5: {name: 'Flame', tooltip: '<p>Cosmetic "flame" effect</p><p>Thaws out frozen characters</p><p>Deals no damage to red pikmin</p>'},
  6: {name: 'Coin', tooltip: '<p>Cosmetic "coin" effect, no known gameplay effect</p>'},
  7: {name: 'Reverse', tooltip: '<p>Puts opponent into reversed state for 25 frames</p><p>Opponent gets super armor for 8 frames</p><p>Boosts momentum to airborne opponents</p>'},
  8: {name: 'Slip', tooltip: '<p>Puts grounded opponent into "tripping" state</p><p>Moves that deal 0 damage cause soft trip</p><p>Can\'t suffer another trip for 60 frames after tripping</p>'},
  9: {name: 'Sleep', tooltip: '<p>Puts opponents into "sleep" state</p><p>Sleep time = (10 + (10 * 6) + (25 * KB) + (1 * Opponent\'s % after hit))</p>'},
  10: {name: 'Unused', tooltip: '<p>Unused</p>'},
  11: {name: 'Bury', tooltip: '<p>Puts grounded opponents into "buried" state</p><p>Bury time = (10 + (15 * 3) + (1.5 * KB) + (0.5 * Opponent\'s % after hit))</p>'},
  12: {name: 'Stun', tooltip: '<p>Puts opponents into "stun" state</p><p>Does no KB/hitlag for certain frames after "stun" and "disable" state</p><p>Stun time = (76 + (15 * 3) + (1 * KB))</p>'},
  13: {name: 'Unused', tooltip: '<p>Unused</p>'},
  14: {name: 'Flower', tooltip: '<p>Puts opponents into "flower" state</p>'},
  15: {name: 'Unused', tooltip: '<p>Unused</p>'},
  16: {name: 'Death', tooltip: '<p>Puts opponents into KO\'d state</p>'},
  17: {name: 'Unused', tooltip: '<p>Unused</p>'},
  18: {name: 'Water', tooltip: '<p>Deals no damage to blue Pikmin</p>'},
  19: {name: 'Darkness', tooltip: '<p>Cosmetic "darkness" effect, no known gameplay effect</p>'},
  20: {name: 'Paralyze', tooltip: '<p>Puts opponents into "paralyzing" state</p><p>No hitlag</p><p>Ignores opponent\'s weight, and sets it to 100 instead</p><p>Paralyze time = ((((Damage * 0.3846154 + 14) * HitlagMult.) * CrouchingMult. * 0.025) * KB)</p>'},
  21: {name: 'Aura', tooltip: '<p>Cosmetic "aura" effect, no known gameplay effect</p>'},
  22: {name: 'Plunge', tooltip: '<p>Always puts opponent into "burying" state</p>'},
  23: {name: 'Down', tooltip: '<p>Puts opponent into the state where they lie on their back</p>'},
  24: {name: 'Adhesion', tooltip: '<p>Sticks an item onto the opponent</p>'},
  25: {name: 'Stab', tooltip: '<p>Cosmetic "slash" effect, no known gameplay effect</p>'},
  26: {name: 'Magic', tooltip: '<p>Cosmetic "magic" effect, no known gameplay effect</p>'},
  27: {name: 'Flinchless1', tooltip: '<p>No hitlag, no knockback</p>'},
  28: {name: 'Flinchless2', tooltip: '<p>No hitlag, no knockback</p>'},
  29: {name: 'Solar', tooltip: '<p>No known gameplay effect</p>'},
  30: {name: 'Crumple', tooltip: '<p>Puts opponents into the state where they lie on their front</p><p>Doesn\'t occur on uncharged Focus Attack despite element being present on the hitbox</p>'},
  31: {name: 'Disable', tooltip: '<p>Puts opponents into "disable" state</p><p>Does no KB/hitlag for certain frames after "stun" and "disable" state</p><p>Disable time = ((1 * KB) + (1.1 * Opponent\'s % after hit))</p>'},
  32: {name: 'Pin', tooltip: '<p>Puts opponents into "pinned" state</p>'},
  33: {name: 'Unused', tooltip: '<p>Unused</p>'},
  34: {name: 'Unused', tooltip: '<p>Unused</p>'},
  35: {name: 'Unused', tooltip: '<p>Unused</p>'},
  36: {name: 'Bullet Arts', tooltip: '<p>No known gameplay effect</p>'},
  37: {name: 'Unused', tooltip: '<p>Unused</p>'},
}

// See: https://docs.google.com/spreadsheets/d/1FgOsGYfTD4nQo4jFGJ22nz5baU1xihT5lreNinY5nNQ
const FACING_RESTRICTION = {
  0: {name: 'Same direction attacker is facing', tooltip: '<p>Same direction attacker is facing</p>'},
  1: {name: 'Opposite direction attacker is facing', tooltip: '<p>Opposite direction attacker is facing</p>'},
  2: {name: 'Same direction opponent is facing', tooltip: '<p>Same direction victim is facing</p>'},
  3: {name: 'Opposite direction attacker is facing', tooltip: '<p>Opposite direction attacker is facing</p>'},
  4: {name: 'Same direction attacker is facing', tooltip: '<p>Same direction attacker is facing</p>'},
  5: {name: 'Centre of hitbox', tooltip: '<p>Centre of hitbox</p>'},
  6: {name: 'Same direction attacker is facing', tooltip: '<p>Same direction attacker is facing, but shield pushback is opposite direction to usual</p>'},
  7: {name: 'Left', tooltip: '<p>Unused</p>'},
  8: {name: 'Right', tooltip: '<p>Unused</p>'},
  9: {name: 'Front', tooltip: '<p>Unused</p>'},
}

const TOOLTIPS = {
  // Generic move info stuff
  faf: `
    <span class="Bold-label">First Actionable Frame</span>
    <p>The first frame on which this animation can be interrupted by another action or input</p>`,

  intFrames: `
    <span class="Bold-label">Intangible frames</span>
    <p>The range(s) of frames in this move in which all character hurtboxes are disabled</p>`,

  saFrames: `
    <span class="Bold-label">Super armor frames</span>
    <p>The range(s) of frames in this move in which the character is resistant or impervious to knockback</p>`,

  invFrames: `
    <span class="Bold-label">Invincible frames</span>
    <p>The range(s) of frames in this move in which the character takes no damage or knockback from being hit.</p>
    <p>The attacker is still placed into hitlag but the defender is not</p>`,

  hitActive: `
    <span class="Bold-label">Hitbox active frames</span>
    <p>The range(s) of frames in this move which have an active hitbox</p>`,


  // Table stuff
  props: `
    <span class="Bold-label">Properties</span>
    <ul>
      <li>U: Hitbox is unblockable</li>
      <li>R: Hitbox is reflectable</li>
      <li>A: Hitbox is absorbable</li>
      <li>C: Hitbox does not clang</li>
      <li>B: Hitbox does not rebound. Also known as "trample".</li>
      <li>F: Hitbox is flinchless</li>
      <li>H: Hitbox has hitlag disabled</li>
    </ul>`,

  groundAir: `
    <span class="Bold-label">Ground/Air</span>
    <p>Which types of opponent this hitbox can hit</p>`,

  direct: `
    <span class="Bold-label">Direct</span>
    <p>If "Yes" then the hitbox will put the attacker in hitlag.</p><p>If "No" then the hitbox will usually not put the attacker in hitlag</p>`,

  direction: `
    <span class="Bold-label">Facing direction</span>
    <p>Determines which way the hitbox will send the victim.</p>
    <p>Directions are reversed if the victim's TransN bone has passed the attacker's TransN bone when the hit registers.</p>
    <p>Mouse over the individual value for more info</p>`,

  hitlag: `
    <span class="Bold-label">Hitlag modifier</span>
    <p>Multiplier on how many frames your character will freeze after connecting with this hitbox.</p>
    <p>Greater than 1 means more than usual, less than 1 means less than usual</p>`,

  sdi: `
    <span class="Bold-label">SDI modifier</span>
    <p>Multiplier on how far each SDI input will move the victim.</p>
    <p>Greater than 1 means more distance than usual, less than 1 means less distance than usual</p>`,

  trip: `
    <span class="Bold-label">Tripping chance</span>
    <p>Percentage chance the hitbox will trip an opponent.</p>
    <p>Can be negative for some unknown reason</p>`,

  rehit: `
    <span class="Bold-label">Rehit rate</span>
    <p>If 0 the hitbox does not rehit. If greater than 0 then the hitbox can hit an opponent again after the specified number of frames</p>`,

  collateral: `
    <span class="Bold-label">Throw collateral</span>
    <p>If "yes" then the hitbox cannot hit the currently grabbed opponent</p>`,

  effect: `
    <span class="Bold-label">Hitbox effect</span>
    <p>Different effects make hitboxes act differently.</p>
    <p>Mouse over the effect names to find out more about the specific effect</p>`,

  wbkb: `
    <span class="Bold-label">Weight based knockback</span>
    <p>If the value is greater than 0 then this hitbox has set knockback based on the weight of the victim</p>`,

  bkb: `
    <span class="Bold-label">Base knockback</span>
    <p>The base knockback of the hitbox.</p>
    <p>This is multiplied with other factors like damage, kbg, rage, and victim % to produce the in-game knockback received by the victim</p>`,

  kbg: `
    <span class="Bold-label">Knockback growth</span>
    <p>The knockback growth of the hitbox.</p>
    <p>The higher this value is the more the victim's % will affect the in-game knockback received by the victim</p>`,

  angle: `
    <span class="Bold-label">Angle</span>
    <p>The angle at which the opponent will be knocked away by the hitbox.</p>
    <p>See "Dir." column for other factors that affect this</p>`,

  damage: `
    <span class="Bold-label">Damage</span>
    <p>The amount of % that will be added to the victim's total %.</p>
    <p>In general, higher damage hitboxes will produce more in-game knockback to the victim.</p>
    <p>Any number shown in brackets is the amount of damage done when the move hits a shield instead of a hurtbox.</p>`,

  type: `
    <span class="Bold-label">Hitbox type</span>
    <p>The type of hitbox. One of: Hitbox, Grabbox, Windbox, Searchbox.</p>
    <p>Mouse over the individual type for more info</p>`,

  id: `
    <span class="Bold-label">Hitbox ID</span>
    <p>The ID of the hitbox. Hitboxes with lower IDs take precedence when calculating which hitbox has hit.</p>
    <p>Usually only one hitbox from a move can hit the victim in a single frame</p>`,

  color: `
    <span class="Bold-label">Hitbox color</span>
    <p>The color of the hitbox in the visualization.</p>
    <p>If you cannot see this colour it is likely hidden behind another hitbox with a lower ID number</p>`,


  // Angle stuff
  sakuraiAngle: `
    <span class="Bold-label">The "Sakurai angle"</span>
    <p>The actual angle is dependent on whether opponent is grounded or aerial. Angle scales with knockback</p>`,

  autolinkAngle: `
    <span class="Bold-label">Autolink angle</span>
    <p>The actual angle is determined by many factors with the goal of moving the opponent to stay inside the current move's continuing hitboxes</p>`
}


class CallbackLink extends Component {
  constructor(props) {
    super(props);
    this.state = {
      frameNum: this.props.frameNum,
      text: this.props.text
    };

    this.clickHandler = this.clickHandler.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(function(prevState, props) {
      prevState.frameNum = nextProps.frameNum;
      prevState.text = nextProps.text;
    });
  }

  clickHandler(e) {
    this.props.clickHandler(this.state.frameNum);
  }

  render() {
    return (
      <button type="button" className="Link-button"
        onClick={this.clickHandler}>{this.props.text}</button>
    );
  }
}


// TODO: make a concrete class to use, that parses the JSON rather than just
// assuming the files are in the right format.
class MoveInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      moveData: this.props.moveData,
      intangibilityRange: null,
      hitboxRanges: null,
      superArmorRange: null,
      invincibleRange: null
    };

    this.frameClicked = this.frameClicked.bind(this);
  }

  componentDidMount() {
    this.initData(this.state.moveData);
  }

  componentWillReceiveProps(nextProps) {
    // Reload the json only if the url has changed
    if (this.props.moveData !== nextProps.moveData) {
      this.setState(function(prevState, props) {
        prevState.moveData = nextProps.moveData;
        return prevState;
      });
      this.initData(nextProps.moveData);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Because otherwise when we change frames and the table already exists the
    // tooltips don't get rebound
    ReactTooltip.rebuild();
  }

  initData(moveData) {
    // Does one-time initialization of the move data
    if (moveData) {
      this.setState(function(prevState, props) {
        prevState.intangibilityRange = this.getIntangibilityRange(moveData);
        prevState.hitboxRanges = this.getHitboxRange(moveData);
        prevState.superArmorRange = this.getSuperArmorRange(moveData);
        prevState.invincibleRange = this.getInvincibleRange(moveData);
        return prevState;
      });
    }
  }

  frameClicked(frameNum) {
    // More frame thunking, why didn't I just use 0 index everywhere....
    this.props.onFrameChange(frameNum - 1, true);
  }

  getGlobalIntangibilityRange(moveData) {
    if (moveData.intangibilityEnd <= moveData.intangibilityStart) {
      return '';
    }
    // Intangibility end is the *frame on which* the intangibility ends i.e. the frame
    // that you are once again vulnerable so we subtract one to make more sense
    var realStart = moveData.intangibilityStart > 0 ? moveData.intangibilityStart : 1;
    return (
      <div className="Frame-range-spacer">
        <CallbackLink text={'' + realStart + '-' + (moveData.intangibilityEnd - 1)}
          frameNum={parseInt(realStart, 10)} clickHandler={this.frameClicked}/>
      </div>
    );
  }

  getIntangibilityRange(moveData) {
    // Global range can only be one block (it's from params)
    var globalIntangibilityRange = this.getGlobalIntangibilityRange(moveData);
    var localIntangibilityRange = this.getRangesFromFrames(moveData, 'bodyIntangible');

    if (!globalIntangibilityRange && !localIntangibilityRange) {
      return null;
    }
    // Intangibility end is the *frame on which* the intangibility ends i.e. the frame
    // that you are once again vulnerable so we subtract one for it to make more sense
    var intangibilityRange = null;
    if (globalIntangibilityRange && localIntangibilityRange)
      intangibilityRange = (
        <div style={{display: 'inline-block'}}>
            {globalIntangibilityRange}
            {localIntangibilityRange}
        </div>
      );
    else if (globalIntangibilityRange)
      intangibilityRange = globalIntangibilityRange;
    else
      intangibilityRange = localIntangibilityRange;

    return (
      <p>
        <span className='Bold-label' data-tip={TOOLTIPS['intFrames']}>
          Intangible frames:
        </span> {intangibilityRange}
      </p>);
  }

  getSuperArmorRange(moveData) {
    var superArmorRange = this.getRangesFromFrames(moveData, 'bodySuperArmor');
    if (!superArmorRange)
      return null;
    return (
      <p>
        <span className='Bold-label' data-tip={TOOLTIPS['saFrames']}>
          Super armor frames:
        </span> {superArmorRange}
      </p>);
  }

  getInvincibleRange(moveData) {
    var invincibleRange = this.getRangesFromFrames(moveData, 'bodyInvincible');
    if (!invincibleRange)
      return null;
    return (
      <p>
        <span className='Bold-label' data-tip={TOOLTIPS['invFrames']}>
          Invincible frames:
        </span> {invincibleRange}
      </p>);
  }

  getHitboxRange(moveData) {
    var hitboxRange = this.getRangesFromFrames(moveData, 'hitboxes');
    if (!hitboxRange)
      return null;
    return (
      <p>
        <span className='Bold-label' data-tip={TOOLTIPS['hitActive']}>
          Hitbox active:
        </span> {hitboxRange}
      </p>);
  }

  getRangesFromFrames(moveData, frameVarName) {
    var rangeString = [];

    var currentFrameStart = -1;
    for (var i = 0; i < moveData.frames.length; i++) {
      let type = typeof(moveData.frames[i][frameVarName]);
      if ((type === "boolean" && moveData.frames[i][frameVarName]) ||
          (type === "object" && moveData.frames[i][frameVarName].length)) {
        if (currentFrameStart < 0) {
          currentFrameStart = i;
        }
      } else if (currentFrameStart >= 0) {
        // If we have a range in flight, this is the end of it
        if (i - currentFrameStart < 2) {
          // 1 frame range
          rangeString.push(
            <CallbackLink text={'' + (currentFrameStart + 1)}
              frameNum={parseInt(currentFrameStart + 1, 10)} clickHandler={this.frameClicked}/>
          );
        } else {
          // 2+ frame range
          rangeString.push(
            <CallbackLink text={'' + (currentFrameStart + 1) + '-' + i}
              frameNum={parseInt(currentFrameStart + 1, 10)} clickHandler={this.frameClicked}/>
          );
        }
        currentFrameStart = -1;
      }
    }

    if (!rangeString.length) {
      return '';
    }

    return (
      <span>
        {rangeString.map(function(tag) {
          return <div className="Frame-range-spacer">{tag}</div>;
        })}
      </span>
    );
  }

  render() {
    if (!this.state.moveData) {
      return(
        <div className="Move-info">
        </div>
      );
    }

    const faf = this.state.moveData.faf === 0 ? -1 : this.state.moveData.faf;

    const frame = this.props.frameIndex;
    const hitboxes = this.state.moveData.frames[frame].hitboxes;
    var specialBubbles = [];
    if ('specialBubbles' in this.state.moveData.frames[frame])
      specialBubbles = this.state.moveData.frames[frame].specialBubbles;

    var hitboxTable = (
      <span>Pause while hitboxes are visible to see more specific information</span>
    );
    if (hitboxes.length > 0 || specialBubbles.length > 0) {
      hitboxTable = (
        <div className='Hitbox-table-container'>
          <table className='Hitbox-info-table'>
            <thead>
              <tr className="Colored-table-row">
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
              {hitboxes.map(function(hitbox, index) {
                // TODO: ideally this should be a hash function so we don't re-render unless something has changed
                return (
                  <HitboxInfo key={frame + "-" + hitbox.id} hitboxData={hitbox}
                   className={index % 2 ? "Colored-table-row" : null}/>
               );
              })}
              {specialBubbles.map(function(specialBubble, index) {
                // TODO: ideally this should be a hash function so we don't re-render unless something has changed
                return (
                  <SpecialBubbleInfo key={frame + "-" + specialBubble.id} specialBubbleData={specialBubble}
                   className={index % 2 ? "Colored-table-row" : null}/>
               );
              })}
            </tbody>
          </table>
        </div>);
    }

    return(
      <div className="Move-info">
        <p>
          <span className='Bold-label' data-tip={TOOLTIPS['faf']}>
            First Actionable Frame:
          </span>
          <div className="Frame-range-spacer">
            <CallbackLink text={faf === -1 ? 'Not specified' : faf}
              frameNum={parseInt(faf, 10)} clickHandler={this.frameClicked}/>
          </div>
        </p>
        {this.state.hitboxRanges}
        {this.state.superArmorRange}
        {this.state.intangibilityRange}
        {this.state.invincibleRange}
        {hitboxTable}
        {/* FIXME: this tooltip also serves Player.js. We should decouple them */}
        <ReactTooltip multiline={true} delayShow={160} html={true} effect={'solid'} place={'right'} />
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
      <tr id={"hitbox-" + hitboxData.id} className={this.props.className}>
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
    if (hitboxData.special) {
      if (!hitboxData.blockability) {
        statusString += 'U ';
      }
      if (hitboxData.reflectable) {
        statusString += 'R ';
      }
      if (hitboxData.absorbable) {
        statusString += 'A ';
      }
    }
    if (!hitboxData.clang) {
      statusString += 'C ';
    }
    if (!hitboxData.rebound) {
      statusString += 'B ';
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

  static isSakuraiAngle(angleDegrees) {
    return angleDegrees === 361;
  }

  static isAutolinkAngle(angleDegrees) {
    return (angleDegrees === 362 || angleDegrees === 365 ||
      angleDegrees === 366 || angleDegrees === 367);
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

    let angleText = null;
    if (HitboxAngle.isSakuraiAngle(angle)) {
      angleText = <span className="Angle-text" data-tip={TOOLTIPS['sakuraiAngle']}>  {angle}&deg;</span>;
    } else if (HitboxAngle.isAutolinkAngle(angle)) {
      angleText = <span className="Angle-text" data-tip={TOOLTIPS['autolinkAngle']}>  {angle}&deg;</span>;
    } else {
      angleText = <span className="Angle-text">  {angle}&deg;</span>;
    }

    return(
      // height and lineHeight required together with vertical-align to make
      // things sit in the middle of the cell vertically
      <div className="Angle-container" style={{'height': this.props.size, 'lineHeight': this.props.size + 'px'}}>
        {angleCanvas}
        {angleText}
      </div>
    );
  }
}


class SpecialBubbleInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {specialBubbleData: props.specialBubbleData};
  }

  render() {
    const specialBubbleData = this.state.specialBubbleData;
    const bubbleColor = specialBubbleData.type === 3 ? specialBubbleColors[1] : specialBubbleColors[0];

    return(
      <tr id={"specialBubble-" + specialBubbleData.id} className={this.props.className}>
        <td style={{'textAlign': 'center'}}>
          <div className="Hitbox-color" style={{'background': bubbleColor}}></div>
        </td>
        <td>{specialBubbleData.id}</td>
        <td data-tip={HITBOX_TYPE[4].tooltip}>{HITBOX_TYPE[4].name}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td data-tip={SPECIAL_BUBBLE_EFFECT[specialBubbleData.type].tooltip}>{SPECIAL_BUBBLE_EFFECT[specialBubbleData.type].name}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    );
  }
}

export default MoveInfo;
