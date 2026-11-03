import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Figure } from '../etsi/Figure';
import { mono, sans } from '../theme';

export type MentiScene = 'hook' | 'ask' | 'invent' | 'answerA' | 'answerB' | 'fake' | 'why' | 'cliff' | 'question' | 'loop';
export type MProps = { id: MentiScene; speaking: boolean; local: number; dur: number };
export const PART = '1/3';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const W = 1080;
const H = 1920;
const DESK = 1740;
const SCREEN = { x: 100, y: 410, w: 880, h: 790 };

const typedN = (s: string, local: number, t0: number, cps = 22) => s.slice(0, Math.floor(interpolate(local, [t0, t0 + s.length / cps], [0, s.length], clamp)));
const blink = (f: number) => f % 120 > 114;

// le point d'encre terracotta de la chaîne = l'IA
const PixelDot: React.FC<{ x: number; y: number; r: number; mood?: 'smile' | 'wow' | 'sad' }> = ({ x, y, r, mood = 'smile' }) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 9) * r * 0.05;
  return (
    <g transform={`translate(${x} ${y + bob})`}>
      <circle r={r} fill="#d97757" stroke="#3a2417" strokeWidth={r * 0.07} />
      <g stroke="#f4ecd9" strokeWidth={r * 0.07} strokeLinecap="round">
        {[0, 45, 90, 135].map((a) => <line key={a} x1="0" y1={-r * 0.62} x2="0" y2={-r * 0.14} transform={`rotate(${a} 0 ${-r * 0.38})`} />)}
      </g>
      {[-1, 1].map((e) => <ellipse key={e} cx={e * r * 0.28} cy={r * 0.1} rx={r * 0.075} ry={mood === 'wow' ? r * 0.14 : r * 0.1} fill="#3a2417" />)}
      {mood === 'sad' ? <path d={`M ${-r * 0.2} ${r * 0.42} Q 0 ${r * 0.3} ${r * 0.2} ${r * 0.42}`} fill="none" stroke="#3a2417" strokeWidth={r * 0.06} strokeLinecap="round" />
        : <path d={`M ${-r * 0.2} ${r * 0.34} Q 0 ${r * 0.5} ${r * 0.2} ${r * 0.34}`} fill="none" stroke="#3a2417" strokeWidth={r * 0.06} strokeLinecap="round" />}
    </g>
  );
};

/* ---------- le décor : le bureau de Sam la nuit ---------- */

const Room: React.FC<{ shake?: number; tint?: string }> = ({ shake = 0, tint = '#14203a' }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${shake} 0)`}>
      <rect width={W} height={H} fill={tint} />
      <circle cx="900" cy="250" r="46" fill="#f6eed3" opacity="0.9" />
      {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={(i * 211) % W} cy={120 + ((i * 97) % 280)} r={2 + (i % 3)} fill="#fff" opacity={0.4 + 0.4 * Math.sin(f / 14 + i)} />)}
    </g>
  );
};

const Sam: React.FC<{ talk?: number; worried?: boolean; waving?: boolean }> = ({ talk = 0, worried, waving }) => {
  const f = useCurrentFrame();
  return (
    <g>
      <Figure x={300} y={2100} s={1.5} sam pose={{ armL: 30, armR: waving ? 150 + Math.sin(f / 4) * 18 : 30, talk, happy: !worried, look: 0.4, blink: blink(f) }} />
      <rect y={DESK} width={W} height={H - DESK} fill="#7a5638" />
      <rect y={DESK - 16} width={W} height="22" fill="#9a7048" />
    </g>
  );
};

// l'ordinateur : un grand écran carré avec le chat
const Laptop: React.FC<{ children: React.ReactNode; scale?: number; shake?: number }> = ({ children, scale = 1, shake = 0 }) => (
  <g transform={`translate(${540 + shake} ${SCREEN.y + SCREEN.h / 2}) scale(${scale}) translate(-540 ${-(SCREEN.y + SCREEN.h / 2)})`}>
    <rect x={SCREEN.x - 18} y={SCREEN.y - 18} width={SCREEN.w + 36} height={SCREEN.h + 36} rx="36" fill="#0b0f1f" stroke="#7a86b8" strokeWidth="6" />
    <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx="22" fill="#f4f6fb" />
    {children}
    <rect x="300" y={SCREEN.y + SCREEN.h + 18} width="480" height="34" rx="14" fill="#2a3150" />
  </g>
);

const ChatHeader = () => (
  <g>
    <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height="104" rx="22" fill="#e6eaf3" />
    <PixelDot x={SCREEN.x + 70} y={SCREEN.y + 52} r={34} />
    <text x={SCREEN.x + 130} y={SCREEN.y + 66} fontFamily={sans} fontWeight="800" fontSize="40" fill="#1d2540">IA</text>
    <circle cx={SCREEN.x + 232} cy={SCREEN.y + 52} r="9" fill="#3fa66b" />
  </g>
);

const UserBubble: React.FC<{ chars?: number }> = ({ chars = 999 }) => {
  const l1 = 'Résume-moi le film';
  const l2 = '« La Lune de Tonton Pierre »';
  const a = l1.slice(0, chars), b = l2.slice(0, Math.max(0, chars - l1.length));
  return (
    <g>
      <rect x="320" y="540" width="620" height="170" rx="34" fill="#3b5fa8" />
      <text x="350" y="610" fontFamily={sans} fontWeight="700" fontSize="42" fill="#fff">{a}</text>
      <text x="350" y="670" fontFamily={sans} fontWeight="700" fontSize="42" fill="#fff">{b}</text>
    </g>
  );
};

/* ---------- scènes ---------- */

const AiAnswer: React.FC<{ local: number; stage: 'A' | 'B' | 'full' }> = ({ local, stage }) => {
  const pa = interpolate(local, [0.2, 0.55], [0, 1], clamp);
  const pb = stage === 'A' ? 0 : interpolate(local, [stage === 'B' ? 0.1 : 0.2, 0.45], [0, 1], clamp);
  const stars = stage === 'A' ? 0 : interpolate(local, [stage === 'B' ? 0.9 : 0.4, stage === 'B' ? 1.6 : 0.9], [0, 4.2], clamp);
  const lines = stage === 'A' ? 2 : 4;
  const h = 150 + lines * 62 + (stage === 'A' ? 0 : 70);
  return (
    <g>
      <rect x="140" y="750" width="760" height={h} rx="34" fill="#e9edf6" />
      <g opacity={pa}>
        <text x="175" y="820" fontFamily={sans} fontWeight="800" fontSize="44" fill="#1d2540">La Lune de Tonton Pierre</text>
        <text x="175" y="882" fontFamily={sans} fontWeight="600" fontSize="38" fill="#3b4566">Sorti en 1987</text>
        {stage === 'A' ? null : null}
      </g>
      <g opacity={stage === 'A' ? interpolate(local, [0.9, 1.3], [0, 1], clamp) : 1}>
        <text x="175" y="944" fontFamily={sans} fontWeight="600" fontSize="38" fill="#3b4566">Réalisé par P. Morel</text>
      </g>
      {stage !== 'A' ? (
        <g opacity={pb}>
          <text x="175" y="1006" fontFamily={sans} fontWeight="600" fontSize="38" fill="#3b4566">Un vieil homme parle à la lune…</text>
          <g transform="translate(175 1070)">
            {[0, 1, 2, 3, 4].map((i) => {
              const fill = Math.max(0, Math.min(1, stars - i));
              return (
                <g key={i} transform={`translate(${i * 70} 0)`}>
                  <path d="M 28 0 L 36 20 L 58 22 L 41 36 L 46 58 L 28 46 L 10 58 L 15 36 L -2 22 L 20 20 Z" fill="#c9cfe0" />
                  <clipPath id={`star${i}`}><rect x="-4" y="-4" width={66 * fill} height="70" /></clipPath>
                  <path clipPath={`url(#star${i})`} d="M 28 0 L 36 20 L 58 22 L 41 36 L 46 58 L 28 46 L 10 58 L 15 36 L -2 22 L 20 20 Z" fill="#f7b32b" />
                </g>
              );
            })}
            <text x="360" y="48" fontFamily={sans} fontWeight="800" fontSize="44" fill="#1d2540">4,2/5</text>
          </g>
        </g>
      ) : null}
    </g>
  );
};

const Hook: React.FC<MProps> = ({ local, speaking }) => {
  const f = useCurrentFrame();
  const s = 1;
  return (
    <g>
      <Room />
      <Laptop>
        <ChatHeader />
        <UserBubble />
        <AiAnswer local={9} stage="full" />
      </Laptop>
      {/* le titre, déjà là dès la première image */}
      <g transform={`translate(540 800) rotate(-6) scale(${s})`}>
        <rect x="-420" y="-90" width="840" height="180" rx="26" fill="#e0463c" stroke="#fff" strokeWidth="10" />
        <text x="0" y="22" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="76" fill="#fff">ELLE A INVENTÉ ÇA</text>
      </g>
      <Sam talk={speaking && local > 0.05 ? 0.5 + 0.5 * Math.sin(f * 1.5) : 0} />
    </g>
  );
};

const Ask: React.FC<MProps> = ({ local, speaking }) => {
  const f = useCurrentFrame();
  const n = Math.floor(interpolate(local, [0.3, 2.6], [0, 46], clamp));
  return (
    <g>
      <Room />
      <Laptop>
        <ChatHeader />
        <UserBubble chars={n} />
        {n < 46 && f % 20 < 10 ? <rect x="940" y="580" width="6" height="40" fill="#fff" /> : null}
      </Laptop>
      <Sam talk={speaking ? 0.5 + 0.5 * Math.sin(f * 1.5) : 0} />
    </g>
  );
};

const Invent: React.FC<MProps> = ({ local, speaking }) => {
  const f = useCurrentFrame();
  const count = Math.max(0, Math.ceil(10 - local * 3.2));
  const pen = interpolate(local, [0.2, 0.9], [0, 1], clamp);
  return (
    <g>
      <Room />
      <Laptop scale={1.0}>
        <ChatHeader />
        <UserBubble />
        <ellipse cx="640" cy="640" rx={300 * pen} ry={62 * pen} fill="none" stroke="#e0463c" strokeWidth="9" />
      </Laptop>
      <g transform="translate(300 1290) rotate(-4)">
        <rect x="-210" y="-70" width="640" height="150" rx="22" fill="#ffd23f" stroke="#2b2235" strokeWidth="6" />
        <text x="-176" y="-12" fontFamily={sans} fontWeight="800" fontSize="46" fill="#2b2235">titre inventé il y a</text>
        <text x="-176" y="52" fontFamily={mono} fontWeight="700" fontSize="64" fill="#e0463c">{String(count).padStart(2, '0')} secondes</text>
      </g>
      <Sam talk={speaking ? 0.5 + 0.5 * Math.sin(f * 1.5) : 0} />
    </g>
  );
};

const Answer: React.FC<MProps & { stage: 'A' | 'B' }> = ({ local, speaking, stage }) => {
  const f = useCurrentFrame();
  return (
    <g>
      <Room />
      <Laptop>
        <ChatHeader />
        <UserBubble />
        <AiAnswer local={local} stage={stage} />
      </Laptop>
      <g opacity={interpolate(local, [stage === 'A' ? 1.6 : 1.4, 1.9], [0, 1], clamp)} transform="translate(790 1310) rotate(6)">
        <rect x="-170" y="-50" width="340" height="100" rx="50" fill="#3fa66b" stroke="#fff" strokeWidth="6" />
        <text x="0" y="16" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="40" fill="#fff">« sûr à 100 % »</text>
      </g>
      <Sam talk={speaking ? 0.5 + 0.5 * Math.sin(f * 1.5) : 0} />
    </g>
  );
};

const Fake: React.FC<MProps> = ({ local, speaking }) => {
  const f = useCurrentFrame();
  const slam = spring({ frame: Math.max(0, f - 12), fps: 30, config: { damping: 9, stiffness: 260 } });
  const stamped = local > 0.4;
  const shake = stamped ? Math.sin(local * 80) * 12 * Math.exp(-(local - 0.4) * 7) : 0;
  const flash = interpolate(local, [0.4, 0.5, 0.9], [0, 0.55, 0], clamp);
  return (
    <g>
      <Room shake={shake} />
      <Laptop shake={shake}>
        <ChatHeader />
        <UserBubble />
        <AiAnswer local={9} stage="full" />
      </Laptop>
      {stamped ? (
        <g transform={`translate(540 800) rotate(-12) scale(${1 + 2.2 * (1 - slam)})`} opacity={Math.min(1, slam * 1.6)}>
          <rect x="-430" y="-110" width="860" height="220" rx="24" fill="rgba(255,255,255,0.9)" stroke="#e0463c" strokeWidth="16" />
          <text x="0" y="28" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="96" fill="#e0463c">N&#8217;EXISTE PAS</text>
        </g>
      ) : null}
      <rect width={W} height={H} fill="#e0463c" opacity={flash} />
      <Sam talk={speaking ? 0.9 : 0.6} />
    </g>
  );
};

const Why: React.FC<MProps> = ({ local, speaking }) => {
  const f = useCurrentFrame();
  const words = ['La', 'Lune', 'de', 'Tonton', 'Pierre', 'est', 'un'];
  const shown = Math.min(words.length, Math.floor(local / 0.32) + 1);
  const pick = local > 2.4;
  return (
    <g>
      <Room />
      <Laptop>
        <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx="22" fill="#14203a" />
        <text x="540" y="520" textAnchor="middle" fontFamily={mono} fontWeight="700" fontSize="36" fill="#7ae7ff">l&#8217;IA devine le mot suivant</text>
        {(() => {
          let x = 140, y = 600;
          return words.slice(0, shown).map((w, i) => {
            const cw = w.length * 27 + 64;
            if (x + cw > 940) { x = 140; y += 120; }
            const px = x; x += cw + 16;
            return (
              <g key={w + i} transform={`translate(${px} ${y})`}>
                <rect width={cw} height="90" rx="20" fill="#f6f7fb" />
                <text x={32} y="62" fontFamily={sans} fontWeight="800" fontSize="46" fill="#1d2540">{w}</text>
              </g>
            );
          });
        })()}
        {local > 1.9 ? (
          <g transform="translate(160 930)">
            {[['film', 62], ['roman', 21], ['chat', 5]].map(([w, p], i) => (
              <g key={w as string} transform={`translate(0 ${i * 92})`} opacity={interpolate(local, [1.9 + i * 0.15, 2.2 + i * 0.15], [0, 1], clamp)}>
                <rect width="560" height="76" rx="18" fill={pick && i === 0 ? '#3fa66b' : '#26335f'} />
                <rect x="6" y="6" width={(548 * (p as number)) / 100 * 1.4} height="64" rx="14" fill={pick && i === 0 ? '#5de37a' : '#3b5fa8'} opacity="0.7" />
                <text x="30" y="52" fontFamily={sans} fontWeight="800" fontSize="42" fill="#fff">{w}</text>
                <text x="530" y="52" textAnchor="end" fontFamily={mono} fontWeight="700" fontSize="40" fill="#fff">{p} %</text>
              </g>
            ))}
          </g>
        ) : null}
      </Laptop>
      <Sam talk={speaking ? 0.5 + 0.5 * Math.sin(f * 1.5) : 0} />
    </g>
  );
};

const Cliff: React.FC<MProps> = ({ local }) => {
  const f = useCurrentFrame();
  const txt = typedN('Et si je me trompais sur toi aussi ?', local, 0.5, 18);
  return (
    <g>
      <Room tint="#0b1124" />
      <circle cx="540" cy="760" r={440 + Math.sin(f / 10) * 14} fill="#d97757" opacity="0.14" />
      <PixelDot x={540} y={720} r={230} mood="sad" />
      <text x="540" y="1130" textAnchor="middle" fontFamily={mono} fontWeight="700" fontSize="46" fill="#7ae7ff">{txt}</text>
      <Sam worried />
    </g>
  );
};

const Question: React.FC<MProps> = ({ local, speaking }) => {
  const f = useCurrentFrame();
  const tapOui = Math.floor(local * 1.4) % 2 === 0;
  const pulse = 1 + 0.03 * Math.sin(f / 4);
  return (
    <g>
      <rect width={W} height={H} fill="#f6e4c6" />
      <circle cx="540" cy="780" r="400" fill="#f0c98a" opacity="0.55" />
      <g transform={`translate(540 520) rotate(-3) scale(${pulse})`}>
        <rect x="-330" y="-62" width="660" height="124" rx="30" fill="#2fa3a0" stroke="#fff" strokeWidth="8" />
        <text x="0" y="22" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="64" fill="#fff">PARTIE 2 DEMAIN</text>
      </g>
      <text x="540" y="740" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="76" fill="#2b2235">Tu fais confiance</text>
      <text x="540" y="830" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="76" fill="#2b2235">à ton IA ?</text>
      <g transform={`translate(300 1010) scale(${tapOui ? 1.06 : 1})`}>
        <rect x="-170" y="-70" width="340" height="140" rx="70" fill="#3fa66b" stroke="#fff" strokeWidth="8" />
        <text x="0" y="24" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="70" fill="#fff">OUI</text>
      </g>
      <g transform={`translate(780 1010) scale(${tapOui ? 1 : 1.06})`}>
        <rect x="-170" y="-70" width="340" height="140" rx="70" fill="#e0463c" stroke="#fff" strokeWidth="8" />
        <text x="0" y="24" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="70" fill="#fff">NON</text>
      </g>
      <text x="540" y="1200" textAnchor="middle" fontFamily={sans} fontWeight="700" fontSize="44" fill="#2b2235">réponds en commentaire 👇</text>
      <Figure x={540} y={1900} s={1.15} sam pose={{ armL: 14, armR: 150 + Math.sin(f / 4) * 18, talk: speaking ? 0.5 + 0.5 * Math.sin(f * 1.5) : 0, happy: true, blink: blink(f) }} />
    </g>
  );
};

export const MentiSceneView: React.FC<MProps> = (p) => {
  const { fps } = useVideoConfig();
  const f = useCurrentFrame();
  const t = p.local;
  const punch = spring({ frame: f, fps, config: { damping: 14, stiffness: 170 } });
  const start = p.id === 'hook' ? 1.12 : 1.1;
  const settle = 1 + 0.05 * Math.min(1, t / p.dur);
  const zoom = p.id === 'loop' ? 1.12 : interpolate(punch, [0, 1], [start, settle]);
  const fade = p.id === 'hook' || p.id === 'loop' ? 1 : interpolate(f, [0, 3], [0.3, 1], clamp);
  const pan = p.id === 'loop' ? 0 : Math.sin(t * 0.6) * 6;
  const loopProps = p.id === 'loop' ? { ...p, id: 'hook' as MentiScene, local: 0, speaking: false } : p;
  const badgeIn = p.id === 'loop' || p.id === 'hook' ? 1 : 1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <g transform={`translate(${540 + pan} 1100) scale(${zoom}) translate(-540 -1100)`} opacity={fade}>
        {(p.id === 'hook' || p.id === 'loop') && <Hook {...loopProps} />}
        {p.id === 'ask' && <Ask {...p} />}
        {p.id === 'invent' && <Invent {...p} />}
        {p.id === 'answerA' && <Answer {...p} stage="A" />}
        {p.id === 'answerB' && <Answer {...p} stage="B" />}
        {p.id === 'fake' && <Fake {...p} />}
        {p.id === 'why' && <Why {...p} />}
        {p.id === 'cliff' && <Cliff {...p} />}
        {p.id === 'question' && <Question {...p} />}
      </g>
      {/* le badge de série, sur toutes les scènes */}
      <g transform="translate(70 345) rotate(-4)" opacity={badgeIn}>
        <rect x="0" y="-34" width="250" height="68" rx="16" fill="#111" stroke="#fff" strokeWidth="4" />
        <text x="125" y="14" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="38" fill="#ffd23f">PARTIE {PART}</text>
      </g>
    </svg>
  );
};
