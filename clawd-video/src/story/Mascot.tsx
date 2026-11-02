import React from 'react';

// « Pixel » : petite mascotte originale (robot rond turquoise avec antenne).
// talk (0 → 1) = ouverture de la bouche ; frame = frame absolu pour les petits mouvements.
export const Mascot: React.FC<{ width: number; talk: number; frame: number; action?: string; color?: string }> = ({
  width,
  talk,
  frame,
  action = '',
  color = '#3FC1B0',
}) => {
  const bob = Math.sin(frame / 9) * 4;
  const blink = frame % 100 > 94 ? 0.15 : 1;
  const wave = action.startsWith('greeting') ? Math.sin(frame / 3) * 25 : 0;
  const busy = /writing|running|searching|plan/.test(action) ? Math.sin(frame / 2.5) * 12 : 0;
  const lead = action.startsWith('directing') ? -35 + Math.sin(frame / 5) * 8 : 0;
  const shake = action.startsWith('error') ? Math.sin(frame * 1.3) * 4 : 0;
  const dark = '#1F8F80';
  return (
    <svg width={width} height={width * 0.95} viewBox="0 0 300 285" style={{ overflow: 'visible' }}>
      <g transform={`translate(${shake} ${bob})`}>
        {/* antenne */}
        <line x1="150" y1="40" x2="150" y2="8" stroke={dark} strokeWidth="8" strokeLinecap="round" />
        <circle cx="150" cy="8" r="12" fill="#FFB347" />
        {/* pieds */}
        <ellipse cx="100" cy="268" rx="34" ry="14" fill={dark} />
        <ellipse cx="200" cy="268" rx="34" ry="14" fill={dark} />
        {/* bras */}
        <g transform={`rotate(${-20 + wave + lead + busy} 40 170)`}>
          <rect x="-8" y="150" width="60" height="30" rx="15" fill={dark} />
        </g>
        <g transform={`rotate(${20 - wave - lead - busy} 260 170)`}>
          <rect x="248" y="150" width="60" height="30" rx="15" fill={dark} />
        </g>
        {/* corps */}
        <rect x="35" y="40" width="230" height="220" rx="95" fill={color} />
        <ellipse cx="150" cy="210" rx="80" ry="40" fill="#fff" opacity="0.12" />
        {/* visage */}
        <rect x="70" y="85" width="160" height="90" rx="40" fill="#10242B" />
        <ellipse cx="115" cy="125" rx="15" ry={18 * blink} fill="#8CF3E3" />
        <ellipse cx="185" cy="125" rx="15" ry={18 * blink} fill="#8CF3E3" />
        <rect x={150 - 22} y="150" width="44" height={5 + talk * 18} rx="8" fill="#8CF3E3" />
        <circle cx="86" cy="160" r="8" fill="#FF8E9E" opacity="0.7" />
        <circle cx="214" cy="160" r="8" fill="#FF8E9E" opacity="0.7" />
      </g>
    </svg>
  );
};
