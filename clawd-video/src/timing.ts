import { staticFile } from 'remotion';
import { SEGMENTS } from './script';

export const FPS = 30;
// petite respiration entre deux phrases quand il y a une voix off
const GAP = 0.15;

export type Word = { text: string; start: number; end: number }; // secondes, relatif au segment
export type TimedSegment = {
  start: number; // secondes, absolu
  duration: number;
  audio: string | null;
  words: Word[];
};
export type VideoProps = { timeline: TimedSegment[] };

type VoiceFile = {
  segments: { audio: string; duration: number; words: Word[] }[];
};

// Sans voix off : on répartit les mots sur la durée selon leur longueur.
const estimateWords = (text: string, duration: number): Word[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const weights = words.map((w) => w.length + 2);
  const total = weights.reduce((a, b) => a + b, 0);
  const usable = duration - 0.3;
  let t = 0.1;
  return words.map((w, i) => {
    const d = (weights[i] / total) * usable;
    const word = { text: w, start: t, end: t + d };
    t += d;
    return word;
  });
};

export const buildTimeline = (voice: VoiceFile | null): TimedSegment[] => {
  let start = 0;
  return SEGMENTS.map((seg, i) => {
    const v = voice?.segments[i];
    const duration = v ? v.duration + GAP : seg.duration;
    const item: TimedSegment = {
      start,
      duration,
      audio: v ? v.audio : null,
      words: v ? v.words : estimateWords(seg.text, duration),
    };
    start += duration;
    return item;
  });
};

export const loadVoice = async (): Promise<VoiceFile | null> => {
  try {
    const res = await fetch(staticFile('voice/timings.json'));
    if (!res.ok) return null;
    const data = (await res.json()) as VoiceFile;
    return data.segments?.length === SEGMENTS.length ? data : null;
  } catch {
    return null;
  }
};

export const totalFrames = (timeline: TimedSegment[]) => {
  const last = timeline[timeline.length - 1];
  return Math.ceil((last.start + last.duration + 0.4) * FPS);
};
