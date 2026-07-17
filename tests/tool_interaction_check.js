const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '..', 'LongShotStitch.html');
const html = fs.readFileSync(file, 'utf8');

const required = [
  'TOOL_DRAG_THRESHOLD',
  'pathExtents',
  'imageDataStore',
  'patchDataStore',
  'snapshot(forHistory=false)',
  'function onPointerCancel',
  'shouldCommitToolDraft',
  'commitToolDraft',
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
  'data-selection-action="paste"',
  '①',
  "selectionShape:'rect'",
  'selectionPath',
  'drawSelectionPath',
  'finalizeSelectionAsTransform',
  'switchToTransformTool',
  'pasteExternalImageAsAnnotation'
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
if (!keyBlock.includes("if(state.mode === 'tools' && state.toolArmed === 'select' && state.selected?.type === 'annotation'){ deleteSelectedAnnotation(); return; }")) {
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
if (!overlayBlock.includes('inlineTextIndex !== i')) {
  throw new Error('inline text editing must not draw a second selection frame over the editor');
}

const commitSource = blockBetween('function shouldCommitToolDraft', 'function commitToolDraft').trim();
const pathSource = blockBetween('function pathExtents', 'function pointSegmentDistance').trim();
const pathExtents = new Function(`return (${pathSource});`)();
const shouldCommit = new Function('TOOL_DRAG_THRESHOLD', 'isFreePathAnnotation', 'pathExtents', `return (${commitSource});`)(
  6,
  a => ['pen', 'highlight', 'mosaicPen'].includes(a?.type),
  pathExtents
);
if (shouldCommit({type:'arrow', w:0, h:0})) throw new Error('a click must not create an arrow');
if (shouldCommit({type:'box', w:3, h:4})) throw new Error('a sub-threshold shape drag must be cancelled');
if (!shouldCommit({type:'box', w:6, h:0})) throw new Error('a threshold-length shape drag must commit');
if (shouldCommit({type:'pen', points:[{x:0,y:0}]})) throw new Error('one pencil point must be cancelled');
if (!shouldCommit({type:'pen', points:[{x:0,y:0},{x:6,y:0}]})) throw new Error('a valid pencil stroke must commit');
const longPath = Array.from({length:120000}, (_,i)=>({x:i,y:i%7}));
const extents = pathExtents(longPath);
if (extents.minX !== 0 || extents.maxX !== 119999 || extents.minY !== 0 || extents.maxY !== 6) {
  throw new Error('large pencil paths must compute bounds without spread-argument limits');
}

const cancelBlock = blockBetween('function cancelToolDraft', 'function addAnnotation');
if (cancelBlock.includes('future = []') || cancelBlock.includes('history.pop()')) {
  throw new Error('cancelling a no-op tool draft must preserve undo and redo history');
}
const commitBlock = blockBetween('function commitToolDraft', 'function cancelToolDraft');
if (!commitBlock.includes('history.push(finished.historySnapshot)')) {
  throw new Error('tool history must be recorded only when a real drag commits');
}

const pointerCancelBlock = blockBetween('function onPointerCancel', 'function getPointer');
if (!pointerCancelBlock.includes("finished?.type === 'toolCreate'") || !pointerCancelBlock.includes('cancelToolDraft(finished)')) {
  throw new Error('pointercancel must discard an unfinished drawing instead of committing it');
}
if (!pointerCancelBlock.includes("finished?.type === 'marqueeCreate'") || !pointerCancelBlock.includes('state.selectionDraft = null')) {
  throw new Error('pointercancel must discard an unfinished marquee selection');
}
if (html.includes("stage.addEventListener('pointercancel', onPointerUp)")) {
  throw new Error('pointercancel must not share the normal pointerup commit path');
}
if (!pointerCancelBlock.includes('restoreAnnotationTransform(finished)')) {
  throw new Error('pointercancel must restore an annotation transform to its drag-start state');
}
const annotationTransformBlock = blockBetween('function annotationTransformChanged', 'function onPointerUp');
if (!annotationTransformBlock.includes('history.push(finished.historySnapshot)') || !annotationTransformBlock.includes('future = []')) {
  throw new Error('a real annotation transform must create one undo entry and clear redo');
}
if (!annotationTransformBlock.includes('function restoreAnnotationTransform')) {
  throw new Error('annotation transform cancellation needs a restore helper');
}
const hitDownBlock = blockBetween('function handleHitDown', 'function startActiveDrag');
if (!hitDownBlock.includes('historySnapshot:snapshot(true)')) {
  throw new Error('annotation move, resize and rotate drags must capture lightweight start history');
}

const snapshotBlock = blockBetween('function snapshot(forHistory=false)', 'function pushHistory');
if (!snapshotBlock.includes('if(!forHistory) record.dataUrl = im.dataUrl')) {
  throw new Error('project saves must retain image data while history snapshots use references');
}
if (!snapshotBlock.includes('if(forHistory) delete record.dataUrl')) {
  throw new Error('history snapshots must not duplicate patch base64 data');
}
const historyBlock = blockBetween('function pushHistory', 'function updateUndoRedo');
if (!historyBlock.includes('snapshot(true)')) throw new Error('undo history must use lightweight snapshots');

const pointerDownBlock = blockBetween('function onPointerDown', 'function handleHitDown');
if (!pointerDownBlock.includes("state.toolArmed === 'select'")) {
  throw new Error('only the select tool may manipulate an existing annotation');
}
const drawDispatchStart = pointerDownBlock.indexOf("state.toolArmed && !['select','marquee','eraser'].includes(state.toolArmed)");
if (drawDispatchStart < 0) {
  throw new Error('drawing tools need an explicit creation-only pointer branch');
}
const drawDispatchEnd = pointerDownBlock.indexOf('if(h && !state.preview)', drawDispatchStart);
if (drawDispatchEnd < 0) throw new Error('drawing-tool dispatch must return before the non-tool hit fallback');
const drawDispatch = pointerDownBlock.slice(drawDispatchStart, drawDispatchEnd);
if (!drawDispatch.includes('beginToolDraw(state.toolArmed, w)')) {
  throw new Error('drawing tools must create over existing content');
}
if (drawDispatch.includes('handleHitDown(h, w, e)')) {
  throw new Error('drawing tools must not move or resize existing annotations');
}
const pointerMoveBlock = blockBetween('function onPointerMove', 'function onPointerUp');
if (!pointerMoveBlock.includes("state.toolArmed === 'select' ? (h?.cursor || 'grab') : 'crosshair'")) {
  throw new Error('only the select tool may show existing-object move and resize cursors');
}

const pasteBlock = blockBetween('async function pastePixelClipboard', 'function cloneAnnotationForDrag');
if (!pasteBlock.includes("state.toolSettings.group = 'select'") || !pasteBlock.includes("state.toolArmed = 'select'")) {
  throw new Error('pasting pixels must switch to the select tool');
}
if (!pasteBlock.includes('setSelectedAnnotation(state.annotations.length - 1, true)')) {
  throw new Error('the newest pasted object must remain selected through the stable selection helper');
}
const pasteRenderIndex = pasteBlock.indexOf('updateModeButtons(); renderProps(); renderToolDock(); requestRender()');
const pasteDecodeIndex = pasteBlock.indexOf('ensurePatchImage(a)');
if (pasteRenderIndex < 0 || pasteDecodeIndex < 0 || pasteRenderIndex > pasteDecodeIndex || pasteBlock.includes('await ensurePatchImage(a)')) {
  throw new Error('a pasted patch must become selectable before asynchronous image decoding finishes');
}
const cloneBlock = blockBetween('function cloneAnnotationForDrag', 'function isLineAnnotation');
if (cloneBlock.includes('JSON.stringify')) {
  throw new Error('dragging a pasted image must not serialize its base64 payload');
}
if (!cloneBlock.includes('points.map')) {
  throw new Error('lightweight annotation clones must still copy mutable path points');
}

const beginToolBlock = blockBetween('function beginToolDraw', 'function addAnnotationAt');
if (!beginToolBlock.includes("if(type === 'text')") || !beginToolBlock.includes('openInlineTextEditor(idx, true')) {
  throw new Error('desktop text creation must immediately open the inline editor');
}
const textInputBlock = blockBetween("inlineTextEditor.addEventListener('input'", "inlineTextEditor.addEventListener('keydown'");
if (!textInputBlock.includes('positionInlineTextEditor()')) {
  throw new Error('the inline editor must resize as text content changes');
}
if (!textInputBlock.includes('ensureInlineTextHistory()')) {
  throw new Error('editing existing inline text must create one undo snapshot on first input');
}
const inlineHistoryBlock = blockBetween('function ensureInlineTextHistory', 'function closeInlineTextEditor');
if (!inlineHistoryBlock.includes('pushHistory()') || !inlineHistoryBlock.includes('inlineTextHistoryStarted = true')) {
  throw new Error('inline text history must be recorded once before changing the annotation');
}
const textBlurBlock = blockBetween("inlineTextEditor.addEventListener('blur'", 'function updateAnnotationInput');
if (!textBlurBlock.includes('setTimeout') || !textBlurBlock.includes('blurredTextIndex')) {
  throw new Error('inline text blur must defer DOM rebuilding until the pending tool click completes');
}
const textPositionBlock = blockBetween('function positionInlineTextEditor', 'function openInlineTextEditor');
if (['Math.max(24', 'Math.max(16', 'Math.max(6', 'Math.max(8'].some(token => textPositionBlock.includes(token))) {
  throw new Error('inline text dimensions must use exact zoomed Canvas metrics without hard minimums');
}
const doubleClickBlock = blockBetween("stage.addEventListener('dblclick'", "document.addEventListener('keydown'");
if (!doubleClickBlock.includes("state.toolArmed === 'select'")) {
  throw new Error('double-click editing must be restricted to the select tool');
}
if (!doubleClickBlock.includes("h?.type === 'annotationSelect'")) {
  throw new Error('double-click editing must use the actual annotationSelect hit area');
}
if (doubleClickBlock.includes("h?.type === 'annotation'")) {
  throw new Error('legacy annotation hit type prevents double-click text editing');
}
if (!doubleClickBlock.includes('const textAnnotation = state.annotations[h.index]') || !doubleClickBlock.includes("textAnnotation?.type === 'text'")) {
  throw new Error('double-click text editing must validate the current annotation index and type before selection');
}

const textMetricsBlock = blockBetween('function measureTextAnnotation', 'function annotationLocalSize');
for (const token of ['contentWidth', 'contentHeight', 'padX', 'padY']) {
  if (!textMetricsBlock.includes(token)) throw new Error(`text layout metrics missing ${token}`);
}
const measureTextAnnotation = new Function('document', `return (${textMetricsBlock.trim()});`)({
  createElement: () => ({
    getContext: () => ({font: '', measureText: text => ({width: String(text).length * 8})})
  })
});
const singleLineMetrics = measureTextAnnotation({type:'text', text:'输入文字', fontSize:14, vertical:false});
const multiLineMetrics = measureTextAnnotation({type:'text', text:'第一行\n第二行', fontSize:14, vertical:false});
const verticalMetrics = measureTextAnnotation({type:'text', text:'竖排文字', fontSize:14, vertical:true});
const verticalColumnsMetrics = measureTextAnnotation({type:'text', text:'右列\n左列', fontSize:14, vertical:true});
if (singleLineMetrics.width !== singleLineMetrics.contentWidth + singleLineMetrics.padX * 2) {
  throw new Error('text selection width must equal content plus shared horizontal padding');
}
if (multiLineMetrics.contentHeight !== singleLineMetrics.contentHeight * 2) {
  throw new Error('multiline text height must grow by one shared line height per line');
}
if (verticalMetrics.lines.length !== 4 || verticalMetrics.contentHeight <= singleLineMetrics.contentHeight) {
  throw new Error('vertical text metrics must allocate one line step per character');
}
if (verticalColumnsMetrics.columns.length !== 2 || verticalColumnsMetrics.contentWidth <= verticalMetrics.contentWidth) {
  throw new Error('vertical text newlines must create additional columns instead of merging content');
}
const makeAnnotationBlock = blockBetween('function makeAnnotation', 'function shouldCommitToolDraft');
if (!makeAnnotationBlock.includes("text:s.textValue || '输入文字'")) {
  throw new Error('new text must expose a selectable default value for immediate editing');
}

const keyBlockSelectOnly = blockBetween('function handleKey', 'function nudge');
if (!keyBlockSelectOnly.includes("state.mode === 'tools' && state.toolArmed === 'select' && state.selected?.type === 'annotation'")) {
  throw new Error('keyboard annotation deletion and clipboard actions must require the select tool');
}
const nudgeBlock = blockBetween('function nudge', 'function amountSign');
if (!nudgeBlock.includes("state.mode === 'tools' && state.toolArmed === 'select' && state.selected?.type === 'annotation'")) {
  throw new Error('arrow-key annotation movement must require the select tool');
}


const selectionFinalizeBlock = blockBetween('async function finalizeSelectionAsTransform', 'function cloneAnnotationForDrag');
for (const token of ["type:'patch'", "type:'cutout'", 'switchToTransformTool']) {
  if (!selectionFinalizeBlock.includes(token)) throw new Error(`selection auto-transform missing ${token}`);
}

const toolCommitBlock = blockBetween('function commitToolDraft', 'function cancelToolDraft');
if (!toolCommitBlock.includes('switchToTransformTool')) {
  throw new Error('committed annotations must automatically enter select/transform mode');
}

const pasteExternalBlock = blockBetween('async function pasteExternalImageAsAnnotation', 'function inferAutoOrientation');
if (!pasteExternalBlock.includes("type:'patch'") || !pasteExternalBlock.includes('switchToTransformTool')) {
  throw new Error('external clipboard images must become editable patch objects');
}

console.log('tool_interaction_check ok');
