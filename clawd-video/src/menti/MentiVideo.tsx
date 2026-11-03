import React from 'react';
import { AbsoluteFill, Audio, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import story from '../stories/menti1.json';
import { MentiSceneView as SceneView, type MentiScene as SceneId } from '../menti/ScenesMenti';
import { sans } from '../theme';
import { FPS } from '../timing';

type Word = { text: string; start: number; end: number };
type Seg = { speaker: string; scene: SceneId; text: string; highlight: string[]; duration: number };
export const MENTI = story as unknown as { title: string; segments: Seg[] };
// la dernière scène (sans voix) reboucle sur la première image : le spectateur ne voit pas la fin
const LOOP: Seg = { speaker: 'n', scene: 'loop', text: '', highlight: [], duration: 0.7 };
export const ALL: Seg[] = [...MENTI.segments, LOOP];
// pause après chaque phrase (s) : courte pour garder le rythme, plus longue avant « Alors, commence aujourd'hui » (le silence)
export const GAPS = [0.12, 0.12, 0.1, 0.12, 0.12, 0.15, 0.12, 0.2, 0.3, 0];
export const LEAD = 0.05;

export type MentiTimed = { start: number; duration: number; audio: string | null; words: Word[] };
export const buildMenti = (voice: { segments: { audio: string; duration: number; words: Word[] }[] } | null): MentiTimed[] => {
  let t = LEAD;
  const out: MentiTimed[] = MENTI.segments.map((s, i) => {
    const v = voice?.segments[i];
    const duration = v ? v.duration : s.duration;
    const words = v ? v.words : s.text.split(/\s+/).map((w, k, a) => ({ text: w, start: (k / a.length) * duration, end: ((k + 1) / a.length) * duration }));
    const item = { start: t, duration, audio: v ? v.audio : null, words };
    t += duration + GAPS[i];
    return item;
  });
  out.push({ start: t, duration: LOOP.duration, audio: null, words: out[0].words.slice(0, 3).map((w, i) => ({ ...w, start: i === 0 ? 0 : 99, end: 99 })) });
  return out;
};
export const mentiFrames = (tl: MentiTimed[]) => { const l = tl[tl.length - 1]; return Math.ceil((l.start + l.duration) * FPS); };

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}']/gu, '');
const mergePunct = (words: Word[]) => {
  const out: Word[] = [];
  for (const w of words) {
    if (out.length && /^[?!:;.…»]+$/.test(w.text)) out[out.length - 1] = { ...out[out.length - 1], text: out[out.length - 1].text + w.text, end: w.end };
    else out.push({ ...w });
  }
  return out;
};
const chunk = (words: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length === 3 || /[.,?!:…]$/.test(w.text)) { out.push(cur); cur = []; }
  }
  if (cur.length) out.push(cur);
  return out;
};

// sous-titres en haut : blanc à contour noir, mots-clés en jaune, mot par mot
const Captions: React.FC<{ words: Word[]; highlight: string[] }> = ({ words, highlight }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const groups = chunk(mergePunct(words));
  const hl = new Set(highlight.map(norm));
  const idx = groups.findIndex((g, i) => t >= g[0].start && (i === groups.length - 1 || t < groups[i + 1][0].start));
  if (idx < 0) return null;
  const g = groups[idx];
  const p = spring({ frame: Math.round((t - g[0].start) * fps), fps, config: { damping: 16, stiffness: 240 } });
  return (
    <div style={{ position: 'absolute', top: 150, left: 50, right: 50, display: 'flex', justifyContent: 'center', transform: `scale(${0.85 + 0.15 * p})` }}>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 72, textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.1, color: '#fff', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', textShadow: '0 6px 0 rgba(0,0,0,0.35)' }}>
        {g.map((w, i) => (
          <span key={i} style={{ color: hl.has(norm(w.text)) ? '#ffd23f' : '#fff', opacity: t >= w.start - 0.05 ? 1 : 0.35 }}>
            {w.text}
            {i < g.length - 1 ? ' ' : ''}
          </span>
        ))}
      </div>
    </div>
  );
};

const SceneBlock: React.FC<{ index: number; seg: MentiTimed; offset: number; dur: number }> = ({ index, seg, offset, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps; // temps depuis le début de la scène
  const spoken = t - offset / fps; // temps depuis le début de la phrase
  const speaking = spoken >= 0 && spoken <= seg.duration && seg.audio !== null;
  const meta = ALL[index];
  const shifted = seg.words.map((w) => ({ ...w, start: w.start + offset / fps, end: w.end + offset / fps }));
  return (
    <AbsoluteFill>
      <SceneView id={meta.scene} speaking={speaking} local={t} dur={dur} />
      <Captions words={shifted} highlight={meta.highlight} />
      {seg.audio ? <Sequence from={offset}><Audio src={staticFile(seg.audio)} /></Sequence> : null}
    </AbsoluteFill>
  );
};

export const MentiVideo: React.FC<{ timeline: MentiTimed[] }> = ({ timeline }) => (
  <AbsoluteFill style={{ background: '#111' }}>
    {timeline.map((s, i) => {
      const from = Math.round(s.start * FPS);
      const end = i < timeline.length - 1 ? Math.round(timeline[i + 1].start * FPS) : Math.ceil((s.start + s.duration) * FPS);
      const begin = i === 0 ? 0 : from;
      return (
        <Sequence key={i} from={begin} durationInFrames={end - begin}>
          <SceneBlock index={i} seg={s} offset={from - begin} dur={(end - begin) / FPS} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
