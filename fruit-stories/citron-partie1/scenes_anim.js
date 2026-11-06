const S = { t: 0, p: 0, d: 1, speaking: null, mouth: 0 }; const sin = Math.sin; const ease = x => x * x * (3 - 2 * x);
// Dessine les 12 plans (banane Léo, Papy Poire, Coco la noix de coco) -> images/NN.png (1080x1920)
const W = 1080, H = 1920;
const defs = `<defs>
<linearGradient id="gBan" x1="0" x2="1"><stop offset="0" stop-color="#ffe45a"/><stop offset=".6" stop-color="#f2c418"/><stop offset="1" stop-color="#c99a0c"/></linearGradient>
<linearGradient id="gPear" x1="0" x2="1"><stop offset="0" stop-color="#d6e26a"/><stop offset=".6" stop-color="#a9c23a"/><stop offset="1" stop-color="#76902a"/></linearGradient>
<radialGradient id="gCoco" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#9a6a42"/><stop offset=".6" stop-color="#6b4226"/><stop offset="1" stop-color="#3b2312"/></radialGradient>
<radialGradient id="gGold" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff2a8"/><stop offset=".5" stop-color="#e8b422"/><stop offset="1" stop-color="#8a5f0a"/></radialGradient>
<radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></radialGradient>
<radialGradient id="glow"><stop offset="0" stop-color="#ffcf70" stop-opacity=".85"/><stop offset="1" stop-color="#ffcf70" stop-opacity="0"/></radialGradient>
<filter id="blur"><feGaussianBlur stdDeviation="14"/></filter></defs>`;
const SK = { banana: '#f2c418', pear: '#a9c23a', coco: '#efe3c8' };
const DK = '#2a1608';
function face(cy, expr, look = [0, 0], skin = '#f2c418', k = 1, mo = null, bl = 1) {
  let s = ''; const big = expr === 'shock' ? 1.25 : 1, lid = expr === 'smug';
  for (const d of [-1, 1]) {
    const ex = d * 40 * k;
    s += `<ellipse cx="${ex}" cy="${cy}" rx="${25 * k}" ry="${(expr === 'happy' ? 24 : 27) * big * k * bl}" fill="#fff" stroke="${DK}" stroke-width="3"/>`;
    if (bl > .5) s += `<circle cx="${ex + look[0] * 9}" cy="${cy + look[1] * 8}" r="${(expr === 'shock' ? 7 : 11) * k}" fill="${DK}"/><circle cx="${ex + look[0] * 9 - 3}" cy="${cy + look[1] * 8 - 4}" r="${3 * k}" fill="#fff"/>`;
    if (lid) s += `<path d="M${ex - 26 * k},${cy} Q${ex},${cy - 34 * k} ${ex + 26 * k},${cy} Z" fill="${skin}" stroke="${DK}" stroke-width="3"/>`;
    const bx = d * 40 * k, by = cy - 42 * k, o = d * 24 * k;
    let br = '';
    if (expr === 'angry') br = `M${bx + o * 1.2},${by - 14} L${bx - o},${by + 10}`;
    else if (expr === 'sad' || expr === 'worried' || expr === 'cry') br = `M${bx + o * 1.2},${by + 8} L${bx - o},${by - 16}`;
    else if (expr === 'shock') br = `M${bx - o},${by - 12} Q${bx},${by - 34} ${bx + o},${by - 12}`;
    else if (expr === 'smug') br = d < 0 ? `M${bx - o},${by + 2} L${bx + o},${by + 2}` : `M${bx - o},${by - 6} Q${bx},${by - 26} ${bx + o},${by - 6}`;
    else br = `M${bx - o},${by} Q${bx},${by - 14} ${bx + o},${by}`;
    s += `<path d="${br}" stroke="${DK}" stroke-width="8" stroke-linecap="round" fill="none"/>`;
    if (expr === 'cry') s += `<path transform="translate(0,${(S.t * 70 + d * 20) % 80})" d="M${ex},${cy + 26} q-8,30 0,44 q10,-14 0,-44" fill="#7cc8ff" stroke="#3a8fd0" stroke-width="2"/>`;
  }
  const my = cy + 78 * k;
  const m = {
    happy: `<path d="M-46,${my} Q0,${my + 62} 46,${my} Z" fill="#6a1c1c" stroke="${DK}" stroke-width="4"/><path d="M-30,${my + 22} Q0,${my + 52} 30,${my + 22} Q0,${my + 30} -30,${my + 22}" fill="#e46a6a"/>`,
    sad: `<path d="M-38,${my + 22} Q0,${my - 18} 38,${my + 22}" stroke="${DK}" stroke-width="8" fill="none" stroke-linecap="round"/>`,
    cry: `<path d="M-38,${my + 22} Q0,${my - 18} 38,${my + 22}" stroke="${DK}" stroke-width="8" fill="none" stroke-linecap="round"/>`,
    worried: `<path d="M-30,${my + 14} Q-10,${my - 2} 4,${my + 10} Q18,${my + 20} 32,${my + 4}" stroke="${DK}" stroke-width="7" fill="none" stroke-linecap="round"/>`,
    angry: `<path d="M-52,${my + 4} Q0,${my - 14} 52,${my + 4} L44,${my + 52} Q0,${my + 72} -44,${my + 52} Z" fill="#5a1414" stroke="${DK}" stroke-width="4"/><path d="M-46,${my + 6} Q0,${my - 8} 46,${my + 6} L42,${my + 24} L-42,${my + 24} Z" fill="#fff"/>`,
    shock: `<ellipse cx="0" cy="${my + 18}" rx="24" ry="34" fill="#5a1414" stroke="${DK}" stroke-width="4"/>`,
    smug: `<path d="M-40,${my + 8} Q12,${my + 36} 48,${my - 10}" stroke="${DK}" stroke-width="9" fill="none" stroke-linecap="round"/>`,
  }[expr];
  if (mo !== null && mo > 0.04) return s + `<ellipse cx="0" cy="${my + 16}" rx="${22 + mo * 16}" ry="${5 + mo * 32}" fill="#5a1414" stroke="${DK}" stroke-width="4"/><ellipse cx="0" cy="${my + 16 + (5 + mo * 32) * .55}" rx="${14 + mo * 8}" ry="${(5 + mo * 32) * .35}" fill="#e46a6a"/>`;
  return s + m;
}
function char(kind, o) {
  const { x, y, s = 1, flip = false, expr = 'happy', look = [0, 0], armL: aL = [-150, -140], armR: aR = [150, -140], tilt: tl = 0, helmet = true, id = null, phase = 0 } = o; let extra = o.extra || '';
  const sp = id && S.speaking === id, mo = sp ? S.mouth : null, bl = ((S.t + phase * 1.7) % 3.6) < 0.13 ? 0.1 : 1;
  const bob = sin(S.t * 2.4 + phase) * 5, sway = sin(S.t * 2 + phase) * 8, ges = sp ? sin(S.t * 8 + phase) * S.mouth * 34 : 0;
  const armL = [aL[0], aL[1] + sway - ges], armR = [aR[0], aR[1] - sway + ges * .8], tilt = tl + sin(S.t * 1.3 + phase) * 1.6 + (sp ? sin(S.t * 6) * S.mouth * 2.5 : 0);
  const skin = SK[kind]; let head = '', body = '', legs = '', cy = -450;
  if (kind === 'banana') {
    head = `<path d="M-22,-640 C48,-660 110,-575 100,-455 C92,-365 44,-296 -22,-288 C-92,-282 -110,-335 -104,-410 C-98,-520 -76,-615 -22,-640 Z" fill="url(#gBan)" stroke="#8a6a08" stroke-width="5"/>
    ${helmet ? '' : '<rect x="-32" y="-668" width="34" height="40" rx="9" fill="#5a3b12" transform="rotate(8 -15 -650)"/>'}
    <circle cx="-62" cy="-380" r="5" fill="#8a6a08" opacity=".6"/><circle cx="64" cy="-365" r="4" fill="#8a6a08" opacity=".6"/><circle cx="58" cy="-560" r="4" fill="#8a6a08" opacity=".5"/>`;
    if (helmet) head += `<path d="M-95,-585 Q-10,-700 90,-585 Z" fill="#f4a21a" stroke="#8a4f06" stroke-width="5"/><rect x="-100" y="-590" width="196" height="16" rx="8" fill="#d98a10"/><circle cx="-4" cy="-610" r="17" fill="#fffbd0" stroke="#8a4f06" stroke-width="4"/>`;
    body = `<path d="M-92,-300 L92,-300 L108,-96 L-108,-96 Z" fill="#2f5597" stroke="#1b3466" stroke-width="5"/><path d="M-58,-300 L-48,-355 M58,-300 L48,-355" stroke="#1b3466" stroke-width="16" stroke-linecap="round"/><rect x="-34" y="-250" width="68" height="46" rx="6" fill="#274a86" stroke="#1b3466" stroke-width="3"/><circle cx="-58" cy="-300" r="9" fill="#e8b422"/><circle cx="58" cy="-300" r="9" fill="#e8b422"/>`;
    legs = [-1, 1].map(d => `<rect x="${d * 40 - 17}" y="-100" width="34" height="72" fill="${skin}" stroke="#8a6a08" stroke-width="3"/><path d="M${d * 40 - 30},-34 q30,-20 60,0 l4,28 h-68 z" fill="#4a2f16"/>`).join('');
    cy = -455;
  } else if (kind === 'pear') {
    head = `<path d="M0,-650 C32,-650 46,-605 56,-565 C118,-520 138,-430 106,-355 C74,-285 -74,-285 -106,-355 C-138,-430 -118,-520 -56,-565 C-46,-605 -32,-650 0,-650 Z" fill="url(#gPear)" stroke="#53681a" stroke-width="5"/>
    <rect x="-6" y="-690" width="14" height="48" rx="6" fill="#5a3b12"/><path d="M8,-668 q50,-34 70,4 q-40,22 -70,-4" fill="#5c9a2a" stroke="#3c6a1a" stroke-width="3"/>
    <path d="M-60,-505 q60,-22 120,0 M-52,-485 q52,-14 104,0" stroke="#53681a" stroke-width="4" fill="none" opacity=".6"/>
    <path d="M-108,-440 q-34,-6 -28,-38 q22,14 28,38 M108,-440 q34,-6 28,-38 q-22,14 -28,38" fill="#f4f4f0" stroke="#bbb" stroke-width="2"/>`;
    body = `<path d="M-96,-300 L96,-300 L112,-96 L-112,-96 Z" fill="#8a5632" stroke="#4e2f18" stroke-width="5"/><path d="M0,-300 L0,-96" stroke="#4e2f18" stroke-width="4"/>${[-220, -170, -120].map(yy => `<circle cx="12" cy="${yy}" r="8" fill="#e8d2a0"/>`).join('')}`;
    legs = [-1, 1].map(d => `<rect x="${d * 40 - 17}" y="-100" width="34" height="72" fill="#5b5b66"/><path d="M${d * 40 - 30},-34 q30,-20 60,0 l4,28 h-68 z" fill="#2b2b30"/>`).join('');
    extra += `<g stroke="${DK}" stroke-width="6" fill="none"><circle cx="-40" cy="-450" r="36"/><circle cx="40" cy="-450" r="36"/><path d="M-4,-452 h8"/></g>`; cy = -442;
  } else {
    head = `${Array.from({ length: 90 }, (_, i) => { const a = Math.PI * (0.92 + 1.16 * i / 90), r1 = 100, r2 = 150 + (i % 4) * 9; return `<path d="M${Math.cos(a) * r1},${-440 + Math.sin(a) * r1} Q${Math.cos(a + .12) * (r1 + 30)},${-440 + Math.sin(a + .12) * (r1 + 30)} ${Math.cos(a) * r2},${-440 + Math.sin(a) * r2}" stroke="#4a2a14" stroke-width="7" stroke-linecap="round" fill="none"/>`; }).join('')}<circle cx="0" cy="-440" r="136" fill="url(#gCoco)" stroke="#2a170a" stroke-width="5"/><ellipse cx="0" cy="-425" rx="108" ry="112" fill="#f7f0e0" stroke="#c9b48a" stroke-width="5"/><ellipse cx="-30" cy="-480" rx="40" ry="18" fill="#fff" opacity=".7"/>`;
    body = `<path d="M-112,-300 L112,-300 L124,-92 L-124,-92 Z" fill="#17171c" stroke="#000" stroke-width="5"/><path d="M-40,-300 L0,-210 L40,-300 Z" fill="#fff"/><path d="M0,-300 L-14,-250 L0,-130 L14,-250 Z" fill="#b01a1a"/>`;
    legs = [-1, 1].map(d => `<rect x="${d * 44 - 20}" y="-100" width="40" height="72" fill="#101014"/><path d="M${d * 44 - 34},-34 q34,-22 68,0 l4,28 h-76 z" fill="#050505"/>`).join('');
    cy = -440;
  }
  const arms = [[-1, armL], [1, armR]].map(([d, h]) => {
    const sx = d * 92, sy = -270;
    return `<line x1="${sx}" y1="${sy}" x2="${h[0]}" y2="${h[1]}" stroke="${skin}" stroke-width="30" stroke-linecap="round"/><line x1="${sx}" y1="${sy}" x2="${sx + (h[0] - sx) * .55}" y2="${sy + (h[1] - sy) * .55}" stroke="${kind === 'banana' ? '#2f5597' : kind === 'pear' ? '#8a5632' : '#17171c'}" stroke-width="40" stroke-linecap="round"/><circle cx="${h[0]}" cy="${h[1]}" r="26" fill="${skin}" stroke="#0004" stroke-width="3"/>${kind === 'coco' ? `<circle cx="${h[0] + 8}" cy="${h[1] + 4}" r="9" fill="none" stroke="#e8b422" stroke-width="6"/>` : ''}`;
  }).join('');
  return `<g transform="translate(${x},${y + bob}) scale(${flip ? -s : s},${s}) rotate(${tilt})"><ellipse cx="0" cy="8" rx="150" ry="24" fill="#000" opacity=".45"/>${legs}${body}${arms}${head}<g>${face(cy, expr, [look[0] + sin(S.t * .7 + phase) * .4, look[1]], skin, 1, mo, bl)}</g>${extra}</g>`;
}
const clock = (x, y, r, a = S.t) => `<g transform="translate(${x},${y})"><circle r="${r * 1.5}" fill="url(#glow)"/><rect x="${-r * .85}" y="${r * .9}" width="${r * 1.7}" height="${r * .5}" rx="10" fill="#8a5f0a"/><circle r="${r}" fill="url(#gGold)" stroke="#6b470a" stroke-width="8"/><circle r="${r * .82}" fill="#fff6dc" stroke="#8a5f0a" stroke-width="5"/>${Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="${-r * .7}" x2="0" y2="${-r * .6}" stroke="#4a3010" stroke-width="7" transform="rotate(${i * 30})"/>`).join('')}<line x1="0" y1="0" x2="0" y2="${-r * .5}" stroke="#2a1608" stroke-width="10" stroke-linecap="round" transform="rotate(${300 + a * 40})"/><line x1="0" y1="0" x2="0" y2="${-r * .68}" stroke="#2a1608" stroke-width="6" stroke-linecap="round" transform="rotate(${60 + a * 3.3})"/><circle r="9" fill="#2a1608"/></g>`;
const rect = (c) => `<rect width="${W}" height="${H}" fill="${c}"/>`;
const wall = (a, b) => `<linearGradient id="bg"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><rect width="${W}" height="${H}" fill="url(#bg)"/>`;
const floor = (c, y = 1360) => `<rect y="${y}" width="${W}" height="${H - y}" fill="${c}"/>${Array.from({ length: 7 }, (_, i) => `<line x1="0" y1="${y + i * 80}" x2="${W}" y2="${y + i * 80}" stroke="#0005" stroke-width="3"/>`).join('')}`;
const gears = (x, y) => `<g opacity=".5"><circle cx="${x}" cy="${y}" r="70" fill="none" stroke="#a37a2a" stroke-width="16" stroke-dasharray="16 12"/><circle cx="${x}" cy="${y}" r="20" fill="#a37a2a"/></g>`;
const shelf = (y) => `<rect x="0" y="${y}" width="${W}" height="18" fill="#3a2410"/>${Array.from({ length: 9 }, (_, i) => `<circle cx="${70 + i * 120}" cy="${y - 32}" r="${18 + (i % 3) * 8}" fill="none" stroke="#c99a3a" stroke-width="7"/>`).join('')}`;
const candle = (x, y) => `<circle cx="${x}" cy="${y - 20}" r="${140 + sin(S.t * 9 + x) * 8}" fill="url(#glow)"/><rect x="${x - 10}" y="${y}" width="20" height="60" fill="#f4ecd0"/><ellipse cx="${x}" cy="${y - 10}" rx="9" ry="18" fill="#ffb040"/>`;
const workshop = (night = true) => wall(night ? '#1d1209' : '#6b4a2c', night ? '#3a2410' : '#a67c4a') + (night ? `<circle cx="900" cy="330" r="90" fill="#dfe8ff" opacity=".8"/><rect x="760" y="200" width="280" height="340" fill="none" stroke="#2a1608" stroke-width="14" opacity=".9"/>` : `<rect x="760" y="200" width="280" height="340" fill="#ffe9b0" opacity=".7" stroke="#2a1608" stroke-width="14"/>`) + shelf(520) + shelf(760) + gears(160, 250) + gears(540, 160) + floor('#2a1a0d') + candle(140, 1010) + candle(960, 1030);
const hall = (sw = 0) => wall('#2a0a14', '#5a1a24') + `<path d="M0,0 H230 Q130,500 0,820 Z M${W},0 H${W - 230} Q${W - 130},500 ${W},820 Z" fill="#7a1220"/><polygon points="${540 + sw},0 ${330 + sw * 2},1100 ${750 + sw * 2},1100" fill="#fff3c0" opacity=".14"/>` + `<rect y="1000" width="${W}" height="920" fill="#1a0a0a"/><rect y="1000" width="${W}" height="34" fill="#c99a3a"/>` + Array.from({ length: 12 }, (_, i) => `<circle cx="${40 + i * 92}" cy="${1560 + (i % 2) * 50}" r="${54 + (i % 3) * 8}" fill="#0b0508"/><rect x="${i * 92 - 20}" y="${1620 + (i % 2) * 50}" width="120" height="300" rx="40" fill="#0b0508"/>`).join('');
const corridor = () => wall('#0c0a10', '#1d1626') + `<rect x="130" y="260" width="360" height="1120" fill="#120a08" stroke="#3a2410" stroke-width="12"/><rect x="470" y="260" width="22" height="1120" fill="#ffd27a"/><polygon points="492,260 800,1420 492,1420" fill="#ffd27a" opacity=".16"/>` + floor('#17121c', 1380);
const backstage = () => wall('#0a0710', '#241a2e') + `<path d="M0,0 H320 Q200,600 0,1400 Z M${W},0 H${W - 320} Q${W - 200},600 ${W},1400 Z" fill="#4a1018"/><polygon points="540,0 240,1500 840,1500" fill="#fff3c0" opacity=".12"/>` + floor('#120d18', 1500);
const text = (t, x, y, sz, c = '#fff', ex = '') => `<text x="${x}" y="${y}" text-anchor="middle" font-family="DejaVu Serif" font-weight="bold" font-size="${sz}" fill="${c}" ${ex}>${t}</text>`;
const sparkles = () => Array.from({ length: 22 }, (_, i) => `<path d="M0,-18 L5,-5 L18,0 L5,5 L0,18 L-5,5 L-18,0 L-5,-5 Z" fill="#fff6b0" transform="translate(${180 + (i * 137) % 700},${300 + (i * 211) % 900 - (S.t * 30 + i * 9) % 60}) scale(${(0.5 + (i % 4) * .3) * (0.6 + 0.4 * sin(S.t * 4 + i))})" opacity="${0.5 + 0.5 * sin(S.t * 5 + i)}"/>`).join('');

const E = (c) => '';
const ar = (x0, y0, f, w) => [x0 + sin(S.t * f) * w, y0 + sin(S.t * f * 1.3) * w * .6];
const scenes = [
  () => workshop() + clock(540, 800, 330) + sparkles() + char('banana', { id: 'LEO', x: 540, y: 1700 - Math.abs(sin(S.t * 3.5)) * 46, s: 1.35, expr: 'happy', look: [0, -1], armL: [-190, -420 + sin(S.t * 7) * 55], armR: [190, -420 - sin(S.t * 7) * 55] }),
  () => workshop() + `<rect x="120" y="700" width="170" height="640" fill="#1a0f08"/>` + char('pear', { id: 'NOIX', phase: 1, x: 600, y: 1890, s: 1.75, expr: 'worried', look: [-1 + sin(S.t * 1.5) * .6, 0], armL: [-60, -560 + sin(S.t * 4) * 12], armR: [150, -140] }),
  () => corridor() + char('coco', { id: 'ARTICHAUT', phase: 2, x: 640 + (1 - ease(Math.min(S.t / 1.2, 1))) * 420, y: 1900, s: 1.8, expr: 'smug', look: [-1, 0], armL: [-140, -150], armR: ar(160, -470, 5, 18), tilt: -3 }),
  () => workshop(false) + clock(280, 760, 230) + char('coco', { id: 'ARTICHAUT', phase: 2, x: 780, y: 1760, s: 1.4, flip: true, expr: 'smug', armL: [-150, -140], armR: [-260, -480 + sin(S.t * 6) * 28] }) + char('banana', { id: 'LEO', x: 330 + sin(S.t * 30) * 2.5, y: 1860, s: 1.3, expr: 'shock', look: [1, 0], armL: [-160, -300], armR: [160, -300] }),
  () => workshop() + clock(220, 700, 200) + char('banana', { id: 'LEO', x: 580 + sin(S.t * 45) * 3.5, y: 1930, s: 1.9, expr: 'angry', look: [1, 0], armL: [-130, -300 + sin(S.t * 20) * 10], armR: [130, -300 + sin(S.t * 20 + 1) * 10] }),
  () => { const a = [150 + sin(S.t * 5) * 22, -330 + sin(S.t * 9) * 20]; return workshop() + `<rect x="150" y="1220" width="780" height="130" rx="14" fill="#5a3a1c"/><rect x="250" y="1100" width="440" height="130" fill="#fff6dc" stroke="#8a6a3a" stroke-width="5"/>${[1130, 1160, 1190].map(yy => `<line x1="290" y1="${yy}" x2="650" y2="${yy}" stroke="#555" stroke-width="5"/>`).join('')}<path d="M300,1195 q${(S.t * 60) % 300},-24 ${(S.t * 60) % 300},0" stroke="#1a1a40" stroke-width="5" fill="none"/>` + clock(700, 700, 250) + char('coco', { id: 'ARTICHAUT', phase: 2, x: 420, y: 1720, s: 1.45, expr: 'smug', armL: [-150, -140], armR: a, extra: `<line x1="${a[0]}" y1="${a[1]}" x2="${a[0] + 40}" y2="${a[1] - 110}" stroke="#e8b422" stroke-width="12" stroke-linecap="round"/>` }); },
  () => corridor() + char('pear', { id: 'NOIX', phase: 1, x: 330 - ease(S.p) * 70, y: 1850, s: 1.4, expr: 'sad', look: [1, 0], armL: [-120, -120], armR: [60, -330], tilt: 4 + ease(S.p) * 10 }) + char('coco', { id: 'ARTICHAUT', phase: 2, x: 800 - ease(S.p) * 40, y: 1850, s: 1.4, flip: true, expr: 'angry', armL: [-150, -140], armR: [-330 - ease(S.p) * 30, -380 + sin(S.t * 6) * 22] }),
  () => hall(sin(S.t * 1.5) * 60) + `<rect x="400" y="860" width="280" height="160" fill="#6b470a"/>` + clock(540, 700, 230) + char('coco', { id: 'ARTICHAUT', phase: 2, x: 820, y: 1480 - Math.abs(sin(S.t * 3)) * 18, s: 1.15, flip: true, expr: 'happy', armL: [-200, -420 + sin(S.t * 5) * 45], armR: [200, -420 - sin(S.t * 5) * 45] }),
  () => hall() + char('banana', { id: 'LEO', x: 540, y: 1960 + Math.abs(sin(S.t * 4.5)) * 12, s: 1.9, expr: 'cry', look: [1, 0], armL: [-130, -250 + sin(S.t * 9) * 12], armR: [130, -250 + sin(S.t * 9 + 2) * 12] }),
  () => { const pull = sin(S.t * 10) * 16; return hall() + `<rect x="0" y="960" width="${W}" height="60" fill="#c99a3a"/>` + char('coco', { id: 'ARTICHAUT', phase: 2, x: 780, y: 1500, s: 1.4, flip: true, expr: 'angry', armL: [-150, -140], armR: [-330, -430 + sin(S.t * 7) * 30] }) + char('banana', { id: 'LEO', x: 330 + pull, y: 1700, s: 1.3, expr: 'worried', armL: [-200, -250], armR: [200, -250] }) + [90, 590].map(gx => `<g transform="translate(${gx - pull * (gx < 300 ? 1 : -1) * .6},1700) scale(1.15)"><ellipse cx="0" cy="-330" rx="95" ry="130" fill="#1a2438"/><rect x="-100" y="-210" width="200" height="200" rx="30" fill="#1a2438"/><line x1="${gx < 300 ? 90 : -90}" y1="-190" x2="${gx < 300 ? 190 : -190}" y2="-250" stroke="#1a2438" stroke-width="40" stroke-linecap="round"/></g>`).join(''); },
  () => corridor() + char('pear', { id: 'NOIX', phase: 1, x: 560, y: 1900 + sin(S.t * 1.8) * 6, s: 1.8, expr: 'sad', look: [1, 1], armL: [-130, -330 + sin(S.t * 3) * 10], armR: [100, -140], tilt: 3 + sin(S.t * 1.2) * 2 }),
  () => backstage() + `<circle cx="540" cy="760" r="${420 + sin(S.t * 2) * 25}" fill="url(#glow)"/><circle cx="540" cy="760" r="400" fill="url(#gGold)" stroke="#6b470a" stroke-width="12"/><circle cx="540" cy="760" r="330" fill="#a87818" opacity=".55"/>` + text('POUR LÉO,', 540, 690, 70, '#4a3010') + text('MON HÉRITIER.', 540, 780, 70, '#4a3010') + text('Et si Coco ose', 540, 880, 52, '#4a3010', `opacity="${Math.min(.8, S.t / 2)}"`) + text('la voler…', 540, 950, 52, '#4a3010', `opacity="${Math.max(0, Math.min(.5, (S.t - 3) / 2))}"`) + char('banana', { id: 'LEO', x: 330, y: 1930, s: 1.15, expr: 'shock', look: [1, -1], armL: [-120, -300], armR: [120, -300] }),
];
// caméra par plan : [zoom début, zoom fin, centre x, centre y, dérive x, dérive y]
const CAM = [[1.0, 1.1, 540, 1000, 0, 0], [1.0, 1.12, 600, 900, 0, 0], [1.1, 1.0, 640, 900, 0, 0], [1.0, 1.1, 540, 1000, -20, 0], [1.12, 1.0, 580, 1000, 0, 0], [1.0, 1.1, 500, 1100, 20, 0], [1.0, 1.1, 540, 1000, -30, 0], [1.0, 1.12, 700, 1000, 0, 0], [1.1, 1.0, 540, 1100, 0, 0], [1.0, 1.1, 540, 1000, 0, 0], [1.0, 1.12, 560, 900, 0, 0], [1.0, 1.35, 540, 800, 0, 0]];
window.frameSVG = (plan, t, dur, speaking, mouth) => {
  S.t = t; S.d = dur; S.p = t / dur; S.speaking = speaking; S.mouth = mouth;
  const c = CAM[plan], z = c[0] + (c[1] - c[0]) * ease(S.p), fade = Math.max(0, 1 - t / .25, 1 - (dur - t) / .25);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}<g transform="translate(${c[2]},${c[3]}) scale(${z}) translate(${-c[2] + c[4] * S.p},${-c[3]})">${scenes[plan]()}</g><rect width="${W}" height="${H}" fill="url(#vig)"/><rect width="${W}" height="${H}" fill="#000" opacity="${fade}"/></svg>`;
};
