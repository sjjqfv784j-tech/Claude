import React from 'react';
import { Composition } from 'remotion';
import { ClawdVideo } from './Video';
import { FPS, buildTimeline, loadVoice, totalFrames, type VideoProps } from './timing';

export const Root: React.FC = () => (
  <Composition
    id="ClaudeCode"
    component={ClawdVideo}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={300}
    defaultProps={{ timeline: buildTimeline(null) } as VideoProps}
    calculateMetadata={async () => {
      const timeline = buildTimeline(await loadVoice());
      return { durationInFrames: totalFrames(timeline), props: { timeline } };
    }}
  />
);
