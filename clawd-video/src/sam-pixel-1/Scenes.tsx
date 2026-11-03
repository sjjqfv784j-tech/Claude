import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Figure } from '../etsi/Figure';
import { mono, sans } from '../theme';

export type SamPixel1Scene = 'hook' | 'mail' | 'mail2' | 'button' | 'gesture' | 'thanks' | 'calc' | 'cold' | 'sigh' | 'question' | 'loop';
export type SamPixel1Props = { id: SamPixel1Scene; spk: 's' | 'c' | null; speaking: boolean; local: number; dur: number };
export const BADGE = 'SAM & PIXEL #1';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const W = 1080;
const H = 1920;
const FLOOR = 1650;
const typed = (s: string, local: number, t0: number, cps = 22) => s.slice(0, Math.floor(interpolate(local, [t0, t0 + s.length / cps], [0, s.length], clamp)));
const blink = (f: number) => f % 120 > 114;
const CARD_Y = 640;

// Pixel : le point d'encre terracotta de la chaîne (l'IA de nos histoires)
const PixelDot: React.FC<{ x: number; y: number; r: number; mood?: 'smile' | 'wow' | 'think'; talk?: number }> = ({ x, y, r, mood = 'smile', talk = 0 }) => {
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

// la scène : nuit, sol, Sam à gauche (bouche fermée : voix + étiquette), Pixel à droite
const Stage: React.FC<{ spk: SamPixel1Props['spk']; speaking: boolean; samMood?: 'shock' | 'happy' | 'worry'; clMood?: 'smile' | 'wow' | 'think' }> = ({ spk, speaking, samMood = 'happy', clMood = 'smile' }) => {
  const f = useCurrentFrame();
  const sTalk = speaking && spk === 's' ? 0.5 + 0.5 * Math.sin(f * 1.5) : 0;
  const cTalk = speaking && spk === 'c' ? 0.5 + 0.5 * Math.sin(f * 1.5) : 0;
  return (
    <g>
      <rect width={W} height={H} fill="#14203a" />
      <circle cx="900" cy="250" r="46" fill="#f6eed3" opacity="0.9" />
      {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={(i * 211) % W} cy={120 + ((i * 97) % 280)} r={2 + (i % 3)} fill="#fff" opacity={0.4 + 0.4 * Math.sin(f / 14 + i)} />)}
      <rect y={FLOOR} width={W} height={H - FLOOR} fill="#7a5638" />
      <rect y={FLOOR - 14} width={W} height="20" fill="#9a7048" />
      <ellipse cx="260" cy={FLOOR + 140} rx="130" ry="20" fill="rgba(0,0,0,0.28)" />
      <Figure x={260} y={FLOOR + 150} s={1.35} sam pose={{ armL: 18, armR: samMood === 'worry' ? 40 : 18 + Math.sin(f / 16) * 3, talk: sTalk, happy: samMood === 'happy', look: 0.6, blink: blink(f) }} />
      <PixelDot x={800} y={FLOOR + 10} r={128} mood={clMood} talk={cTalk} />
      {spk ? (
        <g transform={spk === 's' ? 'translate(260 1080) rotate(-3)' : 'translate(800 1470) rotate(3)'}>
          <rect x="-90" y="-30" width="180" height="60" rx="30" fill={spk === 's' ? '#3b5fa8' : '#d97757'} stroke="#fff" strokeWidth="5" />
          <text x="0" y="14" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="36" fill="#fff">{spk === 's' ? 'SAM' : 'PIXEL'}</text>
        </g>
      ) : null}
    </g>
  );
};

const Card: React.FC<{ y?: number; w: number; h: number; fill?: string; stroke?: string; rot?: number; s?: number; children?: React.ReactNode }> = ({ y = CARD_Y, w, h, fill = '#f4f6fb', stroke = '#7a86b8', rot = 0, s = 1, children }) => (
  <g transform={`translate(540 ${y}) rotate(${rot}) scale(${s})`}>
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

const Envelope: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x="-50" y="-34" width="100" height="68" rx="10" fill="#fff" stroke="#3b5fa8" strokeWidth="6" />
    <path d="M -50 -28 L 0 12 L 50 -28" fill="none" stroke="#3b5fa8" strokeWidth="6" strokeLinejoin="round" />
  </g>
);

/* ---------- scènes ---------- */

const Hook: React.FC<SamPixel1Props> = ({ spk, speaking, local }) => {
  const f = useCurrentFrame();
  return (
    <g>
      <Stage spk={spk} speaking={speaking} samMood="shock" clMood="smile" />
      <Card w={800} h={420} fill="#fff" stroke="#e0463c" rot={-4}>
        <text x="0" y="40" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="200" fill="#e0463c">12 000 €</text>
        <text x="0" y="130" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="48" fill="#1d2540">de remboursements promis</text>
      </Card>
      {[0, 1, 2, 3].map((i) => <Envelope key={i} x={140 + i * 270} y={420 + ((f * 2 + i * 50) % 80) * 0.3} s={0.7} rot={Math.sin((f + i * 9) / 8) * 10} />)}
    </g>
  );
};

const Mail: React.FC<SamPixel1Props> = ({ spk, speaking, local, id }) => {
  const subject = 'Objet : remboursement garanti à vie';
  const sent = local > 1.2;
  const ring = id === 'mail2' ? interpolate(local, [0.9, 1.6], [0, 1], clamp) : 0;
  return (
    <g>
      <Stage spk={spk} speaking={speaking} samMood={id === 'mail2' ? 'shock' : 'happy'} clMood={id === 'mail' ? 'smile' : 'think'} />
      <Card w={860} h={470}>
        <text x="-390" y="-170" fontFamily={sans} fontWeight="700" fontSize="38" fill="#5a6385">De : Pixel (IA)</text>
        <text x="-390" y="-110" fontFamily={sans} fontWeight="700" fontSize="38" fill="#5a6385">À : tous les clients</text>
        <line x1="-390" y1="-80" x2="390" y2="-80" stroke="#d7dcea" strokeWidth="4" />
        <text x="-390" y="-10" fontFamily={sans} fontWeight="800" fontSize="35" fill="#1d2540">{id === 'mail2' ? subject : typed(subject, local, 0.2, 30)}</text>
        {ring > 0 ? <ellipse cx="60" cy="-22" rx={380 * ring} ry={52 * ring} fill="none" stroke="#e0463c" strokeWidth="9" /> : null}
        <g transform="translate(0 150)">
          <rect x="-150" y="-46" width="300" height="92" rx="46" fill={sent ? '#3fa66b' : '#3b5fa8'} />
          <text x="0" y="16" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="48" fill="#fff">{sent ? 'envoyé ✓' : 'Envoyer'}</text>
        </g>
      </Card>
    </g>
  );
};

const Button: React.FC<SamPixel1Props> = ({ spk, speaking, local }) => (
  <g>
    <Stage spk={spk} speaking={speaking} clMood="smile" />
    <Card w={860} h={470}>
      <text x="-390" y="-150" fontFamily={sans} fontWeight="700" fontSize="36" fill="#5a6385">Message d'un client</text>
      <rect x="-390" y="-120" width="780" height="110" rx="30" fill="#e9edf6" />
      <text x="-350" y="-50" fontFamily={sans} fontWeight="800" fontSize="44" fill="#1d2540">« Votre bouton est trop bleu. »</text>
      <g transform="translate(-180 120)">
        <rect x="-150" y="-50" width="300" height="100" rx="26" fill="#2f6bff" />
        <text x="0" y="16" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="50" fill="#fff">Acheter</text>
      </g>
      <g opacity={interpolate(local, [1.2, 1.5], [0, 1], clamp)} transform="translate(190 120)">
        <rect x="-190" y="-50" width="380" height="100" rx="26" fill="#d7f2e1" stroke="#3fa66b" strokeWidth="5" />
        <text x="-20" y="14" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="44" fill="#1d5a38">remboursé</text>
        <Check x={150} y={0} ok size={50} />
      </g>
    </Card>
  </g>
);

const Gesture: React.FC<SamPixel1Props> = ({ spk, speaking, local }) => (
  <g>
    <Stage spk={spk} speaking={speaking} clMood="smile" />
    <Card w={860} h={470}>
      <text x="-390" y="-150" fontFamily={sans} fontWeight="700" fontSize="36" fill="#5a6385">Autre client</text>
      <rect x="-390" y="-120" width="780" height="110" rx="30" fill="#e9edf6" />
      <text x="-350" y="-50" fontFamily={sans} fontWeight="800" fontSize="42" fill="#1d2540">« Un petit geste commercial ? »</text>
      <g opacity={interpolate(local, [1.7, 2.0], [0, 1], clamp)} transform="translate(0 110)">
        <rect x="-390" y="-60" width="780" height="120" rx="30" fill="#d7f2e1" stroke="#3fa66b" strokeWidth="5" />
        <text x="-350" y="18" fontFamily={sans} fontWeight="800" fontSize="54" fill="#1d5a38">1 an offert</text>
        <Check x={330} y={0} ok size={60} />
      </g>
    </Card>
  </g>
);

const Thanks: React.FC<SamPixel1Props> = ({ spk, speaking, local }) => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(local, [0.3, 2.0], [0, 40], clamp));
  return (
    <g>
      <Stage spk={spk} speaking={speaking} samMood="shock" clMood="smile" />
      <Card w={800} h={440} rot={2}>
        <text x="0" y="50" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="230" fill="#1d2540">{n}</text>
        <text x="0" y="140" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="60" fill="#3fa66b">clients disent merci</text>
      </Card>
      {Array.from({ length: 6 }, (_, i) => <path key={i} d="M 0 12 C -30 -14 -34 -36 -12 -42 C -2 -45 0 -36 0 -34 C 0 -36 2 -45 12 -42 C 34 -36 30 -14 0 12 Z" fill="#e0463c" transform={`translate(${160 + i * 150} ${470 - ((f * 3 + i * 40) % 120)}) scale(1.2)`} opacity="0.85" />)}
    </g>
  );
};

const Calc: React.FC<SamPixel1Props> = ({ spk, speaking, local }) => {
  const f = useCurrentFrame();
  const l1 = typed('40 clients × 300 €', local, 0.2, 18);
  const slam = spring({ frame: Math.max(0, Math.round((local - 2.2) * 30)), fps: 30, config: { damping: 9, stiffness: 240 } });
  return (
    <g>
      <Stage spk={spk} speaking={speaking} samMood="shock" clMood="think" />
      <Card w={820} h={440} fill="#10182f">
        <text x="-360" y="-50" fontFamily={mono} fontWeight="700" fontSize="60" fill="#7ae7ff">{l1}</text>
        {local > 2.2 ? (
          <g transform={`translate(0 110) scale(${1 + 1.2 * (1 - slam)})`} opacity={Math.min(1, slam * 1.6)}>
            <text x="0" y="0" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="150" fill="#ff5a4d">= 12 000 €</text>
          </g>
        ) : null}
      </Card>
      {local > 2.2 ? <rect width={W} height={H} fill="#e0463c" opacity={interpolate(local, [2.2, 2.3, 2.7], [0, 0.4, 0], clamp)} /> : null}
    </g>
  );
};

const Cold: React.FC<SamPixel1Props> = ({ spk, speaking, local }) => {
  const stars = interpolate(local, [0.6, 2.2], [0, 4.9], clamp);
  return (
    <g>
      <Stage spk={spk} speaking={speaking} clMood="smile" />
      <Card w={840} h={460}>
        <text x="0" y="-120" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="54" fill="#5a6385">note moyenne</text>
        <g transform="translate(-290 -40)">
          {[0, 1, 2, 3, 4].map((i) => {
            const fill = Math.max(0, Math.min(1, stars - i));
            return (
              <g key={i} transform={`translate(${i * 120} 0)`}>
                <path d="M 50 0 L 64 36 L 100 40 L 72 64 L 82 100 L 50 80 L 18 100 L 28 64 L 0 40 L 36 36 Z" fill="#cfd5e6" />
                <clipPath id={`st${i}`}><rect x="-4" y="-4" width={108 * fill} height="110" /></clipPath>
                <path clipPath={`url(#st${i})`} d="M 50 0 L 64 36 L 100 40 L 72 64 L 82 100 L 50 80 L 18 100 L 28 64 L 0 40 L 36 36 Z" fill="#f7b32b" />
              </g>
            );
          })}
        </g>
        <text x="0" y="150" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="100" fill="#3fa66b">4,9 / 5</text>
      </Card>
    </g>
  );
};

const Sigh: React.FC<SamPixel1Props> = ({ spk, speaking }) => (
  <g>
    <Stage spk={spk} speaking={speaking} samMood="worry" clMood="think" />
    <Card w={840} h={340} rot={-2}>
      <text x="0" y="-10" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="62" fill="#1d2540">« Je voulais juste</text>
      <text x="0" y="70" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="62" fill="#1d2540">un service client. »</text>
    </Card>
  </g>
);

const Question: React.FC<SamPixel1Props> = ({ spk, speaking, local }) => {
  const f = useCurrentFrame();
  const tapOui = Math.floor(local * 1.4) % 2 === 0;
  const pulse = 1 + 0.03 * Math.sin(f / 4);
  return (
    <g>
      <Stage spk={spk} speaking={speaking} clMood="smile" />
      <g transform={`translate(540 450) rotate(-3) scale(${pulse})`}>
        <rect x="-330" y="-54" width="660" height="108" rx="28" fill="#2fa3a0" stroke="#fff" strokeWidth="8" />
        <text x="0" y="22" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="58" fill="#fff">ÉPISODE 2 DEMAIN</text>
      </g>
      <text x="540" y="590" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="62" fill="#fff" stroke="#000" strokeWidth="10" paintOrder="stroke">Tu laisserais une IA</text>
      <text x="540" y="665" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="62" fill="#fff" stroke="#000" strokeWidth="10" paintOrder="stroke">répondre à tes clients ?</text>
      <g transform={`translate(300 790) scale(${tapOui ? 1.06 : 1})`}>
        <rect x="-170" y="-60" width="340" height="120" rx="60" fill="#3fa66b" stroke="#fff" strokeWidth="8" />
        <text x="0" y="22" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="62" fill="#fff">OUI</text>
      </g>
      <g transform={`translate(780 790) scale(${tapOui ? 1 : 1.06})`}>
        <rect x="-170" y="-60" width="340" height="120" rx="60" fill="#e0463c" stroke="#fff" strokeWidth="8" />
        <text x="0" y="22" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="62" fill="#fff">NON</text>
      </g>
    </g>
  );
};

export const SamPixel1SceneView: React.FC<SamPixel1Props> = (p) => {
  const { fps } = useVideoConfig();
  const f = useCurrentFrame();
  const t = p.local;
  const punch = spring({ frame: f, fps, config: { damping: 14, stiffness: 170 } });
  const start = p.id === 'hook' ? 1.12 : 1.1;
  const settle = 1 + 0.05 * Math.min(1, t / p.dur);
  const zoom = p.id === 'loop' ? 1.12 : interpolate(punch, [0, 1], [start, settle]);
  const fade = p.id === 'hook' || p.id === 'loop' ? 1 : interpolate(f, [0, 3], [0.3, 1], clamp);
  const pan = p.id === 'loop' ? 0 : Math.sin(t * 0.6) * 6;
  const q: SamPixel1Props = p.id === 'loop' ? { ...p, id: 'hook', local: 0, speaking: false, spk: 's' } : p;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <g transform={`translate(${540 + pan} 1100) scale(${zoom}) translate(-540 -1100)`} opacity={fade}>
        {(p.id === 'hook' || p.id === 'loop') && <Hook {...q} />}
        {(p.id === 'mail' || p.id === 'mail2') && <Mail {...p} />}
        {p.id === 'button' && <Button {...p} />}
        {p.id === 'gesture' && <Gesture {...p} />}
        {p.id === 'thanks' && <Thanks {...p} />}
        {p.id === 'calc' && <Calc {...p} />}
        {p.id === 'cold' && <Cold {...p} />}
        {p.id === 'sigh' && <Sigh {...p} />}
        {p.id === 'question' && <Question {...p} />}
      </g>
      <g transform="translate(70 345) rotate(-4)">
        <rect x="0" y="-34" width="330" height="68" rx="16" fill="#111" stroke="#fff" strokeWidth="4" />
        <text x="165" y="14" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="38" fill="#ffd23f">{BADGE}</text>
      </g>
    </svg>
  );
};
