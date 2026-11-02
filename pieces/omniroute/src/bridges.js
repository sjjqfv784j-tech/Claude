// =====================================================================
//  ERAS, CAMÉRAS, PONTS — OmniRoute. Coupes franches sur les fins de phrase (format mission), pas de morphs.
// =====================================================================
const ERA_BG = ERA_LIST.map(() => PAL.paper);
function pieceCam(era, t) {
  const P = [[500, 960], [500, 940], [500, 980], [500, 960], [500, 960], [500, 960], [500, 980], [500, 940], [500, 940], [500, 960]];
  if (era === 7) return null;   // le silence : image tenue, pas de mouvement
  return push(t, SC[era], SC[era + 1], { z: 1.09, p: P[era], to: P[era] });
}
const BRIDGES = [];
