import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Figure } from '../etsi/Figure';
import { mono, sans } from '../theme';

export type CScene = 'hook' | 'link' | 'watch' | 'build' | 'ask' | 'art' | 'feet' | 'worry' | 'redo' | 'question' | 'loop';
export type CProps = { id: CScene; spk: 's' | 'c' | null; speaking: boolean; local: number; dur: number };
export const PART = '1/3';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const W = 1080;
const H = 1920;
const FLOOR = 1650;
const typed = (s: string, local: number, t0: number, cps = 22) => s.slice(0, Math.floor(interpolate(local, [t0, t0 + s.length / cps], [0, s.length], clamp)));
const blink = (f: number) => f % 120 > 114;

// Claude dans nos histoires : le point d'encre terracotta de la chaîne
const ClaudeDot: React.FC<{ x: number; y: number; r: number; mood?: 'smile' | 'wow' | 'think'; talk?: number }> = ({ x, y, r, mood = 'smile', talk = 0 }) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 9) * r * 0.05 - talk * r * 0.04 * Math.abs(Math.sin(f / 3));
  return (
    <g>
      <ellipse cx={x} cy={y + r + 16} rx={r * 0.9} ry={r * 0.16} fill="rgba(0,0,0,0.3)" />
      <g transform={`translate(${x} ${y + bob})`}>
        <circle r={r} fill="#d97757" stroke="#3a2417" strokeWidth={r * 0.07} />
        <g stroke="#f4ecd9" strokeWidth={r * 0.07} strokeLinecap="round">
          {[0, 45, 90, 135].map((a) => <line key={a} x1="0" y1={-r * 0.62} x2="0" y2={-r * 0.14} transform={`rotate(${a} 0 ${-r * 0.38})`} />)}
        </g>
        {[-1, 1].map((e) => <ellipse key={e} cx={e * r * 0.28} cy={r * 0.1} rx={r * 0.075} ry={mood === 'wow' ? r * 0.14 : blink(f) ? r * 0.02 : r * 0.1} fill="#3a2417" />)}
        {talk > 0.1 ? <ellipse cx="0" cy={r * 0.4} rx={r * 0.12} ry={r * (0.04 + 0.1 * talk)} fill="#3a2417" /> :
          mood === 'think' ? <path d={`M ${-r * 0.16} ${r * 0.4} L ${r * 0.16} ${r * 0.4}`} stroke="#3a2417" strokeWidth={r * 0.06} strokeLinecap="round" /> :
          <path d={`M ${-r * 0.2} ${r * 0.34} Q 0 ${r * 0.5} ${r * 0.2} ${r * 0.34}`} fill="none" stroke="#3a2417" strokeWidth={r * 0.06} strokeLinecap="round" />}
      </g>
    </g>
  );
};

const Stage: React.FC<{ spk: CProps['spk']; speaking: boolean; samMood?: 'shock' | 'happy' | 'worry'; clMood?: 'smile' | 'wow' | 'think'; tint?: string }> = ({ spk, speaking, samMood = 'happy', clMood = 'smile', tint = '#14203a' }) => {
  const f = useCurrentFrame();
  const sTalk = speaking && spk === 's' ? 0.5 + 0.5 * Math.sin(f * 1.5) : samMood === 'shock' ? 0.7 : 0;
  const cTalk = speaking && spk === 'c' ? 0.5 + 0.5 * Math.sin(f * 1.5) : 0;
  return (
    <g>
      <rect width={W} height={H} fill={tint} />
      <circle cx="900" cy="250" r="46" fill="#f6eed3" opacity="0.9" />
      {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={(i * 211) % W} cy={120 + ((i * 97) % 280)} r={2 + (i % 3)} fill="#fff" opacity={0.4 + 0.4 * Math.sin(f / 14 + i)} />)}
      <rect y={FLOOR} width={W} height={H - FLOOR} fill="#7a5638" />
      <rect y={FLOOR - 14} width={W} height="20" fill="#9a7048" />
      <ellipse cx="260" cy={FLOOR + 140} rx="130" ry="20" fill="rgba(0,0,0,0.28)" />
      <Figure x={260} y={FLOOR + 150} s={1.35} sam pose={{ armL: 18, armR: samMood === 'worry' ? 40 : 18 + Math.sin(f / 16) * 3, talk: sTalk, happy: samMood === 'happy', look: 0.6, blink: blink(f) }} />
      <ClaudeDot x={800} y={FLOOR + 10} r={128} mood={clMood} talk={cTalk} />
      {/* qui parle */}
      {spk ? (
        <g transform={spk === 's' ? 'translate(260 1060) rotate(-3)' : 'translate(800 1470) rotate(3)'}>
          <rect x="-90" y="-30" width="180" height="60" rx="30" fill={spk === 's' ? '#3b5fa8' : '#d97757'} stroke="#fff" strokeWidth="5" />
          <text x="0" y="14" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="36" fill="#fff">{spk === 's' ? 'SAM' : 'CLAUDE'}</text>
        </g>
      ) : null}
    </g>
  );
};

/* ---------- cartes ---------- */

const Card: React.FC<{ x?: number; y: number; w: number; h: number; fill?: string; stroke?: string; rot?: number; s?: number; children?: React.ReactNode }> = ({ x = 540, y, w, h, fill = '#f4f6fb', stroke = '#7a86b8', rot = 0, s = 1, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-w / 2 + 8} y={-h / 2 + 10} width={w} height={h} rx="28" fill="rgba(0,0,0,0.35)" />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="28" fill={fill} stroke={stroke} strokeWidth="6" />
    {children}
  </g>
);

const Check: React.FC<{ x: number; y: number; ok: boolean; size?: number }> = ({ x, y, ok, size = 46 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={size / 2} fill={ok ? '#3fa66b' : '#e0463c'} />
    {ok ? <path d={`M ${-size * 0.22} 0 L ${-size * 0.06} ${size * 0.18} L ${size * 0.26} ${-size * 0.18}`} stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      : <path d={`M ${-size * 0.18} ${-size * 0.18} L ${size * 0.18} ${size * 0.18} M ${size * 0.18} ${-size * 0.18} L ${-size * 0.18} ${size * 0.18}`} stroke="#fff" strokeWidth="6" strokeLinecap="round" />}
  </g>
);

const Hook: React.FC<CProps> = ({ spk, speaking }) => (
  <g>
    <Stage spk={spk} speaking={speaking} samMood="shock" clMood="smile" />
    {/* la vidéo « terminée » */}
    <Card y={700} w={420} h={560} fill="#0e1430" rot={-3}>
      <rect x="-190" y="-250" width="380" height="440" rx="18" fill="#1f3b7a" />
      <circle cx="90" cy="-170" r="26" fill="#f6eed3" />
      <rect x="-190" y="40" width="380" height="150" fill="#7a5638" />
      <circle cx="-30" cy="0" r="62" fill="#d97757" stroke="#3a2417" strokeWidth="5" />
      <rect x="-190" y="205" width="380" height="14" rx="7" fill="#2a3560" />
      <rect x="-190" y="205" width="380" height="14" rx="7" fill="#3fa66b" />
      <text x="0" y="262" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="40" fill="#fff">vidéo prête ✓</text>
    </Card>
    <g transform="translate(540 480) rotate(-5)">
      <rect x="-430" y="-72" width="860" height="144" rx="26" fill="#e0463c" stroke="#fff" strokeWidth="9" />
      <text x="0" y="22" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="70" fill="#fff">FAITE PAR CLAUDE</text>
    </g>
  </g>
);

const Link: React.FC<CProps> = ({ local, spk, speaking }) => {
  const msg = typed('fais pareil', local, 1.3, 14);
  const inLink = interpolate(local, [0.3, 0.7], [0, 1], clamp);
  return (
    <g>
      <Stage spk={spk} speaking={speaking} clMood="think" />
      <Card y={640} w={800} h={420}>
        <g opacity={inLink} transform={`scale(${0.8 + 0.2 * inLink})`}>
          <rect x="-340" y="-150" width="680" height="130" rx="34" fill="#3b5fa8" />
          <g transform="translate(-300 -85)" stroke="#fff" strokeWidth="9" strokeLinecap="round" fill="none"><path d="M -14 8 L 14 -8" /><path d="M -26 0 a 14 14 0 0 1 14 -14 h 8" /><path d="M 26 0 a 14 14 0 0 1 -14 14 h -8" /></g>
          <text x="-240" y="-70" fontFamily={sans} fontWeight="800" fontSize="46" fill="#fff">lien TikTok</text>
        </g>
        <rect x="-60" y="10" width="400" height="120" rx="34" fill="#3b5fa8" />
        <text x="-30" y="86" fontFamily={sans} fontWeight="700" fontSize="48" fill="#fff">{msg}</text>
      </Card>
    </g>
  );
};

const Watch: React.FC<CProps> = ({ local, spk, speaking }) => {
  const l1 = typed('$ télécharger la vidéo', local, 0.2, 26);
  const l2 = typed('$ extraire les images', local, 1.6, 26);
  const frames = Math.floor(interpolate(local, [2.2, 3.2], [0, 8], clamp));
  return (
    <g>
      <Stage spk={spk} speaking={speaking} clMood="smile" />
      <Card y={690} w={840} h={560} fill="#10182f">
        <text x="-380" y="-190" fontFamily={mono} fontWeight="700" fontSize="38" fill="#7ae7ff">{l1}</text>
        {local > 1.3 ? <text x="320" y="-190" fontFamily={mono} fontWeight="700" fontSize="42" fill="#5de37a">✓</text> : null}
        <text x="-380" y="-110" fontFamily={mono} fontWeight="700" fontSize="38" fill="#7ae7ff">{l2}</text>
        {Array.from({ length: 8 }, (_, i) => i < frames ? (
          <g key={i} transform={`translate(${-330 + (i % 4) * 175} ${-30 + Math.floor(i / 4) * 150})`}>
            <rect width="150" height="120" rx="10" fill={['#3b5fa8', '#d97757', '#3fa66b', '#e7b53c'][i % 4]} opacity="0.85" />
            <circle cx="75" cy="60" r="22" fill="#f6eed3" opacity="0.8" />
          </g>
        ) : null)}
      </Card>
    </g>
  );
};

const Build: React.FC<CProps> = ({ local, spk, speaking }) => {
  const rows = [['script', 0.3], ['voix', 1.3], ['scènes (code)', 2.4]] as const;
  return (
    <g>
      <Stage spk={spk} speaking={speaking} clMood="smile" />
      <Card y={690} w={840} h={560}>
        {rows.map(([name, t0], i) => {
          const p = interpolate(local, [t0, t0 + 0.9], [0, 1], clamp);
          return (
            <g key={name} transform={`translate(0 ${-150 + i * 150})`}>
              <text x="-370" y="-12" fontFamily={sans} fontWeight="800" fontSize="52" fill="#1d2540">{name}</text>
              <rect x="-370" y="14" width="620" height="26" rx="13" fill="#d7dcea" />
              <rect x="-370" y="14" width={620 * p} height="26" rx="13" fill="#3b5fa8" />
              {p >= 1 ? <Check x={310} y={20} ok /> : null}
            </g>
          );
        })}
      </Card>
    </g>
  );
};

const Ask: React.FC<CProps> = ({ local, spk, speaking }) => {
  const f = useCurrentFrame();
  const k = spring({ frame: f, fps: 30, config: { damping: 9, stiffness: 200 } });
  return (
    <g>
      <Stage spk={spk} speaking={speaking} samMood="shock" clMood="smile" />
      <Card y={700} w={720} h={480} rot={2} s={0.7 + 0.3 * k}>
        <text x="0" y="40" textAnchor="middle" fontFamily={mono} fontWeight="800" fontSize="210" fill="#3b5fa8">&lt;/&gt;</text>
        <text x="250" y="-110" fontFamily={sans} fontWeight="800" fontSize="120" fill="#e0463c" transform={`rotate(${Math.sin(f / 5) * 8} 250 -110)`}>?</text>
      </Card>
    </g>
  );
};

const Art: React.FC<CProps> = ({ local, spk, speaking }) => {
  const l1 = typed('<circle r="60"', local, 0.2, 18);
  const l2 = typed('  fill="terracotta" />', local, 1.0, 18);
  const pop = spring({ frame: Math.max(0, Math.round((local - 1.8) * 30)), fps: 30, config: { damping: 9, stiffness: 190 } });
  return (
    <g>
      <Stage spk={spk} speaking={speaking} clMood="smile" />
      <Card x={300} y={690} w={500} h={400} fill="#10182f">
        <text x="-220" y="-40" fontFamily={mono} fontWeight="700" fontSize="34" fill="#7ae7ff">{l1}</text>
        <text x="-220" y="30" fontFamily={mono} fontWeight="700" fontSize="34" fill="#f6b27a">{l2}</text>
      </Card>
      <g transform="translate(570 690)"><path d="M -30 0 H 30 M 10 -22 L 36 0 L 10 22" stroke="#ffd23f" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
      <Card x={820} y={690} w={340} h={400}>
        <g transform={`scale(${pop})`}>
          <circle r="90" fill="#d97757" stroke="#3a2417" strokeWidth="7" />
          <g stroke="#f4ecd9" strokeWidth="7" strokeLinecap="round">{[0, 45, 90, 135].map((a) => <line key={a} x1="0" y1="-56" x2="0" y2="-13" transform={`rotate(${a} 0 -35)`} />)}</g>
        </g>
      </Card>
    </g>
  );
};

const Feet: React.FC<CProps> = ({ local, spk, speaking }) => {
  const fixed = local > 2.2;
  const rows: [string, boolean][] = [['rythme', true], ['son', true], ['pieds', fixed]];
  const land = interpolate(local, [2.2, 2.6], [0, 1], clamp);
  return (
    <g>
      <Stage spk={spk} speaking={speaking} clMood="smile" />
      <Card y={700} w={840} h={520}>
        <text x="-380" y="-190" fontFamily={sans} fontWeight="800" fontSize="40" fill="#5a6385">contrôle mesuré</text>
        {rows.map(([n, ok], i) => {
          const show = interpolate(local, [0.3 + i * 0.5, 0.6 + i * 0.5], [0, 1], clamp);
          return (
            <g key={n} opacity={show} transform={`translate(0 ${-90 + i * 120})`}>
              <text x="-370" y="16" fontFamily={sans} fontWeight="800" fontSize="58" fill="#1d2540">{n}</text>
              <Check x={320} y={0} ok={ok} size={64} />
            </g>
          );
        })}
        {/* la basket qui flotte, puis se pose */}
        <g transform={`translate(160 ${148 - 100 * (1 - land)})`} opacity={interpolate(local, [1.6, 1.9], [0, 1], clamp)}>
          <ellipse rx="52" ry="22" fill="#fff" stroke="#8a8fa0" strokeWidth="5" />
        </g>
        <line x1="60" y1="170" x2="260" y2="170" stroke="#9aa3bd" strokeWidth="6" />
      </Card>
    </g>
  );
};

const Worry: React.FC<CProps> = ({ spk, speaking }) => (
  <g>
    <Stage spk={spk} speaking={speaking} samMood="worry" clMood="think" />
    <Card y={720} w={820} h={320} rot={-2}>
      <text x="0" y="22" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="68" fill="#1d2540">Et si ça ne me plaît pas ?</text>
    </Card>
  </g>
);

const Redo: React.FC<CProps> = ({ local, spk, speaking }) => {
  const done = local > 1.6;
  const p = interpolate(local, [0.3, 1.6], [0, 1], clamp);
  return (
    <g>
      <Stage spk={spk} speaking={speaking} clMood="smile" />
      <Card y={700} w={800} h={420}>
        <g transform={`translate(-300 -20) rotate(${done ? 0 : local * 360})`}>
          {done ? <Check x={0} y={0} ok size={110} /> : <path d="M 0 -50 a 50 50 0 1 1 -45 22 M -60 -30 L -44 -26 L -52 -44" stroke="#3b5fa8" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
        </g>
        <text x="-200" y="0" fontFamily={sans} fontWeight="800" fontSize="76" fill="#1d2540">{done ? 'prêt' : 'je refais…'}</text>
        <rect x="-340" y="110" width="680" height="28" rx="14" fill="#d7dcea" />
        <rect x="-340" y="110" width={680 * p} height="28" rx="14" fill="#3fa66b" />
      </Card>
    </g>
  );
};

const Question: React.FC<CProps> = ({ local, spk, speaking }) => {
  const f = useCurrentFrame();
  const tapOui = Math.floor(local * 1.4) % 2 === 0;
  const pulse = 1 + 0.03 * Math.sin(f / 4);
  return (
    <g>
      <Stage spk={spk} speaking={speaking} clMood="smile" />
      <g transform={`translate(540 470) rotate(-3) scale(${pulse})`}>
        <rect x="-330" y="-56" width="660" height="112" rx="28" fill="#2fa3a0" stroke="#fff" strokeWidth="8" />
        <text x="0" y="22" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="60" fill="#fff">PARTIE 2 DEMAIN</text>
      </g>
      <text x="540" y="640" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="66" fill="#fff" stroke="#000" strokeWidth="10" paintOrder="stroke">Tu laisserais une IA</text>
      <text x="540" y="720" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="66" fill="#fff" stroke="#000" strokeWidth="10" paintOrder="stroke">faire ta vidéo ?</text>
      <g transform={`translate(300 850) scale(${tapOui ? 1.06 : 1})`}>
        <rect x="-170" y="-66" width="340" height="132" rx="66" fill="#3fa66b" stroke="#fff" strokeWidth="8" />
        <text x="0" y="24" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="66" fill="#fff">OUI</text>
      </g>
      <g transform={`translate(780 850) scale(${tapOui ? 1 : 1.06})`}>
        <rect x="-170" y="-66" width="340" height="132" rx="66" fill="#e0463c" stroke="#fff" strokeWidth="8" />
        <text x="0" y="24" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="66" fill="#fff">NON</text>
      </g>
      <text x="540" y="950" textAnchor="middle" fontFamily={sans} fontWeight="700" fontSize="40" fill="#fff" stroke="#000" strokeWidth="8" paintOrder="stroke">réponds en commentaire 👇</text>
      <text x="540" y="996" textAnchor="middle" fontFamily={sans} fontWeight="600" fontSize="28" fill="#b9c2de">vidéo non officielle, non affiliée à Anthropic</text>
    </g>
  );
};

export const ClaudeSceneView: React.FC<CProps> = (p) => {
  const { fps } = useVideoConfig();
  const f = useCurrentFrame();
  const t = p.local;
  const punch = spring({ frame: f, fps, config: { damping: 14, stiffness: 170 } });
  const start = p.id === 'hook' ? 1.12 : 1.1;
  const settle = 1 + 0.05 * Math.min(1, t / p.dur);
  const zoom = p.id === 'loop' ? 1.12 : interpolate(punch, [0, 1], [start, settle]);
  const fade = p.id === 'hook' || p.id === 'loop' ? 1 : interpolate(f, [0, 3], [0.3, 1], clamp);
  const pan = p.id === 'loop' ? 0 : Math.sin(t * 0.6) * 6;
  const q: CProps = p.id === 'loop' ? { ...p, id: 'hook', local: 0, speaking: false, spk: 's' } : p;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <g transform={`translate(${540 + pan} 1100) scale(${zoom}) translate(-540 -1100)`} opacity={fade}>
        {(p.id === 'hook' || p.id === 'loop') && <Hook {...q} />}
        {p.id === 'link' && <Link {...p} />}
        {p.id === 'watch' && <Watch {...p} />}
        {p.id === 'build' && <Build {...p} />}
        {p.id === 'ask' && <Ask {...p} />}
        {p.id === 'art' && <Art {...p} />}
        {p.id === 'feet' && <Feet {...p} />}
        {p.id === 'worry' && <Worry {...p} />}
        {p.id === 'redo' && <Redo {...p} />}
        {p.id === 'question' && <Question {...p} />}
      </g>
      <g transform="translate(70 345) rotate(-4)">
        <rect x="0" y="-34" width="250" height="68" rx="16" fill="#111" stroke="#fff" strokeWidth="4" />
        <text x="125" y="14" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="38" fill="#ffd23f">PARTIE {PART}</text>
      </g>
    </svg>
  );
};
