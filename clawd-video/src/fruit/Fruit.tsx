// Personnages fruits dessinés en SVG : visage expressif, clignements, bouche synchronisée sur la voix, bras et jambes.
import React from 'react';

export type Emo = 'neutral' | 'happy' | 'smug' | 'angry' | 'shocked' | 'scared' | 'sad' | 'wink';
export type FruitKind = 'strawberry' | 'banana' | 'peach' | 'apple' | 'orange' | 'lemon' | 'grape' | 'kiwi';

export type FruitProps = {
  kind: FruitKind;
  emo: Emo;
  mouth: number; // 0..1, ouverture de la bouche (voix)
  t: number; // secondes, pour l'animation au repos
  seed: number;
  acc?: string[];
  glasses?: boolean;
  tears?: boolean;
  sweat?: boolean;
  look?: number; // -1 (gauche) .. 1 (droite)
  speaking?: boolean;
  prop?: string | null;
};

type Pt = [number, number];
type Spec = {
  body: (id: string) => React.ReactNode; // forme + détails sous le visage
  top?: React.ReactNode; // feuilles / tige au-dessus
  skin: string; // couleur des paupières
  face: Pt; // centre du visage
  shoulders: [Pt, Pt];
  hips: [Pt, Pt];
};

const INK = '#2a1a1f';
const rnd = (s: number) => {
  const x = Math.sin(s * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const leaf = (x: number, y: number, r: number, c = '#3fa34d') => (
  <ellipse cx={0} cy={-26} rx={13} ry={30} fill={c} stroke="#23702f" strokeWidth={4} transform={`translate(${x} ${y}) rotate(${r})`} />
);

const SPECS: Record<FruitKind, Spec> = {
  strawberry: {
    skin: '#e8344a',
    face: [0, -20],
    shoulders: [[-140, -10], [140, -10]],
    hips: [[-55, 150], [55, 150]],
    body: (id) => (
      <>
        <defs>
          <radialGradient id={`${id}g`} cx="0.38" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#ff6f7d" />
            <stop offset="0.55" stopColor="#e8344a" />
            <stop offset="1" stopColor="#a8172c" />
          </radialGradient>
        </defs>
        <path d="M -155,-60 C -165,-185 165,-185 155,-60 C 145,70 45,185 0,200 C -45,185 -145,70 -155,-60 Z" fill={`url(#${id}g)`} stroke={INK} strokeWidth={6} />
        {Array.from({ length: 34 }, (_, i) => {
          const x = -135 + rnd(i * 3.1) * 270;
          const y = -140 + rnd(i * 7.7) * 310;
          const inside = Math.abs(x) < 150 - Math.max(0, y + 40) * 0.62 && y < 175;
          const onFace = Math.abs(x) < 115 && y > -110 && y < 85;
          if (!inside || onFace) return null;
          return <ellipse key={i} cx={x} cy={y} rx={5} ry={8} fill="#ffe17a" transform={`rotate(${x * 0.15} ${x} ${y})`} />;
        })}
      </>
    ),
    top: (
      <g transform="translate(0 -150)">
        {[-70, -35, 0, 35, 70].map((r, i) => leaf(r * 0.9, 8, r * 1.2, i % 2 ? '#45b553' : '#3a9a47'))}
        <rect x={-6} y={-62} width={12} height={34} rx={6} fill="#3f7a2c" stroke="#23702f" strokeWidth={3} />
      </g>
    ),
  },
  banana: {
    skin: '#ffd84a',
    face: [45, -10],
    shoulders: [[-45, 0], [145, -10]],
    hips: [[-5, 175], [85, 165]],
    body: (id) => (
      <>
        <defs>
          <linearGradient id={`${id}g`} x1="0" x2="1">
            <stop offset="0" stopColor="#f2b51e" />
            <stop offset="0.45" stopColor="#ffe264" />
            <stop offset="1" stopColor="#e9a810" />
          </linearGradient>
        </defs>
        <path d="M -20,-205 C 110,-185 170,-60 160,60 C 150,175 70,228 -40,222 C -95,219 -118,192 -104,160 C -66,120 -52,60 -60,0 C -70,-80 -100,-140 -66,-188 C -55,-200 -40,-206 -20,-205 Z" fill={`url(#${id}g)`} stroke={INK} strokeWidth={6} />
        <path d="M -40,-180 C 10,-120 30,-40 25,60 C 22,130 0,180 -60,210" fill="none" stroke="#d99a12" strokeWidth={5} opacity={0.55} />
        <ellipse cx={-62} cy={214} rx={16} ry={11} fill="#5a3a1a" />
      </>
    ),
    top: <path d="M -38,-200 L -52,-250 Q -40,-262 -26,-252 L -12,-204 Z" fill="#7a5a2a" stroke={INK} strokeWidth={5} />,
  },
  peach: {
    skin: '#ff9877',
    face: [0, 5],
    shoulders: [[-160, 10], [160, 10]],
    hips: [[-60, 160], [60, 160]],
    body: (id) => (
      <>
        <defs>
          <radialGradient id={`${id}g`} cx="0.35" cy="0.3" r="0.85">
            <stop offset="0" stopColor="#ffd6a8" />
            <stop offset="0.5" stopColor="#ff9f7a" />
            <stop offset="1" stopColor="#e8566a" />
          </radialGradient>
        </defs>
        <path d="M 0,-140 C 60,-188 178,-152 172,-20 C 166,112 82,178 0,178 C -82,178 -166,112 -172,-20 C -178,-152 -60,-188 0,-140 Z" fill={`url(#${id}g)`} stroke={INK} strokeWidth={6} />
        <path d="M 0,-138 C -40,-100 -48,-60 -40,-30" fill="none" stroke="#d9505e" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
      </>
    ),
    top: (
      <g transform="translate(6 -150)">
        <path d="M 0,10 Q -4,-20 6,-34" stroke="#6b4a2a" strokeWidth={9} fill="none" strokeLinecap="round" />
        <path d="M 6,-28 C 40,-70 95,-55 105,-30 C 70,-10 30,-12 6,-28 Z" fill="#4fb35a" stroke="#23702f" strokeWidth={4} />
      </g>
    ),
  },
  apple: {
    skin: '#d8283a',
    face: [0, 0],
    shoulders: [[-160, 0], [160, 0]],
    hips: [[-60, 160], [60, 160]],
    body: (id) => (
      <>
        <defs>
          <radialGradient id={`${id}g`} cx="0.35" cy="0.3" r="0.85">
            <stop offset="0" stopColor="#ff7a6a" />
            <stop offset="0.55" stopColor="#d8283a" />
            <stop offset="1" stopColor="#8f1222" />
          </radialGradient>
        </defs>
        <path d="M 0,-130 C 70,-175 180,-140 170,-10 C 160,120 90,180 30,170 Q 0,160 -30,170 C -90,180 -160,120 -170,-10 C -180,-140 -70,-175 0,-130 Z" fill={`url(#${id}g)`} stroke={INK} strokeWidth={6} />
      </>
    ),
    top: (
      <g transform="translate(0 -135)">
        <path d="M 0,6 Q 4,-30 16,-48" stroke="#6b4a2a" strokeWidth={10} fill="none" strokeLinecap="round" />
        {leaf(36, -30, 60)}
      </g>
    ),
  },
  orange: {
    skin: '#ff9a1f',
    face: [0, 0],
    shoulders: [[-165, 0], [165, 0]],
    hips: [[-60, 160], [60, 160]],
    body: (id) => (
      <>
        <defs>
          <radialGradient id={`${id}g`} cx="0.35" cy="0.3" r="0.85">
            <stop offset="0" stopColor="#ffd07a" />
            <stop offset="0.55" stopColor="#ff9a1f" />
            <stop offset="1" stopColor="#d96a00" />
          </radialGradient>
        </defs>
        <circle r={172} fill={`url(#${id}g)`} stroke={INK} strokeWidth={6} />
        {Array.from({ length: 22 }, (_, i) => {
          const a = rnd(i * 2.3) * Math.PI * 2;
          const d = 60 + rnd(i * 5.1) * 100;
          const x = Math.cos(a) * d;
          const y = Math.sin(a) * d;
          return Math.abs(x) < 110 && y > -100 && y < 90 ? null : <circle key={i} cx={x} cy={y} r={4} fill="#e07a10" opacity={0.6} />;
        })}
      </>
    ),
    top: <g transform="translate(0 -165)">{leaf(20, 0, 50)}<circle r={10} fill="#4a7a2a" /></g>,
  },
  lemon: {
    skin: '#ffe23a',
    face: [0, 0],
    shoulders: [[-170, 0], [170, 0]],
    hips: [[-60, 135], [60, 135]],
    body: (id) => (
      <>
        <defs>
          <radialGradient id={`${id}g`} cx="0.35" cy="0.3" r="0.85">
            <stop offset="0" stopColor="#fff6a0" />
            <stop offset="0.55" stopColor="#ffe23a" />
            <stop offset="1" stopColor="#d9b400" />
          </radialGradient>
        </defs>
        <path d="M -200,0 Q -185,-20 -160,-40 C -120,-150 120,-150 160,-40 Q 185,-20 200,0 Q 185,20 160,40 C 120,150 -120,150 -160,40 Q -185,20 -200,0 Z" fill={`url(#${id}g)`} stroke={INK} strokeWidth={6} />
      </>
    ),
    top: <g transform="translate(0 -120)">{leaf(10, 0, 40)}</g>,
  },
  grape: {
    skin: '#7b3fa8',
    face: [0, 0],
    shoulders: [[-150, 0], [150, 0]],
    hips: [[-55, 150], [55, 150]],
    body: (id) => (
      <>
        <defs>
          <radialGradient id={`${id}g`} cx="0.35" cy="0.3" r="0.85">
            <stop offset="0" stopColor="#c48ae8" />
            <stop offset="0.55" stopColor="#7b3fa8" />
            <stop offset="1" stopColor="#3e1a5e" />
          </radialGradient>
        </defs>
        <ellipse rx={158} ry={170} fill={`url(#${id}g)`} stroke={INK} strokeWidth={6} />
        <ellipse cx={-70} cy={-100} rx={30} ry={18} fill="#fff" opacity={0.25} transform="rotate(-30 -70 -100)" />
      </>
    ),
    top: <g transform="translate(0 -165)"><path d="M 0,8 Q 6,-20 -10,-40" stroke="#5a7a2a" strokeWidth={9} fill="none" strokeLinecap="round" /></g>,
  },
  kiwi: {
    skin: '#8a6a3a',
    face: [0, 0],
    shoulders: [[-160, 0], [160, 0]],
    hips: [[-60, 150], [60, 150]],
    body: () => (
      <>
        <ellipse rx={168} ry={172} fill="#8a6a3a" stroke={INK} strokeWidth={6} />
        <ellipse rx={150} ry={154} fill="#8cc63f" />
        <ellipse rx={50} ry={50} fill="#e8f5c8" />
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const x = Math.cos(a) * 125;
          const y = Math.sin(a) * 128;
          return <ellipse key={i} cx={x} cy={y} rx={5} ry={9} fill="#1a1a1a" transform={`rotate(${(a * 180) / Math.PI + 90} ${x} ${y})`} />;
        })}
      </>
    ),
  },
};

// paramètres du visage selon l'émotion
const FACE: Record<Emo, { brow: [number, number]; browY: number; lid: number; mouth: 'smile' | 'smirk' | 'flat' | 'frown' | 'o' | 'wobble' | 'grin'; blush: number }> = {
  neutral: { brow: [0, 0], browY: 0, lid: 0, mouth: 'flat', blush: 0.4 },
  happy: { brow: [-8, -8], browY: -6, lid: 0, mouth: 'smile', blush: 0.7 },
  smug: { brow: [6, -14], browY: 0, lid: 0.45, mouth: 'smirk', blush: 0.3 },
  angry: { brow: [24, 24], browY: 12, lid: 0.38, mouth: 'frown', blush: 0 },
  shocked: { brow: [-6, -6], browY: -22, lid: 0, mouth: 'o', blush: 0 },
  scared: { brow: [-22, -22], browY: -12, lid: 0, mouth: 'wobble', blush: 0 },
  sad: { brow: [-24, -24], browY: 0, lid: 0.25, mouth: 'frown', blush: 0.2 },
  wink: { brow: [-8, -4], browY: -6, lid: 0, mouth: 'grin', blush: 0.8 },
};

const Eye: React.FC<{ x: number; y: number; side: -1 | 1; lid: number; blink: number; look: number; skin: string; emo: Emo; lashes: boolean }> = ({ x, y, side, lid, blink, look, skin, emo, lashes }) => {
  const rx = 31;
  const ry = emo === 'shocked' ? 46 : 40;
  if (emo === 'wink' && side === 1) {
    return <path d={`M ${x - 30},${y + 4} Q ${x},${y - 26} ${x + 30},${y + 4}`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />;
  }
  const close = Math.max(lid, blink);
  const pr = emo === 'shocked' || emo === 'scared' ? 11 : 16;
  // paupière : couvre le haut de l'œil, inclinée vers l'intérieur si en colère
  const tilt = emo === 'angry' ? 18 * side : emo === 'sad' ? -12 * side : 0;
  const lidY = y - ry + close * 2 * ry;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#fff" stroke={INK} strokeWidth={5} />
      <circle cx={x + look * 10} cy={y + 6} r={pr} fill={INK} />
      <circle cx={x + look * 10 - 6} cy={y} r={pr * 0.35} fill="#fff" />
      {close > 0.02 ? (
        <path
          d={`M ${x - rx - 6},${y - ry - 8} L ${x + rx + 6},${y - ry - 8} L ${x + rx + 6},${lidY - tilt} L ${x - rx - 6},${lidY + tilt} Z`}
          fill={skin}
          stroke={INK}
          strokeWidth={5}
          clipPath={undefined}
        />
      ) : null}
      {lashes ? (
        <path d={`M ${x + side * 22},${y - ry + 6} l ${side * 16},-14 M ${x + side * 30},${y - ry + 20} l ${side * 18},-8`} stroke={INK} strokeWidth={5} strokeLinecap="round" />
      ) : null}
    </g>
  );
};

const Mouth: React.FC<{ x: number; y: number; open: number; kind: (typeof FACE)[Emo]['mouth'] }> = ({ x, y, open, kind }) => {
  const o = kind === 'o' ? Math.max(0.55, open) : open;
  if (o > 0.08) {
    const w = kind === 'o' ? 26 : 40;
    const h = 8 + 40 * o;
    const lift = kind === 'smile' || kind === 'grin' ? -6 : 0;
    return (
      <g>
        <path
          d={kind === 'smile' || kind === 'grin'
            ? `M ${x - w - 4},${y + lift} Q ${x},${y + lift - 6} ${x + w + 4},${y + lift} Q ${x + w},${y + h} ${x},${y + h + 4} Q ${x - w},${y + h} ${x - w - 4},${y + lift} Z`
            : `M ${x - w},${y} Q ${x},${y - h * 0.7} ${x + w},${y} Q ${x + w},${y + h} ${x},${y + h} Q ${x - w},${y + h} ${x - w},${y} Z`}
          fill="#5a1222"
          stroke={INK}
          strokeWidth={5}
        />
        <ellipse cx={x} cy={y + h * 0.75} rx={w * 0.55} ry={h * 0.28} fill="#ff6b8a" />
      </g>
    );
  }
  const d = {
    smile: `M ${x - 38},${y - 6} Q ${x},${y + 30} ${x + 38},${y - 6}`,
    grin: `M ${x - 44},${y - 8} Q ${x},${y + 36} ${x + 44},${y - 8}`,
    smirk: `M ${x - 30},${y + 6} Q ${x + 10},${y + 14} ${x + 36},${y - 14}`,
    flat: `M ${x - 26},${y + 4} L ${x + 26},${y + 4}`,
    frown: `M ${x - 32},${y + 14} Q ${x},${y - 12} ${x + 32},${y + 14}`,
    o: '',
    wobble: `M ${x - 34},${y + 6} q 11,-10 22,0 t 22,0 t 22,0`,
  }[kind];
  return <path d={d} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />;
};

const limb = (a: Pt, b: Pt, bend: number) => {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy) || 1;
  return `M ${a[0]},${a[1]} Q ${mx - (dy / l) * bend},${my + (dx / l) * bend} ${b[0]},${b[1]}`;
};

const Glove: React.FC<{ p: Pt }> = ({ p }) => <circle cx={p[0]} cy={p[1]} r={22} fill="#fff" stroke={INK} strokeWidth={5} />;

export const Fruit: React.FC<FruitProps> = ({ kind, emo, mouth, t, seed, acc = [], glasses, tears, sweat, look = 0, speaking, prop }) => {
  const s = SPECS[kind];
  const f = FACE[emo];
  const id = `fr${seed}`;
  const [fx, fy] = s.face;
  // clignement toutes les ~3 s, décalé par personnage
  const ph = (t + rnd(seed) * 3) % 3.2;
  const blink = ph < 0.12 ? Math.sin((ph / 0.12) * Math.PI) : 0;
  const breathe = Math.sin(t * 2.4 + seed) * 0.015;
  const bob = speaking ? Math.abs(Math.sin(t * 9)) * -8 : 0;
  const tremble = emo === 'scared' ? Math.sin(t * 50) * 3 : 0;
  const swing = Math.sin(t * 3 + seed) * 8;

  const [sl, sr] = s.shoulders;
  const [hl, hr] = s.hips;
  let hands: [Pt, Pt];
  let bends: [number, number] = [20, -20];
  switch (emo) {
    case 'angry':
      hands = [[hl[0] - 30, hl[1] - 30], [hr[0] + 30, hr[1] - 30]];
      bends = [-70, 70];
      break;
    case 'shocked':
    case 'scared':
      hands = [[sl[0] - 70, sl[1] - 150], [sr[0] + 70, sr[1] - 150]];
      bends = [40, -40];
      break;
    case 'sad':
      hands = [[sl[0] - 20, sl[1] + 140], [sr[0] + 20, sr[1] + 140]];
      break;
    case 'smug':
      hands = [[hl[0] - 30, hl[1] - 30], [sr[0] + 80, sr[1] - 70]];
      bends = [-70, 30];
      break;
    case 'wink':
      hands = [[sl[0] - 60, sl[1] + 110], [sr[0] + 70 + swing, sr[1] - 170]];
      bends = [20, -30];
      break;
    default:
      hands = [[sl[0] - 55, sl[1] + 115 + swing], [sr[0] + 55, sr[1] + 115 - swing]];
  }
  const feet: [Pt, Pt] = [[hl[0] - 20, 250], [hr[0] + 20, 250]];

  return (
    <g transform={`translate(${tremble} ${bob})`}>
      {/* jambes */}
      {[0, 1].map((i) => (
        <g key={`l${i}`}>
          <path d={limb(s.hips[i], [feet[i][0], feet[i][1] - 10], i ? -10 : 10)} stroke={INK} strokeWidth={15} fill="none" strokeLinecap="round" />
          <ellipse cx={feet[i][0] + (i ? 14 : -14)} cy={feet[i][1]} rx={34} ry={17} fill="#3a2430" stroke={INK} strokeWidth={4} />
        </g>
      ))}
      <g transform={`translate(0 ${-breathe * 200}) scale(${1 - breathe} ${1 + breathe})`}>
        {s.body(id)}
        {s.top}
        {/* joues */}
        <ellipse cx={fx - 78} cy={fy + 40} rx={24} ry={14} fill="#ff5a7a" opacity={f.blush * 0.7} />
        <ellipse cx={fx + 78} cy={fy + 40} rx={24} ry={14} fill="#ff5a7a" opacity={f.blush * 0.7} />
        {emo === 'angry' ? <ellipse cx={fx} cy={fy - 40} rx={120} ry={70} fill="#ff0020" opacity={0.18} /> : null}
        {/* sourcils */}
        {[-1, 1].map((side) => (
          <rect
            key={side}
            x={fx + side * 55 - 28}
            y={fy - 88 + f.browY}
            width={56}
            height={12}
            rx={6}
            fill={INK}
            transform={`rotate(${f.brow[side < 0 ? 0 : 1] * (side < 0 ? 1 : -1)} ${fx + side * 55} ${fy - 82 + f.browY})`}
          />
        ))}
        <Eye x={fx - 55} y={fy - 22} side={-1} lid={f.lid} blink={blink} look={look} skin={s.skin} emo={emo} lashes={acc.includes('lashes')} />
        <Eye x={fx + 55} y={fy - 22} side={1} lid={emo === 'smug' ? f.lid * 0.6 : f.lid} blink={blink} look={look} skin={s.skin} emo={emo} lashes={acc.includes('lashes')} />
        {glasses ? (
          <g>
            <path d={`M ${fx - 100},${fy - 50} L ${fx + 100},${fy - 50}`} stroke={INK} strokeWidth={8} />
            <path d={`M ${fx - 96},${fy - 52} L ${fx - 14},${fy - 52} L ${fx - 22},${fy - 2} Q ${fx - 55},${fy + 12} ${fx - 88},${fy - 2} Z`} fill="#141018" stroke={INK} strokeWidth={4} />
            <path d={`M ${fx + 96},${fy - 52} L ${fx + 14},${fy - 52} L ${fx + 22},${fy - 2} Q ${fx + 55},${fy + 12} ${fx + 88},${fy - 2} Z`} fill="#141018" stroke={INK} strokeWidth={4} />
            <path d={`M ${fx - 80},${fy - 42} l 22,0`} stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
            <path d={`M ${fx + 30},${fy - 42} l 22,0`} stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
          </g>
        ) : null}
        <Mouth x={fx} y={fy + 50} open={mouth} kind={f.mouth} />
        {acc.includes('bow') ? (
          <g transform={`translate(${fx + 95} ${fy - 140}) rotate(18)`}>
            <path d="M 0,0 C -40,-40 -70,-10 -60,20 C -50,40 -20,20 0,0 Z M 0,0 C 40,-40 70,-10 60,20 C 50,40 20,20 0,0 Z" fill="#ff5fa2" stroke={INK} strokeWidth={5} />
            <circle r={13} fill="#ff86bb" stroke={INK} strokeWidth={5} />
          </g>
        ) : null}
        {acc.includes('earrings') ? (
          <>
            <circle cx={s.shoulders[0][0] + 12} cy={fy + 18} r={11} fill="#ffd23f" stroke={INK} strokeWidth={4} />
            <circle cx={s.shoulders[1][0] - 12} cy={fy + 18} r={11} fill="#ffd23f" stroke={INK} strokeWidth={4} />
          </>
        ) : null}
        {acc.includes('tie') ? (
          <g transform={`translate(${fx} ${fy + 120})`}>
            <path d="M -16,0 L 16,0 L 8,14 L 20,78 L 0,98 L -20,78 L -8,14 Z" fill="#2f5bd8" stroke={INK} strokeWidth={5} />
            <path d="M -10,40 L 12,30 M -12,62 L 14,52" stroke="#9fb6ff" strokeWidth={5} />
          </g>
        ) : null}
        {acc.includes('necklace') ? (
          <g>
            {Array.from({ length: 9 }, (_, i) => {
              const a = Math.PI * (0.2 + (i / 8) * 0.6);
              return <circle key={i} cx={fx + Math.cos(a) * 110} cy={fy + 50 + Math.sin(a) * 85} r={10} fill="#fff6ee" stroke={INK} strokeWidth={3} />;
            })}
          </g>
        ) : null}
        {tears ? (
          <>
            {[0, 1].map((k) => {
              const p = (t * 0.9 + k * 0.5) % 1;
              return (
                <g key={k}>
                  <path d={`M ${fx - 60 + k * 120},${fy + 10} q -6,${60 * p + 20} 0,${80 * p + 30}`} stroke="#6cc8ff" strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.85} />
                  <ellipse cx={fx - 62 + k * 124} cy={fy + 60 + 120 * p} rx={9} ry={13} fill="#6cc8ff" opacity={1 - p} />
                </g>
              );
            })}
          </>
        ) : null}
        {sweat ? (
          <path d={`M ${fx + 120},${fy - 110 + ((t * 60) % 40)} q 14,24 0,32 q -14,-8 0,-32 Z`} fill="#8fd8ff" stroke={INK} strokeWidth={4} />
        ) : null}
      </g>
      {/* bras par-dessus le corps */}
      {[0, 1].map((i) => (
        <g key={`a${i}`}>
          <path d={limb(s.shoulders[i], hands[i], bends[i])} stroke={INK} strokeWidth={15} fill="none" strokeLinecap="round" />
          <Glove p={hands[i]} />
        </g>
      ))}
      {prop === 'keys' ? (
        <g transform={`translate(${hands[1][0]} ${hands[1][1] + 20}) rotate(${Math.sin(t * 5) * 14})`}>
          <circle cy={18} r={16} fill="none" stroke="#c9a227" strokeWidth={6} />
          <g transform="translate(-6 34) rotate(12)"><rect width={14} height={60} rx={4} fill="#ffd23f" stroke={INK} strokeWidth={4} /><rect x={10} y={40} width={14} height={8} fill="#ffd23f" stroke={INK} strokeWidth={3} /></g>
          <g transform="translate(6 34) rotate(-22)"><rect width={14} height={52} rx={4} fill="#d0d6e0" stroke={INK} strokeWidth={4} /></g>
        </g>
      ) : null}
    </g>
  );
};
