const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.resolve(__dirname, '..', 'LongShotStitch.html'), 'utf8');

function blockBetween(startToken, endToken) {
  const start = html.indexOf(startToken);
  const end = html.indexOf(endToken, start + startToken.length);
  if (start < 0 || end < 0) throw new Error(`missing block: ${startToken}`);
  return html.slice(start, end);
}

const required = [
  "const APP_VERSION = 'v1.45.0'",
  "canvasPadding: { top: 0, right: 0, bottom: 0, left: 0 }",
  "canvasBackground: '#ffffff'",
  "eraserMode:'local'",
  'pointInsideAnnotationErasure',
  'drawAnnotationWithErasures',
  'applyCanvasExpansion',
  'classifyCanvasShrinkSelection',
  'deleteAndShrinkSelection',
  'computeExportTargetSize',
  'exportResizeEnabled',
  'data-photo-preset="one-inch"',
  'data-photo-preset="two-inch"',
  'data-selection-action="shrink"'
];
for (const token of required) {
  if (!html.includes(token)) throw new Error(`missing canvas editing token: ${token}`);
}

const drawBlock = blockBetween('function drawAnnotations', 'function annotationRawBounds');
if (!drawBlock.includes('inlineTextIndex === i') || !drawBlock.includes('!exportMode')) {
  throw new Error('inline text editing must suppress the duplicate Canvas text object');
}

const commitBlock = blockBetween('function commitToolDraft', 'function cancelToolDraft');
if (!commitBlock.includes("['pen','highlight','mosaicPen']") || !commitBlock.includes('state.selected = null')) {
  throw new Error('continuous drawing tools must remain active without a selection frame');
}

const setToolBlock = blockBetween('function setToolGroup', 'function mobileToolGroupTap');
if (!setToolBlock.includes("sameGroup && group === 'select'") || !setToolBlock.includes('state.selected = null')) {
  throw new Error('clicking the active select tool must clear the selection');
}

const shrinkSource = blockBetween('function classifyCanvasShrinkSelection', 'async function deleteAndShrinkSelection').trim();
const classifyCanvasShrinkSelection = new Function(`return (${shrinkSource});`)();
const full = {fullWidth:100, fullHeight:80};
let result = classifyCanvasShrinkSelection({shape:'rect',x:0,y:0,w:100,h:10,ready:true}, full);
if (result?.axis !== 'y' || result.start !== 0 || result.end !== 10) throw new Error('top full-width strip must be shrinkable');
result = classifyCanvasShrinkSelection({shape:'rect',x:0,y:25,w:100,h:10,ready:true}, full);
if (result?.axis !== 'y' || result.start !== 25 || result.end !== 35) throw new Error('internal full-width strip must be shrinkable');
result = classifyCanvasShrinkSelection({shape:'rect',x:20,y:0,w:30,h:10,ready:true}, full);
if (result?.axis !== 'y' || result.start !== 0 || result.end !== 10) throw new Error('single-edge selection must map to an edge band');
result = classifyCanvasShrinkSelection({shape:'rect',x:20,y:20,w:30,h:10,ready:true}, full);
if (result !== null) throw new Error('ordinary internal rectangle must not shrink the canvas');
result = classifyCanvasShrinkSelection({shape:'ellipse',x:0,y:0,w:100,h:10,ready:true}, full);
if (result !== null) throw new Error('non-rectangular selections must not shrink the canvas');

const exportSource = blockBetween('function computeExportTargetSize', 'function exportTargetSettings').trim();
const computeExportTargetSize = new Function(`return (${exportSource});`)();
result = computeExportTargetSize(256, 256, {enabled:true,width:128,height:128,lockRatio:true});
if (result.width !== 128 || result.height !== 128) throw new Error('exact icon export size failed');
result = computeExportTargetSize(400, 300, {enabled:true,width:200,height:0,lockRatio:true});
if (result.width !== 200 || result.height !== 150) throw new Error('locked export aspect ratio failed');

console.log('canvas_editing_check ok');
