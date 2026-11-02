// Script de la vidéo « C'est quoi Claude Code ? »
// Chaque segment = une phrase de voix off + une animation de Clawd + un écran sur le panneau.
// `duration` (secondes) sert tant qu'il n'y a pas de voix off ; ensuite la durée réelle de l'audio est utilisée.

export type PanelKind =
  | 'title'
  | 'terminal'
  | 'prompt'
  | 'files'
  | 'diff'
  | 'tests'
  | 'fix'
  | 'commit'
  | 'coffee'
  | 'follow';

export type Segment = {
  text: string; // texte lu par la voix off et affiché en sous-titres
  highlight: string[]; // mots affichés en orange
  clawd: string; // nom du GIF dans public/clawd/
  panel: PanelKind;
  duration: number;
};

export const TITLE = "CLAUDE CODE,\nC'EST QUOI ?";

export const SEGMENTS: Segment[] = [
  {
    text: "Claude Code, c'est quoi ?",
    highlight: ['Claude', 'Code,'],
    clawd: 'greeting-fluid',
    panel: 'title',
    duration: 2.4,
  },
  {
    text: "C'est Claude… mais directement dans ton terminal.",
    highlight: ['terminal.'],
    clawd: 'idle-fluid',
    panel: 'terminal',
    duration: 3.2,
  },
  {
    text: 'Tu lui donnes une mission, en français.',
    highlight: ['mission,'],
    clawd: 'thinking-fluid',
    panel: 'prompt',
    duration: 3.0,
  },
  {
    text: 'Il lit tout ton projet pour comprendre le code.',
    highlight: ['lit', 'projet'],
    clawd: 'reading-fluid',
    panel: 'files',
    duration: 3.3,
  },
  {
    text: 'Il écrit les modifications lui-même.',
    highlight: ['écrit'],
    clawd: 'writing-fluid',
    panel: 'diff',
    duration: 2.9,
  },
  {
    text: 'Il lance les tests…',
    highlight: ['tests…'],
    clawd: 'testing-fluid',
    panel: 'tests',
    duration: 2.2,
  },
  {
    text: 'Une erreur ? Il la corrige tout seul.',
    highlight: ['erreur', 'tout', 'seul.'],
    clawd: 'error-fluid',
    panel: 'fix',
    duration: 3.1,
  },
  {
    text: 'Et quand tout marche, il sauvegarde ton travail.',
    highlight: ['sauvegarde'],
    clawd: 'committing-fluid',
    panel: 'commit',
    duration: 3.2,
  },
  {
    text: 'Et toi, pendant ce temps ? Tu prends un café.',
    highlight: ['café.'],
    clawd: 'gag-coffee',
    panel: 'coffee',
    duration: 3.4,
  },
  {
    text: 'Abonne-toi pour tout savoir sur les IA !',
    highlight: ['Abonne-toi', 'IA'],
    clawd: 'done-fluid',
    panel: 'follow',
    duration: 2.8,
  },
];
