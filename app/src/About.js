import React, { Component } from 'react';
import ReactGA from 'react-ga';


import './Help.css';
import './MoveInfo.css';


ReactGA.initialize('UA-107697636-1');

class Help extends Component {
  render() {
    // TODO: fixme, dodgy analytics. Should fire on router events instead of render
    ReactGA.pageview('/about');

    return (
      <div className="prose">
        <hr />
        <h2>About</h2>
        Hey, I'm Struz and welcome to Smash Move Viewer. I started my journey in
        move visualization by becoming one of the devs on a program
        called <a href="https://github.com/jam1garner/Smash-Forge">Smash Forge</a>.
        Unfortunately because the program requires you to have a copy of the game
        files for Smash 4 and a rather powerful GPU, not many people outside of
        modders started using it. This was a shame to me as I
        believe that interactive hitbox viewing could really help people
        understand and theorycraft the game better. To get around this problem
        I decided to make a web interface for viewing Smash 4 hitboxes. After a
        long time and a lot of work, this is the result.
        <br /><br />
        <h3>How to help</h3>
        I'd love to make this the best site it can be for the Smash community.
        If you have any suggestions or feedback please don't hesitate to let
        me know.
        <ul>
          <li><span className="Bold-label">Twitter:</span> <ReactGA.OutboundLink eventLabel="Twitter" to="https://twitter.com/StruzSmash" target="_blank" rel="noopener noreferrer">&#64;StruzSmash</ReactGA.OutboundLink></li>
          <li><span className="Bold-label">Email:</span> <a href="mailto:smashmoveviewer@gmail.com">smashmoveviewer@gmail.com</a></li>
          <li><span className="Bold-label">Discord:</span> Struz#7839</li>
        </ul>
        Some examples of feedback I would love to hear:
        <ul>
          <li>Move naming suggestions</li>
          <li>General site usability suggestions</li>
          <li>If a move has provably wrong frame data</li>
          <li>If a feature is broken or not working on your device</li>
          <li>Feature suggestions</li>
        </ul>
        <h3>Site limitations</h3>
        The site has some known limitations right now. Some of these will likely
        be fixed in the future, but others will not. It really depends on the
        time required for a fix vs the value the fix brings to the site.
        <ul>
          <li>
            <span className="Bold-label">
              Not every move is guaranteed to be 100% correct.
            </span> I have done my best to ensure that most moves are correct,
            and spent a lot of time verifying this with existing frame databases.
            However, all of the moves shown here were generated using reverse
            engineered data, and as such could be rendered slightly different
            from in-game.
          </li>
          <li>
            <span className="Bold-label">No tether grabs.</span> This also extends
            to other "weapon" visualizations. Weapons have lots of unique code
            per weapon and this requires a lot of manual work to fix, but only
            benefits a small portion of the moves in the game.
          </li>
          <li>
            <span className="Bold-label">No projectiles.</span> This is mostly
            because projectiles are all different types of "weapon" in the game
            files. I plan to remedy this by providing images or videos of
            projectiles that are possible to visualize at some point.
          </li>
          <li>
            <span className="Bold-label">
              Some characters are missing.
            </span> I am slowly rolling out new characters until every character
            is done. If your character is not done yet please be patient.
          </li>
          <li>
            <span className="Bold-label">
              Some characters are hard or impossible to do properly.
            </span> The main culprits here are Olimar and Kirby, because both
            of them use a large amount of code separate from the scripts that
            govern the rest of the characters. This means the tools used to make
            the rest of the characters do not work well with them.
          </li>
        </ul>
        <h3>Credits &amp; Thanks</h3>
        <ul className="Spaced-list">
          <li>
            <span className="Bold-label">Struz
              (<a href="https://twitter.com/StruzSmash" target="_blank" rel="noopener noreferrer">@StruzSmash</a>):
            </span> main developer of Smash Move Viewer. Smash4 reverse engineering
            and Smash Forge contributions relating to animations, hitboxes, and
            ACMD scripts. Author of this About page.
          </li>
          <li>
            <span className="Bold-label">jam1garner
              (<a href="https://twitter.com/jam1garner" target="_blank" rel="noopener noreferrer">@jam1garner</a>):
            </span> creator of <a href="https://github.com/jam1garner/Smash-Forge">Smash Forge</a>,
            the program which inspired this site. This program was integral in producing
            hitbox visualizations. Jam also got me started on reverse engineering on the WiiU.
          </li>
          <li>
            <span className="Bold-label">Ploaj/Furil:</span>
            an amazing contributor in the Smash4 modding and reverse engineering scene.
            His posts of hitbox visualizations on Smashboards were what first
            inspired me to check out Smash Forge. He's done a lot of hard work
            on Smash Forge and is solely responsible for a large portion of the
            animation rendering code in there.
          </li>
          <li>
            <span className="Bold-label">Ruben
              (<a href="https://twitter.com/ruben_dal" target="_blank" rel="noopener noreferrer">@Ruben_dal</a>):
            </span> one of the best Smash scientists around. Added many helpful
            visualizations to Smash Forge, has researched and explained many
            game mechanics in detail, owner and creator
            of <a href="http://rubendal.github.io/Sm4sh-Calculator/">
              the Sm4sh Calculator
            </a> and assorted tools.
            His <a href="http://rubendal.github.io/Sm4sh-Calculator/scripts.html">script viewer and searcher</a> have
            been invaluable for helping me make this site.
          </li>
          <li>
            <span className="Bold-label">Kurogane Hammer
              (<a href="https://twitter.com/KuroganeHammer" target="_blank" rel="noopener noreferrer">@KuroganeHammer</a>):
            </span> super helpful frame data man. This site was somewhat
            inspired by <a href="http://kuroganehammer.com/Smash4">his website</a>,
            as I always wished that alongside the numbers there was a visual of
            how the hitboxes actually looked. He helped me test a bunch of bugs
            with smash forge animation viewing, and he and his discord kept
            finding bugs with various moves (which I would then fix).
          </li>
          <li>
            <span className="Bold-label">Rose
              (<a href="https://twitter.com/SuperSharkRocky" target="_blank" rel="noopener noreferrer">@SuperSharkRocky</a>):
            </span> awesome artist and game designer. Huge thanks for creating a theme
            for Smash Move Viewer, helping me with site usability &amp; graphics,
            and for being a generally great person to bounce ideas off. You made
            the final stretch of finishing this project off much more bearable, and
            I can't thank you enough.
            <br />
            <a href="http://supershark.studio/">Go check out all of her amazing art!</a>
          </li>
        </ul>
    		<hr />
    	</div>
    );
  }
}

export default Help;
