import React, { Component } from 'react';
import ReactGA from 'react-ga';

import './Help.css';
import './MoveInfo.css';

import ryuExample from './img/ryu_example.png';
import moveViewerExample from './img/MoveViewerInstructional.png';

import * as MoveInfo from './MoveInfo.js';
const hurtboxColor = '#FFE119';
const superArmorColor = '#730A43';
const invincibleColor = '#FFFFFF';


ReactGA.initialize('UA-107697636-1');

class Help extends Component {
  render() {
    // TODO: fixme, dodgy analytics. Should fire on router events instead of render
    ReactGA.pageview('/help');

    return (
      <div className="prose">
        <hr />
        <h2>How to use this site</h2>
        This page will explain everything you need to know to start using Smash
        Move Viewer. The aim of this site is to create an interactive animation
        viewer that is easy to use so Smash 4 players can investigate every
        aspect of their character.
        <br /><br />Here is an example screen from the app. Each part of the
        user interface is highlighted with an explanation on what it does below.
        <br /><br />
        <a href={moveViewerExample}><img src={moveViewerExample} className="Move-viewer-example" alt="move viewer layout example" /></a>
        <br /><br />
        <h3 className="Section-1">1. Selecting a move</h3>
        Use the controls at the top of the page to select a character and a move
        to view. If you uncheck the "Relevant moves only" box then you will be
        able to see every animation the character has, rather than just the most
        viewed ones.
        <br /><br />
        Moves are sorted by category, with attacks at the very top.
        Some moves have different parts which are separate animations, but
        in-game they may be one single move. Unfortunately there is no easy way
        to link all the animations together so you have to view them in
        individual parts.
        <br /><br />
        <h3 className="Section-2">2. Playing the move</h3>
        Use the controls just under the viewport to interact with the move.
        The play button will play the move at the selected speed. The buttons
        immediately to the left and right of play will skip one frame backward
        or forward in the move. The buttons on the ends skip straight to the
        start and end of the move respectively.
        <br /><br />
        Checking the "Loop" checkbox will loop the animation over and over while
        playing. You can also directly enter a frame into the frame box to skip
        to it.
        <br /><br />
        <h3 className="Section-3">3. General move information</h3>
        This section contains information about the move in general. Everything
        here is a summary of the entire move. Things that might be here include
        notes about the move, it's First Actionable Frame, and summaries of when
        hurtboxes and hitboxes are present. Mouse over any of the fields to get
        a detailed description about what they mean.
        <br /><br />
        <h3 className="Section-4">4. Hitbox information</h3>
        Always present when there is a hitbox or other special bubble in the
        viewport, this section describes what each bubble represents. It will
        only appear when the move is paused.
        <br /><br />
        <span className="Bold-label">This table contains a lot of information
        </span>. To help you make the most of it, every column header can
        be moused over for detailed information on what the column means and
        how to interpret it. The values in some columns can also be moused
        over, such as the "Type", "Effect" and "Dir" columns. Column header
        tooltips will tell you when their values can be moused over for more
        information.
        <br /><br />
        <span style={{"fontStyle": "italic"}}>Notes for mobile:</span> To mouse
        over something on mobile just tap on it. Also, on mobile you may need
        to scroll to the right to see the full table.
        <br /><br />
        The information with this table will change depending on which frame of
        the move you are viewing. It will always have up-to-date information on
        the current frame of the move. Match the colour in the table row with
        the colour of a bubble in the viewport to find out which hitbox has
        which properties.
        <br /><br />
        <h2>The viewport</h2>
        Arguably the most important part of the entire site the viewport allows
        you to view every frame of animation just as it would appear in-game.
        It also has various useful data overlaid on the animation; mainly
        hitboxes and hurtboxes.
        <br /><br />
        <h3>Frames</h3>
        Smash 4 runs at 60 Frames Per Second (FPS). That means that the smallest
        unit of time according to in-game processing is 1/60th of a second. This
        is known as a "frame". Everything in this app revolves around frames.
        The power of this entire site is in being able to inspect when and how
        the moves in this game interact with each other. All of the following
        parts of the viewport change depending on the current frame of the move
        being displayed.
        <br /><br />
        <h3>Hitboxes</h3>
        If a hitbox bubble intersects with a hurtbox bubble on the same in-game
        frame, then the character who owns the hurtbox will take damage and
        knockback according to the parameters of the intersecting hitbox.
        <br /><br />
        There are two general types of hitbox: <span className="Bold-label">regular</span> and <span className="Bold-label">extended</span>. Regular
        hitboxes are always round. Extended hitboxes make a cylinder between two
        points. The most important distinction between the two is that regular
        hitboxes "interpolate" their position between frames, while extended ones
        do not. This is drawn in the viewport as a very faint red background
        behind hitboxes. This means that if a hitbox moves very far between two
        frames, it will also hit the area in between where it moved. A notable
        example of this is the first few active frames of Cloud's Up Air.
        <br /><br />
        Hitboxes come in different colours depending on the ID number of the
        hitbox. These ID numbers are taken from the game's files, and a hitbox
        with a lower ID will always hit instead of one with a higher ID if both
        would hit an opponent in the same frame. Hitbox colours in ascending
        order of ID are listed below:
        <br /><br />
        {MoveInfo.hitboxIdColors.map(function(element) {
          return <div className="Hitbox-color Text-aligned-div Spaced-box" style={{'background': element}} key={element}></div>;
        })}
        <br /><br />
        Hitboxes with lower IDs are always drawn on top of higher ID hitboxes to
        emphasize which one will apply if they all hit together. Check the
        Hitbox Information table below the viewport for detailed information on
        what each hitbox does. Mouse over any of the column headers for an
        explanation of what they mean.
        <br /><br />
        <h3>Special bubbles</h3>
        Special bubbles are all coloured <div className="Hitbox-color Text-aligned-div" style={{'background': MoveInfo.specialBubbleColors[0]}}></div> except
        for the REFLECT type which is coloured <div className="Hitbox-color Text-aligned-div" style={{'background': MoveInfo.specialBubbleColors[1]}}></div>.
        Mouse over the relevant column in the Hitbox Information table for more
        information on what they do. Very few moves use this type of bubble.
        They are generally reserved for special reflect or armor moves like
        Mario's Cape or Pit's Guardian Orbitars.
        <br /><br />
        <h3>Hurtboxes</h3>
        Regular hurtboxes are coloured <div className="Hitbox-color Text-aligned-div" style={{'background': hurtboxColor}}></div>.
        If a hitbox bubble intersects with a hurtbox bubble on the same in-game
        frame, then the character who owns the hurtbox will take damage and
        knockback according to the parameters of the intersecting hitbox.
        <br /><br />
        Super armored hurtboxes are coloured <div className="Hitbox-color Text-aligned-div" style={{'background': superArmorColor}}></div>.
        They can take increased damage from hitboxes before interrupting or
        knocking back the hurtbox owner.
        <a href="https://www.ssbwiki.com/Armor#In_Super_Smash_Bros._4">See the ssbwiki for more info.</a>
        <br /><br />
        Invincible hurtboxes are coloured <div className="Hitbox-color Text-aligned-div" style={{'background': invincibleColor}}></div>.
        They are completely invincible to all damage, and the attacker is still
        put into hitlag for attacking. This is the same state as characters who
        have just come down from the respawn platform.
        <br /><br />
        <h3>An example</h3>
        <img src={ryuExample} className="Ryu-example" alt="move viewer layout example" />
        <br />
        Here we see a frame from Ryu's strong jab. On this frame we can see his
        entire body enveloped by yellow hurtboxes. This is the area that can be
        hit by an enemy hitbox to make him take damage. We can also see a red
        hitbox around part of his leg. This is the area that is actively able
        to hurt opponents on this frame.
        <br /><br />
    		<hr />
    	</div>
    );
  }
}

export default Help;
