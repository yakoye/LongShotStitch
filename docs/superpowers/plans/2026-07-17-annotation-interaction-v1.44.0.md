# Annotation Interaction v1.44.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Upgrade LongShotStitch annotations to mature-editor behavior with Shift constraints, eight resize handles, z-order controls, configurable selection-hole fill, and cleaner text editing.

**Architecture:** Keep the single-file Canvas object model. Treat `state.annotations` order as the visual layer stack, add explicit helpers for geometric constraints and layer movement, and store the source-hole fill mode on each `cutout` object so projects and undo/redo preserve the result. Tests first lock down each interaction before implementation.

**Tech Stack:** HTML/CSS, vanilla JavaScript, Canvas 2D, Node.js static/behavior checks.

---

### Task 1: Version and regression tests

**Files:**
- Modify: `tests/entry_check.js`
- Modify: `tests/static_check.js`
- Create: `tests/annotation_maturity_check.js`
- Create: `tests/annotation_tool_matrix_check.js`

- [x] **Step 1: Write failing tests** covering `v1.44.0`, Shift-constrained geometry, eight resize handles, layer operations, cutout fill modes, and removal of text background controls.
- [x] **Step 2: Run tests and verify failure** with missing helper/function tokens from v1.43.0.
- [x] **Step 3: Keep existing v1.43.0 regression checks active** while updating only version assertions.

### Task 2: Shift-constrained drawing

**Files:**
- Modify: `LongShotStitch.html`
- Test: `tests/annotation_maturity_check.js`

- [x] **Step 1: Add `snapVectorToAngle`** to snap line/arrow endpoints to 45-degree increments while Shift is held.
- [x] **Step 2: Add `constrainBoxFromStart`** so rectangle, ellipse, mosaic, redact, and marquee creation become square/circular with Shift.
- [x] **Step 3: Add `applyShiftPenConstraint`** so Shift during pencil/highlighter/free-mosaic drawing replaces the live tail with a straight segment from the point where Shift began.
- [x] **Step 4: Preserve normal freehand behavior immediately after Shift is released.**

### Task 3: Mature resize handles

**Files:**
- Modify: `LongShotStitch.html`
- Test: `tests/annotation_maturity_check.js`

- [x] **Step 1: Expand `annotationFrame`** to expose four corner and four edge handles.
- [x] **Step 2: Render all eight handles** with matching diagonal/horizontal/vertical cursors.
- [x] **Step 3: Add `resizeAnnotationFromHandle`** so edge handles resize one axis and corner handles resize two axes.
- [x] **Step 4: Hold Shift to preserve the drag-start aspect ratio** for corner resizing; text, watermark, and badge continue to resize through font size.
- [x] **Step 5: Keep rotation and line endpoint editing unchanged.**

### Task 4: Layer stack controls

**Files:**
- Modify: `LongShotStitch.html`
- Test: `tests/annotation_maturity_check.js`

- [x] **Step 1: Add `moveSelectedAnnotationLayer(action)`** supporting `front`, `forward`, `backward`, and `back`.
- [x] **Step 2: Add compact layer buttons** to every selected annotation popover.
- [x] **Step 3: Keep the selected object selected after reordering** by tracking object id rather than stale index.
- [x] **Step 4: Add keyboard shortcuts** `Ctrl/Cmd+]`, `Ctrl/Cmd+[`, and their Shift variants for top/bottom.

### Task 5: Selection-hole fill modes

**Files:**
- Modify: `LongShotStitch.html`
- Test: `tests/annotation_maturity_check.js`

- [x] **Step 1: Add tool settings** `selectionFillMode` and `selectionFillColor`.
- [x] **Step 2: Expose fill choices** transparent, white, black, and custom color in the marquee popover.
- [x] **Step 3: Store `fillMode` and `fillColor` on new cutout objects** created by auto-transform and explicit Cut.
- [x] **Step 4: Render transparent holes with `destination-out`; render other modes with normal fill.**
- [x] **Step 5: Preserve fill properties through project save, undo/redo, copy, and export.**

### Task 6: Text tool cleanup

**Files:**
- Modify: `LongShotStitch.html`
- Test: `tests/annotation_maturity_check.js`

- [x] **Step 1: Remove text background swatches** from new-text and selected-text panels.
- [x] **Step 2: Force new and existing text annotations to use transparent background.**
- [x] **Step 3: Keep outline, color, font size, vertical layout, inline editing, and secondary editing.**
- [x] **Step 4: Use a subtle edit outline only while typing; do not export any text box.**

### Task 7: Annotation consistency audit

**Files:**
- Modify: `LongShotStitch.html`
- Modify: `README.md`
- Create: `docs/v1.44.0修改记录.md`
- Modify: `docs/LongShotStitch标注系统任务书.md`
- Modify: `tests/test_plan.md`

- [x] **Step 1: Verify every creation tool auto-selects the new object.**
- [x] **Step 2: Verify move, resize, rotate, duplicate, delete, layer order, undo, redo, copy, cut, and paste.**
- [x] **Step 3: Update user-facing help and version history** with the actual Shift and layer behavior.
- [x] **Step 4: Sync `index.html` from `LongShotStitch.html`.**

### Task 8: Final verification and package

**Files:**
- Verify: all files above

- [x] **Step 1: Run every Node test** and require zero failures.
- [x] **Step 2: Run JavaScript syntax smoke check.**
- [x] **Step 3: Confirm `index.html` and `LongShotStitch.html` are byte-identical.**
- [x] **Step 4: Run `git diff --check` equivalent whitespace validation.**
- [x] **Step 5: Package as `LongShotStitch-v1.44.0.zip` and verify the unpacked package again.**
