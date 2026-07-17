const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '..', 'LongShotStitch.html'), 'utf8');

function blockBetween(startToken, endToken) {
  const start = html.indexOf(startToken);
  const end = html.indexOf(endToken, start + startToken.length);
  if (start < 0 || end < 0) throw new Error(`missing block: ${startToken}`);
  return html.slice(start, end);
}

if (!html.includes("const APP_VERSION = 'v1.47.0'")) throw new Error('version must be v1.47.0');
if (!html.includes('SUPERPOWERS_REQUIREMENTS.md')) throw new Error('HTML must reference SUPERPOWERS_REQUIREMENTS.md');
if (html.includes('POWERSTORM_REQUIREMENTS.md')) throw new Error('legacy POWERSTORM reference remains');

const mobileTools = blockBetween('id="mobileAnnotationTools"', '</div>\n  </nav>');
const expectedOrder = ['select','marquee','shape','pen','arrow','text','badge','mosaic','eraser','watermark'];
let cursor = -1;
for (const group of expectedOrder) {
  const next = mobileTools.indexOf(`data-tool-group="${group}"`);
  if (next < 0) throw new Error(`mobile tool missing: ${group}`);
  if (next <= cursor) throw new Error(`mobile tool order mismatch at: ${group}`);
  cursor = next;
}

if (html.includes('.inline-text-editor.mobile-text-mode{position:fixed')) {
  throw new Error('mobile text editor must not become a fixed full-screen-style panel');
}
const positionEditor = blockBetween('function positionInlineTextEditor', 'function openInlineTextEditor');
if (positionEditor.includes("if(inlineTextEditor.classList.contains('mobile-text-mode')) return")) {
  throw new Error('mobile text editor must use the same object-aligned positioning path');
}
if (html.includes('.inline-text-editor.mobile-text-mode{min-width:44px')) throw new Error('mobile text editor must match the actual text box width');
const openInline = blockBetween('function openInlineTextEditor', 'function openMobileTextEditor');
if (!openInline.includes('setTimeout') || !openInline.includes('preventScroll')) throw new Error('desktop text focus must wait until the canvas pointer sequence finishes');
for (const token of ['m.width * z', 'm.height * z', 'boxSizing']) {
  if (!positionEditor.includes(token)) throw new Error(`shared text editor box metric missing: ${token}`);
}

const textMetrics = blockBetween('function measureTextAnnotation', 'function annotationLocalSize');
for (const token of ['actualBoundingBoxAscent', 'actualBoundingBoxDescent', 'baselineOffset']) {
  if (!textMetrics.includes(token)) throw new Error(`centered text metric missing: ${token}`);
}
const drawText = blockBetween("} else if(a.type === 'text' || a.type === 'watermark'){", "} else if(a.type === 'badge'){");
if (!drawText.includes("c.textBaseline = 'alphabetic'")) throw new Error('canvas text must use the measured alphabetic baseline');
if (!drawText.includes('m.baselineOffset')) throw new Error('canvas text must use centered baselineOffset');

const annotationHit = blockBetween("if(h.type === 'annotationSelect')", "if(h.type === 'annotationResize')");
if (annotationHit.includes('openMobileTextEditor')) throw new Error('single tap on mobile text must not enter content editing');
if (!annotationHit.includes('wasSelected')) throw new Error('annotation tap must remember whether the object was already selected');
if (!annotationHit.includes('openProperties:isDesktopLayout()')) throw new Error('single mobile selection must keep properties closed');

const pointerUp = blockBetween('function onPointerUp', 'function onPointerCancel');
if (!pointerUp.includes('toggleSelectedAnnotationProperties')) throw new Error('second tap must toggle selected object properties');
if (!html.includes('centerMoveRect')) throw new Error('small selected objects need a reliable central drag zone');

const selectedHelpers = blockBetween('function setSelectedAnnotation', 'function findExistingWatermarkIndex');
if (!selectedHelpers.includes('function toggleSelectedAnnotationProperties')) throw new Error('stable property toggle helper missing');
if (!selectedHelpers.includes('avoidSelectedAnnotationOcclusion')) throw new Error('mobile property panel must avoid covering the selected object');

const annotationPopover = blockBetween('function annotationPopover', 'function updateAnnotationInput');
if (!annotationPopover.includes('data-edit-text')) throw new Error('text object must expose an explicit edit action');
if (!html.includes('function geometryInputs') || !html.includes('geometry-inputs')) throw new Error('precise geometry controls must be separately hideable on mobile');
if (!annotationPopover.includes('objectControlRow')) throw new Error('layer and object actions must share a compact row');

for (const token of [
  '--ui-control-height:28px',
  '.tool-popover{',
  '.pop-inline{display:flex;align-items:center;gap:4px;flex-wrap:nowrap',
  '.geometry-inputs{',
  '.tool-panel-card .tool-popover{position:static;display:block;min-width:0;width:100%;max-width:100%',
  '.mobile-annotation-tools'
]) {
  if (!html.includes(token)) throw new Error(`unified compact UI token missing: ${token}`);
}

console.log('mobile_annotation_ui_check ok');
