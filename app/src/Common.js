// Common functions needed in a lot of places

//import * as Env from './Env';
import QueryString from 'query-string';


// Hotkey help, which is shown in two places in the app
export const HOTKEY_HELP = `
There are hotkeys to make interacting with the move easier:
<ul>
  <li><span class="Bold-label">Spacebar:</span> Play/Pause</li>
  <li><span class="Bold-label">Right arrow:</span> Next frame</li>
  <li><span class="Bold-label">Left arrow:</span> Previous frame</li>
  <li><span class="Bold-label">Holding shift:</span> arrow keys skip 10 frames in direction</li>
  <li><span class="Bold-label">Holding ctrl:</span> arrow keys skip to first or last frame</li>
</ul>
`;

// Make sure these match values in Player.js "speed" dropdown
const VALID_SPEEDS = [2, 1, 0.5, 0.25, 0.1];

/* Parse the app URL and retrieve information about requested state from it */
export function parsePath(path, search) {
  // Canonical URL style: #/v1/<fighter>/<move>/<frame>/<optional frameRangeEnd>
  // The v1 is to allow deprecation and the ability to change this format in the future
  // As we build the URl up, everything is optional except if you need a section, you
  // also need all sections before it.

  // Valid query paramters: ?speed=[string]&view=[string]
  // Speed string is like '1x', '0.25x', etc

  var allVars = path.split('/');
  // index 0 is always "" and index 1 is always <version>

  // defaults
  var view = 'game_view';
  var fighter = '';
  var move = '';
  var speed = 1;
  var frame = 1;
  var frameEnd = -1;
  var showAllMoves = false;

  if (allVars.length >= 3)
    fighter = allVars[2];
  if (allVars.length >= 4)
    move = allVars[3];
  if (allVars.length >= 5)
    frame = parseInt(allVars[4], 10);
  if (allVars.length >= 6)
    frameEnd = parseInt(allVars[5], 10);

  // Now parse the query params
  var parsedQueryString = QueryString.parse(search);
  if ('speed' in parsedQueryString) {
    speed = parseFloat(parsedQueryString['speed'], 10);
    if (!VALID_SPEEDS.includes(speed)) {
      speed = 1;
    }
  }
  if ('view' in parsedQueryString)
    view = parsedQueryString['view'];
  if ('showAllMoves' in parsedQueryString)
    showAllMoves = JSON.parse(parsedQueryString['showAllMoves']);

  var returnVars = [view, fighter, move, speed, frame, frameEnd, showAllMoves];
  return returnVars;
}

/* Generate a URL that describes the current state of the App */
export function generateAppUrl({
  path,  // Usually will be the current router 'location'
  search,  // Usually will be the current router 'search'
  view = null,
  fighter = null,
  move = null,  // If this is the special value False, ignore all URL bits past "Move"
  speed = null,
  frame = null,
  frameEnd = null,
  showAllMoves = null
}) {
  var splitCurrentPath = path.split('/');
  var numParams = splitCurrentPath.length - 2;  // '/' and 'vX'

  if (numParams >= 0 && fighter) {
    if (numParams === 0)
      splitCurrentPath.push(fighter);
    else
      splitCurrentPath[2] = fighter;
  }
  if (numParams >= 1 && move) {
    if (numParams === 1)
      splitCurrentPath.push(move);
    else
      splitCurrentPath[3] = move;
  }
  if (move !== false) {
    if (numParams >= 2 && frame) {
      if (numParams === 2)
        splitCurrentPath.push(frame);
      else
        splitCurrentPath[4] = frame;
    }
    if (numParams >= 3 && frameEnd) {
      if (numParams === 3)
        splitCurrentPath.push(frameEnd);
      else
        splitCurrentPath[5] = frameEnd;
    }
  } else {
    splitCurrentPath.splice(3, splitCurrentPath.length);
  }

  // Search query parsing
  var parsedQueryString = QueryString.parse(search);
  if (speed)
    parsedQueryString['speed'] = speed;
  if (view)
    parsedQueryString['view'] = view;
  if (showAllMoves !== null)
    parsedQueryString['showAllMoves'] = showAllMoves;

  // Returns [location, search_query]
  return [splitCurrentPath.join('/'), '?' + QueryString.stringify(parsedQueryString)];
}
