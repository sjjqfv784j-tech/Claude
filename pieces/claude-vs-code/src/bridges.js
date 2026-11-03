// =====================================================================
//  ERAS, CAMÉRAS, PONTS — Claude ou Claude Code ? Coupes franches sur les fins de phrase (héros fixe), pas de morphs.
// =====================================================================
const ERA_BG = ['#f4ecd9', '#d6a466', '#0c0d1c', '#f4ecd9', '#d6a466', '#f4ecd9', '#f4ecd9', '#d6a466', '#f4ecd9'];
function pieceCam(era, t) {
  if (era === 0 || era === 8) return null;   // première et dernière scène : tenues, pour que la boucle retombe sur la même image
  return push(t, SC[era], SC[era + 1], { z: 1.06, p: [540, 1000], to: [540, 1000] });
}
const BRIDGES = [];
