import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import story from '../stories/etsi.json';
import { SceneView, type SceneId } from './Scenes';
import { sans } from '../theme';
import { FPS } from '../timing';

type Word = { text: string; start: number; end: number };
type Seg = { speaker: string; scene: SceneId; text: string; highlight: string[]; duration: number };
export const ETSI = story as { title: string; segments: Seg[] };
// pause après chaque phrase (s) : une pause plus longue avant « Alors, commence aujourd'hui » (le silence)
const GAPS = [0.5, 0.5, 0.5, 0.5, 1.9, 0.5, 0];
const LEAD = 0.4;

export type EtSiTimed = { start: number; duration: number; audio: string | null; words: Word[] };
export const buildEtSi = (voice: { segments: { audio: string; duration: number; words: Word[] }[] } | null): EtSiTimed[] => {
  let t = LEAD;
  return ETSI.segments.map((s, i) => {
    const v = voice?.segments[i];
    const duration = v ? v.duration : s.duration;
    const words = v ? v.words : s.text.split(/\s+/).map((w, k, a) => ({ text: w, start: (k / a.length) * duration, end: ((k + 1) / a.length) * duration }));
    const item = { start: t, duration, audio: v ? v.audio : null, words };
    t += duration + GAPS[i];
    return item;
  });
};
export const etsiFrames = (tl: EtSiTimed[]) => { const l = tl[tl.length - 1]; return Math.ceil((l.start + l.duration + 1.2) * FPS); };

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}']/gu, '');
const mergePunct = (words: Word[]) => {
  const out: Word[] = [];
  for (const w of words) {
    if (out.length && /^[?!:;.…»]+$/.test(w.text)) { out[out.length - 1] = { ...out[out.length - 1], text: out[out.length - 1].text + w.text, end: w.end }; } else out.push({ ...w });
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

export const EtSiVideo: React.FC<{ timeline: EtSiTimed[] }> = ({ timeline }) => (
  <AbsoluteFill style={{ background: '#111' }}>
    {timeline.map((s, i) => {
      const from = Math.round(s.start * FPS);
      // la scène couvre la phrase + la pause qui suit
      const end = i < timeline.length - 1 ? Math.round(timeline[i + 1].start * FPS) : Math.round((s.start + s.duration + 1.2) * FPS);
      const dur = end - (i === 0 ? 0 : from);
      return (
        <Sequence key={i} from={i === 0 ? 0 : from} durationInFrames={dur}>
          <SceneBlock scene={ETSI.segments[i].scene} seg={s} offset={i === 0 ? from : 0} dur={dur / FPS} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

const SceneBlock: React.FC<{ scene: SceneId; seg: EtSiTimed; offset: number; dur: number }> = ({ scene, seg, offset, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps; // temps depuis le début de la scène
  const spoken = t - offset / fps; // temps depuis le début de la phrase
  const speaking = spoken >= 0 && spoken <= seg.duration;
  // les mots sont relatifs au début de la phrase
  const idx = ETSI.segments.findIndex((s) => s.scene === scene);
  return (
    <AbsoluteFill>
      <SceneView id={scene} speaking={speaking} local={t} dur={dur} />
      <ShiftedCaptions words={seg.words} offset={offset / fps} highlight={ETSI.segments[idx].highlight} />
      {seg.audio ? <Sequence from={offset}><Audio src={staticFile(seg.audio)} /></Sequence> : null}
    </AbsoluteFill>
  );
};

const ShiftedCaptions: React.FC<{ words: Word[]; offset: number; highlight: string[] }> = ({ words, offset, highlight }) => (
  <Captions words={words.map((w) => ({ ...w, start: w.start + offset, end: w.end + offset }))} highlight={highlight} />
);
