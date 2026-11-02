import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Gif } from '@remotion/gif';
import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import story from '../stories/restaurant.json';
import { FPS, type TimedSegment, type VideoProps } from '../timing';
import { Captions } from '../Video';
import { C, sans } from '../theme';
import { Sam, type Mood } from './Sam';
import { Holo, N, type HoloKind } from './Holo';

type StorySegment = {
  speaker: 'clawd' | 'sam';
  text: string;
  highlight: string[];
  clawd: string;
  holo: HoloKind;
  mood: Mood;
  duration: number;
};
export const STORY = story as { title: string; segments: StorySegment[] };
const SEGS = STORY.segments;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const COUNTER_TOP = 1480;

/* ---------- décor : bureau du resto, la nuit, vue sur la ville ---------- */

const rand = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};
const BUILDINGS = Array.from({ length: 11 }, (_, i) => ({
  x: i * 100 - 20 + rand(i) * 30,
  w: 90 + rand(i + 50) * 60,
  h: 380 + rand(i + 99) * 520,
}));

const City = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#0A1430 0%, #13265A 55%, #1E2F66 100%)' }} />
      <div style={{ position: 'absolute', left: 800, top: 140, width: 110, height: 110, borderRadius: '50%', background: '#F3EBD3', boxShadow: '0 0 60px #F3EBD388' }} />
      {BUILDINGS.map((b, i) => (
        <div key={i} style={{ position: 'absolute', left: b.x, bottom: 1920 - COUNTER_TOP, width: b.w, height: b.h, background: i % 2 ? '#0B1633' : '#0E1C40' }}>
          {Array.from({ length: Math.floor(b.h / 46) * 3 }, (_, j) => {
            const on = rand(i * 100 + j) > 0.55;
            const flick = rand(i * 7 + j + Math.floor(frame / 90)) > 0.97;
            return (
              <div
                key={j}
                style={{
                  position: 'absolute',
                  left: 12 + (j % 3) * ((b.w - 24) / 3),
                  top: 20 + Math.floor(j / 3) * 46,
                  width: (b.w - 24) / 3 - 10,
                  height: 22,
                  background: on && !flick ? '#F6C76B' : '#1B2A55',
                  opacity: on ? 0.85 : 0.6,
                }}
              />
            );
          })}
        </div>
      ))}
      {/* montants de la baie vitrée */}
      {[0, 360, 720, 1060].map((x) => (
        <div key={x} style={{ position: 'absolute', left: x, top: 0, width: 22, bottom: 1920 - COUNTER_TOP, background: '#0A0F1F' }} />
      ))}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 26, background: '#0A0F1F' }} />
      {/* lampe suspendue */}
      <div style={{ position: 'absolute', left: 537, top: 0, width: 6, height: 120, background: '#0A0F1F' }} />
      <div style={{ position: 'absolute', left: 470, top: 116, width: 140, height: 50, borderRadius: '70px 70px 8px 8px', background: '#2B2F45' }} />
      <div
        style={{
          position: 'absolute',
          left: 140,
          top: 160,
          width: 800,
          height: COUNTER_TOP - 160,
          background: 'linear-gradient(rgba(255,226,170,0.16), rgba(255,226,170,0.03))',
          clipPath: 'polygon(46% 0, 54% 0, 100% 100%, 0 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

const Counter = () => (
  <>
    <div style={{ position: 'absolute', left: 0, right: 0, top: COUNTER_TOP, height: 26, background: '#7A5A44' }} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: COUNTER_TOP + 26, bottom: 0, background: 'linear-gradient(#5A4234, #3A2A22)' }} />
    {/* projecteur d'hologramme */}
    <div
      style={{
        position: 'absolute',
        left: 540 - 150,
        top: COUNTER_TOP - 16,
        width: 300,
        height: 34,
        borderRadius: '50%',
        background: '#10213F',
        border: `4px solid ${N.cyan}`,
        boxShadow: `0 0 30px ${N.cyan}`,
      }}
    />
  </>
);

/* ---------- personnages ---------- */

const SamAt: React.FC<{ mood: Mood; talk: number; frame: number }> = ({ mood, talk, frame }) => (
  <div style={{ position: 'absolute', left: -10, top: COUNTER_TOP + 40 - 728 }}>
    <Sam mood={mood} talk={talk} width={520} frame={frame} />
  </div>
);

// bouche pilotée par le volume de la voix
const SamTalking: React.FC<{ audio: string; mood: Mood; offset: number }> = ({ audio, mood, offset }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const data = useAudioData(staticFile(audio));
  let talk = 0;
  if (data) {
    const v = visualizeAudio({ fps, frame, audioData: data, numberOfSamples: 16 });
    talk = Math.min(1, (v.slice(0, 6).reduce((a, b) => a + b, 0) / 6) * 6);
  }
  return <SamAt mood={mood} talk={talk} frame={frame + offset} />;
};

const SamSpeaking: React.FC<{ audio: string | null; mood: Mood; offset: number; speaking: boolean }> = ({ audio, mood, offset, speaking }) => {
  const frame = useCurrentFrame();
  if (speaking && audio) return <SamTalking audio={audio} mood={mood} offset={offset} />;
  const talk = speaking ? 0.5 + 0.5 * Math.sin(frame * 1.4) : 0;
  return <SamAt mood={mood} talk={talk} frame={frame + offset} />;
};

const ClawdOnCounter: React.FC<{ name: string; speaking: boolean }> = ({ name, speaking }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 12, stiffness: 180 } });
  const w = 660;
  const h = (w * 440) / 480;
  const bounce = speaking ? Math.abs(Math.sin(frame / 4)) * 0.035 : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: 1080 - w + 60,
        top: COUNTER_TOP + 8 - h,
        width: w,
        height: h,
        transform: `scale(${(0.9 + 0.1 * p) * (1 + bounce)}, ${(0.9 + 0.1 * p) * (1 - bounce)})`,
        transformOrigin: '50% 96%',
      }}
    >
      <Gif src={staticFile(`clawd/${name}.gif`)} width={w} height={h} fit="contain" style={{ imageRendering: 'pixelated' }} />
    </div>
  );
};

const NameTag: React.FC<{ speaker: 'clawd' | 'sam' }> = ({ speaker }) => (
  <div style={{ position: 'absolute', top: 1548, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
    <div
      style={{
        background: speaker === 'clawd' ? C.orange : '#3B6FD8',
        color: '#fff',
        fontFamily: sans,
        fontWeight: 800,
        fontSize: 34,
        padding: '6px 26px',
        borderRadius: 999,
        letterSpacing: 2,
      }}
    >
      {speaker === 'clawd' ? 'CLAWD' : 'SAM'}
    </div>
  </div>
);

/* ---------- hologrammes, regroupés quand le même écran reste affiché ---------- */

const family = (k: HoloKind) => (k.startsWith('agents') ? 'agents' : k);

const HoloGroup: React.FC<{ kinds: HoloKind[]; starts: number[]; dur: number }> = ({ kinds, starts, dur }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 8], [0, 1], clamp);
  const exit = interpolate(frame, [dur - 6, dur], [1, 0], clamp);
  const flicker = frame < 8 && frame % 3 === 0 ? 0.6 : 1;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 170, height: 640, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ opacity: Math.min(enter, exit) * flicker, transform: `translateY(${(1 - enter) * 40}px)` }}>
        <Holo kind={kinds[0]} kinds={kinds} starts={starts} />
      </div>
    </div>
  );
};

/* ---------- composition ---------- */

export const StoryVideo: React.FC<VideoProps> = ({ timeline }) => {
  const groups: { from: number; dur: number; kinds: HoloKind[]; starts: number[] }[] = [];
  timeline.forEach((s: TimedSegment, i) => {
    const kind = SEGS[i].holo;
    const from = Math.round(s.start * FPS);
    const end = Math.round((s.start + s.duration) * FPS);
    const last = groups[groups.length - 1];
    if (last && family(last.kinds[0]) === family(kind)) {
      last.kinds.push(kind);
      last.starts.push(from - last.from);
      last.dur = end - last.from;
    } else {
      groups.push({ from, dur: end - from, kinds: [kind], starts: [0] });
    }
  });
  const lastIdx = timeline.length - 1;

  return (
    <AbsoluteFill style={{ background: '#0A1430' }}>
      <City />
      {groups.map((g, i) => (
        <Sequence key={i} from={g.from} durationInFrames={g.dur + (i === groups.length - 1 ? FPS : 0)}>
          <HoloGroup kinds={g.kinds} starts={g.starts} dur={g.dur + (i === groups.length - 1 ? FPS : 0)} />
        </Sequence>
      ))}
      {timeline.map((s, i) => {
        const from = Math.round(s.start * FPS);
        const dur = Math.round(s.duration * FPS) + (i === lastIdx ? FPS : 0);
        const seg = SEGS[i];
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <SamSpeaking audio={s.audio} mood={seg.mood} offset={from} speaking={seg.speaker === 'sam'} />
          </Sequence>
        );
      })}
      <Counter />
      {timeline.map((s, i) => {
        const from = Math.round(s.start * FPS);
        const dur = Math.round(s.duration * FPS) + (i === lastIdx ? FPS : 0);
        const seg = SEGS[i];
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <ClawdOnCounter name={seg.clawd} speaking={seg.speaker === 'clawd'} />
            <NameTag speaker={seg.speaker} />
            <Captions words={s.words} highlight={seg.highlight} />
            {s.audio ? <Audio src={staticFile(s.audio)} /> : null}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
