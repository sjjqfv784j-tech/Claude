// Ajoute ici chaque nouvelle histoire de fruits : la composition « Fruit-<id> » apparaît dans Remotion.
import type { FruitStory } from './FruitStoryVideo';
import fraise from '../stories/fruit-fraise.json';

export const FRUIT_STORIES: Record<string, FruitStory> = {
  fraise: fraise as unknown as FruitStory,
};
