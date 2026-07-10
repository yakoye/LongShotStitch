const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '..', 'LongShotStitch.html');
const html = fs.readFileSync(file, 'utf8');

const seamBranchStart = html.indexOf("if(['seamBefore','seamAfter','seamCenter'].includes(drag.type))");
if (seamBranchStart < 0) throw new Error('seam drag branch missing');

const seamBranchEnd = html.indexOf('\n    }\n  }\n\n  function onPointerUp', seamBranchStart);
const seamBranch = html.slice(seamBranchStart, seamBranchEnd);

if (!seamBranch.includes('drag.startScreen')) {
  throw new Error('seam drag must use pointer screen delta so pan compensation cannot cancel movement');
}

if (seamBranch.includes('w.y - drag.start.y') || seamBranch.includes('w.x - drag.start.x')) {
  throw new Error('seam drag must not compute movement from pan-adjusted world coordinates');
}

if (!html.includes("type: h.type === 'activeDragBefore' ? 'seamBefore' : 'seamAfter'") || !html.includes('startScreen:')) {
  throw new Error('direct seam handle drags must capture startScreen');
}

console.log('drag_math_check ok');
