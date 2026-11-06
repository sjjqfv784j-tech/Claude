// Version « 3D » d'une histoire de fruits : un plan généré par IA (public/fruit3d/<id>/shot-N.jpg) par réplique,
// animé par des mouvements de caméra lents, avec voix, sous-titres mot par mot, bandeaux et effets.
import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Banner, CAST_COLOR, Captions, type FruitStory, type FruitTimed } from './FruitStoryVideo';
import { Rain } from './Scenery';
import { sans } from '../theme';
import { FPS } from '../timing';

export type Fruit3DProps = { id: string; story: FruitStory; timeline: FruitTimed[] };

// mouvements de caméra qui alternent d'un plan à l'autre (zoom avant, zoom arrière, glissements)
const MOVES = [
  { s: [1.04, 1.16], x: [0, 0], y: [0, -20] },
  { s: [1.16, 1.06], x: [-25, 25], y: [0, 0] },
  { s: [1.06, 1.18], x: [20, -10], y: [10, -10] },
  { s: [1.14, 1.08], x: [0, 0], y: [-30, 20] },
];

const Shot: React.FC<{ id: string; story: FruitStory; i: number; timed: FruitTimed; offset: number; dur: number }> = ({ id, story, i, timed, offset, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const seg = story.segments[i];
  const fx = new Set(seg.fx ?? []);
  const m = fx.has('zoom') ? { s: [1.0, 1.3], x: [0, 0], y: [0, -60] } : MOVES[i % MOVES.length];
  const p = Math.min(1, t / Math.max(1, dur));
  const ease = 0.5 - 0.5 * Math.cos(Math.PI * p);
  const s = interpolate(ease, [0, 1], m.s);
  const x = interpolate(ease, [0, 1], m.x);
  const y = interpolate(ease, [0, 1], m.y);
  const shake = fx.has('shake') && t < 0.7 ? (1 - t / 0.7) * 26 : 0;
  // entrée du plan : léger « coup de zoom » + fondu depuis le plan précédent
  const punch = i === 0 ? 0 : interpolate(t, [0, 0.22], [0.08, 0], { extrapolateRight: 'clamp' });
  const fade = i === 0 ? 1 : interpolate(t, [0, 0.12], [0, 1], { extrapolateRight: 'clamp' });
  const flash = fx.has('flash') ? interpolate(t, [0, 0.3], [0.85, 0], { extrapolateRight: 'clamp' }) : 0;
  const spk = story.cast[seg.speaker];
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <AbsoluteFill style={{ overflow: 'hidden', background: '#000' }}>
        <Img
          src={staticFile(`fruit3d/${id}/shot-${i}.jpg`)}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: `translate(${x + Math.sin(frame * 2.1) * shake}px, ${y + Math.cos(frame * 2.7) * shake}px) scale(${s + punch})`,
          }}
        />
      </AbsoluteFill>
      {fx.has('rain') ? <svg width={1080} height={1920} style={{ position: 'absolute' }}><Rain t={t} /></svg> : null}
      {/* dégradés pour la lisibilité du texte */}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.55) 100%)' }} />
      {seg.hook ? <Banner text={seg.hook} t={t} top={230} color="#ff2d55" /> : null}
      {fx.has('question') ? <Banner text={story.ending ?? 'RÉPONDS EN COMMENTAIRE'} t={t - 0.4} top={230} color="#ffd23f" dark /> : null}
      {story.series && i > 0 ? (
        <div style={{ position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center', fontFamily: sans, fontWeight: 800, fontSize: 30, color: '#fff', opacity: 0.9, textShadow: '0 3px 8px rgba(0,0,0,0.7)', letterSpacing: 2 }}>{story.series}</div>
      ) : null}
      <Captions
        words={timed.words.map((w) => ({ ...w, start: w.start + offset / fps, end: w.end + offset / fps }))}
        highlight={seg.highlight ?? []}
        t={t}
        color={spk ? CAST_COLOR[spk.fruit] : '#fff'}
        name={spk?.name ?? null}
      />
      {timed.audio ? <Sequence from={offset}><Audio src={staticFile(timed.audio)} /></Sequence> : null}
      {flash > 0 ? <AbsoluteFill style={{ background: '#fff', opacity: flash }} /> : null}
    </AbsoluteFill>
  );
};

export const Fruit3DVideo: React.FC<Fruit3DProps> = ({ id, story, timeline }) => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {timeline.map((s, i) => {
        const from = Math.round(s.start * FPS);
        const begin = i === 0 ? 0 : from;
        const end = i < timeline.length - 1 ? Math.round(timeline[i + 1].start * FPS) : durationInFrames;
        return (
          <Sequence key={i} from={begin} durationInFrames={end - begin}>
            <Shot id={id} story={story} i={i} timed={s} offset={from - begin} dur={(end - begin) / FPS} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
