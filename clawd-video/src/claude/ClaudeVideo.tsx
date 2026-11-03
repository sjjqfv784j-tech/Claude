import React from 'react';
import { AbsoluteFill, Audio, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import story from '../stories/claude1.json';
import { ClaudeSceneView as SceneView, type CScene as SceneId } from '../claude/ScenesClaude';
import { sans } from '../theme';
import { FPS } from '../timing';

type Word = { text: string; start: number; end: number };
type Seg = { speaker: string; scene: SceneId; text: string; highlight: string[]; duration: number };
export const CLAUDE1 = story as unknown as { title: string; segments: Seg[] };
// la dernière scène (sans voix) reboucle sur la première image : le spectateur ne voit pas la fin
// réglages de l'épisode, lus dans le JSON de l'histoire : { "timing": { "lead": 0.05, "gaps": [...], "loop": 0.7, "captions": "outline" | "box" } }
const TIMING = ((story as unknown as { timing?: { lead?: number; gaps?: number[]; loop?: number; captions?: 'outline' | 'box'; captionY?: number } }).timing) ?? {};
const CAPTIONS: 'outline' | 'box' = TIMING.captions ?? 'outline';
const LOOP: Seg = { speaker: 'n', scene: 'loop', text: '', highlight: [], duration: TIMING.loop ?? 0.7 };
export const ALL: Seg[] = [...CLAUDE1.segments, LOOP];
// pause après chaque phrase (s) : courte pour garder le rythme, plus longue avant « Alors, commence aujourd'hui » (le silence)
export const GAPS: number[] = TIMING.gaps ?? [0.12, 0.12, 0.12, 0.12, 0.1, 0.12, 0.12, 0.1, 0.12, 0.3, 0];
export const LEAD: number = TIMING.lead ?? 0.05;

export type ClaudeTimed = { start: number; duration: number; audio: string | null; words: Word[] };
export const buildClaude = (voice: { segments: { audio: string; duration: number; words: Word[] }[] } | null): ClaudeTimed[] => {
  let t = LEAD;
  const out: ClaudeTimed[] = CLAUDE1.segments.map((s, i) => {
    const v = voice?.segments[i];
    const duration = v ? v.duration : s.duration;
    const words = v ? v.words : s.text.split(/\s+/).map((w, k, a) => ({ text: w, start: (k / a.length) * duration, end: ((k + 1) / a.length) * duration }));
    const item = { start: t, duration, audio: v ? v.audio : null, words };
    t += duration + GAPS[i];
    return item;
  });
  out.push({ start: t, duration: LOOP.duration, audio: null, words: [] });
  return out;
};
export const claudeFrames = (tl: ClaudeTimed[]) => { const l = tl[tl.length - 1]; return Math.ceil((l.start + l.duration) * FPS); };

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
  if (CAPTIONS === 'box') {
    // style « sous-titres de série » : texte blanc en bas (au-dessus de la zone cachée par TikTok), mots-clés dans une pastille orange
    return (
      <div style={{ position: 'absolute', top: TIMING.captionY ?? 1380, left: 60, right: 60, display: 'flex', justifyContent: 'center', transform: `scale(${0.9 + 0.1 * p})` }}>
        <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 62, textAlign: 'center', lineHeight: 1.35, color: '#fff', textShadow: '0 4px 0 rgba(0,0,0,0.6), 0 0 14px rgba(0,0,0,0.55)' }}>
          {g.map((w, i) => {
            const key = hl.has(norm(w.text));
            return (
              <span key={i} style={{ opacity: t >= w.start - 0.05 ? 1 : 0.4, background: key ? '#ff8a50' : 'transparent', color: key ? '#1b1220' : '#fff', textShadow: key ? 'none' : undefined, borderRadius: 12, padding: key ? '0 12px' : 0, margin: '0 4px' }}>
                {w.text}
              </span>
            );
          })}
        </div>
      </div>
    );
  }
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

const SceneBlock: React.FC<{ index: number; seg: ClaudeTimed; offset: number; dur: number }> = ({ index, seg, offset, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps; // temps depuis le début de la scène
  const spoken = t - offset / fps; // temps depuis le début de la phrase
  const speaking = spoken >= 0 && spoken <= seg.duration && seg.audio !== null;
  const meta = ALL[index];
  const shifted = seg.words.map((w) => ({ ...w, start: w.start + offset / fps, end: w.end + offset / fps }));
  return (
    <AbsoluteFill>
      <SceneView id={meta.scene} spk={(meta.speaker === 's' || meta.speaker === 'c') ? meta.speaker : null} speaking={speaking} local={t} dur={dur} />
      <Captions words={shifted} highlight={meta.highlight} />
      {seg.audio ? <Sequence from={offset}><Audio src={staticFile(seg.audio)} /></Sequence> : null}
    </AbsoluteFill>
  );
};

export const ClaudeVideo: React.FC<{ timeline: ClaudeTimed[] }> = ({ timeline }) => (
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
