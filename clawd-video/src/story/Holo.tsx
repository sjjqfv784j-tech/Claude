import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { mono, sans } from '../theme';

export const N = {
  cyan: '#4FE3F0',
  green: '#4BE38A',
  red: '#FF5A6A',
  orange: '#FFB347',
  purple: '#B48CFF',
  blue: '#5AA9FF',
  text: '#EAF6FF',
  bg: 'rgba(8, 18, 38, 0.78)',
};

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const usePop = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 13, stiffness: 150 } });
};

// Carte néon façon hologramme
export const Card: React.FC<{ color: string; children: React.ReactNode; delay?: number; style?: React.CSSProperties }> = ({
  color,
  children,
  delay = 0,
  style,
}) => {
  const p = usePop(delay);
  return (
    <div
      style={{
        transform: `scale(${0.6 + 0.4 * p})`,
        opacity: p,
        background: N.bg,
        border: `5px solid ${color}`,
        borderRadius: 30,
        boxShadow: `0 0 28px ${color}88, inset 0 0 22px ${color}33`,
        padding: '26px 34px',
        color: N.text,
        fontFamily: sans,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontWeight: 700, fontSize: 32, opacity: 0.85, marginBottom: 6 }}>{children}</div>
);

const Count: React.FC<{ from: number; to: number; start: number; end: number; suffix?: string }> = ({ from, to, start, end, suffix = '' }) => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(frame, [start, end], [from, to], clamp));
  return (
    <span>
      {v.toLocaleString('fr-FR')}
      {suffix}
    </span>
  );
};

// Petit Clawd en pixels (pour les agents), dessiné à la main en rectangles
export const PixelCrab: React.FC<{ color: string; size: number }> = ({ color, size }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 6) * 2;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <g transform={`translate(0 ${bob})`}>
        <line x1="50" y1="14" x2="50" y2="4" stroke={color} strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="4" r="4" fill={color} />
        <rect x="14" y="14" width="72" height="70" rx="30" fill={color} />
        <rect x="26" y="34" width="48" height="28" rx="12" fill="#0B1426" />
        <circle cx="39" cy="48" r="5" fill="#EAF6FF" />
        <circle cx="61" cy="48" r="5" fill="#EAF6FF" />
        <rect x="26" y="84" width="16" height="8" rx="4" fill={color} opacity="0.8" />
        <rect x="58" y="84" width="16" height="8" rx="4" fill={color} opacity="0.8" />
      </g>
    </svg>
  );
};

/* ---------- écrans ---------- */

const ClockHolo = () => {
  const frame = useCurrentFrame();
  const colon = Math.floor(frame / 15) % 2 === 0;
  return (
    <Card color={N.red} style={{ textAlign: 'center', padding: '30px 70px' }}>
      <Label>Toujours au resto…</Label>
      <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 150, color: N.red, textShadow: `0 0 24px ${N.red}` }}>
        23{colon ? ':' : ' '}52
      </div>
    </Card>
  );
};

const RevenueHolo = () => (
  <Card color={N.green} style={{ padding: '30px 50px' }}>
    <Label>Réservations / semaine</Label>
    <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
      <div style={{ fontWeight: 800, fontSize: 110 }}>
        <Count from={120} to={240} start={6} end={40} />
      </div>
      <div style={{ background: N.green, color: '#062', fontWeight: 800, fontSize: 52, borderRadius: 20, padding: '6px 22px' }}>↑ ×2</div>
    </div>
  </Card>
);

const ROWS = [
  { icon: '📅', label: 'Réservations', v: '×2', c: N.orange },
  { icon: '⭐', label: 'Avis en ligne', v: '×2', c: N.orange },
  { icon: '📦', label: 'Commandes', v: 'le soir', c: N.red },
];
const OverloadHolo = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 26, width: 760 }}>
    {ROWS.map((r, i) => (
      <Card key={r.label} color={r.c} delay={i * 40} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 34px' }}>
        <span style={{ fontWeight: 800, fontSize: 50 }}>
          {r.icon} {r.label}
        </span>
        <span style={{ fontWeight: 800, fontSize: 50, color: r.c }}>{r.v}</span>
      </Card>
    ))}
  </div>
);

const AloneHolo = () => {
  const frame = useCurrentFrame();
  const shake = Math.sin(frame * 1.3) * 5;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
      <div style={{ display: 'flex', gap: 22 }}>
        {['Résas', 'Avis', 'Stocks', 'Cuisine'].map((t, i) => (
          <Card key={t} color={N.orange} delay={i * 5} style={{ padding: '14px 24px', fontWeight: 800, fontSize: 36 }}>
            {t}
          </Card>
        ))}
      </div>
      <div style={{ fontSize: 70, color: N.orange, lineHeight: 0.8 }}>↓ ↓ ↓ ↓</div>
      <Card color={N.red} delay={10} style={{ transform: `translateX(${shake}px)`, fontWeight: 800, fontSize: 64, padding: '18px 60px', color: N.red }}>
        1 SEUL SAM
      </Card>
    </div>
  );
};

const AGENTS = [
  { label: 'RÉSERVATIONS', color: N.blue },
  { label: 'AVIS', color: N.green, badge: '✓ TU VALIDES' },
  { label: 'STOCKS', color: N.purple },
];
// appearAt[i] = frame (local au groupe) où l'agent i apparaît
const AgentsHolo: React.FC<{ appearAt: number[] }> = ({ appearAt }) => {
  const frame = useCurrentFrame();
  const W = 900;
  const xs = [150, 450, 750];
  return (
    <div style={{ position: 'relative', width: W, height: 560 }}>
      <svg width={W} height={560} style={{ position: 'absolute', inset: 0 }}>
        {AGENTS.map((a, i) => {
          if (frame < appearAt[i]) return null;
          const len = interpolate(frame - appearAt[i], [0, 14], [0, 1], clamp);
          const x2 = 450 + (xs[i] - 450) * len;
          const y2 = 170 + (320 - 170) * len;
          return <line key={a.label} x1="450" y1="170" x2={x2} y2={y2} stroke={a.color} strokeWidth="6" strokeDasharray="14 10" opacity="0.9" />;
        })}
      </svg>
      <div style={{ position: 'absolute', left: 450 - 110, top: 0, filter: 'drop-shadow(0 0 18px #3FC1B0)' }}>
        <PixelCrab color="#3FC1B0" size={220} />
      </div>
      {AGENTS.map((a, i) =>
        frame >= appearAt[i] ? (
          <div key={a.label} style={{ position: 'absolute', left: xs[i] - 140, top: 300, width: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ transform: `scale(${Math.min(1, (frame - appearAt[i]) / 10)})` }}>
              <PixelCrab color={a.color} size={120} />
            </div>
            <Card color={a.color} delay={appearAt[i] + 8} style={{ padding: '10px 18px', fontWeight: 800, fontSize: 30, whiteSpace: 'nowrap' }}>
              {a.label}
            </Card>
            {a.badge ? (
              <Card color={N.green} delay={appearAt[i] + 50} style={{ padding: '6px 14px', fontWeight: 800, fontSize: 24, color: N.green }}>
                {a.badge}
              </Card>
            ) : null}
          </div>
        ) : null,
      )}
    </div>
  );
};

const CuisineHolo = () => (
  <Card color={N.orange} style={{ textAlign: 'center', padding: '34px 70px' }}>
    <div style={{ fontSize: 120 }}>👨‍🍳</div>
    <div style={{ fontWeight: 800, fontSize: 64 }}>
      Toi : <span style={{ color: N.orange }}>la cuisine</span>
    </div>
  </Card>
);

const DayBar: React.FC<{ parts: { w: number; c: string; t: string }[] }> = ({ parts }) => (
  <div style={{ display: 'flex', height: 64, borderRadius: 14, overflow: 'hidden', marginTop: 16 }}>
    {parts.map((p, i) => (
      <div key={i} style={{ width: `${p.w}%`, background: p.c, color: '#0B1426', fontWeight: 800, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {p.t}
      </div>
    ))}
  </div>
);

const ScheduleHolo: React.FC<{ after: boolean }> = ({ after }) => {
  const c = after ? N.green : N.red;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26, width: 820 }}>
      <Card color={c} style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
        <div style={{ fontSize: 110 }}>{after ? '😴' : '⏰'}</div>
        <div>
          <Label>Travail</Label>
          <div style={{ fontWeight: 800, fontSize: 70, color: c }}>{after ? '10 h / jour' : '16 h / jour'}</div>
          <Label>Sommeil : {after ? '8 h ✓' : '5 h'}</Label>
        </div>
      </Card>
      <Card color={c} delay={12}>
        <Label>{after ? 'DEMAIN' : "AUJOURD'HUI"}</Label>
        <DayBar
          parts={
            after
              ? [
                  { w: 33, c: N.purple, t: 'SOMMEIL' },
                  { w: 42, c: N.orange, t: 'CUISINE' },
                  { w: 25, c: N.cyan, t: 'AGENTS' },
                ]
              : [
                  { w: 21, c: N.purple, t: '5 h' },
                  { w: 79, c: N.red, t: 'TRAVAIL 16 h' },
                ]
          }
        />
      </Card>
    </div>
  );
};

const FollowHolo = () => {
  const frame = useCurrentFrame();
  const clicked = frame > 45;
  const p = usePop(45);
  return (
    <Card color={clicked ? N.green : N.orange} style={{ textAlign: 'center', padding: '40px 80px' }}>
      <div style={{ fontWeight: 800, fontSize: 56, marginBottom: 26 }}>La suite bientôt…</div>
      <div
        style={{
          display: 'inline-block',
          transform: `scale(${clicked ? 0.95 + 0.08 * p : 1})`,
          background: clicked ? N.green : N.orange,
          color: '#0B1426',
          fontWeight: 800,
          fontSize: 60,
          padding: '20px 60px',
          borderRadius: 999,
        }}
      >
        {clicked ? 'ABONNÉ ✓' : "S'ABONNER"}
      </div>
    </Card>
  );
};

export type HoloKind = 'clock' | 'revenue' | 'overload' | 'alone' | 'agents0' | 'agents1' | 'agents2' | 'agents3' | 'cuisine' | 'before' | 'after' | 'follow';

// starts = frame local de début de chaque segment du groupe (utile pour les agents)
export const Holo: React.FC<{ kind: HoloKind; kinds: HoloKind[]; starts: number[] }> = ({ kind, kinds, starts }) => {
  switch (kind) {
    case 'clock':
      return <ClockHolo />;
    case 'revenue':
      return <RevenueHolo />;
    case 'overload':
      return <OverloadHolo />;
    case 'alone':
      return <AloneHolo />;
    case 'agents0':
    case 'agents1':
    case 'agents2':
    case 'agents3':
      return (
        <AgentsHolo
          appearAt={[1, 2, 3].map((n) => {
            const i = kinds.indexOf(`agents${n}` as HoloKind);
            return i < 0 ? Infinity : starts[i];
          })}
        />
      );
    case 'cuisine':
      return <CuisineHolo />;
    case 'before':
      return <ScheduleHolo after={false} />;
    case 'after':
      return <ScheduleHolo after />;
    case 'follow':
      return <FollowHolo />;
  }
};
