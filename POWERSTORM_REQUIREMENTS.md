# Powerstorm 开发约束 / Development Requirements

适用项目：LongShotStitch 长图拼接裁剪工具。

## 1. 版本与交付

- 每次开发必须明确本版范围，不能把未确认需求混入当前版本。
- 每次交付必须更新版本号。
- HTML 交付文件必须命名为 `LongShotStitch_vx.x.html`。
- ZIP 交付文件必须命名为 `LongShotStitch_vx.x.zip`。
- 可以保留 `index.html` 作为当前最新版入口，但用户下载和归档以 `LongShotStitch_vx.x.html` 为准。
- 每次开发前必须备份上一版，例如 `index_v1.6_before_v1.7.html`。

## 2. 功能边界

- 已确认正常的功能不要随意重构。
- 修改工具模式时，不应破坏整体裁剪、单图裁剪、拼接线、分割线。
- 修改裁剪/分割/拼接时，不应破坏工具标注与导出。
- 用户明确说“不要改坏”的功能，本版除非必要不得修改核心逻辑。

## 3. 桌面端与手机端

- 每次 UI 修改必须分别考虑 desktop 和 mobile。
- 桌面端优先使用：顶部工具栏 + 左侧模式栏/属性栏 + 中间画布。
- 手机端优先使用：顶部简化操作 + 底部模式/工具栏 + 适合触摸的属性浮层。
- 不允许只按桌面端完成后让手机端自然继承，反之亦然。

## 4. 工具模式约束

- 桌面端工具图标放在左侧“工具”模式下面。
- 手机端工具图标保留底部工具栏/底部浮层思路。
- 工具图标只显示图标，不显示文字名称；鼠标悬停显示提示。
- 工具属性必须允许展开和隐藏，避免属性面板过高导致工具不可见。
- 使用完铅笔、圆圈、箭头、文字、标号等工具后，必须保持当前工具，不能自动回到选择/移动。
- 只有用户主动点击选择/移动、按 Esc、或退出工具模式时，才切回选择/移动。

## 5. 空白画布

- 首次打开或清空后，中间展示区域必须可点击。
- 空白区至少提供“打开图片”和“打开工程”入口。
- 支持拖入图片；拖入单个 JSON 工程文件时应打开工程。

## 6. 检查与测试

- 每次开发后必须执行 JS 语法检查。
- 每次开发后必须执行 `tests/smoke_check.js` 和 `tests/static_check.js`。
- 每次交付必须更新或保留 `tests/test_plan.md` 人工测试清单。
- 如果某项测试没有自动化，必须在最终说明中诚实说明需要人工验证。
## 7. 页面文案与极简模式

- 公开页面默认使用极简模式，不显示面向开发者的解释、状态说明或使用教学。
- 工具模式内不放说明卡片；工具含义通过图标、悬停提示和必要的属性标签表达。
- 空白画布只保留必要入口，例如“打开图片 / 打开工程”，避免长段提示。
- 新增文案前必须判断：用户是否必须看到它；若不是，放入开发文档而不是公开界面。
## 8. 工具属性极简规范

- 工具属性区只显示可操作控件，不显示“形状、颜色、线条、类型、样式、粗细”等二级分类标题。
- 粗细和大小控件必须支持：图形化预设、鼠标滚轮调节、数字输入精确设定。
- 工具属性相关详细规则见 `TOOL_UI_REQUIREMENTS.md`。


## 9. 工具交互一致性

- 工具模式点击画布时，必须先命中检测已有标注对象。
- 点击已有对象应进入编辑，不能在同一位置直接新增叠加对象。
- 点击空白区域才创建新对象。
- 水印作为全局对象处理；已有水印时再次使用水印工具应编辑已有水印。
- 普通粗细快捷档只显示 `1 / 2 / 4 / 8`；橡皮擦可以保留 `16 / 32`。

## v1.11 导航增强约束

- 长图导航相关能力必须和画布状态双向同步：滚轮、拖动画布、缩放、缩略图点击、右侧滚动条、底部滚动条都要更新同一套 pan/zoom 状态。
- 分割线在可视范围内必须保持原位置；只有离开可视范围时才自动回到当前视口中心。
- 分割线可视范围检测必须覆盖鼠标滚轮、触控板滚动、按住画布拖动、缩放、缩略图跳转和滚动条拖动。
- 右侧缩略图属于导航控件，不得影响图片内容、拼接线、裁剪和导出结果。
- 右侧垂直滚动条只在内容高度超出视口时显示；底部横向滚动条只在内容宽度超出视口时显示。
- 后续自动拼接、电影字幕拼接必须先写入规划文档，不得混入导航修复版本中破坏稳定功能。

## v1.12 Mobile Tool Dock Rule

- Mobile-only changes must not alter desktop tool panel behavior.
- On mobile, the tool icon dock stays attached just above the bottom mode bar.
- On mobile, the tool property popover is collapsible: tapping a tool icon toggles its property panel; switching to another tool opens that tool's panel.
- On mobile, tool property popovers must have a bounded height and scroll internally so they do not cover the whole canvas.


## LongShotStitch v1.13 update
- 手机端工具栏必须绑定在底部模式栏上方，不能漂在画布中间遮挡内容。
- 工具属性面板必须提供收起按钮；再次点击当前工具图标也可显示/隐藏属性。
- 工具属性面板在手机端和电脑端都要紧凑，减少 padding、间距和多行堆叠，优先一行内完成。
- 手机端导入图片后默认按屏幕宽度适配，竖向长图优先满宽显示；用户仍可手动放大缩小。
- 页面刷新、关闭、返回导致工程丢失前，必须触发浏览器离开提示。

## 9. v1.14 标注对象编辑约束

- 工具创建的标注对象不能是一次性死对象；必须能再次选中并编辑。
- 点击已有对象时，优先进入编辑，不在其上方新增同类对象。
- 标注对象编辑应至少支持：移动、必要的缩放/端点拖动、颜色/粗细/字号修改。
- 手机端工具栏位置必须单独检查，不能因为桌面端布局改动而产生中间悬浮或遮挡画布的问题。
- 数字键不得作为工具模式切换快捷键，避免文字输入误触。

## v1.15 development guardrails

- Do not make text annotation editing depend only on a side or floating panel; direct canvas editing is required.
- Selection frames and handles must represent the actual transformed object, including rotation.
- Cropping and export must not leave annotations floating outside the visible image content.

## v1.16 公开界面约束补充

- 画布内直接编辑控件必须和标注对象视觉统一，避免背景框、虚线框、选中框多层错位。
- 新建文字不应使用大号默认实心提示遮挡图片正文。


## v1.17 development guardrails

- Text editing may use the stable property-panel flow when inline editing breaks movement or selection. The canvas must keep one clean dashed selection frame.
- Tool subtypes are stateful and locked. Creating an object must use the user-selected subtype, not silently fall back to the default subtype.
- Selecting an existing annotation should synchronize the tool UI to that object's type and style, without breaking the rule that empty-area creation uses the currently selected subtype.
