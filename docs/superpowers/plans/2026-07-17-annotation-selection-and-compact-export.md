# Annotation Selection and Compact Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make freehand drawing overlays unobtrusive, make selected-object properties consistently appear, and redesign the export menu into a compact, number-focused panel.

**Architecture:** Keep the single-file Canvas application and existing annotation object model. Add stable annotation-selection helpers keyed by annotation ID, separate active drawing drafts from committed selection overlays, and constrain export panel intrinsic sizing through explicit CSS grid widths. Regression checks remain source-level Node tests, supplemented by Chromium screenshots and runtime DOM assertions.

**Tech Stack:** HTML, CSS, vanilla JavaScript Canvas API, Node.js regression scripts, Chromium DevTools Protocol.

---

### Task 1: Lock the reported behavior with failing tests

**Files:**
- Create: `tests/annotation_selection_export_check.js`
- Modify: `tests/test_plan.md`

- [x] **Step 1: Write the failing test**

```js
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.resolve(__dirname, '..', 'LongShotStitch.html'), 'utf8');

function blockBetween(startToken, endToken){
  const start = html.indexOf(startToken);
  const end = html.indexOf(endToken, start + startToken.length);
  if(start < 0 || end < 0) throw new Error(`missing block: ${startToken}`);
  return html.slice(start, end);
}

if(!html.includes("const APP_VERSION = 'v1.46.0'")) throw new Error('version not bumped');
const overlay = blockBetween('function drawToolsOverlay', 'function measureTextAnnotation');
if(!overlay.includes("drag?.type === 'toolCreate'")) throw new Error('active drawing draft must suppress selection overlay');
if(!overlay.includes('drawFreePathSelectionHandles')) throw new Error('committed free paths need endpoint handles');
const select = blockBetween('function selectedAnnotationIndex', 'function switchToTransformTool');
if(!select.includes('state.mobileToolPopoverOpen = true')) throw new Error('selecting any annotation must open its property panel');
if(!html.includes('width:min(360px,calc(100vw - 20px))')) throw new Error('export panel must be explicitly compact');
if(!html.includes('.photo-mm-row input{width:72px')) throw new Error('photo numeric fields must be compact');
console.log('annotation_selection_export_check ok');
```

- [x] **Step 2: Run test to verify it fails**

Run: `node tests/annotation_selection_export_check.js`
Expected: FAIL because v1.45.0 lacks the new selection helper and compact export constraints.

- [x] **Step 3: Record the scenario in the test plan**

Add manual cases for drawing without a live dashed frame, selecting every annotation type to show the matching property panel, and measuring the export popup at desktop and mobile widths.

### Task 2: Separate drawing drafts from selection overlays

**Files:**
- Modify: `LongShotStitch.html`
- Test: `tests/annotation_selection_export_check.js`

- [x] **Step 1: Implement draft-overlay suppression**

Inside `drawToolsOverlay`, compute:

```js
const activeToolDraft = drag?.type === 'toolCreate' && drag.index === i;
const selected = state.selected?.type === 'annotation' && selectedAnnotationIndex() === i && inlineTextIndex !== i && !activeToolDraft;
```

This prevents the bounding overlay from appearing while the pointer is still drawing.

- [x] **Step 2: Show free-path endpoints after commit**

Use `drawFreePathSelectionHandles(c, a)` for selected `pen`, `highlight`, and `mosaicPen` objects while preserving their eight resize handles and rotation control after the stroke is committed.

- [x] **Step 3: Keep the completed freehand stroke selected without switching tools**

In `commitToolDraft`, select the newly committed free path and open its property panel, but keep `toolSettings.group` and `toolArmed` on the current freehand tool so the next pointer-down starts a new stroke.

- [x] **Step 4: Run the regression test**

Run: `node tests/annotation_selection_export_check.js`
Expected: The overlay-related assertions pass; export assertions may still fail until Task 4.

### Task 3: Make annotation selection and properties stable

**Files:**
- Modify: `LongShotStitch.html`
- Test: `tests/annotation_selection_export_check.js`

- [x] **Step 1: Add stable selection helpers**

```js
function selectedAnnotationIndex(){
  if(state.selected?.type !== 'annotation') return -1;
  const id = state.selected.id;
  let index = Number.isInteger(state.selected.index) ? state.selected.index : -1;
  if(id){
    const byId = state.annotations.findIndex(a => a?.id === id);
    if(byId >= 0) index = byId;
  }
  if(index < 0 || !state.annotations[index]) return -1;
  state.selected.index = index;
  state.selected.id = state.annotations[index].id;
  return index;
}

function selectedAnnotation(){
  const index = selectedAnnotationIndex();
  return index >= 0 ? state.annotations[index] : null;
}

function setSelectedAnnotation(index, openProperties=true){
  const annotation = state.annotations[index];
  if(!annotation) return false;
  state.selected = {type:'annotation', index, id:annotation.id};
  if(openProperties) state.mobileToolPopoverOpen = true;
  return true;
}
```

- [x] **Step 2: Route selection paths through the helper**

Replace direct annotation-selection assignments in pointer hit handling, creation, paste, duplicate, layer reordering, clipboard, keyboard movement, and property updates with `setSelectedAnnotation` and `selectedAnnotationIndex`.

- [x] **Step 3: Keep the property panel open for every selected object**

`selectAnnotationForEdit` must always set `mobileToolPopoverOpen = true`, on desktop and mobile. Rendering an annotation selection must use the stable helper, not a stale array index.

- [x] **Step 4: Run all annotation tests**

Run:

```bash
node tests/annotation_selection_export_check.js
node tests/annotation_maturity_check.js
node tests/annotation_tool_matrix_check.js
node tests/tool_interaction_check.js
```

Expected: all commands exit 0.

### Task 4: Redesign the export panel for compact numeric entry

**Files:**
- Modify: `LongShotStitch.html`
- Test: `tests/annotation_selection_export_check.js`

- [x] **Step 1: Constrain the popup width**

Set the export menu to an explicit desktop width no larger than 360 px and a mobile width that fits within the viewport:

```css
.export-menu{right:10px;width:min(360px,calc(100vw - 20px));min-width:0}
```

- [x] **Step 2: Compact output-size controls**

Use an inline size row, 72 px numeric inputs, and a compact fit select. Inputs should use `font-variant-numeric: tabular-nums` and right alignment.

- [x] **Step 3: Compact photo fields**

Use fixed compact columns for millimetre width, millimetre height, and DPI:

```css
.photo-mm-row{grid-template-columns:72px 72px 82px auto}
.photo-mm-row input{width:72px;min-width:0}
.photo-mm-row input:last-of-type{width:82px}
```

- [x] **Step 4: Run the focused test**

Run: `node tests/annotation_selection_export_check.js`
Expected: PASS.

### Task 5: Version, documentation, and full verification

**Files:**
- Modify: `LongShotStitch.html`
- Modify: `index.html`
- Modify: `README.md`
- Modify: `TOOL_UI_REQUIREMENTS.md`
- Modify: `docs/LongShotStitch标注系统任务书.md`
- Create: `docs/v1.46.0修改记录.md`

- [x] **Step 1: Bump version strings to v1.46.0**

Update application constant, title/about text, README, and static-test expectations.

- [x] **Step 2: Synchronize the publishing entry**

Run: `cp LongShotStitch.html index.html`
Expected: `cmp -s LongShotStitch.html index.html` exits 0.

- [x] **Step 3: Run the complete test suite**

Run:

```bash
for test in tests/*_check.js; do node "$test"; done
node --check <(python extraction helper) # or extract the inline script to a temporary .js and run node --check
```

Expected: every test prints `ok`; JavaScript syntax check exits 0.

- [x] **Step 4: Run Chromium runtime verification**

Inject the single-file page into an `about:blank` Chromium document (the environment blocks file/data/localhost navigation), insert a sample image through the file input, open the export menu, and verify through CDP that its rendered width is at most 360 px. Draw a pen stroke and verify no selection-frame dash is rendered during pointer movement, then verify the selected annotation property popup is visible after pointer-up.

- [x] **Step 5: Package and re-test the package**

Create `LongShotStitch-v1.46.0.zip`, extract it into a clean directory, and rerun the full test suite from the extracted copy.

- [x] **Step 6: Commit**

```bash
git add LongShotStitch.html index.html README.md TOOL_UI_REQUIREMENTS.md docs tests
git commit -m "fix: stabilize annotation properties and compact export panel"
git push origin main
```
