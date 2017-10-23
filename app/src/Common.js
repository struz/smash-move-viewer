// Common functions needed in a lot of places

//import * as Env from './Env';
import QueryString from 'query-string';

/* Parse the app URL and retrieve information about requested state from it */
export function parsePath(path, search) {
  // Canonical URL style: #/v1/<view>/<fighter>/<move>/<frame>/<optional frameRangeEnd>
  // The v1 is to allow deprecation and the ability to change this format in the future
  // As we build the URl up, everything is optional except if you need a section, you
  // also need all sections before it.

  // Valid query paramters: ?small=[true|false]&fps=[int]

  var allVars = path.split('/');
  // index 0 is always "" and index 1 is always <version>

  // defaults
  var view = 'game_view';
  var fighter = '';
  var move = '';
  var fps = 60;
  var frame = 1;
  var frameEnd = -1;
  var small = true;

  if (allVars.length >= 3)
    view = allVars[2];
  if (allVars.length >= 4)
    fighter = allVars[3];
  if (allVars.length >= 5)
    move = allVars[4];
  if (allVars.length >= 6)
    frame = parseInt(allVars[5], 10);
  if (allVars.length >= 7)
    frameEnd = parseInt(allVars[6], 10);

  // Now parse the query params
  var parsedQueryString = QueryString.parse(search);
  if ('small' in parsedQueryString)
    small = parsedQueryString['small'] === 'true';
  if ('fps' in parsedQueryString)
    fps = parseInt(parsedQueryString['fps'], 10);

  var returnVars = [view, fighter, move, fps, frame, frameEnd, small];
  return returnVars;
}

/* Generate a URL that describes the current state of the App */
export function generateAppUrl({
  path,  // Usually will be the current router 'location'
  search,  // Usually will be the current router 'search'
  view = null,
  fighter = null,
  move = null,
  fps = null,
  frame = null,
  frameEnd = null,
  small = null
}) {
  var splitCurrentPath = path.split('/');
  var numParams = splitCurrentPath.length - 2;  // '/' and 'vX'

  if (view) {
    if (numParams === 0)
      splitCurrentPath.push(view);
    else
      splitCurrentPath[2] = view;
  }
  if (numParams >= 1 && fighter) {
    if (numParams === 1)
      splitCurrentPath.push(fighter);
    else
      splitCurrentPath[3] = fighter;
  }
  if (numParams >= 2 && move) {
    if (numParams === 2)
      splitCurrentPath.push(move);
    else
      splitCurrentPath[4] = move;
  }
  if (numParams >= 3 && frame) {
    if (numParams === 3)
      splitCurrentPath.push(frame);
    else
      splitCurrentPath[5] = frame;
  }
  if (numParams >= 4 && frameEnd) {
    if (numParams === 4)
      splitCurrentPath.push(frameEnd);
    else
      splitCurrentPath[6] = frameEnd;
  }

  // Search query parsing
  var parsedQueryString = QueryString.parse(search);
  if (small !== null && small !== undefined) {
    parsedQueryString['small'] = small;
  }
  if (fps)
    parsedQueryString['fps'] = fps;

  // Returns [location, search_query]
  return [splitCurrentPath.join('/'), '?' + QueryString.stringify(parsedQueryString)];
}
