# LongShotStitch v1.14 Test Plan

- Mobile: enter Tools mode; tool dock is directly above the bottom mode bar with no large blank gap.
- Tool parameter popover: selecting a tool shows only tool parameters, not delete/copy/collapse actions.
- Object edit popover: selecting an existing annotation shows delete/copy/collapse actions.
- Shape edit: create rectangle/circle, select it, move it, resize it from the corner, rotate it with the rotate handle, change color/fill/line width.
- Line edit: create line/arrow/double-arrow, select it, drag the whole object, drag start/end handles to change direction and length.
- Text edit: create text, select it, edit content, move it, rotate it, toggle vertical writing.
- Keyboard: typing numbers in text/number inputs must not switch modes; keys 1-5 must not switch modes globally.
- Badge: create more than 10 badges and verify they continue 11, 12, 13; edit an existing badge number and verify later badges update sequentially.
- Regression: open images, seam editing, divider, whole crop, single-image crop, multi-format export.
- Auto stitch: enable 自动, import multiple images, verify direction is inferred and seams remain editable.
- Subtitle stitch: adjust 高 and 位, verify the blue subtitle region moves/resizes, generate a subtitle long image, crop/export it.
- Cut mode: test 行, 列, 格, 3×3, drag cut lines, tap 完成 to enter single-image crop, then use the top export button.
- Cut export names must use row/column labels such as source_01_01.png and source_01_02.png; when the format selector changes, extensions follow the selected format.
- Seam drag: dragging the upper/left area changes only the upper/left image; dragging the lower/right area changes only the lower/right image.
- Browser chrome: tab favicon shows ✂ for index.html and LongShotStitch.html.
- Mobile 390x844: seven bottom modes fit; first tool tap does not open properties, second tap opens properties; ⋯ exposes desktop-only actions.


## v1.17 manual checks

- 选择文字工具新增文字后，文字对象可拖动；文字内容可在属性面板修改。
- 选中文字时，画布只显示统一蓝色虚线框，不出现蓝底内联输入框。
- 选择圆形后拖动创建，必须创建圆形；选择矩形后拖动创建，必须创建矩形。
- 选择直线 / 单箭头 / 双箭头后拖动创建，必须保持对应子类型。
- 选择自由笔 / 荧光笔、矩形马赛克 / 自由马赛克后创建，必须保持对应子类型。
- 选中已有圆形、箭头、文字后，属性栏同步到该对象类型，并且后续空白处创建使用当前锁定子类型。


## v1.18 manual checks

- 选中文字后，在属性面板文字输入框中可以连续输入完整句子，不会只能输入一个字符。
- 新建文字默认字号比 v1.17 更小，适合截图标注。
- 旋转文字后，文字内容、蓝色虚线框、旋转手柄保持同一旋转中心，文字不跑出虚线框。
- 选中任意标注后，按 Backspace / Delete 不会删除标注；只能用显式删除按钮删除。
- 回归检查：矩形/圆形、箭头、标号、马赛克、裁剪、分割线、多格式导出不受影响。


## v1.19 manual checks

- 拼接线、分割线、单图裁剪中拖动中线的上方/左方图片时，中线和下方/右方图片保持屏幕位置不动。
- 切割和字幕面板在手机端切换时只显示当前模式属性，面板不遮挡过多画布。
- 切割的“完成”和字幕的“生成”按钮文字清晰可见。
- 顶部撤销、重做、清空、适合窗口、预览、导出只显示图标；导出格式可选择 PNG、JPEG、WEBP、SVG。


## v1.20 manual checks

- 拼接线、分割线、单图裁剪中拖动中线的上方/左方图片时，拖动应连续丝滑，不因屏幕锚点补偿产生抖动。
- 拼接线、分割线、单图裁剪中拖动中线的下方/右方图片时，交互手感应与上方/左方保持一致。
- 回归检查整体裁剪、切割线、标注移动/缩放/旋转、画布平移缩放，拖动过程中不应出现明显跳动。
- 仓库不再保留 `LongShotStitch_v*.html` 版本归档文件；发布入口保留 `LongShotStitch.html` 和 `index.html`。


## v1.21 manual checks

- 小图导入后不生成代理图，编辑和导出都保持原图路径。
- 大图导入后先显示原图，后台生成轻量 JPG 代理图；代理完成后编辑拖动使用代理图。
- 大图导出仍使用原图，输出尺寸和切割命名规则不受代理图影响。
- 多张大图同时导入时，代理图按队列逐张生成，界面仍可切换模式、缩放和平移。


## v1.22 manual checks

- 手机端进入字幕/切割时，底部弹窗不显示图片列表，只保留当前模式参数。
- 字幕蓝框和切割红框只围绕当前选中的单张图，切过拼接线/分割线后再进入也不应错位。
- 手机端三个点菜单中“打开”是分组入口，展开后提供图片和工程；粘贴、保存、关于是独立入口。


## v1.23 manual checks

- 手机端顶部只保留一排按钮：清空、文件、自动、方向、撤销、重做、适合窗口、导出；不显示预览按钮和三点菜单。
- 点击文件按钮弹出小菜单，提供打开图片、打开工程、保存工程、关于版本。
- 点击导出按钮只打开导出设置小弹窗；可选格式和质量，点击“直接导出”才下载。
- 手机端竖向模式点击适合窗口后，内容宽度贴合屏幕，拖动画布只上下移动；横向模式内容高度贴合可视区，拖动画布只左右移动。
- 切换方向、自动拼接、撤销、重做、清空在手机端顶栏直接可用，不需要进入更多菜单。
