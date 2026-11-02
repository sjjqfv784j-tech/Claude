// =====================================================================
//  ERAS, CAMÉRAS, PONTS — Histoires d'IA. Coupes franches sur les fins de phrase (héros fixe), pas de morphs.
// =====================================================================
const ERA_BG = ['#f4ecd9', '#d6a466', '#f4ecd9', '#0c0d1c', '#f4ecd9', '#d6a466', '#f4ecd9', '#f4ecd9', '#f4ecd9', '#f4ecd9'];
function pieceCam(era, t) {
  if (era === 7) return null;   // le silence : l'image est tenue
  const P = [[540, 1000], [560, 1000], [540, 1000], [540, 1000], [540, 1000], [540, 1000], [540, 1000], [540, 1000], [540, 900], [540, 1000]];
  return push(t, SC[era], SC[era + 1], { z: 1.08, p: P[era], to: P[era] });
}
const BRIDGES = [];
