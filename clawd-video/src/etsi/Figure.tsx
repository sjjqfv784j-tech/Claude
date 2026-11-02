import React from 'react';

// Un personnage filiforme original : tête ronde couleur chair, sweat de couleur, jambes fines, baskets blanches.
// Origine = sous les pieds. Hauteur d'environ 440 unités. Angles des bras : 0 = le long du corps, 90 = à l'horizontale, 180 = levé.
export type Pose = { armL: number; armR: number; walk?: number; sit?: boolean | 'edge'; talk?: number; look?: number; happy?: boolean; blink?: boolean; tilt?: number };

const ARM = 132;
const handOf = (side: 1 | -1, a: number, y0: number) => {
  const r = (a * Math.PI) / 180;
  return { x: side * (44 + ARM * Math.sin(r)), y: y0 + ARM * Math.cos(r) };
};

export const Figure: React.FC<{
  x: number;
  y: number;
  s?: number;
  pose: Pose;
  hood?: string;
  pants?: string;
  skin?: string;
  hair?: string;
  flip?: boolean;
  phone?: { glow: string } | null;
  sam?: boolean;
}> = ({ x, y, s = 1.5, pose, hood = '#2fa3a0', pants = '#262a45', skin = '#f2c9a0', hair = '#4a2f23', flip = false, phone = null, sam = false }) => {
  if (sam) { hood = '#3b5fa8'; skin = '#C98B62'; hair = '#3A2A22'; if (pants === '#262a45') pants = '#2b2f4a'; }
  const dy = pose.sit ? 78 : 0;
  const shoulderY = -322;
  const L = handOf(-1, pose.armL, shoulderY);
  const R = handOf(1, pose.armR, shoulderY);
  const talk = pose.talk ?? 0;
  const look = (pose.look ?? 0) * 4;
  const eyeH = pose.blink ? 1.5 : 9;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {/* jambes */}
      {pose.sit === 'edge' ? (
        <g stroke={pants} strokeWidth="15" strokeLinecap="round" fill="none">
          <path d="M -18 -128 L -44 -70 L -34 -16" />
          <path d="M 18 -128 L 46 -70 L 36 -16" />
          <ellipse cx="-24" cy="-8" rx="28" ry="12" fill="#fff" stroke="none" />
          <ellipse cx="50" cy="-8" rx="28" ry="12" fill="#fff" stroke="none" />
        </g>
      ) : pose.sit ? (
        <g stroke={pants} strokeWidth="15" strokeLinecap="round" fill="none">
          <path d="M -14 -126 L 104 -126 L 110 -16" />
          <path d="M 12 -126 L 130 -126 L 136 -16" opacity="0.85" />
          <ellipse cx="118" cy="-8" rx="28" ry="12" fill="#fff" stroke="none" />
          <ellipse cx="144" cy="-8" rx="28" ry="12" fill="#fff" stroke="none" />
        </g>
      ) : pose.walk !== undefined ? (
        <g stroke={pants} strokeWidth="15" strokeLinecap="round" fill="none">
          {[1, -1].map((sg) => {
            const sw = Math.sin(pose.walk! + (sg === 1 ? 0 : Math.PI));
            const lift = Math.max(0, Math.cos(pose.walk! + (sg === 1 ? 0 : Math.PI))) * 26;
            const fx = sg * 18 + sw * 52;
            return (
              <g key={sg}>
                <path d={`M ${sg * 16} -200 L ${fx} ${-18 - lift}`} />
                <ellipse cx={fx + 8} cy={-8 - lift} rx="28" ry="12" fill="#fff" stroke="none" />
              </g>
            );
          })}
        </g>
      ) : (
        <g stroke={pants} strokeWidth="15" strokeLinecap="round" fill="none">
          <path d="M -16 -200 L -22 -18" />
          <path d="M 16 -200 L 22 -18" />
          <ellipse cx="-28" cy="-8" rx="28" ry="12" fill="#fff" stroke="none" />
          <ellipse cx="30" cy="-8" rx="28" ry="12" fill="#fff" stroke="none" />
        </g>
      )}
      <g transform={`translate(0 ${dy}) rotate(${pose.tilt ?? 0} 0 -200)`}>
        {/* bras gauche (derrière) */}
        <line x1="-44" y1={shoulderY} x2={L.x} y2={L.y} stroke={hood} strokeWidth="15" strokeLinecap="round" />
        <circle cx={L.x} cy={L.y} r="9" fill={skin} />
        {/* torse : le sweat */}
        <rect x="-52" y="-346" width="104" height="156" rx="30" fill={hood} />
        <path d="M -24 -346 Q 0 -318 24 -346" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="6" strokeLinecap="round" />
        <rect x="-26" y="-240" width="52" height="30" rx="10" fill="rgba(0,0,0,0.12)" />
        {sam ? (
          <g>
            <path d="M -52 -330 Q 0 -300 52 -330" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="6" strokeLinecap="round" />
            <path d="M -30 -350 L 30 -350 L 22 -324 L 0 -314 L -22 -324 Z" fill="#D9534F" />
            <path d="M -3 -318 L -14 -292 L 4 -296 Z" fill="#D9534F" />
          </g>
        ) : null}
        {/* bras droit (devant) */}
        <line x1="44" y1={shoulderY} x2={R.x} y2={R.y} stroke={hood} strokeWidth="15" strokeLinecap="round" />
        <circle cx={R.x} cy={R.y} r="9" fill={skin} />
        {phone ? (
          <g transform={`translate(${R.x} ${R.y}) rotate(-12)`}>
            <rect x="-4" y="-44" width="40" height="64" rx="7" fill="#111827" />
            <rect x="0" y="-40" width="32" height="54" rx="5" fill={phone.glow} />
          </g>
        ) : null}
        {/* cou + tête */}
        <rect x="-10" y="-358" width="20" height="18" fill={skin} />
        <g transform="translate(0 -398)">
          <circle r="50" fill={skin} />
          <path d="M -50 -6 Q -46 -62 4 -58 Q 48 -56 50 -8 Q 36 -34 4 -34 Q -30 -34 -50 -6 Z" fill={hair} />
          {[-1, 1].map((e) => (
            <g key={e}>
              <ellipse cx={e * 19} cy="2" rx="9" ry={eyeH} fill="#fff" />
              <circle cx={e * 19 + look} cy="3" r="4.4" fill="#222" />
            </g>
          ))}
          {sam ? <path d="M -48 6 Q -44 58 0 60 Q 44 58 48 6 Q 38 36 0 38 Q -38 36 -48 6 Z" fill="#3A2A22" /> : null}
          {sam ? (
            <g>
              <path d="M -34 -14 L -8 -20" stroke="#3A2A22" strokeWidth="7" strokeLinecap="round" />
              <path d="M 8 -20 L 34 -14" stroke="#3A2A22" strokeWidth="7" strokeLinecap="round" />
            </g>
          ) : null}
          {talk > 0.08 ? (
            <ellipse cx="0" cy="34" rx="10" ry={3 + talk * 10} fill="#5a2a2a" />
          ) : pose.happy ? (
            <path d="M -14 28 Q 0 42 14 28" fill="none" stroke={sam ? '#f2e6d8' : '#7a2e2e'} strokeWidth="4.5" strokeLinecap="round" />
          ) : (
            <path d="M -10 32 L 10 32" stroke={sam ? '#f2e6d8' : '#7a2e2e'} strokeWidth="4.5" strokeLinecap="round" />
          )}

        </g>
      </g>
    </g>
  );
};
