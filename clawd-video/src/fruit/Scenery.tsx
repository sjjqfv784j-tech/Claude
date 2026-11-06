// Décors (1080x1920) et effets : rue, cuisine, marché la nuit, coucher de soleil, chambre, bureau.
import React from 'react';

export const FLOOR = 1440;
const W = 1080;
const H = 1920;
const INK = '#2a1a1f';
const rnd = (s: number) => {
  const x = Math.sin(s * 91.7 + 17.3) * 43758.5453;
  return x - Math.floor(x);
};

const Street: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="skyD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffb07a" /><stop offset="1" stopColor="#ffe2b8" /></linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#skyD)" />
    <circle cx={820} cy={430} r={110} fill="#fff1c9" opacity={0.9} />
    {[[-40, 520, 300, '#c7869a'], [240, 420, 260, '#a8708e'], [470, 560, 280, '#d59b86'], [720, 470, 400, '#b97b92']].map(([x, y, w, c], i) => (
      <g key={i}>
        <rect x={x as number} y={y as number} width={w as number} height={FLOOR - (y as number)} fill={c as string} stroke={INK} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, k) => (
          <rect key={k} x={(x as number) + 30 + (k % 3) * (((w as number) - 60) / 3)} y={(y as number) + 40 + Math.floor(k / 3) * 130} width={50} height={70} rx={6} fill={rnd(i * 13 + k) > 0.5 ? '#ffe9a8' : '#6d4a66'} stroke={INK} strokeWidth={4} />
        ))}
      </g>
    ))}
    {/* la maison de Fraise : porte rose */}
    <rect x={160} y={920} width={760} height={FLOOR - 920} fill="#fff1e6" stroke={INK} strokeWidth={6} />
    <path d="M 130,930 L 540,760 L 950,930 Z" fill="#e85d75" stroke={INK} strokeWidth={6} />
    <rect x={460} y={1100} width={160} height={FLOOR - 1100} rx={12} fill="#ff6f9a" stroke={INK} strokeWidth={6} />
    <circle cx={595} cy={1280} r={10} fill="#ffd23f" stroke={INK} strokeWidth={3} />
    {[240, 720].map((x) => (
      <g key={x}><rect x={x} y={1040} width={140} height={130} rx={8} fill="#ffe9a8" stroke={INK} strokeWidth={5} /><path d={`M ${x + 70},1040 v 130 M ${x},1105 h 140`} stroke={INK} strokeWidth={4} /></g>
    ))}
    <rect y={FLOOR} width={W} height={H - FLOOR} fill="#8c7d8a" />
    <rect y={FLOOR} width={W} height={26} fill="#b3a4b0" stroke={INK} strokeWidth={4} />
  </g>
);

const Kitchen: React.FC = () => (
  <g>
    <rect width={W} height={H} fill="#fde7d2" />
    {Array.from({ length: 9 }, (_, i) => (
      <rect key={i} x={i * 130 - 40} y={0} width={64} height={FLOOR} fill="#fbd9bd" />
    ))}
    {/* fenêtre */}
    <rect x={340} y={330} width={400} height={340} rx={16} fill="#9fd6ff" stroke={INK} strokeWidth={8} />
    <path d="M 540,330 v 340 M 340,500 h 400" stroke={INK} strokeWidth={7} />
    <path d="M 320,320 h 440 l -30,90 h -380 Z" fill="#ff8fb1" stroke={INK} strokeWidth={6} />
    {/* placards */}
    <rect x={40} y={260} width={240} height={330} rx={12} fill="#7fc7b8" stroke={INK} strokeWidth={6} />
    <rect x={800} y={260} width={240} height={330} rx={12} fill="#7fc7b8" stroke={INK} strokeWidth={6} />
    {/* frigo */}
    <rect x={850} y={760} width={210} height={FLOOR - 760} rx={18} fill="#e9f3f7" stroke={INK} strokeWidth={6} />
    <path d="M 850,1000 h 210" stroke={INK} strokeWidth={5} />
    <rect x={870} y={860} width={14} height={90} rx={7} fill="#a9b8c2" />
    {/* plan de travail */}
    <rect x={-10} y={1040} width={830} height={FLOOR - 1040} fill="#f6b78a" stroke={INK} strokeWidth={6} />
    <rect x={-10} y={1020} width={850} height={40} rx={8} fill="#fff6ee" stroke={INK} strokeWidth={6} />
    {[60, 300, 540].map((x) => <rect key={x} x={x} y={1110} width={200} height={260} rx={10} fill="none" stroke={INK} strokeWidth={4} opacity={0.4} />)}
    {/* sol carrelé */}
    <rect y={FLOOR} width={W} height={H - FLOOR} fill="#f3d6e2" />
    {Array.from({ length: 10 }, (_, i) => <rect key={i} x={i * 120 - (i % 2) * 60} y={FLOOR + 50 + (i % 2) * 120} width={60} height={60} fill="#e2b9cc" />)}
    <rect y={FLOOR - 4} width={W} height={10} fill={INK} />
  </g>
);

const Market: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <defs>
      <linearGradient id="skyN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#141533" /><stop offset="1" stopColor="#3a2d5c" /></linearGradient>
      <radialGradient id="lampG"><stop offset="0" stopColor="#ffe9a8" stopOpacity="0.7" /><stop offset="1" stopColor="#ffe9a8" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#skyN)" />
    {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={rnd(i) * W} cy={rnd(i + 50) * 700} r={2 + rnd(i + 9) * 3} fill="#fff" opacity={0.4 + 0.4 * Math.sin(t * 2 + i)} />)}
    <circle cx={230} cy={330} r={80} fill="#fff6d8" />
    <circle cx={260} cy={310} r={70} fill="#141533" opacity={0.0} />
    {/* étals fermés */}
    {[0, 380, 760].map((x, i) => (
      <g key={x}>
        <rect x={x - 20} y={880} width={360} height={FLOOR - 880} fill="#4a3a55" stroke={INK} strokeWidth={5} />
        <path d={`M ${x - 40},880 l 400,0 l -30,-110 l -340,0 Z`} fill={i % 2 ? '#c94a5e' : '#3f7fa8'} stroke={INK} strokeWidth={5} />
        {Array.from({ length: 5 }, (_, k) => <path key={k} d={`M ${x - 40 + k * 80},880 q 40,50 80,0`} fill="#fff" opacity={0.25} />)}
      </g>
    ))}
    {/* lampadaire */}
    <circle cx={920} cy={700} r={260} fill="url(#lampG)" />
    <rect x={910} y={700} width={20} height={FLOOR - 700} fill="#2a2440" />
    <path d="M 880,700 h 80 l -15,-50 h -50 Z" fill="#2a2440" />
    <circle cx={920} cy={712} r={22} fill="#ffe9a8" />
    <rect y={FLOOR} width={W} height={H - FLOOR} fill="#2a2440" />
    <ellipse cx={920} cy={FLOOR + 80} rx={260} ry={40} fill="#ffe9a8" opacity={0.12} />
  </g>
);

const Sunset: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <defs>
      <linearGradient id="skyS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff5f8f" /><stop offset="0.55" stopColor="#ffa36b" /><stop offset="1" stopColor="#ffd98a" /></linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#skyS)" />
    <circle cx={540} cy={900} r={330} fill="#fff1b8" opacity={0.85} />
    {Array.from({ length: 14 }, (_, i) => (
      <circle key={i} cx={rnd(i * 3) * W} cy={200 + rnd(i * 5) * 1100 - ((t * 30 * (0.5 + rnd(i))) % 300)} r={20 + rnd(i * 7) * 50} fill="#fff" opacity={0.12} />
    ))}
    <rect y={FLOOR} width={W} height={H - FLOOR} fill="#c9506e" />
    <rect y={FLOOR} width={W} height={20} fill="#e47a8a" />
  </g>
);

const Bedroom: React.FC = () => (
  <g>
    <rect width={W} height={H} fill="#d8d0f5" />
    <rect x={120} y={360} width={360} height={420} rx={20} fill="#2c2a5a" stroke={INK} strokeWidth={8} />
    <circle cx={380} cy={470} r={50} fill="#fff6d8" />
    <rect x={560} y={1080} width={560} height={FLOOR - 1080} rx={30} fill="#9c8ce6" stroke={INK} strokeWidth={6} />
    <rect x={600} y={1010} width={200} height={110} rx={40} fill="#fff" stroke={INK} strokeWidth={6} />
    <rect y={FLOOR} width={W} height={H - FLOOR} fill="#a87c66" />
  </g>
);

const Office: React.FC = () => (
  <g>
    <rect width={W} height={H} fill="#dfe8ef" />
    {[0, 1, 2].map((i) => <rect key={i} x={80 + i * 330} y={300} width={260} height={500} fill="#9fc8e8" stroke={INK} strokeWidth={6} />)}
    <rect x={-10} y={1100} width={1100} height={60} fill="#7a5a44" stroke={INK} strokeWidth={6} />
    <rect y={FLOOR} width={W} height={H - FLOOR} fill="#6b7a8a" />
  </g>
);

export const Background: React.FC<{ bg: string; t: number }> = ({ bg, t }) => {
  switch (bg) {
    case 'kitchen': return <Kitchen />;
    case 'market': return <Market t={t} />;
    case 'sunset': return <Sunset t={t} />;
    case 'bedroom': return <Bedroom />;
    case 'office': return <Office />;
    default: return <Street />;
  }
};

// gâteau d'anniversaire (avec une part déjà mangée)
export const Cake: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={6} rx={170} ry={26} fill="#fff" stroke={INK} strokeWidth={5} />
    <path d="M -130,0 L -130,-120 L 40,-120 L 40,0 Z" fill="#ffb3cf" stroke={INK} strokeWidth={6} />
    <path d="M 40,-120 L 130,-120 L 130,-60 L 40,-60 Z" fill="#ffb3cf" stroke={INK} strokeWidth={6} opacity={0} />
    <path d="M -130,-120 q 20,30 40,0 q 20,30 40,0 q 20,30 40,0 q 20,30 40,0 q 20,30 40,0" fill="#fff" stroke={INK} strokeWidth={5} />
    <path d="M -130,-60 h 170" stroke="#ff6f9a" strokeWidth={10} />
    {[-100, -55, -10].map((cx, i) => (
      <g key={cx}>
        <rect x={cx - 7} y={-180} width={14} height={60} rx={5} fill={['#7fc7ff', '#ffd23f', '#9cf08f'][i]} stroke={INK} strokeWidth={4} />
        <path d={`M ${cx},-185 q ${10 + Math.sin(t * 12 + i) * 4},-18 0,-34 q ${-10 + Math.sin(t * 10 + i) * 4},16 0,34 Z`} fill="#ffb02e" />
      </g>
    ))}
    {/* la part mangée */}
    <path d="M 40,0 L 40,-120 Q 60,-110 54,-96 Q 70,-90 60,-74 Q 74,-60 58,-44 Q 70,-26 50,-12 Z" fill="#c9506e" stroke={INK} strokeWidth={5} />
    {[[80, -6], [100, -14], [118, -4]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={6} fill="#ffb3cf" stroke={INK} strokeWidth={3} />)}
  </g>
);

export const Rain: React.FC<{ t: number }> = ({ t }) => (
  <g opacity={0.55}>
    {Array.from({ length: 90 }, (_, i) => {
      const x = rnd(i * 1.7) * (W + 200) - 100;
      const sp = 1500 + rnd(i * 3.3) * 900;
      const y = ((rnd(i * 5.1) * H + t * sp) % (H + 200)) - 100;
      return <path key={i} d={`M ${x},${y} l -14,48`} stroke="#bcd7ff" strokeWidth={4} strokeLinecap="round" />;
    })}
  </g>
);

export const Hearts: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {Array.from({ length: 10 }, (_, i) => {
      const p = (t * 0.35 + rnd(i * 2.2)) % 1;
      const x = 380 + rnd(i * 4.4) * 420 + Math.sin(t * 2 + i) * 30;
      const y = 1100 - p * 700;
      const s = 0.6 + rnd(i * 6.6) * 0.8;
      return <path key={i} transform={`translate(${x} ${y}) scale(${s})`} d="M 0,12 C -30,-14 -18,-38 0,-22 C 18,-38 30,-14 0,12 Z" fill="#ff4f7b" stroke={INK} strokeWidth={3} opacity={Math.sin(p * Math.PI)} />;
    })}
  </g>
);

export const Sparkles: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {Array.from({ length: 16 }, (_, i) => {
      const x = rnd(i * 8.1) * W;
      const y = 300 + rnd(i * 2.9) * 1100;
      const a = Math.max(0, Math.sin(t * 3 + i * 1.3));
      return <path key={i} transform={`translate(${x} ${y}) scale(${0.5 + a})`} d="M 0,-24 L 6,-6 L 24,0 L 6,6 L 0,24 L -6,6 L -24,0 L -6,-6 Z" fill="#fff6c2" opacity={a} />;
    })}
  </g>
);
