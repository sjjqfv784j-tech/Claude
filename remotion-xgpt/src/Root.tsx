import { Composition } from 'remotion';
import { Pub, DURATION } from './Pub';
export const Root = () => <Composition id="Pub" component={Pub} durationInFrames={DURATION} fps={30} width={1080} height={1920} />;
