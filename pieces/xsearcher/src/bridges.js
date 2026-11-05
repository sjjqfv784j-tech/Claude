// no morphs: every era boundary is a hard cut on the beat grid; no camera moves (the type and the glow carry the motion)
const ERA_BG = ERA_LIST.map((_, i) => (SHOT_LIST[i][1] === 'w1' || SHOT_LIST[i][1] === 'w3' || SHOT_LIST[i][1] === 'w5' ? '#f13c38' : '#090809'));
function pieceCam() { return null; }
const BRIDGES = [];
