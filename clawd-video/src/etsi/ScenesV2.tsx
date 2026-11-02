import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Figure } from './Figure';
import { mono, sans } from '../theme';

export type SceneId =
  | 'bedNight' | 'phoneAsk' | 'phonePress' | 'bedMorning' | 'kitchen' | 'street' | 'officeA' | 'officeAI'
  | 'applause' | 'homeDoor' | 'homeKid' | 'homeSmile' | 'phoneEnd' | 'bedEnd' | 'cta' | 'loop';
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
    {tile ? Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 100} y1={FLOOR} x2={i * 100 - 120} y2={H} stroke="rgba(0,0,0,0.08)" strokeWidth="3" />) : null}
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
          {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={x + ((i * 97) % w)} cy={y + ((i * 61) % (h * 0.7))} r={2 + (i % 3)} fill="#fff" opacity={0.5 + 0.5 * Math.sin(f / 12 + i)} />)}
        </>
      ) : <circle cx={x + w * 0.5} cy={y + h * 0.35} r="70" fill="#ffd36b" />}
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
      {[-40, -15, 15, 40].map((a, i) => <ellipse key={i} cx={a * 1.3} cy={-130 - (i % 2) * 22} rx="20" ry="64" fill={i % 2 ? '#3f8f5b' : '#2f7a4d'} transform={`rotate(${a + sway} 0 -60)`} />)}
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

// l'avatar de l'IA : le point terracotta de la chaîne
const PixelDot: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 9) * r * 0.06;
  return (
    <g transform={`translate(${x} ${y + bob})`}>
      <circle r={r} fill="#d97757" stroke="#3a2417" strokeWidth={r * 0.07} />
      <g stroke="#f4ecd9" strokeWidth={r * 0.07} strokeLinecap="round">
        {[0, 45, 90, 135].map((a) => <line key={a} x1="0" y1={-r * 0.62} x2="0" y2={-r * 0.14} transform={`rotate(${a} 0 ${-r * 0.38})`} />)}
      </g>
      {[-1, 1].map((e) => <ellipse key={e} cx={e * r * 0.28} cy={r * 0.1} rx={r * 0.075} ry={r * 0.1} fill="#3a2417" />)}
      <path d={`M ${-r * 0.2} ${r * 0.34} Q 0 ${r * 0.5} ${r * 0.2} ${r * 0.34}`} fill="none" stroke="#3a2417" strokeWidth={r * 0.06} strokeLinecap="round" />
    </g>
  );
};

const Defs = () => (
  <defs>
    <radialGradient id="lampGlow"><stop offset="0%" stopColor="#ffd9a0" stopOpacity="0.55" /><stop offset="100%" stopColor="#ffd9a0" stopOpacity="0" /></radialGradient>
    <radialGradient id="phoneGlow"><stop offset="0%" stopColor="#7ae7ff" stopOpacity="0.55" /><stop offset="100%" stopColor="#7ae7ff" stopOpacity="0" /></radialGradient>
    <linearGradient id="sunBeam" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffe6a8" stopOpacity="0.6" /><stop offset="100%" stopColor="#ffe6a8" stopOpacity="0" /></linearGradient>
    <linearGradient id="daySky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8fd3f5" /><stop offset="100%" stopColor="#d9f0fb" /></linearGradient>
  </defs>
);

/* ---------- scènes ---------- */

// la chambre la nuit : Sam sur son lit avec son téléphone (la première et la dernière image de la vidéo)
const BedNight: React.FC<SceneProps> = ({ id, speaking, local }) => {
  const f = useCurrentFrame();
  const talk = useTalk(speaking);
  const end = id === 'bedEnd';
  const cardIn = end ? interpolate(local, [0.3, 0.8], [0, 1], clamp) : 0;
  return (
    <g>
      <Defs />
      <Wall color={end ? '#2b3560' : '#1d2540'} floor="#2a2e4a" />
      <Window x={620} y={330} w={320} h={400} sky={end ? '#3a4a8a' : '#101a3a'} night />
      <Bed x={60} y={1390} blanket="#4b5fa3" sheet="#8a97c8" />
      <Lamp x={900} y={1390} glow />
      <Figure x={330} y={1451} s={1.5} pose={{ armL: 24, armR: 118 + Math.sin(f / 18) * 4, sit: 'edge', talk, look: -0.5, happy: end, blink: blinkAt(f) }} sam pants="#7480b8" phone={{ glow: '#7ae7ff' }} />
      <circle cx="470" cy="1085" r="230" fill="url(#phoneGlow)" opacity={0.6 + 0.4 * Math.sin(f / 7)} />
      {end ? (
        <g transform={`translate(520 ${790 - 40 * cardIn}) scale(${0.6 + 0.4 * cardIn})`} opacity={cardIn}>
          <rect x="-300" y="-70" width="600" height="140" rx="30" fill="#f6f7fb" />
          <text x="0" y="14" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="46" fill="#1d2540">Commence aujourd&#8217;hui</text>
        </g>
      ) : null}
    </g>
  );
};

// le téléphone en gros plan : la question, puis le « oui »
const PhoneClose: React.FC<SceneProps> = ({ id, local }) => {
  const f = useCurrentFrame();
  const ask = id === 'phoneAsk';
  const thumb = ask ? interpolate(local, [1.4, 3.4], [0, 1], clamp) : 1;
  const press = !ask && local > 0.5;
  const typed = 'Tu veux vraiment savoir ?';
  const n = Math.floor(interpolate(local, [0.3, 1.8], [0, typed.length], clamp));
  const flash = !ask ? interpolate(local, [0.45, 0.6, 1.0], [0, 0.8, 0], clamp) : 0;
  const glow = 0.5 + 0.5 * Math.sin(f / 10);
  const squash = press ? 1 - 0.06 * Math.exp(-(local - 0.5) * 8) : 1;
  return (
    <g>
      <rect width={W} height={H} fill="#0e1430" />
      <circle cx="540" cy="900" r={540 + glow * 30} fill="#1f3b7a" opacity="0.4" />
      <rect x="170" y="330" width="740" height="1160" rx="80" fill="#0b0f1f" stroke="#7a86b8" strokeWidth="8" />
      <rect x="205" y="380" width="670" height="1060" rx="50" fill="#162044" />
      <rect x="450" y="348" width="180" height="22" rx="11" fill="#0b0f1f" />
      <PixelDot x={540} y={560} r={96} />
      <text x="540" y="780" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="54" fill="#f6f7fb">{typed.slice(0, press ? typed.length : n)}</text>
      <g transform={`translate(385 945) scale(${squash}) translate(-385 -945)`}>
        <rect x="250" y="880" width="270" height="130" rx="65" fill="#3fa66b" />
        <text x="385" y="965" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="56" fill="#fff">OUI</text>
      </g>
      <rect x="560" y="880" width="270" height="130" rx="65" fill="#6b7390" />
      <text x="695" y="965" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="56" fill="#fff">NON</text>
      {press ? (
        <g>
          <rect x="250" y="1100" width="580" height="22" rx="11" fill="#2a3560" />
          <rect x="250" y="1100" width={580 * interpolate(local, [0.8, 1.35], [0, 1], clamp)} height="22" rx="11" fill="#7ae7ff" />
          <text x="540" y="1200" textAnchor="middle" fontFamily={mono} fontWeight="700" fontSize="38" fill="#7ae7ff">ta vie, dans 10 ans…</text>
        </g>
      ) : null}
      <g transform={`translate(${790 - 405 * thumb} ${1560 - 560 * thumb}) rotate(-18)`}>
        <ellipse cx="0" cy="0" rx="62" ry="110" fill="#c98b62" />
        <ellipse cx="-22" cy="-60" rx="14" ry="22" fill="#e0a77f" opacity="0.7" />
      </g>
      <rect width={W} height={H} fill="#fff" opacity={flash} />
    </g>
  );
};

const BedMorning: React.FC<SceneProps> = ({ speaking, local }) => {
  const f = useCurrentFrame();
  const talk = useTalk(speaking);
  const stretch = interpolate(local, [0.4, 1.6], [20, 172], clamp);
  return (
    <g>
      <Defs />
      <Wall color="#f3dfc2" floor="#d8b98c" />
      <Window x={620} y={330} w={320} h={400} sky="#9edcf5" />
      <polygon points="620,330 940,330 760,1390 140,1390" fill="url(#sunBeam)" />
      <Bed x={60} y={1390} blanket="#f2a65a" sheet="#fff6e8" />
      <Plant x={960} y={1390} s={1.25} />
      <Figure x={520} y={1560} s={1.5} pose={{ armL: stretch, armR: stretch, talk, happy: local > 1, blink: blinkAt(f) }} sam />
      {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={650 + ((i * 53) % 240)} cy={500 + ((i * 97 + f * 1.2) % 700)} r="3" fill="#fff6d0" opacity="0.7" />)}
    </g>
  );
};

const Kitchen: React.FC<SceneProps> = ({ speaking, local }) => {
  const f = useCurrentFrame();
  const talk = useTalk(speaking);
  const sip = Math.max(0, Math.sin((local - 1.4) * 2.2)) * 28;
  return (
    <g>
      <Defs />
      <Wall color="#f7e6c8" floor="#d9b98a" tile />
      <Window x={110} y={330} w={340} h={420} sky="url(#daySky)" />
      <polygon points="110,330 450,330 700,1390 -60,1390" fill="url(#sunBeam)" />
      <rect x="720" y="520" width="260" height="870" rx="18" fill="#e9eef3" stroke="#c5ccd6" strokeWidth="5" />
      <line x1="720" y1="860" x2="980" y2="860" stroke="#c5ccd6" strokeWidth="5" />
      {[['#e0463c', 780, 640], ['#e7b53c', 880, 700], ['#3fa66b', 800, 760]].map(([c, x, y], i) => <rect key={i} x={x as number} y={y as number} width="46" height="46" rx="8" fill={c as string} />)}
      <rect x="-20" y="1240" width="720" height="150" fill="#b78a5a" />
      <rect x="-20" y="1226" width="720" height="22" fill="#d1a672" />
      <g transform="translate(500 1226)">
        <rect x="-36" y="-70" width="72" height="70" rx="10" fill="#fff" stroke="#d7d0c4" strokeWidth="4" />
        {[0, 1, 2].map((i) => <path key={i} d={`M ${-14 + i * 14} -80 q -8 -22 0 -44 q 8 -22 0 -44`} fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.6" transform={`translate(0 ${-((f * 1.6 + i * 18) % 36)})`} />)}
      </g>
      <Figure x={300} y={1580} s={1.5} pose={{ armL: 12, armR: 70 + sip + Math.sin(f / 14) * 3, talk, happy: true, blink: blinkAt(f) }} sam />
    </g>
  );
};

const Street: React.FC<SceneProps> = ({ speaking }) => {
  const f = useCurrentFrame();
  const talk = useTalk(speaking);
  const far = (i: number) => ((i * 260 - f * 2.2) % 1400 + 1400) % 1400 - 260;
  const near = (i: number) => ((i * 420 - f * 6) % 1500 + 1500) % 1500 - 320;
  return (
    <g>
      <Defs />
      <rect width={W} height={H} fill="url(#daySky)" />
      <circle cx="880" cy="380" r="90" fill="#ffe08a" />
      {Array.from({ length: 6 }, (_, i) => <rect key={'f' + i} x={far(i)} y={640 + (i % 3) * 70} width="220" height={FLOOR - 640 - (i % 3) * 70} fill="#b9c6d6" />)}
      {Array.from({ length: 4 }, (_, i) => (
        <g key={'n' + i} transform={`translate(${near(i)} 0)`}>
          <rect x="0" y={480 + (i % 2) * 90} width="320" height={FLOOR - 480 - (i % 2) * 90} fill={['#e8b49a', '#c9d4a5', '#a9c4e0', '#e9cf9a'][i]} />
          {Array.from({ length: 4 }, (_, r) => Array.from({ length: 2 }, (_, c) => <rect key={r * 2 + c} x={50 + c * 140} y={540 + (i % 2) * 90 + r * 160} width="90" height="110" rx="8" fill="#f6efe4" />))}
        </g>
      ))}
      <rect y={FLOOR - 20} width={W} height={H - FLOOR + 20} fill="#cfd3da" />
      <rect y={FLOOR - 20} width={W} height="26" fill="#aab0ba" />
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={(((i * 220 - f * 6) % 1760) + 1760) % 1760 - 200} y="1640" width="120" height="14" rx="7" fill="#fff" opacity="0.8" />)}
      <Figure x={520} y={1560} s={1.5} pose={{ armL: 20 + 28 * Math.sin(f * 0.32 + Math.PI), armR: 20 + 28 * Math.sin(f * 0.32), walk: f * 0.32, talk, happy: true, blink: blinkAt(f) }} sam />
    </g>
  );
};

const Office: React.FC<SceneProps> = ({ id, speaking, local }) => {
  const f = useCurrentFrame();
  const talk = useTalk(speaking);
  const ai = id === 'officeAI';
  const app = id === 'applause';
  const bars = [0.35, 0.5, 0.45, 0.7, 0.9].map((b, i) => b * (app || ai ? 1 : interpolate(local, [0.4 + i * 0.25, 1.0 + i * 0.25], [0, 1], clamp)));
  const clap = app ? 70 + Math.abs(Math.sin(f * 0.9)) * 22 : 12;
  const confetti = app ? Array.from({ length: 36 }, (_, i) => ({ x: (i * 97) % W, y: ((i * 53 + f * (6 + (i % 5))) % 1300) + 200, c: ['#e0463c', '#e7b53c', '#3fa66b', '#6d8cc7'][i % 4], r: (i * 31 + f * 4) % 360 })) : [];
  return (
    <g>
      <Defs />
      <Wall color="#dfe6ee" floor="#b9a58a" tile />
      <rect x="470" y="420" width="520" height="340" rx="14" fill="#1c2438" />
      <rect x="490" y="440" width="480" height="300" rx="8" fill="#f4f7fb" />
      {bars.map((b, i) => <rect key={i} x={520 + i * 84} y={720 - 250 * b} width="56" height={250 * b} rx="6" fill={i === 4 ? '#3fa66b' : '#6d8cc7'} />)}
      <text x="500" y="486" fontFamily={mono} fontWeight="700" fontSize="28" fill="#1c2438">Projet</text>
      {ai ? (
        <g>
          <PixelDot x={900} y={520} r={42} />
          <g transform={`translate(780 ${300 + Math.sin(f / 8) * 6})`}>
            <path d="M 0 40 Q -40 0 0 -30 Q 40 0 0 40 Z" fill="#ffd23f" stroke="#e7b53c" strokeWidth="4" />
            <rect x="-14" y="38" width="28" height="16" rx="5" fill="#8a8f9c" />
          </g>
          <text x="660" y="380" fontFamily={sans} fontWeight="800" fontSize="34" fill="#2b2235">Idée</text>
        </g>
      ) : null}
      <Plant x={120} y={1390} s={1.1} />
      <rect x="40" y="1290" width="130" height="100" fill="#c4a67a" />
      <Figure x={760} y={1500} s={1.15} pose={{ armL: clap, armR: clap, happy: app }} hood="#e0685a" hair="#222" />
      <Figure x={930} y={1500} s={1.15} pose={{ armL: clap, armR: clap, happy: app }} hood="#e7b53c" hair="#7a4a2b" flip />
      <Figure x={340} y={1580} s={1.5} pose={{ armL: ai ? 28 : 12, armR: ai ? 34 : 98 + Math.sin(f / 14) * 6, talk, happy: app || ai, look: 0.7, blink: blinkAt(f) }} sam />
      {confetti.map((c, i) => <rect key={i} x={c.x} y={c.y} width="14" height="24" fill={c.c} transform={`rotate(${c.r} ${c.x} ${c.y})`} />)}
    </g>
  );
};

const HomeDoor: React.FC<SceneProps> = ({ speaking, local }) => {
  const f = useCurrentFrame();
  const talk = useTalk(speaking);
  const walkT = interpolate(local, [0.3, 2.3], [0, 1], clamp);
  const x = 960 - 440 * walkT;
  const moving = walkT > 0 && walkT < 1;
  const open = interpolate(local, [0, 0.4], [0, 1], clamp);
  return (
    <g>
      <Defs />
      <Wall color="#e9d1b0" floor="#bf9764" />
      <Lamp x={140} y={1390} glow />
      <rect x="700" y="560" width="340" height="830" fill="#f6dba0" opacity={0.85 * open} />
      <rect x="690" y="550" width="360" height="850" fill="none" stroke="#7a5638" strokeWidth="26" />
      <polygon points={`1040,550 ${1040 - 150 * open},600 ${1040 - 150 * open},1350 1040,1400`} fill="#8a6342" />
      <Plant x={560} y={1390} s={1} />
      <Figure x={x} y={1570} s={1.5} pose={{ armL: moving ? 20 + 28 * Math.sin(f * 0.3 + Math.PI) : 14, armR: moving ? 20 + 28 * Math.sin(f * 0.3) : 14, walk: moving ? f * 0.3 : undefined, talk, happy: true, blink: blinkAt(f) }} sam />
    </g>
  );
};

const Home: React.FC<SceneProps> = ({ id, speaking }) => {
  const f = useCurrentFrame();
  const talk = useTalk(speaking);
  const smile = id === 'homeSmile';
  return (
    <g>
      <Defs />
      <Wall color="#efd7b8" floor="#c79f6e" />
      <Window x={110} y={360} w={300} h={380} sky="#26335f" night />
      <Lamp x={960} y={1390} glow />
      <rect x="480" y="1180" width="520" height="40" rx="10" fill="#8a6342" />
      <rect x="520" y="1220" width="30" height="170" fill="#7a5638" />
      <rect x="930" y="1220" width="30" height="170" fill="#7a5638" />
      <rect x="620" y="1040" width="280" height="140" rx="10" fill="#222a3d" />
      <rect x="634" y="1052" width="252" height="112" rx="6" fill={smile ? '#c7f0d8' : '#e9eef7'} />
      <text x="760" y="1120" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="34" fill="#1d2540">{smile ? 'Bien joué !' : 'Vérifie la source'}</text>
      {/* chaise de Sam */}
      <rect x="240" y="1392" width="200" height="26" rx="8" fill="#7a5638" />
      <rect x="214" y="1170" width="26" height="248" rx="8" fill="#7a5638" />
      <rect x="250" y="1418" width="22" height="152" fill="#6a4a30" /><rect x="410" y="1418" width="22" height="152" fill="#6a4a30" />
      <Figure x={290} y={1570} s={1.5} pose={{ armL: 20, armR: 84, sit: true, talk, happy: smile, look: 0.6, blink: blinkAt(f) }} sam />
      {/* chaise de l'enfant */}
      <rect x="540" y="1442" width="130" height="20" rx="6" fill="#7a5638" />
      <rect x="528" y="1290" width="18" height="172" rx="6" fill="#7a5638" />
      <rect x="548" y="1462" width="16" height="104" fill="#6a4a30" /><rect x="640" y="1462" width="16" height="104" fill="#6a4a30" />
      <Figure x={560} y={1560} s={1.0} pose={{ armL: 18, armR: smile ? 150 + Math.sin(f / 5) * 12 : 70, sit: true, happy: smile }} hood="#e7b53c" hair="#7a4a2b" />
      {smile ? Array.from({ length: 8 }, (_, i) => <path key={i} d="M 0 -12 L 4 -4 L 12 -4 L 6 2 L 8 11 L 0 6 L -8 11 L -6 2 L -12 -4 L -4 -4 Z" fill="#ffd23f" transform={`translate(${380 + i * 85} ${640 + ((f * 2 + i * 40) % 220)}) scale(${1 + (i % 3) * 0.3})`} opacity="0.85" />) : null}
    </g>
  );
};

const PhoneEnd: React.FC<SceneProps> = ({ local, dur }) => {
  const f = useCurrentFrame();
  const full = 'Cette vie dépend de ce que tu apprends maintenant.';
  const count = Math.floor(interpolate(local, [0.5, dur - 1.0], [0, full.length], clamp));
  const lines: string[] = [];
  let cur = '';
  full.slice(0, count).split(' ').forEach((w) => { if ((cur + ' ' + w).trim().length > 16) { lines.push(cur.trim()); cur = w; } else cur += ' ' + w; });
  lines.push(cur.trim());
  const glow = 0.5 + 0.5 * Math.sin(f / 14);
  return (
    <g>
      <rect width={W} height={H} fill="#0e1430" />
      <circle cx="540" cy="900" r={520 + glow * 30} fill="#1f3b7a" opacity="0.35" />
      <rect x="170" y="360" width="740" height="1140" rx="80" fill="#0b0f1f" stroke="#7a86b8" strokeWidth="8" />
      <rect x="205" y="410" width="670" height="1040" rx="50" fill="#162044" />
      <rect x="450" y="378" width="180" height="22" rx="11" fill="#0b0f1f" />
      <PixelDot x={330} y={540} r={56} />
      <text x="410" y="560" fontFamily={mono} fontWeight="700" fontSize="34" fill="#7ae7ff">&gt; ta vie, dans 10 ans</text>
      {lines.map((l, i) => <text key={i} x="250" y={740 + i * 96} fontFamily={sans} fontWeight="800" fontSize="70" fill="#f6f7fb">{l}</text>)}
      {count < full.length ? <rect x="250" y={740 + (lines.length - 1) * 96 + 14} width="30" height="8" fill="#7ae7ff" opacity={f % 24 < 12 ? 1 : 0} /> : null}
    </g>
  );
};

const Cta: React.FC<SceneProps> = ({ speaking, local }) => {
  const f = useCurrentFrame();
  const talk = useTalk(speaking);
  const clicked = local > 2.6;
  return (
    <g>
      <Defs />
      <rect width={W} height={H} fill="#f6e4c6" />
      <circle cx="540" cy="700" r="340" fill="#f0c98a" opacity="0.55" />
      <text x="540" y="470" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="96" fill="#2b2235">Histoires d&#8217;IA</text>
      <rect x="270" y="500" width="540" height="10" rx="5" fill="#2fa3a0" />
      <rect x="290" y="640" width="500" height="130" rx="65" fill={clicked ? '#3fa66b' : '#e0463c'} transform={clicked ? 'translate(16 21) scale(0.97)' : undefined} />
      <text x="540" y="726" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="62" fill="#fff">{clicked ? 'ABONNÉ ✓' : 'S’ABONNER'}</text>
      <PixelDot x={860} y={560} r={54} />
      <Figure x={540} y={1640} s={1.5} pose={{ armL: 14, armR: 150 + Math.sin(f / 4) * 18, talk, happy: true, blink: blinkAt(f) }} sam />
    </g>
  );
};

export const SceneView: React.FC<SceneProps> = (p) => {
  const { fps } = useVideoConfig();
  const f = useCurrentFrame();
  const t = p.local;
  // un « punch » au début de chaque scène (zoom qui se pose), puis une dérive lente
  const punch = spring({ frame: f, fps, config: { damping: 14, stiffness: 170 } });
  const start = p.id === 'bedNight' ? 1.12 : 1.1;
  const settle = 1 + 0.05 * Math.min(1, t / p.dur);
  const zoom = p.id === 'loop' ? 1.12 : interpolate(punch, [0, 1], [start, settle]);
  const fade = p.id === 'bedNight' || p.id === 'loop' ? 1 : interpolate(f, [0, 3], [0.3, 1], clamp);
  const pan = p.id === 'loop' ? 0 : Math.sin(t * 0.6) * 6;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <g transform={`translate(${540 + pan} 1100) scale(${zoom}) translate(-540 -1100)`} opacity={fade}>
        {(p.id === 'bedNight' || p.id === 'bedEnd' || p.id === 'loop') && <BedNight {...p} />}
        {(p.id === 'phoneAsk' || p.id === 'phonePress') && <PhoneClose {...p} />}
        {p.id === 'bedMorning' && <BedMorning {...p} />}
        {p.id === 'kitchen' && <Kitchen {...p} />}
        {p.id === 'street' && <Street {...p} />}
        {(p.id === 'officeA' || p.id === 'officeAI' || p.id === 'applause') && <Office {...p} />}
        {p.id === 'homeDoor' && <HomeDoor {...p} />}
        {(p.id === 'homeKid' || p.id === 'homeSmile') && <Home {...p} />}
        {p.id === 'phoneEnd' && <PhoneEnd {...p} />}
        {p.id === 'cta' && <Cta {...p} />}
      </g>
    </svg>
  );
};
