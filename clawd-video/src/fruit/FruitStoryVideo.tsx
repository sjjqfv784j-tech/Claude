// « Histoire de fruits » : vidéo 9:16 générée à partir d'un JSON (src/stories/<id>.json).
// Chaque segment = une réplique : décor, personnages à l'écran, émotion, effets. Voix ElevenLabs + bouche synchronisée.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import { Fruit, type Emo, type FruitKind } from './Fruit';
import { Background, Cake, FLOOR, Hearts, Rain, Sparkles } from './Scenery';
import { sans } from '../theme';
import { FPS } from '../timing';

type Word = { text: string; start: number; end: number };
type Show = { id: string; x: number; emo: Emo; enter?: 'left' | 'right' | 'pop'; glasses?: boolean; tears?: boolean; sweat?: boolean; scale?: number };
export type FruitSeg = { speaker: string; bg: string; focus?: string; show: Show[]; fx?: string[]; hook?: string; prop?: string; text: string; highlight?: string[] };
export type FruitStory = {
  title: string;
  series?: string;
  ending?: string;
  voices: Record<string, string>;
  cast: Record<string, { name: string; fruit: FruitKind; acc?: string[] }>;
  segments: FruitSeg[];
  timing?: { lead?: number; gap?: number; tail?: number };
};
export type FruitTimed = { start: number; duration: number; audio: string | null; words: Word[] };
export type FruitProps = { story: FruitStory; timeline: FruitTimed[] };

export const buildFruitTimeline = (story: FruitStory, voice: { segments: { audio: string; duration: number; words: Word[] }[] } | null): FruitTimed[] => {
  let t = story.timing?.lead ?? 0.05;
  const gap = story.timing?.gap ?? 0.15;
  return story.segments.map((s, i) => {
    const v = voice?.segments[i];
    const words = s.text.split(/\s+/);
    const duration = v ? v.duration : Math.max(1.6, words.length * 0.33);
    const item = {
      start: t,
      duration,
      audio: v ? v.audio : null,
      words: v ? v.words : words.map((w, k) => ({ text: w, start: (k / words.length) * duration, end: ((k + 1) / words.length) * duration })),
    };
    t += duration + gap;
    return item;
  });
};
export const fruitFrames = (story: FruitStory, tl: FruitTimed[]) => {
  const l = tl[tl.length - 1];
  return Math.ceil((l.start + l.duration + (story.timing?.tail ?? 1.2)) * FPS);
};

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}']/gu, '');
const groupWords = (words: Word[]) => {
  const merged: Word[] = [];
  for (const w of words) {
    if (merged.length && /^[?!:;.…»]+$/.test(w.text)) merged[merged.length - 1] = { ...merged[merged.length - 1], text: merged[merged.length - 1].text + w.text, end: w.end };
    else merged.push({ ...w });
  }
  const out: Word[][] = [];
  let cur: Word[] = [];
  for (const w of merged) {
    cur.push(w);
    if (cur.length === 3 || /[.,?!:…]$/.test(w.text)) { out.push(cur); cur = []; }
  }
  if (cur.length) out.push(cur);
  return out;
};

export const Captions: React.FC<{ words: Word[]; highlight: string[]; t: number; color: string; name: string | null }> = ({ words, highlight, t, color, name }) => {
  const { fps } = useVideoConfig();
  const groups = groupWords(words);
  const hl = new Set(highlight.map(norm));
  const idx = groups.findIndex((g, i) => t >= g[0].start - 0.05 && (i === groups.length - 1 || t < groups[i + 1][0].start - 0.05));
  if (idx < 0) return null;
  const g = groups[idx];
  const p = spring({ frame: Math.max(0, Math.round((t - g[0].start) * fps)), fps, config: { damping: 14, stiffness: 260 } });
  return (
    <div style={{ position: 'absolute', top: 1500, left: 50, right: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${0.88 + 0.12 * p})` }}>
      {name ? (
        <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 34, color: '#1b1220', background: color, borderRadius: 999, padding: '4px 22px', marginBottom: 10, border: '4px solid #1b1220', letterSpacing: 1 }}>{name.toUpperCase()}</div>
      ) : null}
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 70, textAlign: 'center', lineHeight: 1.18, color: '#fff', WebkitTextStroke: '12px #1b1220', paintOrder: 'stroke fill', textShadow: '0 7px 0 rgba(0,0,0,0.35)' }}>
        {g.map((w, i) => (
          <span key={i} style={{ color: hl.has(norm(w.text)) ? '#ffd23f' : '#fff', opacity: t >= w.start - 0.05 ? 1 : 0.45 }}>
            {w.text}
            {i < g.length - 1 ? ' ' : ''}
          </span>
        ))}
      </div>
    </div>
  );
};

export const CAST_COLOR: Record<FruitKind, string> = { strawberry: '#ff6f86', banana: '#ffd84a', peach: '#ffab8a', apple: '#ff6a6a', orange: '#ffb04a', lemon: '#fff06a', grape: '#c48ae8', kiwi: '#a6d86a' };

// amplitude de la voix -> ouverture de la bouche
const useMouth = (audio: string | null, frame: number, active: boolean) => {
  const { fps } = useVideoConfig();
  const data = useAudioData(audio ? staticFile(audio) : staticFile('voice/fruit-silence.wav'));
  if (!audio || !data || !active || frame < 0) return 0;
  const v = visualizeAudio({ fps, frame, audioData: data, numberOfSamples: 16 });
  const amp = v.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
  return Math.min(1, Math.max(0, (amp - 0.015) * 9));
};

const Scene: React.FC<{ story: FruitStory; seg: FruitSeg; timed: FruitTimed; offset: number; index: number; prevBg: string | null }> = ({ story, seg, timed, offset, index, prevBg }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  const spoken = (frame - offset) / fps;
  const speaking = timed.audio !== null && spoken >= 0 && spoken <= timed.duration;
  const mouth = useMouth(timed.audio, frame - offset, speaking);
  const fx = new Set(seg.fx ?? []);

  // caméra : léger zoom vers le personnage qui parle
  const focus = seg.show.find((s) => s.id === (seg.focus ?? seg.speaker));
  const fxX = focus ? focus.x : width / 2;
  const zoomBase = fx.has('zoom') ? 1.22 : focus && seg.show.length > 1 ? 1.1 : 1.03;
  const zoom = zoomBase + 0.05 * Math.min(1, t / 4);
  const camY = FLOOR - 330;
  const shake = fx.has('shake') && t < 0.6 ? (1 - t / 0.6) * 22 : 0;
  const sx = Math.sin(frame * 2.1) * shake;
  const sy = Math.cos(frame * 2.7) * shake;
  const tx = (width / 2 - fxX) * (zoom - 1) * 0.9;

  const cut = prevBg !== null && prevBg !== seg.bg;
  const flash = (fx.has('flash') ? interpolate(t, [0, 0.25], [0.9, 0], { extrapolateRight: 'clamp' }) : 0) + (cut ? interpolate(t, [0, 0.18], [0.6, 0], { extrapolateRight: 'clamp' }) : 0);
  const others = seg.show;

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        <g transform={`translate(${sx + tx} ${sy}) translate(${fxX} ${camY}) scale(${zoom}) translate(${-fxX} ${-camY})`}>
          <Background bg={seg.bg} t={t} />
          {seg.prop === 'cake' ? <Cake x={560} y={1022} t={t} /> : null}
          {fx.has('hearts') ? <Hearts t={t} /> : null}
          {others.map((s, k) => {
            const c = story.cast[s.id];
            const isSpk = s.id === seg.speaker;
            let x = s.x;
            let sc = (s.scale ?? 1) * 1.15;
            if (s.enter === 'left' || s.enter === 'right') {
              const p = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
              x = interpolate(p, [0, 1], [s.enter === 'left' ? -260 : 1340, s.x]);
            }
            if (s.enter === 'pop') sc *= spring({ frame, fps, config: { damping: 9, stiffness: 180 } });
            const target = isSpk ? others.find((o) => o.id !== s.id) : others.find((o) => o.id === seg.speaker);
            const look = target ? Math.sign(target.x - s.x) * 0.8 : 0;
            return (
              <g key={s.id} transform={`translate(${x} ${FLOOR - 250 * sc}) scale(${sc})`}>
                <ellipse cx={0} cy={262} rx={170} ry={26} fill="#000" opacity={0.18} />
                <Fruit
                  kind={c.fruit}
                  emo={s.emo}
                  acc={c.acc}
                  mouth={isSpk ? mouth : 0}
                  t={t + k}
                  seed={k + index * 0 + Object.keys(story.cast).indexOf(s.id) * 7 + 1}
                  glasses={s.glasses}
                  tears={s.tears}
                  sweat={s.sweat}
                  look={look}
                  speaking={isSpk && speaking && mouth > 0.1}
                  prop={isSpk ? seg.prop : null}
                />
              </g>
            );
          })}
          {fx.has('rain') ? <Rain t={t} /> : null}
          {fx.has('sparkles') ? <Sparkles t={t} /> : null}
        </g>
        {/* vignette */}
        <defs>
          <radialGradient id="vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.45" /></radialGradient>
        </defs>
        <rect width={1080} height={1920} fill="url(#vig)" />
      </svg>
      {seg.hook ? <Banner text={seg.hook} t={t} top={230} color="#ff2d55" /> : null}
      {fx.has('question') ? <Banner text={story.ending ?? 'RÉPONDS EN COMMENTAIRE'} t={t - 0.4} top={230} color="#ffd23f" dark /> : null}
      {story.series && index > 0 ? (
        <div style={{ position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center', fontFamily: sans, fontWeight: 800, fontSize: 30, color: '#fff', opacity: 0.85, textShadow: '0 3px 8px rgba(0,0,0,0.6)', letterSpacing: 2 }}>{story.series}</div>
      ) : null}
      <Captions words={timed.words.map((w) => ({ ...w, start: w.start + offset / fps, end: w.end + offset / fps }))} highlight={seg.highlight ?? []} t={t} color={story.cast[seg.speaker] ? CAST_COLOR[story.cast[seg.speaker].fruit] : '#fff'} name={story.cast[seg.speaker]?.name ?? null} />
      {timed.audio ? <Sequence from={offset}><Audio src={staticFile(timed.audio)} /></Sequence> : null}
      {flash > 0 ? <AbsoluteFill style={{ background: '#fff', opacity: Math.min(1, flash) }} /> : null}
    </AbsoluteFill>
  );
};

export const Banner: React.FC<{ text: string; t: number; top: number; color: string; dark?: boolean }> = ({ text, t, top, color, dark }) => {
  const { fps } = useVideoConfig();
  if (t < 0) return null;
  const p = spring({ frame: Math.round(t * fps), fps, config: { damping: 10, stiffness: 200 } });
  return (
    <div style={{ position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${p}) rotate(${-3 + Math.sin(t * 3) * 1}deg)` }}>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 64, color: dark ? '#1b1220' : '#fff', background: color, padding: '14px 34px', borderRadius: 22, border: '6px solid #1b1220', boxShadow: '0 10px 0 #1b1220', maxWidth: 900, textAlign: 'center', lineHeight: 1.1 }}>{text}</div>
    </div>
  );
};

export const FruitStoryVideo: React.FC<FruitProps> = ({ story, timeline }) => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: '#111' }}>
      {timeline.map((s, i) => {
        const from = Math.round(s.start * FPS);
        const begin = i === 0 ? 0 : from;
        const end = i < timeline.length - 1 ? Math.round(timeline[i + 1].start * FPS) : durationInFrames;
        return (
          <Sequence key={i} from={begin} durationInFrames={end - begin}>
            <Scene story={story} seg={story.segments[i]} timed={s} offset={from - begin} index={i} prevBg={i > 0 ? story.segments[i - 1].bg : null} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
