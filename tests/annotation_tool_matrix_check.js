const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '..', 'LongShotStitch.html'), 'utf8');

const groups = ['select','marquee','shape','pen','arrow','text','badge','mosaic','eraser','watermark'];
for (const group of groups) {
  if (!html.includes(`['${group}'`) && !html.includes(`data-tool-group="${group}"`)) {
    throw new Error(`missing annotation group: ${group}`);
  }
}
for (const mobileGroup of ['select','marquee','shape','pen','arrow','text','badge','mosaic','eraser','watermark']) {
  if (!html.includes(`class="mobile-tool-group`) || !html.includes(`data-tool-group="${mobileGroup}"`)) {
    throw new Error(`mobile annotation group missing: ${mobileGroup}`);
  }
}

const createdTypes = ['box','boxFill','circle','circleFill','line','arrow','doubleArrow','text','badge','watermark','pen','highlight','mosaic','mosaicPen'];
for (const type of createdTypes) {
  if (!html.includes(`type === '${type}'`) && !html.includes(`type==='${type}'`)) {
    throw new Error(`annotation type not implemented: ${type}`);
  }
}

const requiredBehavior = [
  'switchToTransformTool(finished.index)',
  "if(type === 'text')",
  'openInlineTextEditor',
  'openMobileTextEditor',
  'annotationResizeHandles',
  'annotationRotate',
  'annotationLineStart',
  'annotationLineEnd',
  'deleteSelectedAnnotation',
  'duplicateSelectedAnnotation',
  'moveSelectedAnnotationLayer',
  'copyPixelSelection',
  'cutPixelSelection',
  'pastePixelClipboard'
];
for (const token of requiredBehavior) {
  if (!html.includes(token)) throw new Error(`missing annotation behavior: ${token}`);
}

if (html.includes('data-tool-setting="textBg"') || html.includes('data-ann="bg"')) {
  throw new Error('text background controls returned');
}
const popStart = html.indexOf('function annotationPopover');
const popEnd = html.indexOf('function updateAnnotationInput', popStart);
const popover = html.slice(popStart, popEnd);
const mosaicStart = popover.indexOf("if(a.type==='mosaic' || a.type==='mosaicPen')");
if (mosaicStart < 0) throw new Error('mosaic edit panel branch missing');
const mosaicEnd = popover.indexOf('return annotationPopover', mosaicStart);
const mosaicBlock = popover.slice(mosaicStart, mosaicEnd > mosaicStart ? mosaicEnd : undefined);
if (mosaicBlock.includes("colorPalette('color'")) {
  throw new Error('mosaic edit panel must not show an ineffective color control');
}
if (!html.includes("state.annotations[idx]?.type === 'watermark'")) {
  throw new Error('single-watermark behavior must be preserved during duplication');
}

console.log('annotation_tool_matrix_check ok');
