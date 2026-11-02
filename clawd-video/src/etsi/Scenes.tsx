import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { Figure } from './Figure';
import { mono, sans } from '../theme';

export type SceneId = 'bedNight' | 'bedMorning' | 'office' | 'home' | 'phone' | 'bedEnd' | 'cta';
export type SceneProps = { id: SceneId; speaking: boolean; local: number; dur: number };

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const W = 1080;
const H = 1920;
const FLOOR = 1390;

const useTalk = (speaking: boolean) => {
  const f = useCurrentFrame();
  return speaking ? 0.5 + 0.5 * Math.sin(f * 1.5) : 0;
};
const blinkAt = (f: number) => f % 120 > 114;

/* ---------- éléments de décor ---------- */

const Wall: React.FC<{ color: string; floor: string; tile?: boolean }> = ({ color, floor, tile }) => (
  <>
    <rect width={W} height={H} fill={color} />
    <rect y={FLOOR} width={W} height={H - FLOOR} fill={floor} />
    <rect y={FLOOR - 14} width={W} height="14" fill="rgba(0,0,0,0.12)" />
    {tile
      ? Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 100} y1={FLOOR} x2={i * 100 - 120} y2={H} stroke="rgba(0,0,0,0.08)" strokeWidth="3" />)
      : null}
  </>
);

const Window: React.FC<{ x: number; y: number; w: number; h: number; sky: string; night?: boolean }> = ({ x, y, w, h, sky, night }) => {
  const f = useCurrentFrame();
  return (
    <g>
      <rect x={x - 14} y={y - 14} width={w + 28} height={h + 28} rx="10" fill="#f6efe4" />
      <rect x={x} y={y} width={w} height={h} fill={sky} />
      {night ? (
        <>
          <circle cx={x + w * 0.72} cy={y + h * 0.28} r="42" fill="#f6eed3" />
          {Array.from({ length: 12 }, (_, i) => (
            <circle key={i} cx={x + ((i * 97) % w)} cy={y + ((i * 61) % (h * 0.7))} r={2 + (i % 3)} fill="#fff" opacity={0.5 + 0.5 * Math.sin(f / 12 + i)} />
          ))}
        </>
      ) : (
        <circle cx={x + w * 0.5} cy={y + h * 0.35} r="70" fill="#ffd36b" />
      )}
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#f6efe4" strokeWidth="12" />
      <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke="#f6efe4" strokeWidth="12" />
    </g>
  );
};

const Plant: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => {
  const f = useCurrentFrame();
  const sway = Math.sin(f / 30) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-40, -15, 15, 40].map((a, i) => (
        <ellipse key={i} cx={a * 1.3} cy={-130 - (i % 2) * 22} rx="20" ry="64" fill={i % 2 ? '#3f8f5b' : '#2f7a4d'} transform={`rotate(${a + sway} 0 -60)`} />
      ))}
      <path d="M -42 -80 L 42 -80 L 32 0 L -32 0 Z" fill="#c4683f" />
    </g>
  );
};

const Bed: React.FC<{ x: number; y: number; blanket: string; sheet?: string }> = ({ x, y, blanket, sheet = '#dfe7f3' }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x="-20" y="-150" width="30" height="190" rx="8" fill="#7a5638" />
    <rect x="0" y="-60" width="720" height="70" rx="14" fill="#8a6342" />
    <rect x="0" y="-130" width="700" height="80" rx="30" fill={sheet} />
    <rect x="0" y="-100" width="560" height="60" rx="24" fill={blanket} />
    <rect x="30" y="-170" width="150" height="70" rx="30" fill="#f7f9fd" />
    <rect x="690" y="-60" width="30" height="100" rx="8" fill="#7a5638" />
  </g>
);

const Lamp: React.FC<{ x: number; y: number; glow?: boolean }> = ({ x, y, glow }) => (
  <g transform={`translate(${x} ${y})`}>
    {glow ? <circle cx="0" cy="-180" r="190" fill="url(#lampGlow)" /> : null}
    <rect x="-70" y="-90" width="140" height="90" rx="10" fill="#8a6342" />
    <rect x="-8" y="-200" width="16" height="112" fill="#555" />
    <path d="M -60 -170 L 60 -170 L 36 -240 L -36 -240 Z" fill={glow ? '#ffd9a0' : '#d9c6a0'} />
  </g>
);

/* ---------- scènes ---------- */

const Defs = () => (
  <defs>
    <radialGradient id="lampGlow"><stop offset="0%" stopColor="#ffd9a0" stopOpacity="0.55" /><stop offset="100%" stopColor="#ffd9a0" stopOpacity="0" /></radialGradient>
    <radialGradient id="phoneGlow"><stop offset="0%" stopColor="#7ae7ff" stopOpacity="0.55" /><stop offset="100%" stopColor="#7ae7ff" stopOpacity="0" /></radialGradient>
    <linearGradient id="sunBeam" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffe6a8" stopOpacity="0.6" /><stop offset="100%" stopColor="#ffe6a8" stopOpacity="0" /></linearGradient>
  </defs>
);

const BedNight: React.FC<SceneProps & { end?: boolean }> = ({ speaking, local, end }) => {
  const f = useCurrentFrame();
  const talk = useTalk(speaking);
  const pressed = local > (end ? 0.2 : 8.0);
  const text = end ? 'Commence aujourd’hui' : pressed ? 'Ta vie dans 10 ans' : 'Tu veux vraiment savoir ?';
  const cardIn = interpolate(local, [end ? 0.2 : 4.2, end ? 0.7 : 4.8], [0, 1], clamp);
  return (
    <g>
      <Defs />
      <Wall color={end ? '#2b3560' : '#1d2540'} floor="#2a2e4a" />
      <Window x={620} y={330} w={320} h={400} sky={end ? '#3a4a8a' : '#101a3a'} night />
      <Bed x={60} y={1390} blanket="#4b5fa3" sheet="#8a97c8" />
      <Lamp x={900} y={1390} glow />
      <Figure x={330} y={1560} s={1.5} pose={{ armL: 24, armR: 118 + Math.sin(f / 18) * 4, sit: true, talk, look: -0.5, happy: end || pressed, blink: blinkAt(f) }} sam pants="#7480b8" phone={{ glow: '#7ae7ff' }} />
      <circle cx="470" cy="1190" r="230" fill="url(#phoneGlow)" />
      {/* la carte de l'appli, qui flotte au-dessus du téléphone */}
      <g transform={`translate(520 ${790 - 40 * cardIn}) scale(${0.6 + 0.4 * cardIn})`} opacity={cardIn}>
        <rect x="-300" y="-70" width="600" height="140" rx="30" fill="#f6f7fb" />
        <text x="0" y="14" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="46" fill="#1d2540">{text}</text>
        {!end && !pressed ? (
          <g>
            <rect x="-210" y="90" width="170" height="64" rx="32" fill="#3fa66b" />
            <text x="-125" y="135" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="36" fill="#fff">OUI</text>
            <rect x="40" y="90" width="170" height="64" rx="32" fill="#6b7390" />
            <text x="125" y="135" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="36" fill="#fff">NON</text>
          </g>
        ) : null}
      </g>
    </g>
  );
};

const BedMorning: React.FC<SceneProps> = ({ speaking, local }) => {
  const f = useCurrentFrame();
  const talk = useTalk(speaking);
  const stretch = interpolate(local, [0.8, 2.2], [20, 172], clamp);
  return (
    <g>
      <Defs />
      <Wall color="#f3dfc2" floor="#d8b98c" />
      <Window x={620} y={330} w={320} h={400} sky="#9edcf5" />
      <polygon points="620,330 940,330 760,1390 140,1390" fill="url(#sunBeam)" />
      <Bed x={60} y={1390} blanket="#f2a65a" sheet="#fff6e8" />
      <Plant x={960} y={1390} s={1.25} />
      <Figure x={520} y={1560} s={1.5} pose={{ armL: stretch, armR: stretch, talk, happy: local > 1.5, blink: blinkAt(f) }} sam />
      {Array.from({ length: 10 }, (_, i) => (
        <circle key={i} cx={650 + ((i * 53) % 240)} cy={500 + ((i * 97 + f * 1.2) % 700)} r="3" fill="#fff6d0" opacity="0.7" />
      ))}
    </g>
  );
};

const Office: React.FC<SceneProps> = ({ speaking, local }) => {
  const f = useCurrentFrame();
  const talk = useTalk(speaking);
  const bars = [0.35, 0.5, 0.45, 0.7, 0.9].map((b, i) => b * interpolate(local, [0.8 + i * 0.3, 1.5 + i * 0.3], [0, 1], clamp));
  const clapping = local > 6.5;
  const clap = clapping ? 70 + Math.abs(Math.sin(f * 0.9)) * 22 : 12;
  return (
    <g>
      <Defs />
      <Wall color="#dfe6ee" floor="#b9a58a" tile />
      {/* l'écran avec un graphique */}
      <rect x="470" y="420" width="520" height="340" rx="14" fill="#1c2438" />
      <rect x="490" y="440" width="480" height="300" rx="8" fill="#f4f7fb" />
      {bars.map((b, i) => <rect key={i} x={520 + i * 84} y={720 - 250 * b} width="56" height={250 * b} rx="6" fill={i === 4 ? '#3fa66b' : '#6d8cc7'} />)}
      <text x="500" y="486" fontFamily={mono} fontWeight="700" fontSize="28" fill="#1c2438">Projet</text>
      <Plant x={120} y={1390} s={1.1} />
      <rect x="40" y="1290" width="130" height="100" fill="#c4a67a" />
      {/* l'équipe qui applaudit */}
      <Figure x={760} y={1500} s={1.15} pose={{ armL: clap, armR: clap, happy: clapping }} hood="#e0685a" hair="#222" />
      <Figure x={930} y={1500} s={1.15} pose={{ armL: clap, armR: clap, happy: clapping }} hood="#e7b53c" hair="#7a4a2b" flip />
      {/* le héros qui présente */}
      <Figure x={340} y={1580} s={1.5} pose={{ armL: 12, armR: 98 + Math.sin(f / 14) * 6, talk, happy: clapping, look: 0.7, blink: blinkAt(f) }} sam />
    </g>
  );
};

const Home: React.FC<SceneProps> = ({ speaking, local }) => {
  const f = useCurrentFrame();
  const talk = useTalk(speaking);
  const smile = local > 6.2;
  return (
    <g>
      <Defs />
      <Wall color="#efd7b8" floor="#c79f6e" />
      <Window x={110} y={360} w={300} h={380} sky="#26335f" night />
      <Lamp x={960} y={1390} glow />
      <rect x="480" y="1180" width="520" height="40" rx="10" fill="#8a6342" />
      <rect x="520" y="1220" width="30" height="170" fill="#7a5638" />
      <rect x="930" y="1220" width="30" height="170" fill="#7a5638" />
      {/* l'ordinateur sur la table */}
      <rect x="620" y="1040" width="280" height="140" rx="10" fill="#222a3d" />
      <rect x="634" y="1052" width="252" height="112" rx="6" fill={smile ? '#c7f0d8' : '#e9eef7'} />
      <text x="760" y="1120" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="34" fill="#1d2540">{smile ? 'Bien joué !' : 'Vérifie la source'}</text>
      <Figure x={290} y={1570} s={1.5} pose={{ armL: 20, armR: 84, sit: true, talk, happy: smile, look: 0.6, blink: blinkAt(f) }} sam />
      <Figure x={560} y={1560} s={1.0} pose={{ armL: 18, armR: smile ? 150 + Math.sin(f / 5) * 12 : 70, sit: true, happy: smile }} hood="#e7b53c" hair="#7a4a2b" />
    </g>
  );
};

const Phone: React.FC<SceneProps> = ({ local, dur }) => {
  const f = useCurrentFrame();
  const full = 'Cette vie dépend de ce que tu apprends maintenant.';
  const count = Math.floor(interpolate(local, [0.6, dur - 1.2], [0, full.length], clamp));
  const lines: string[] = [];
  let cur = '';
  full.slice(0, count).split(' ').forEach((w) => {
    if ((cur + ' ' + w).trim().length > 16) { lines.push(cur.trim()); cur = w; } else cur += ' ' + w;
  });
  lines.push(cur.trim());
  const glow = 0.5 + 0.5 * Math.sin(f / 14);
  return (
    <g>
      <rect width={W} height={H} fill="#0e1430" />
      <circle cx="540" cy="900" r={520 + glow * 30} fill="#1f3b7a" opacity="0.35" />
      <rect x="170" y="360" width="740" height="1140" rx="80" fill="#0b0f1f" stroke="#7a86b8" strokeWidth="8" />
      <rect x="205" y="410" width="670" height="1040" rx="50" fill="#162044" />
      <rect x="450" y="378" width="180" height="22" rx="11" fill="#0b0f1f" />
      <text x="540" y="560" textAnchor="middle" fontFamily={mono} fontWeight="700" fontSize="34" fill="#7ae7ff">&gt; ta vie, dans 10 ans</text>
      {lines.map((l, i) => (
        <text key={i} x="250" y={720 + i * 96} fontFamily={sans} fontWeight="800" fontSize="70" fill="#f6f7fb">{l}</text>
      ))}
      {count < full.length ? <rect x="250" y={720 + (lines.length - 1) * 96 + 14} width="30" height="8" fill="#7ae7ff" opacity={f % 24 < 12 ? 1 : 0} /> : null}
    </g>
  );
};

const Cta: React.FC<SceneProps> = ({ speaking, local }) => {
  const f = useCurrentFrame();
  const talk = useTalk(speaking);
  const click = 3.0;
  const clicked = local > click;
  return (
    <g>
      <Defs />
      <rect width={W} height={H} fill="#f6e4c6" />
      <circle cx="540" cy="700" r="340" fill="#f0c98a" opacity="0.55" />
      <text x="540" y="470" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="96" fill="#2b2235">Histoires d&#8217;IA</text>
      <rect x="270" y="500" width="540" height="10" rx="5" fill="#2fa3a0" />
      <rect x="290" y="640" width="500" height="130" rx="65" fill={clicked ? '#3fa66b' : '#e0463c'} transform={`scale(${clicked ? 0.97 : 1})`} />
      <text x="540" y="726" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="62" fill="#fff">{clicked ? 'ABONNÉ ✓' : 'S’ABONNER'}</text>
      <Figure x={540} y={1640} s={1.5} pose={{ armL: 14, armR: 150 + Math.sin(f / 4) * 18, talk, happy: true, blink: blinkAt(f) }} sam />
    </g>
  );
};

export const SceneView: React.FC<SceneProps> = (p) => {
  const local = p.local;
  const f = useCurrentFrame();
  const zoom = 1 + 0.05 * Math.min(1, local / p.dur);
  const fade = interpolate(f, [0, 5], [0, 1], clamp);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <g transform={`translate(540 1100) scale(${zoom}) translate(-540 -1100)`} opacity={fade}>
        {p.id === 'bedNight' && <BedNight {...p} />}
        {p.id === 'bedMorning' && <BedMorning {...p} />}
        {p.id === 'office' && <Office {...p} />}
        {p.id === 'home' && <Home {...p} />}
        {p.id === 'phone' && <Phone {...p} />}
        {p.id === 'bedEnd' && <BedNight {...p} end />}
        {p.id === 'cta' && <Cta {...p} />}
      </g>
    </svg>
  );
};
