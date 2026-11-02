import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Gif } from '@remotion/gif';
import { SEGMENTS, TITLE } from './script';
import { FPS, type VideoProps, type Word } from './timing';
import { PANELS } from './panels';
import { C, sans } from './theme';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/* ---------- décor ---------- */

const Background = () => {
  const frame = useCurrentFrame();
  const dots = Array.from({ length: 22 }, (_, i) => ({
    x: (i * 337) % 1080,
    y: 60 + ((i * 211) % 1300),
    r: 2 + (i % 3),
    phase: i * 0.7,
  }));
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${C.wallTop}, ${C.wallBottom})` }}>
      {/* halo de lampe */}
      <div
        style={{
          position: 'absolute',
          left: -260,
          top: 1050,
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: 'radial-gradient(rgba(217,119,87,0.22), rgba(217,119,87,0) 65%)',
        }}
      />
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: d.x,
            top: d.y,
            width: d.r * 2,
            height: d.r * 2,
            borderRadius: '50%',
            background: C.cream,
            opacity: 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(frame / 14 + d.phase)),
          }}
        />
      ))}
      {/* bureau */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1500, height: 16, background: C.deskEdge }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1516, bottom: 0, background: C.desk }} />
    </AbsoluteFill>
  );
};

const TitleChip = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 12 } });
  return (
    <div
      style={{
        position: 'absolute',
        top: 110,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        transform: `scale(${p}) rotate(-2deg)`,
      }}
    >
      <div
        style={{
          background: C.cream,
          borderRadius: 28,
          padding: '18px 44px',
          fontFamily: sans,
          fontWeight: 800,
          fontSize: 66,
          lineHeight: 1.12,
          textAlign: 'center',
          color: C.ink,
          whiteSpace: 'pre',
          boxShadow: '0 12px 0 rgba(0,0,0,0.25)',
        }}
      >
        <span style={{ color: C.orange }}>{TITLE.split('\n')[0]}</span>
        {'\n'}
        {TITLE.split('\n')[1]}
      </div>
    </div>
  );
};

/* ---------- panneau ---------- */

const PANEL = { left: 90, top: 370, width: 900, height: 700 };

const Panel: React.FC<{ kind: keyof typeof PANELS; durationFrames: number }> = ({ kind, durationFrames }) => {
  const frame = useCurrentFrame();
  const Content = PANELS[kind];
  const enter = interpolate(frame, [0, 7], [0, 1], clamp);
  const exit = interpolate(frame, [durationFrames - 5, durationFrames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: Math.min(enter, exit), transform: `translateY(${(1 - enter) * 30}px)` }}>
      <div style={{ position: 'absolute', inset: 0, padding: 26 }}>
        <Content />
      </div>
    </AbsoluteFill>
  );
};

const PanelFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: 'absolute',
      ...PANEL,
      background: C.cream,
      borderRadius: 36,
      boxShadow: '0 18px 0 rgba(0,0,0,0.28)',
      overflow: 'hidden',
    }}
  >
    <div style={{ height: 56, background: C.creamDark, display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 26 }}>
      {[C.red, '#E8B04A', C.green].map((c) => (
        <div key={c} style={{ width: 22, height: 22, borderRadius: '50%', background: c }} />
      ))}
    </div>
    <div style={{ position: 'absolute', top: 56, left: 0, right: 0, bottom: 0 }}>{children}</div>
  </div>
);

/* ---------- Clawd ---------- */

const Clawd: React.FC<{ name: string }> = ({ name }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 10, stiffness: 180 } });
  const w = 760;
  const h = (w * 440) / 480;
  return (
    <div
      style={{
        position: 'absolute',
        left: (1080 - w) / 2,
        top: 1528 - h,
        width: w,
        height: h,
        transform: `scale(${0.85 + 0.15 * p})`,
        transformOrigin: '50% 95%',
      }}
    >
      <Gif src={staticFile(`clawd/${name}.gif`)} width={w} height={h} fit="contain" style={{ imageRendering: 'pixelated' }} />
    </div>
  );
};

/* ---------- sous-titres ---------- */

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, '');

// groupes de 1 à 3 mots, coupés après une ponctuation
const chunk = (words: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length === 3 || /[.,?!…]$/.test(w.text)) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
};

const Captions: React.FC<{ words: Word[]; highlight: string[] }> = ({ words, highlight }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const groups = chunk(words);
  const hl = new Set(highlight.map(norm));
  const idx = groups.findIndex((g, i) => t >= g[0].start && (i === groups.length - 1 || t < groups[i + 1][0].start));
  if (idx < 0) return null;
  const g = groups[idx];
  const local = Math.round((t - g[0].start) * fps);
  const p = spring({ frame: local, fps, config: { damping: 14, stiffness: 220 } });
  return (
    <div style={{ position: 'absolute', top: 1620, left: 60, right: 60, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          background: C.cream,
          borderRadius: 26,
          padding: '16px 38px',
          fontFamily: sans,
          fontWeight: 800,
          fontSize: 70,
          textTransform: 'uppercase',
          color: C.ink,
          textAlign: 'center',
          boxShadow: '0 10px 0 rgba(0,0,0,0.25)',
          transform: `scale(${0.8 + 0.2 * p})`,
        }}
      >
        {g.map((w, i) => (
          <span key={i} style={{ color: hl.has(norm(w.text)) ? C.orange : C.ink, opacity: t >= w.start - 0.05 ? 1 : 0.35 }}>
            {w.text}
            {i < g.length - 1 ? ' ' : ''}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ---------- composition ---------- */

export const ClawdVideo: React.FC<VideoProps> = ({ timeline }) => {
  return (
    <AbsoluteFill>
      <Background />
      {timeline.map((s, i) => {
        const from = Math.round(s.start * FPS);
        const isLast = i === timeline.length - 1;
        const dur = Math.round(s.duration * FPS) + (isLast ? FPS : 0);
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <Clawd name={SEGMENTS[i].clawd} />
          </Sequence>
        );
      })}
      <PanelFrame>
        {timeline.map((s, i) => {
          const from = Math.round(s.start * FPS);
          const dur = Math.round(s.duration * FPS);
          return (
            <Sequence key={i} from={from} durationInFrames={dur} layout="none">
              <Panel kind={SEGMENTS[i].panel} durationFrames={dur} />
            </Sequence>
          );
        })}
      </PanelFrame>
      <TitleChip />
      {timeline.map((s, i) => {
        const from = Math.round(s.start * FPS);
        const isLast = i === timeline.length - 1;
        const dur = Math.round(s.duration * FPS) + (isLast ? FPS : 0);
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <Captions words={s.words} highlight={SEGMENTS[i].highlight} />
            {s.audio ? <Audio src={staticFile(s.audio)} /> : null}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
