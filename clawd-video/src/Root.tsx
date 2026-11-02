import React from 'react';
import { Composition } from 'remotion';
import { ClawdVideo } from './Video';
import { StoryVideo, STORY } from './story/StoryVideo';

const StoryVideo3D: React.FC<VideoProps> = (p) => <StoryVideo {...p} three />;
import { SEGMENTS } from './script';
import { FPS, buildTimeline, loadVoice, totalFrames, type VideoProps } from './timing';

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
  </>
);
