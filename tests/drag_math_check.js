const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '..', 'LongShotStitch.html');
const html = fs.readFileSync(file, 'utf8');

const seamBranchStart = html.indexOf("if(['seamBefore','seamAfter','seamCenter'].includes(drag.type))");
if (seamBranchStart < 0) throw new Error('seam drag branch missing');

const seamBranchEnd = html.indexOf('\n    }\n  }\n\n  function onPointerUp', seamBranchStart);
const seamBranch = html.slice(seamBranchStart, seamBranchEnd);

if (!seamBranch.includes('drag.startScreen')) {
  throw new Error('seam drag must use pointer screen delta so pan compensation cannot cancel movement');
}

if (seamBranch.includes('w.y - drag.start.y') || seamBranch.includes('w.x - drag.start.x')) {
  throw new Error('seam drag must not compute movement from pan-adjusted world coordinates');
}

if (!html.includes("const side = h.type === 'activeDragAfter' ? 'after' : 'before';") || !html.includes('startScreen:') || !html.includes('sourceScale:seamDragSourceScale(h.index, side)')) {
  throw new Error('direct seam handle drags must capture startScreen and the affected image scale');
}

if (!html.includes('shouldFreezeViewportForActiveEdit')) {
  throw new Error('seam edit mode must expose a viewport-freeze guard');
}

if (!html.includes('if(!shouldFreezeViewportForActiveEdit()) clampPanToLayout(layoutCache);')) {
  throw new Error('render must skip pan clamping while seam/divider active edit is in progress');
}

if (!html.includes("state.activeHandle?.kind === 'seamCenter'")) {
  throw new Error('viewport freeze must cover active seam center editing until the done check is clicked');
}

if (!html.includes("['seamCenter','canvasCrop','imageCrop'].includes(state.activeHandle?.kind)")) {
  throw new Error('viewport freeze must cover active crop editing so pan compensation is not clamped away');
}

if (!html.includes("'canvasCrop','imageCrop'")) {
  throw new Error('viewport freeze must cover live canvas/image crop drags');
}

if (!html.includes('commitCanvasCrop') || !html.includes("finishedActive?.kind === 'canvasCrop'")) {
  throw new Error('canvas crop done must commit the cropped result before the next tool uses it');
}

if (!html.includes('applyCanvasCropToImages')) {
  throw new Error('canvas crop commit must distribute crop into original images instead of flattening');
}

const commitStart = html.indexOf('async function commitCanvasCrop');
const commitEnd = html.indexOf('\n\n  async function generateSubtitleStitch', commitStart);
if (commitStart < 0 || commitEnd < 0) throw new Error('commitCanvasCrop block missing');
const commitBlock = html.slice(commitStart, commitEnd);
if (commitBlock.includes('state.images = [record]')) {
  throw new Error('canvas crop commit must not flatten all images into one record');
}

if (commitBlock.includes('fitToView(false)')) {
  throw new Error('canvas crop commit must preserve current zoom instead of forcing fit-to-view');
}

if (!html.includes('baseCropFromEffectiveCrop')) {
  throw new Error('canvas crop distribution must subtract seam crop before writing image.crop');
}

if (!html.includes('layoutDistanceToSourcePixels')) {
  throw new Error('divider insert must convert layout distance back to source pixels using image scale');
}

if (!html.includes("layoutDistanceToSourcePixels(pos - target.y, target, 'y')") || !html.includes("layoutDistanceToSourcePixels(pos - target.x, target, 'x')")) {
  throw new Error('divider insert must keep the inserted seam at the same visual position for vertical and horizontal layouts');
}

if (!html.includes('splitDraftHitPad')) {
  throw new Error('divider draft drag hit area must stay finger-sized at low zoom');
}

if (!html.includes("drag && ['splitDraft','seamBefore','seamAfter','seamCenter','canvasCrop','imageCrop'].includes(drag.type)")) {
  throw new Error('viewport freeze must cover split draft dragging');
}

if (!html.includes('seamDragSourceScale')) {
  throw new Error('seam dragging must convert screen movement through the affected image scale');
}

if (!html.includes('/ Math.max(0.0001, drag.sourceScale || 1)')) {
  throw new Error('seam dragging must divide movement by source scale so large images drag smoothly');
}

console.log('drag_math_check ok');
