const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '..', 'LongShotStitch.html');
const html = fs.readFileSync(file, 'utf8');

function blockBetween(startToken, endToken) {
  const start = html.indexOf(startToken);
  const end = html.indexOf(endToken, start + startToken.length);
  if (start < 0 || end < 0) throw new Error(`missing block: ${startToken}`);
  return html.slice(start, end);
}

const required = [
  "const APP_VERSION = 'v1.45.0'",
  'snapVectorToAngle',
  'constrainBoxFromStart',
  'applyShiftPenConstraint',
  'resizeAnnotationFromHandle',
  'annotationResizeHandles',
  'moveSelectedAnnotationLayer',
  'data-layer-action="front"',
  'data-layer-action="back"',
  "selectionFillMode:'transparent'",
  "selectionFillColor:'#ffffff'",
  'data-selection-fill-mode="transparent"',
  'data-selection-fill-mode="white"',
  'data-selection-fill-mode="black"',
  'data-selection-fill-mode="custom"',
  'fillMode:selectionFillMode()',
  'fillColor:selectionFillColor()',
  'pointInsideCutout',
  'e.shiftKey',
  'e.altKey'
];
for (const token of required) {
  if (!html.includes(token)) throw new Error(`missing mature annotation token: ${token}`);
}

if (html.includes("data-tool-setting=\"textBg\"") || html.includes("data-ann=\"bg\"")) {
  throw new Error('text background controls must be removed');
}
const textDrawBlock = blockBetween("} else if(a.type === 'text' || a.type === 'watermark'){", "} else if(a.type === 'badge'){");
if (textDrawBlock.includes("a.bg && a.bg !== 'transparent'") || textDrawBlock.includes('fillRect(ox-m.padX')) {
  throw new Error('text rendering must not export a background box');
}

const snapSource = blockBetween('function snapVectorToAngle', 'function constrainBoxFromStart').trim();
const snapVectorToAngle = new Function(`return (${snapSource});`)();
let snapped = snapVectorToAngle(10, 2, 45);
if (Math.abs(snapped.dy) > 1e-6 || Math.abs(Math.hypot(snapped.dx, snapped.dy) - Math.hypot(10, 2)) > 1e-6) {
  throw new Error('Shift line snapping must preserve length and snap near-horizontal vectors to 0 degrees');
}
snapped = snapVectorToAngle(8, 7, 45);
if (Math.abs(Math.abs(snapped.dx) - Math.abs(snapped.dy)) > 1e-6) {
  throw new Error('Shift line snapping must snap diagonal vectors to 45 degrees');
}

const boxSource = blockBetween('function constrainBoxFromStart', 'function applyShiftPenConstraint').trim();
const constrainBoxFromStart = new Function(`return (${boxSource});`)();
let box = constrainBoxFromStart({x:10,y:10},{x:35,y:20},true);
if (box.w !== 25 || box.h !== 25) throw new Error('Shift box creation must create equal width and height');
box = constrainBoxFromStart({x:10,y:10},{x:-5,y:3},true);
if (box.w !== -15 || box.h !== -15) throw new Error('Shift box creation must preserve drag direction');
box = constrainBoxFromStart({x:10,y:10},{x:35,y:20},false);
if (box.w !== 25 || box.h !== 10) throw new Error('normal box creation must remain unconstrained');

const overlayBlock = blockBetween('function drawToolsOverlay', 'function measureTextAnnotation');
for (const handle of ['nw','n','ne','e','se','s','sw','w']) {
  if (!overlayBlock.includes(`name:'${handle}'`) && !html.includes(`name:'${handle}'`)) {
    throw new Error(`missing resize handle ${handle}`);
  }
}
if (!overlayBlock.includes("type:'annotationResize'")) throw new Error('resize handles must remain interactive');

const moveBlock = blockBetween('function moveSelectedAnnotationLayer', 'function duplicateSelectedAnnotation');
for (const action of ["'front'", "'forward'", "'backward'", "'back'"]) {
  if (!moveBlock.includes(action)) throw new Error(`layer move missing ${action}`);
}
if (!moveBlock.includes('selectedId')) throw new Error('layer reorder must restore selection by object id');

const pointerMoveBlock = blockBetween('function onPointerMove', 'function annotationTransformChanged');
if (!pointerMoveBlock.includes("drag.type === 'annotationMove'") || !pointerMoveBlock.includes('lockDragAxis')) {
  throw new Error('Shift must constrain selected-object movement to one axis');
}
if (!pointerMoveBlock.includes("drag.type === 'annotationLineStart'") || !pointerMoveBlock.includes('snapVectorToAngle')) {
  throw new Error('Shift must constrain line endpoint adjustment');
}
if (!html.includes('annotationPointsChanged(current, finished.ann)')) {
  throw new Error('free-path resize must participate in undo history');
}
if (!html.includes('probe = rotatePointAround') || !html.includes('if(a.rotation || 0){')) {
  throw new Error('free paths must support rotated rendering and hit testing');
}

console.log('annotation_maturity_check ok');
