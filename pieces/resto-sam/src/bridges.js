const ERA_BG = SC.slice(0, -1).map(() => '#0c0d1c');
function pieceCam(era, t) {
  if (era === 6) return null;   // le silence : image tenue
  return push(t, SC[era], SC[era + 1], { z: 1.07, p: [540, 1000], to: [540, 1000] });
}
const BRIDGES = [];
