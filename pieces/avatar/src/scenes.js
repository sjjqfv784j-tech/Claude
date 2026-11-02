// Photo de profil : le point d'encre terracotta, centré, sur la page de carnet. Tout reste dans le cercle central (TikTok recadre en rond).
function sceneAvatar() {
  paperSheet('sheet');
  // un anneau d'encre et des étincelles, à l'intérieur du cercle de recadrage
  ink(ellipsePts(540, 540, 470, 470, 0, 80), { closed: true, w: 7, color: C.ink, key: 'ring', double: true });
  ink(ellipsePts(540, 540, 440, 440, 0, 80), { closed: true, w: 3, color: C.terra, key: 'ring2' });
  for (let i = 0; i < 10; i++) { const a = i * (TAU / 10) + 0.3, R = 365 + 20 * ((i * 5) % 3); star4(540 + Math.cos(a) * R, 540 + Math.sin(a) * R, 15 * (0.8 + 0.2 * ((B + i) % 2)), C.yellow); }
  dotHero(540, 545, 270, { key: 'hero', mood: 'happy', shadow: false });
}
