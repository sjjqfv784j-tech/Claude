import React from 'react';
import { Composition } from 'remotion';
import { ClawdVideo } from './Video';
import { StoryVideo, STORY } from './story/StoryVideo';
import { EtSiVideo, buildEtSi, etsiFrames } from './etsi/EtSiVideoV2';
import { MentiVideo, buildMenti, mentiFrames } from './menti/MentiVideo';
import { ClaudeVideo, buildClaude, claudeFrames } from './claude/ClaudeVideo';

const StoryVideo3D: React.FC<VideoProps> = (p) => <StoryVideo {...p} three />;
import { SEGMENTS } from './script';
import { FPS, buildTimeline, loadVoice, totalFrames, type VideoProps } from './timing';
import { FruitStoryVideo, buildFruitTimeline, fruitFrames, type FruitProps } from './fruit/FruitStoryVideo';
import { FRUIT_STORIES } from './fruit/registry';
import { SamPixel1Video, buildSamPixel1, samPixel1Frames } from './sam-pixel-1/SamPixel1Video';

export const Root: React.FC = () => (
  <>
    <Composition
      id="ClaudeCode"
      component={ClawdVideo}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={300}
      defaultProps={{ timeline: buildTimeline(SEGMENTS, null) } as VideoProps}
      calculateMetadata={async () => {
        const timeline = buildTimeline(SEGMENTS, await loadVoice('voice', SEGMENTS.length));
        return { durationInFrames: totalFrames(timeline), props: { timeline } };
      }}
    />
    <Composition
      id="Restaurant"
      component={StoryVideo}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={300}
      defaultProps={{ timeline: buildTimeline(STORY.segments, null) } as VideoProps}
      calculateMetadata={async () => {
        // dialogue : un peu plus de silence entre les répliques
        const timeline = buildTimeline(STORY.segments, await loadVoice('voice/restaurant', STORY.segments.length), 0.25);
        return { durationInFrames: totalFrames(timeline), props: { timeline } };
      }}
    />
    <Composition
      id="Restaurant3D"
      component={StoryVideo3D}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={300}
      defaultProps={{ timeline: buildTimeline(STORY.segments, null) } as VideoProps}
      calculateMetadata={async () => {
        // dialogue : un peu plus de silence entre les répliques
        const timeline = buildTimeline(STORY.segments, await loadVoice('voice/restaurant', STORY.segments.length), 0.25);
        return { durationInFrames: totalFrames(timeline), props: { timeline } };
      }}
    />
    <Composition
      id="EtSi"
      component={EtSiVideo}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={300}
      defaultProps={{ timeline: buildEtSi(null) }}
      calculateMetadata={async () => {
        const voice = await loadVoice('voice/etsi', 15);
        const timeline = buildEtSi(voice as never);
        return { durationInFrames: etsiFrames(timeline), props: { timeline } };
      }}
    />
    <Composition
      id="Menti1"
      component={MentiVideo}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={300}
      defaultProps={{ timeline: buildMenti(null) }}
      calculateMetadata={async () => {
        const voice = await loadVoice('voice/menti1', 9);
        const timeline = buildMenti(voice as never);
        return { durationInFrames: mentiFrames(timeline), props: { timeline } };
      }}
    />
    <Composition
      id="ClaudeSam1"
      component={ClaudeVideo}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={300}
      defaultProps={{ timeline: buildClaude(null) }}
      calculateMetadata={async () => {
        const voice = await loadVoice('voice/claude1', 10);
        const timeline = buildClaude(voice as never);
        return { durationInFrames: claudeFrames(timeline), props: { timeline } };
      }}
    />
    <Composition
      id="SamPixel1"
      component={SamPixel1Video}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={300}
      defaultProps={{ timeline: buildSamPixel1(null) }}
      calculateMetadata={async () => {
        const voice = await loadVoice('voice/sam-pixel-1', 5);
        const timeline = buildSamPixel1(voice as never);
        return { durationInFrames: samPixel1Frames(timeline), props: { timeline } };
      }}
    />
    {Object.entries(FRUIT_STORIES).map(([id, story]) => (
      <Composition
        key={id}
        id={`Fruit-${id}`}
        component={FruitStoryVideo}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={300}
        defaultProps={{ story, timeline: buildFruitTimeline(story, null) } as FruitProps}
        calculateMetadata={async () => {
          const voice = await loadVoice(`voice/fruit-${id}`, story.segments.length);
          const timeline = buildFruitTimeline(story, voice as never);
          return { durationInFrames: fruitFrames(story, timeline), props: { story, timeline } };
        }}
      />
    ))}
  </>
);
