import React from 'react';

export type Mood = 'tired' | 'neutral' | 'surprised' | 'happy';

const SKIN = '#C98B62';
const SKIN_SHADE = '#B37752';
const HAIR = '#3A2A22';
const JACKET = '#F4F1EA';
const JACKET_SHADE = '#DCD6CA';
const SCARF = '#D9534F';
const INK = '#2B2235';

// Sam, chef cuisinier. `talk` (0 → 1) = ouverture de la bouche, pilotée par la voix.
// `frame` = frame absolu de la vidéo (pour que la respiration ne saute pas entre deux plans)
export const Sam: React.FC<{ mood: Mood; talk: number; width: number; frame: number }> = ({ mood, talk, width, frame }) => {
  const blink = frame % 96 > 90 ? 0.1 : 1;
  const breathe = Math.sin(frame / 22) * 4;
  const headTilt = Math.sin(frame / 37) * 2 + talk * 3;

  const brow = {
    tired: { l: 'M118 196 Q140 186 162 194', r: 'M238 194 Q260 186 282 196', y: 6 },
    neutral: { l: 'M118 190 Q140 180 162 188', r: 'M238 188 Q260 180 282 190', y: 0 },
    surprised: { l: 'M116 176 Q140 160 164 172', r: 'M236 172 Q260 160 284 176', y: -8 },
    happy: { l: 'M118 186 Q140 176 162 184', r: 'M238 184 Q260 176 282 186', y: -2 },
  }[mood];
  const eyeOpen = (mood === 'tired' ? 0.6 : mood === 'surprised' ? 1.25 : 1) * blink;
  const mouthH = 4 + talk * 34 + (mood === 'surprised' ? 10 : 0);

  return (
    <svg width={width} height={(width * 560) / 400} viewBox="0 0 400 560" style={{ overflow: 'visible' }}>
      {/* corps */}
      <g transform={`translate(0 ${breathe})`}>
        <path d="M40 560 Q40 410 130 385 L270 385 Q360 410 360 560 Z" fill={JACKET} />
        <path d="M200 395 L200 560" stroke={JACKET_SHADE} strokeWidth="6" />
        {[430, 480, 530].map((y) => (
          <g key={y}>
            <circle cx="172" cy={y} r="9" fill={JACKET_SHADE} />
            <circle cx="228" cy={y} r="9" fill={JACKET_SHADE} />
          </g>
        ))}
        {/* foulard */}
        <path d="M150 372 L250 372 L236 408 L200 420 L164 408 Z" fill={SCARF} />
        <path d="M196 410 L180 452 L206 446 Z" fill={SCARF} />
        {/* cou */}
        <rect x="172" y="330" width="56" height="50" rx="12" fill={SKIN_SHADE} />
      </g>

      {/* tête */}
      <g transform={`rotate(${headTilt} 200 330)`}>
        <ellipse cx="96" cy="236" rx="18" ry="26" fill={SKIN_SHADE} />
        <ellipse cx="304" cy="236" rx="18" ry="26" fill={SKIN_SHADE} />
        <rect x="100" y="120" width="200" height="230" rx="96" fill={SKIN} />
        {/* barbe courte */}
        <path d="M108 250 Q110 350 200 352 Q290 350 292 250 Q280 318 200 322 Q120 318 108 250 Z" fill={HAIR} opacity="0.85" />
        {/* cheveux sous la toque */}
        <path d="M104 190 Q104 130 200 124 Q296 130 296 190 Q270 150 200 150 Q130 150 104 190 Z" fill={HAIR} />
        {/* toque */}
        <rect x="112" y="96" width="176" height="46" rx="10" fill={JACKET} />
        <path d="M118 104 Q90 50 140 30 Q160 -10 200 10 Q240 -10 262 30 Q312 50 282 104 Z" fill={JACKET} />
        <path d="M150 100 L150 60 M200 100 L200 48 M250 100 L250 60" stroke={JACKET_SHADE} strokeWidth="5" strokeLinecap="round" />

        {/* sourcils */}
        <g transform={`translate(0 ${brow.y})`}>
          <path d={brow.l} stroke={HAIR} strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d={brow.r} stroke={HAIR} strokeWidth="10" fill="none" strokeLinecap="round" />
        </g>
        {/* yeux */}
        <ellipse cx="142" cy="222" rx="13" ry={16 * eyeOpen} fill={INK} />
        <ellipse cx="258" cy="222" rx="13" ry={16 * eyeOpen} fill={INK} />
        {eyeOpen > 0.5 ? (
          <>
            <circle cx="146" cy={218} r="4" fill="#fff" />
            <circle cx="262" cy={218} r="4" fill="#fff" />
          </>
        ) : null}
        {mood === 'tired' ? (
          <>
            <path d="M126 246 Q142 256 158 246" stroke={SKIN_SHADE} strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M242 246 Q258 256 274 246" stroke={SKIN_SHADE} strokeWidth="5" fill="none" strokeLinecap="round" />
          </>
        ) : null}
        {mood === 'happy' ? (
          <>
            <ellipse cx="124" cy="262" rx="18" ry="10" fill="#E07A6A" opacity="0.45" />
            <ellipse cx="276" cy="262" rx="18" ry="10" fill="#E07A6A" opacity="0.45" />
          </>
        ) : null}
        {/* nez */}
        <path d="M200 232 Q214 262 196 268" stroke={SKIN_SHADE} strokeWidth="7" fill="none" strokeLinecap="round" />
        {/* bouche */}
        {talk > 0.05 || mood === 'surprised' ? (
          <ellipse cx="200" cy={298} rx={mood === 'surprised' ? 18 : 26} ry={mouthH / 2} fill="#5A2A2A" />
        ) : mood === 'happy' ? (
          <path d="M168 290 Q200 318 232 290" stroke="#5A2A2A" strokeWidth="8" fill="none" strokeLinecap="round" />
        ) : mood === 'tired' ? (
          <path d="M176 302 Q200 292 224 302" stroke="#5A2A2A" strokeWidth="8" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M178 298 L222 298" stroke="#5A2A2A" strokeWidth="8" strokeLinecap="round" />
        )}
      </g>
    </svg>
  );
};
