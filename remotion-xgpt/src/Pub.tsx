import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, Easing, interpolate, spring, staticFile, useCurrentFrame } from 'remotion';
import VOICE from './voice.json';

// ---------------------------------------------------------------------------------------------
//  X.GPT / xsearcher.cc — 1080x1920, 30fps. Paper + ink + brand red, printed-poster motion.
//  The only sound is the voice; every beat is timed on the words (VOICE has each word's start).
// ---------------------------------------------------------------------------------------------
export const FPS = 30;
const C = { paper: '#f3ede3', ink: '#121012', red: '#e0302b', redD: '#b81f1b', ghost: '#f1b9a9' };
const FONT = 'Inter, "Helvetica Neue", Arial, sans-serif';

// beats: [start, end) in frames; each voice line starts 6 frames into its beat
const B = { A: [0, 66], B: [66, 150], C: [150, 234], D: [234, 294], E: [294, 372], F: [372, 480] } as const;
const LINE_START = [12, 72, 156, 240, 300, 378];
export const DURATION = 480;
const wf = (line: number, word: number) => Math.round(VOICE[line].words[word].t0 * FPS);   // a word's frame, inside its line
const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const sp = (frame: number, delay = 0, o: { damping?: number; stiffness?: number; mass?: number } = {}) =>
  spring({ frame: frame - delay, fps: FPS, config: { damping: o.damping ?? 15, stiffness: o.stiffness ?? 150, mass: o.mass ?? 0.8 } });
const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

// a line of type that slides up out of a mask
const Rise: React.FC<{ f: number; at: number; size: number; color?: string; weight?: number; ghost?: boolean; children: React.ReactNode; align?: 'center' | 'left' }> = ({ f, at, size, color = C.ink, weight = 900, ghost, children, align = 'center' }) => {
  const k = sp(f, at, { damping: 18, stiffness: 120 });
  return (
    <div style={{ overflow: 'hidden', padding: `${size * 0.12}px 0 ${size * 0.2}px`, textAlign: align }}>
      <div style={{ transform: `translateY(${(1 - k) * 115}%)`, fontFamily: FONT, fontWeight: weight, fontSize: size, lineHeight: 1, letterSpacing: -size * 0.045, color, textShadow: ghost ? `${size * 0.035}px ${size * 0.03}px 0 ${C.ghost}` : undefined, whiteSpace: 'nowrap' }}>{children}</div>
    </div>
  );
};

const Logo: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => <Img src={staticFile('logo.png')} style={{ width: size, height: size, objectFit: 'contain', ...style }} />;

// film grain, flickering on 4s, over everything
const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.16, pointerEvents: 'none' }}>
      <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.floor(f / 2) % 7} /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width="1080" height="1920" filter="url(#g)" />
    </svg>
  );
};

// a red panel sweeps across on every cut
const Wipe: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame(), k = interpolate(f, [at - 5, at + 7], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  if (k <= 0 || k >= 1) return null;
  return <div style={{ position: 'absolute', top: -50, bottom: -50, width: 1500, left: -1500 + k * 3000, background: C.red, transform: 'skewX(-12deg)' }} />;
};

// ---------------------------------------------------------------- A: une idée en tête
const BeatA: React.FC = () => {
  const f = useCurrentFrame(), idea = wf(0, 1) + LINE_START[0], rays = 12;
  const drop = sp(f, 2, { damping: 8, stiffness: 120 }), pulse = sp(f, idea, { damping: 7, stiffness: 200 });
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      {Array.from({ length: rays }).map((_, i) => {
        const a = (i / rays) * Math.PI * 2, k = ease(f, idea, idea + 12), r0 = 150, r1 = 150 + 230 * k;
        return <div key={i} style={{ position: 'absolute', left: 540, top: 700, width: Math.max(0, r1 - r0), height: 10, background: C.ink, borderRadius: 5, transformOrigin: '0 50%', transform: `rotate(${a}rad) translateX(${r0}px)`, opacity: k > 0 ? 1 - ease(f, idea + 14, idea + 26) * 0.9 : 0 }} />;
      })}
      <div style={{ position: 'absolute', left: 540 - 105, top: -250 + drop * 955 - 105, width: 210, height: 210, borderRadius: '50%', background: C.red, transform: `scale(${1 + pulse * 0.35 - 0.35 * (pulse > 0.99 ? 1 : 0) + (f > idea ? 0.02 : 0)})`, boxShadow: `10px 8px 0 ${C.ghost}` }} />
      <div style={{ position: 'absolute', top: 1060, left: 0, right: 0 }}>
        <Rise f={f} at={LINE_START[0]} size={168}>Une idée</Rise>
        <Rise f={f} at={LINE_START[0] + wf(0, 2)} size={196} color={C.red} ghost>en tête.</Rise>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- B: une question, un script, une image
const Icon: React.FC<{ kind: 'q' | 'c' | 'p'; color: string }> = ({ kind, color }) => {
  if (kind === 'q') return <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 130, color, lineHeight: 1 }}>?</div>;
  if (kind === 'c') return <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 70, color, letterSpacing: -4 }}>{'</>'}</div>;
  return <svg width="110" height="110" viewBox="0 0 110 110"><rect x="8" y="14" width="94" height="82" rx="12" fill="none" stroke={color} strokeWidth="9" /><circle cx="38" cy="44" r="11" fill={color} /><path d="M12 90 L46 58 L68 78 L84 62 L100 80 V92 H12Z" fill={color} /></svg>;
};
const BeatB: React.FC = () => {
  const f = useCurrentFrame(), base = LINE_START[1] - B.B[0];
  const items: [string, 'q' | 'c' | 'p', number, string, string, string, number][] = [
    ['Une question', 'q', wf(1, 1), C.red, C.paper, C.paper, -1],
    ['Un script', 'c', wf(1, 3), C.ink, C.paper, C.paper, 1],
    ['Une image', 'p', wf(1, 5), C.paper, C.ink, C.ink, -1],
  ];
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      {items.map(([label, ic, t, bg, fg, ic2, dir], i) => {
        const at = base + t - 6, k = sp(f, at, { damping: 14, stiffness: 130 }), y = 640 + i * 270;
        return (
          <div key={label} style={{ position: 'absolute', left: 100, top: y, width: 860, height: 220, borderRadius: 36, background: bg, border: bg === C.paper ? `8px solid ${C.ink}` : 'none', transform: `translateX(${(1 - k) * 1400 * dir}px) rotate(${(i - 1) * 0.012}rad)`, display: 'flex', alignItems: 'center', boxShadow: bg === C.red ? `12px 10px 0 ${C.ghost}` : undefined }}>
            <div style={{ width: 170, height: 170, margin: '0 36px 0 24px', borderRadius: 30, background: bg === C.paper ? C.red : C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon kind={ic} color={bg === C.paper ? C.paper : C.red} /></div>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 88, letterSpacing: -4, color: fg, whiteSpace: 'nowrap' }}>{label}</div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 540 - 70, top: 420 + Math.abs(Math.sin((f - base) / 6)) * -30 * (f > base ? 1 : 0), width: 140, height: 140, borderRadius: '50%', background: C.red, boxShadow: `8px 6px 0 ${C.ghost}`, transform: `scale(${1 + sp(f, base + wf(1, 1) - 6) * 0.1})` }} />
      <Logo size={120} style={{ position: 'absolute', left: 800, top: 250 }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- C: plusieurs modèles, un seul espace
const NAMES = ['Claude', 'ChatGPT', 'Gemini', 'DeepSeek', 'X.GPT', 'Mistral', 'Kimi', 'Llama', 'Grok'];
const HOP = [0, 2, 6, 8, 1, 7, 3, 5];
const BeatC: React.FC = () => {
  const f = useCurrentFrame(), base = LINE_START[2] - B.C[0];
  const merge = base + wf(2, 3) + 4, k = ease(f, merge, merge + 14), shot = sp(f, merge + 12, { damping: 16, stiffness: 110 });
  const hopIdx = f < merge ? HOP[Math.floor(Math.max(0, f - base - 4) / 4) % HOP.length] : 4;
  const swap = ease(f, base + wf(2, 3) - 2, base + wf(2, 3) + 8);
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <div style={{ position: 'absolute', top: 300, left: 0, right: 0, height: 150, overflow: 'hidden' }}>
        <div style={{ transform: `translateY(${-swap * 150}px)` }}>
          <div style={{ height: 150, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 104, letterSpacing: -5, color: C.ink, lineHeight: '150px' }}>Plusieurs modèles.</div>
          <div style={{ height: 150, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 104, letterSpacing: -5, color: C.red, lineHeight: '150px', textShadow: `4px 4px 0 ${C.ghost}` }}>Un seul espace.</div>
        </div>
      </div>
      {NAMES.map((n, i) => {
        const col = i % 3, row = Math.floor(i / 3), x0 = 128 + col * 282, y0 = 560 + row * 152, hot = i === 4, on = hopIdx === i;
        const pop = sp(f, 2 + i * 2, { damping: 12, stiffness: 170 });
        const cx = 540 - 130, cy = 640;  // the merged X.GPT tile: top centre, bigger
        const x = hot ? lerp(x0, cx - 130, k) : lerp(x0, 540 - 130, k), y = hot ? lerp(y0, 560, k) : lerp(y0, 700, k);
        const sc = hot ? 1 + k * 0.5 : 1 - k;
        if (!hot && k >= 1) return null;
        return (
          <div key={n} style={{ position: 'absolute', left: x, top: y, width: 260, height: 130, borderRadius: 28, background: hot && k > 0.3 ? C.red : C.paper, border: `${on && f < merge ? 10 : 6}px solid ${on && f < merge ? C.red : C.ink}`, transform: `scale(${pop * sc})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 46, letterSpacing: -2, color: hot && k > 0.3 ? C.paper : C.ink, opacity: 1 - (hot ? 0 : k * 0.6) }}>
            {hot && k > 0.5 ? <Logo size={90} style={{ marginRight: 12 }} /> : null}{n}
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 150, top: 880 + (1 - shot) * 900, width: 780, height: 487, borderRadius: 30, border: `8px solid ${C.ink}`, overflow: 'hidden', boxShadow: `14px 12px 0 ${C.ghost}`, background: C.ink }}>
        <Img src={staticFile('home.png')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
      </div>
    </AbsoluteFill>
  );
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ---------------------------------------------------------------- D: et si… voilà.
const BeatD: React.FC = () => {
  const f = useCurrentFrame(), cut = LINE_START[3] - B.D[0] + wf(3, 2);   // "voilà" lands
  if (f < cut) {
    const k = sp(f, 2, { damping: 9, stiffness: 160 });
    return (
      <AbsoluteFill style={{ background: C.red, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 300, letterSpacing: -14, color: C.ink, transform: `scale(${0.6 + k * 0.4}) rotate(${Math.sin(f / 4) * 0.01}rad)`, textShadow: `10px 9px 0 ${C.redD}` }}>et si…</div>
        {[0, 1, 2].map((i) => <div key={i} style={{ position: 'absolute', fontFamily: FONT, fontWeight: 900, fontSize: 150 + i * 40, color: C.ink, left: 140 + i * 330, top: 420 + (i % 2) * 900 + Math.sin(f / 5 + i) * 16, opacity: 0.9 }}>?</div>)}
      </AbsoluteFill>
    );
  }
  const g = f - cut, k = sp(g, 0, { damping: 9, stiffness: 190 });
  return (
    <AbsoluteFill style={{ background: C.paper, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: 24 }).map((_, i) => { const a = (i / 24) * Math.PI * 2, e = ease(g, 0, 10); return <div key={i} style={{ position: 'absolute', left: 540, top: 700, width: 260 * e * (0.6 + 0.4 * rnd(i)), height: 12, borderRadius: 6, background: i % 2 ? C.red : C.ink, transformOrigin: '0 50%', transform: `rotate(${a}rad) translateX(${190 + 40 * e}px)`, opacity: 1 - ease(g, 8, 22) }} />; })}
      {Array.from({ length: 26 }).map((_, i) => { const t = ease(g, 0, 40), x = 540 + (rnd(i * 3) - 0.5) * 1000, y = 700 + (rnd(i * 5 + 1) - 0.2) * 900 * t; return <div key={'c' + i} style={{ position: 'absolute', left: x, top: y, width: 26, height: 14, background: i % 3 === 0 ? C.ink : C.red, transform: `rotate(${rnd(i) * 6 + g / 5}rad)`, opacity: ease(g, 0, 3) * (1 - ease(g, 28, 40)) }} />; })}
      <Logo size={300} style={{ position: 'absolute', top: 530, transform: `scale(${k})` }} />
      <div style={{ position: 'absolute', top: 1000, fontFamily: FONT, fontWeight: 900, fontSize: 340, letterSpacing: -16, color: C.red, transform: `scale(${1.5 - k * 0.5})`, textShadow: `12px 10px 0 ${C.ghost}`, opacity: ease(g, 0, 2) }}>voilà.</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- E: tout pour la créer
const BeatE: React.FC = () => {
  const f = useCurrentFrame(), base = LINE_START[4] - B.E[0];
  const stick: [string, number, number, number, string, string][] = [
    ['Code & développement', 120, 420, -0.07, C.ink, C.paper],
    ['Création d’images', 470, 1240, 0.05, C.red, C.paper],
    ['Réponses & idées', 110, 1350, -0.04, C.paper, C.ink],
  ];
  const under = ease(f, base + wf(4, 3), base + wf(4, 3) + 14);
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <div style={{ position: 'absolute', top: 640, left: 0, right: 0 }}>
        <Rise f={f} at={base + wf(4, 0)} size={196}>Tout pour</Rise>
        <Rise f={f} at={base + wf(4, 2)} size={214} color={C.red} ghost>la créer.</Rise>
      </div>
      <svg width="1080" height="80" style={{ position: 'absolute', top: 1090, left: 0 }}>
        <path d="M110 40 C 300 6, 520 74, 700 34 S 900 30, 960 38" fill="none" stroke={C.ink} strokeWidth="16" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset={1000 * (1 - under)} />
      </svg>
      {stick.map(([label, x, y, rot, bg, fg], i) => {
        const k = sp(f, base + 16 + i * 6, { damping: 11, stiffness: 160 });
        return <div key={label} style={{ position: 'absolute', left: x, top: y + Math.sin((f + i * 9) / 9) * 8, padding: '22px 40px', borderRadius: 28, background: bg, color: fg, border: bg === C.paper ? `7px solid ${C.ink}` : 'none', fontFamily: FONT, fontWeight: 800, fontSize: 50, letterSpacing: -2, transform: `scale(${k}) rotate(${rot + (1 - k) * 0.4}rad)`, whiteSpace: 'nowrap', boxShadow: `8px 7px 0 ${C.ghost}` }}>{label}</div>;
      })}
      <Logo size={120} style={{ position: 'absolute', left: 800, top: 250 }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- F: X.GPT, xsearcher.cc
const BeatF: React.FC = () => {
  const f = useCurrentFrame(), base = LINE_START[5] - B.F[0];
  const bars = sp(f, 0, { damping: 20, stiffness: 100 }), url = base + wf(5, 5), cta = base + wf(5, 8);
  const reveal = ease(f, url, url + 16), pulse = f > cta ? 1 + 0.025 * Math.sin((f - cta) / 4) : 1;
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 150 * bars, background: C.red }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 150 * bars, background: C.red }} />
      <Logo size={1100} style={{ position: 'absolute', left: 330, top: 620, opacity: 0.07, transform: `rotate(${f / 80}rad)` }} />
      <Logo size={300} style={{ position: 'absolute', left: 390, top: 330, transform: `scale(${sp(f, 4, { damping: 9, stiffness: 150 })})` }} />
      <div style={{ position: 'absolute', top: 640, left: 0, right: 0 }}><Rise f={f} at={base + wf(5, 0)} size={270} color={C.red} ghost>X.GPT</Rise></div>
      <div style={{ position: 'absolute', top: 960, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', clipPath: `inset(0 ${100 - reveal * 100}% 0 0)`, fontFamily: FONT, fontWeight: 900, fontSize: 150, letterSpacing: -7, color: C.ink }}>xsearcher.cc</div>
      </div>
      <div style={{ position: 'absolute', top: 1170, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 38, letterSpacing: 5, color: C.ink, opacity: ease(f, url + 6, url + 18) }}>TES IDÉES. UNE LONGUEUR D’AVANCE.</div>
      <div style={{ position: 'absolute', top: 1290, left: 190, width: 700, height: 130, borderRadius: 34, background: C.red, color: C.paper, fontFamily: FONT, fontWeight: 800, fontSize: 52, letterSpacing: -2, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${sp(f, cta - 4, { damping: 10, stiffness: 170 }) * pulse})`, boxShadow: `10px 9px 0 ${C.ghost}` }}>Entrer dans X.GPT &nbsp;↗</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the ad
const Beat: React.FC<{ range: readonly [number, number]; children: React.ReactNode }> = ({ range, children }) => {
  const f = useCurrentFrame(), n = range[1] - range[0];
  return <Sequence from={range[0]} durationInFrames={n}><AbsoluteFill style={{ transform: `scale(${1 + 0.035 * (f - range[0]) / n})` }}>{children}</AbsoluteFill></Sequence>;
};
export const Pub: React.FC = () => (
  <AbsoluteFill style={{ background: C.paper }}>
    <Beat range={B.A}><BeatA /></Beat>
    <Beat range={B.B}><BeatB /></Beat>
    <Beat range={B.C}><BeatC /></Beat>
    <Beat range={B.D}><BeatD /></Beat>
    <Beat range={B.E}><BeatE /></Beat>
    <Beat range={B.F}><BeatF /></Beat>
    {[B.B[0], B.C[0], B.D[0], B.E[0], B.F[0]].map((b) => <Wipe key={b} at={b} />)}
    <Grain />
    {LINE_START.map((s, i) => <Sequence key={i} from={s}><Audio src={staticFile(`voice/l${i + 1}.mp3`)} /></Sequence>)}
  </AbsoluteFill>
);
