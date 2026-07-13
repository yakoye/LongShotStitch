const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '..', 'LongShotStitch.html');
const html = fs.readFileSync(file, 'utf8');

const required = [
  'TOOL_DRAG_THRESHOLD',
  'shouldCommitToolDraft',
  'cancelToolDraft',
  "group === 'marquee'",
  "toolArmed === 'marquee'",
  "type:'marqueeCreate'",
  'selectionDraft',
  'pixelClipboard',
  'captureSelectionBitmap',
  'copyPixelSelection',
  'cutPixelSelection',
  'pastePixelClipboard',
  "type:'patch'",
  "type:'cutout'",
  "a.type === 'patch'",
  "a.type === 'cutout'",
  "c.globalCompositeOperation = 'destination-out'",
  'flattenCanvasForJpeg',
  'data-selection-action="copy"',
  'data-selection-action="cut"',
  'data-selection-action="paste"',
  '①'
];

for (const token of required) {
  if (!html.includes(token)) throw new Error(`missing robust tool token: ${token}`);
}

function blockBetween(startToken, endToken) {
  const start = html.indexOf(startToken);
  const end = html.indexOf(endToken, start + startToken.length);
  if (start < 0 || end < 0) throw new Error(`missing block: ${startToken}`);
  return html.slice(start, end);
}

const selectBlock = blockBetween('function selectAnnotationForEdit', 'function setToolGroup');
if (selectBlock.includes('syncToolSettingsFromAnnotation')) {
  throw new Error('selecting an annotation must not switch the active tool');
}

const deleteBlock = blockBetween('function deleteSelectedAnnotation', 'function normalizeProjectCrops');
if (!deleteBlock.includes('state.selected = null')) {
  throw new Error('deleting an annotation must leave selection empty');
}
if (deleteBlock.includes("state.annotations.length ? {type:'annotation'")) {
  throw new Error('deleting an annotation must not auto-select a neighbor');
}

const keyBlock = blockBetween('function handleKey', 'function nudge');
if (!keyBlock.includes("if(state.selected?.type === 'annotation'){ deleteSelectedAnnotation(); return; }")) {
  throw new Error('Delete and Backspace must delete the selected annotation');
}
if (keyBlock.includes('Keyboard Backspace/Delete must not remove annotations')) {
  throw new Error('legacy keyboard-delete guard must be removed');
}

const overlayBlock = blockBetween('function drawToolsOverlay', 'function measureTextAnnotation');
if (!overlayBlock.includes('drawLineSelectionHandles')) {
  throw new Error('line annotations must use endpoint handles without a dashed bounding box');
}
if (!overlayBlock.includes('isFreePathAnnotation(a)')) {
  throw new Error('free paths must have a dedicated selection-overlay rule');
}

const commitSource = blockBetween('function shouldCommitToolDraft', 'function cancelToolDraft').trim();
const shouldCommit = new Function('TOOL_DRAG_THRESHOLD', 'isFreePathAnnotation', `return (${commitSource});`)(
  6,
  a => ['pen', 'highlight', 'mosaicPen'].includes(a?.type)
);
if (shouldCommit({type:'arrow', w:0, h:0})) throw new Error('a click must not create an arrow');
if (shouldCommit({type:'box', w:3, h:4})) throw new Error('a sub-threshold shape drag must be cancelled');
if (!shouldCommit({type:'box', w:6, h:0})) throw new Error('a threshold-length shape drag must commit');
if (shouldCommit({type:'pen', points:[{x:0,y:0}]})) throw new Error('one pencil point must be cancelled');
if (!shouldCommit({type:'pen', points:[{x:0,y:0},{x:6,y:0}]})) throw new Error('a valid pencil stroke must commit');

console.log('tool_interaction_check ok');
