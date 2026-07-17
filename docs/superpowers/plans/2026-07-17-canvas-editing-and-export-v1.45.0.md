# Canvas Editing and Exact Export v1.45.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 修复文字与连续画笔交互，并增加局部橡皮、取消选择、画布扩展、删除并收缩画布以及指定像素/证件照尺寸导出。

**Architecture:** 保持单文件静态网页架构。画布扩展通过持久化 `canvasPadding` 与背景色实现，不拉伸原图；删除收缩通过选区分类函数限制为边缘带、整宽横带或整高竖带。导出尺寸只作用于最终输出，不修改工程内部对象坐标。

**Tech Stack:** HTML、CSS、原生 JavaScript、Canvas 2D、Node.js 静态回归脚本。

---

### Task 1: Add regression tests

**Files:**
- Create: `tests/canvas_editing_check.js`
- Modify: `tests/entry_check.js`
- Modify: `tests/static_check.js`

- [x] **Step 1: Write failing checks**

检查 `v1.45.0`、文字编辑期间跳过 Canvas 文字、连续画笔提交后保持当前工具、空白点击与重复点击选择按钮取消选中、局部/对象橡皮模式、`canvasPadding`、选区收缩分类、精确导出尺寸和常用证件照预设。

- [x] **Step 2: Run tests and verify failure**

Run: `node tests/canvas_editing_check.js`
Expected: FAIL because v1.45.0 implementation tokens are absent.

### Task 2: Fix annotation editing interactions

**Files:**
- Modify: `LongShotStitch.html`
- Modify: `index.html`

- [x] **Step 1: Hide the Canvas text object while its textarea is active**

在非导出绘制中，当 `inlineTextIndex` 指向当前文字对象时跳过该对象，编辑完成后恢复 Canvas 绘制。

- [x] **Step 2: Keep continuous tools active after one stroke**

`pen`、`highlight`、`mosaicPen` 提交后清除选中但保持原工具；形状、箭头和矩形马赛克仍自动进入变换。

- [x] **Step 3: Add deselection rules**

选择模式下单击空白、再次点击“选择”按钮或按 `Esc` 均取消对象选中；拖动画布超过阈值时不触发取消选择。

- [x] **Step 4: Add local eraser mode**

默认把擦除轨迹记录在对象的 `erasures` 数组，通过对象级离屏合成只擦除该对象；“对象”模式保留整对象删除。

### Task 3: Add canvas expansion

**Files:**
- Modify: `LongShotStitch.html`
- Modify: `index.html`

- [x] **Step 1: Persist canvas padding and background**

在状态快照中保存 `canvasPadding` 与 `canvasBackground`，布局计算时给内容增加左上偏移和四边尺寸。

- [x] **Step 2: Add expansion controls**

整体裁剪面板增加四边像素、最终宽高、比例锁定、九宫格锚点和背景色；应用时只扩大画布并平移标注。

### Task 4: Add delete-and-shrink selection

**Files:**
- Modify: `LongShotStitch.html`
- Modify: `index.html`

- [x] **Step 1: Implement selection classification**

矩形选区仅在贴单边、横跨全宽或纵跨全高时返回可收缩带；内部普通矩形、椭圆、自由选区及角落双边歧义选区拒绝收缩。

- [x] **Step 2: Apply edge shrink without flattening**

顶部、底部、左侧、右侧删除复用整体裁剪提交，保留标注对象和工程结构。

- [x] **Step 3: Apply internal full-width/full-height strip deletion**

内部整宽横带或整高竖带生成删除后的单张底图；未跨带标注保持为对象并按删除方向平移，跨带对象转为可编辑贴图片段，避免视觉内容残留。

### Task 5: Add exact-size export

**Files:**
- Modify: `LongShotStitch.html`
- Modify: `index.html`

- [x] **Step 1: Add export size state and UI**

导出菜单增加原尺寸/自定义尺寸、宽高比例锁定、填满裁边/完整适应，以及常用 1 寸、2 寸预设和自定义毫米/DPI。

- [x] **Step 2: Scale the final export canvas**

PNG、JPEG、WebP、SVG 与预览估算统一使用目标尺寸；不改变工程内图片、选区和标注坐标。

### Task 6: Documentation and verification

**Files:**
- Modify: `README.md`
- Modify: `TOOL_UI_REQUIREMENTS.md`
- Modify: `docs/LongShotStitch标注系统任务书.md`
- Create: `docs/v1.45.0修改记录.md`

- [x] **Step 1: Document behavior and shortcuts**

记录选区 C 规则、连续画笔、局部橡皮、扩图与精确输出。

- [x] **Step 2: Run full verification**

Run:

```bash
node tests/entry_check.js
node tests/annotation_maturity_check.js
node tests/annotation_tool_matrix_check.js
node tests/canvas_editing_check.js
node tests/static_check.js
node tests/smoke_check.js
node tests/drag_math_check.js
node tests/tool_interaction_check.js
cmp -s LongShotStitch.html index.html
git diff --check
```

Expected: all checks exit 0 and both entry files are identical.
