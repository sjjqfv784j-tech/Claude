// Script de la vidéo « C'est quoi Claude Code ? » (~1 min)
// Chaque segment = une phrase de voix off + une animation de Clawd + un écran sur le panneau.
// `duration` (secondes) sert tant qu'il n'y a pas de voix off ; ensuite la durée réelle de l'audio est utilisée.

export type PanelKind =
  | 'title'
  | 'chat'
  | 'terminal'
  | 'prompt'
  | 'plan'
  | 'files'
  | 'web'
  | 'diff'
  | 'tests'
  | 'fix'
  | 'commit'
  | 'agents'
  | 'coffee'
  | 'warn'
  | 'validate'
  | 'phone'
  | 'easy'
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
    duration: 2.6,
  },
  {
    text: 'Une IA qui répond juste à tes questions ? Non.',
    highlight: ['Non.'],
    clawd: 'idle-fluid',
    panel: 'chat',
    duration: 3.4,
  },
  {
    text: "Claude Code, lui, il agit. Directement dans ton ordinateur.",
    highlight: ['agit.', 'ordinateur.'],
    clawd: 'running-commands-fluid',
    panel: 'terminal',
    duration: 3.6,
  },
  {
    text: 'Tu lui donnes une mission, en français.',
    highlight: ['mission,'],
    clawd: 'thinking-fluid',
    panel: 'prompt',
    duration: 3.2,
  },
  {
    text: "D'abord, il prépare un plan.",
    highlight: ['plan.'],
    clawd: 'plan-progress-fluid',
    panel: 'plan',
    duration: 2.6,
  },
  {
    text: 'Il lit tout ton projet pour comprendre le code.',
    highlight: ['lit', 'projet'],
    clawd: 'reading-fluid',
    panel: 'files',
    duration: 3.4,
  },
  {
    text: 'Il cherche même sur internet si besoin.',
    highlight: ['internet'],
    clawd: 'searching-web-fluid',
    panel: 'web',
    duration: 3.0,
  },
  {
    text: 'Puis il écrit les modifications lui-même.',
    highlight: ['écrit'],
    clawd: 'writing-fluid',
    panel: 'diff',
    duration: 3.0,
  },
  {
    text: 'Il lance les tests…',
    highlight: ['tests…'],
    clawd: 'testing-fluid',
    panel: 'tests',
    duration: 2.4,
  },
  {
    text: 'Une erreur ? Il la corrige tout seul.',
    highlight: ['erreur', 'tout', 'seul.'],
    clawd: 'error-fluid',
    panel: 'fix',
    duration: 3.2,
  },
  {
    text: 'Et quand tout marche, il sauvegarde ton travail.',
    highlight: ['sauvegarde'],
    clawd: 'committing-fluid',
    panel: 'commit',
    duration: 3.3,
  },
  {
    text: 'Un gros projet ? Il peut faire travailler plusieurs agents en même temps.',
    highlight: ['plusieurs', 'agents'],
    clawd: 'directing-helpers-fluid',
    panel: 'agents',
    duration: 4.2,
  },
  {
    text: 'Et toi, pendant ce temps ? Tu prends un café.',
    highlight: ['café.'],
    clawd: 'gag-coffee',
    panel: 'coffee',
    duration: 3.5,
  },
  {
    text: 'Attention quand même : comme toute IA, il peut se tromper.',
    highlight: ['Attention', 'tromper.'],
    clawd: 'gag-hallucinate',
    panel: 'warn',
    duration: 3.8,
  },
  {
    text: "C'est pour ça qu'il te demande la permission avant les actions importantes.",
    highlight: ['permission'],
    clawd: 'waiting-for-you-fluid',
    panel: 'validate',
    duration: 4.2,
  },
  {
    text: "Et ça marche aussi depuis ton téléphone, même quand ton ordi est éteint.",
    highlight: ['téléphone,', 'éteint.'],
    clawd: 'server-running-fluid',
    panel: 'phone',
    duration: 4.0,
  },
  {
    text: "Le meilleur ? Pas besoin d'être un expert pour commencer.",
    highlight: ['expert'],
    clawd: 'greeting-crown',
    panel: 'easy',
    duration: 3.6,
  },
  {
    text: 'Abonne-toi pour tout savoir sur les IA !',
    highlight: ['Abonne-toi', 'IA'],
    clawd: 'done-fluid',
    panel: 'follow',
    duration: 3.0,
  },
];
