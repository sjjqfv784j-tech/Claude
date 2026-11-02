// =====================================================================
//  ERAS, CAMÉRAS, PONTS — OmniRoute. Coupes franches sur les fins de phrase (format mission), pas de morphs.
// =====================================================================
const ERA_BG = ERA_LIST.map(() => PAL.paper);
function pieceCam(era, t) {
  const l = t - SC[era];
  if (era === 1) return push(t, SC[1] + 0.2, SC[2], { z: 1.05, p: [500, 960], to: [500, 960] });
  if (era === 5) return push(t, SC[5] + 0.5, SC[6], { z: 1.04, p: [470, 940], to: [470, 940] });
  return null;
}
const BRIDGES = [];
