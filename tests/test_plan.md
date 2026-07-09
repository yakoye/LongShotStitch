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
