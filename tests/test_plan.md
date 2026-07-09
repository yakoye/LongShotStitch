# LongShotStitch v1.14 Test Plan

- Mobile: enter Tools mode; tool dock is directly above the bottom mode bar with no large blank gap.
- Tool parameter popover: selecting a tool shows only tool parameters, not delete/copy/collapse actions.
- Object edit popover: selecting an existing annotation shows delete/copy/collapse actions.
- Shape edit: create rectangle/circle, select it, move it, resize it from the corner, rotate it with the rotate handle, change color/fill/line width.
- Line edit: create line/arrow/double-arrow, select it, drag the whole object, drag start/end handles to change direction and length.
- Text edit: create text, select it, edit content, move it, rotate it, toggle vertical writing.
- Keyboard: typing numbers in text/number inputs must not switch modes; keys 1-5 must not switch modes globally.
- Badge: create more than 10 badges and verify they continue 11, 12, 13; edit an existing badge number and verify later badges update sequentially.
- Regression: open images, seam editing, divider, whole crop, single-image crop, export PNG.


## v1.17 manual checks

- 选择文字工具新增文字后，文字对象可拖动；文字内容可在属性面板修改。
- 选中文字时，画布只显示统一蓝色虚线框，不出现蓝底内联输入框。
- 选择圆形后拖动创建，必须创建圆形；选择矩形后拖动创建，必须创建矩形。
- 选择直线 / 单箭头 / 双箭头后拖动创建，必须保持对应子类型。
- 选择自由笔 / 荧光笔、矩形马赛克 / 自由马赛克后创建，必须保持对应子类型。
- 选中已有圆形、箭头、文字后，属性栏同步到该对象类型，并且后续空白处创建使用当前锁定子类型。
