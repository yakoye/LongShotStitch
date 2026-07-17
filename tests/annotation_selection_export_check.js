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

if (!html.includes("const APP_VERSION = 'v1.47.0'")) {
  throw new Error('version must be bumped to v1.47.0');
}

const overlay = blockBetween('function drawToolsOverlay', 'function measureTextAnnotation');
if (!overlay.includes("drag?.type === 'toolCreate'")) {
  throw new Error('active drawing drafts must suppress the selection overlay');
}
if (!overlay.includes('drawFreePathSelectionHandles(c, a')) {
  throw new Error('committed free paths must expose endpoint markers');
}

const selectionHelpers = blockBetween('function selectedAnnotationIndex', 'function setToolGroup');
for (const token of ['function selectedAnnotation()', 'function setSelectedAnnotation', 'function toggleSelectedAnnotationProperties']) {
  if (!selectionHelpers.includes(token)) throw new Error(`stable annotation selection helper missing: ${token}`);
}

const selectBlock = blockBetween('function selectAnnotationForEdit', 'function switchToTransformTool');
if (!selectBlock.includes('setSelectedAnnotation(index, openProperties)')) {
  throw new Error('annotation selection must respect the requested property-panel state');
}
if (!selectBlock.includes('openProperties=isDesktopLayout()')) {
  throw new Error('mobile selection must keep properties closed on the first tap');
}

const commitBlock = blockBetween('function commitToolDraft', 'function cancelToolDraft');
if (!commitBlock.includes('setSelectedAnnotation(finished.index, isDesktopLayout())')) {
  throw new Error('a completed freehand stroke must remain selected without forcing mobile properties open');
}
if (commitBlock.includes("state.selected = null;\n      state.mobileToolPopoverOpen = isDesktopLayout();")) {
  throw new Error('freehand completion must not clear the selected object');
}

if (!html.includes('width:min(360px,calc(100vw - 20px))')) {
  throw new Error('export popup must have an explicit compact width');
}
if (!html.includes('.photo-mm-row input{width:72px')) {
  throw new Error('photo-size number inputs must be compact');
}
if (!html.includes('.export-size-grid input{width:76px')) {
  throw new Error('export width and height inputs must be compact');
}

const directAnnotationSelections = html.match(/state\.selected\s*=\s*\{type:'annotation'/g) || [];
if (directAnnotationSelections.length !== 1) {
  throw new Error('all annotation selections except the stable helper must route through setSelectedAnnotation');
}
if (!html.includes('长图拼裁工具 v1.47.0')) {
  throw new Error('visible application version must be v1.47.0');
}

console.log('annotation_selection_export_check ok');
