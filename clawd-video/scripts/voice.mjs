// Génère la voix off avec ElevenLabs + le minutage de chaque mot.
// Usage : ELEVENLABS_API_KEY=... [ELEVENLABS_VOICE_ID=...] npm run voice
// Écrit public/voice/seg-N.mp3 et public/voice/timings.json (lu automatiquement par la vidéo).
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const KEY = process.env.ELEVENLABS_API_KEY;
const VOICE = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
const MODEL = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
if (!KEY) {
  console.error('ELEVENLABS_API_KEY manquante.');
  process.exit(1);
}

// on relit les phrases directement dans src/script.ts
const src = readFileSync(new URL('../src/script.ts', import.meta.url), 'utf8');
const texts = [...src.matchAll(/^\s+text:\s*(['"])(.*)\1,\s*$/gm)].map((m) => m[2].replace(/\\'/g, "'"));
if (!texts.length) throw new Error('Aucun texte trouvé dans src/script.ts');

const outDir = new URL('../public/voice/', import.meta.url);
mkdirSync(outDir, { recursive: true });

const toWords = (text, a) => {
  const words = [];
  let cur = null;
  a.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (cur) words.push(cur);
      cur = null;
      return;
    }
    if (!cur) cur = { text: '', start: a.character_start_times_seconds[i], end: 0 };
    cur.text += ch;
    cur.end = a.character_end_times_seconds[i];
  });
  if (cur) words.push(cur);
  return words;
};

const segments = [];
for (const [i, text] of texts.entries()) {
  process.stdout.write(`Segment ${i + 1}/${texts.length} : ${text}\n`);
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        model_id: MODEL,
        voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true },
      }),
    },
  );
  if (!res.ok) throw new Error(`ElevenLabs ${res.status} : ${await res.text()}`);
  const data = await res.json();
  const file = `voice/seg-${i}.mp3`;
  const path = new URL(`../public/${file}`, import.meta.url);
  writeFileSync(path, Buffer.from(data.audio_base64, 'base64'));
  const duration = Number(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.pathname])
      .toString()
      .trim(),
  );
  segments.push({ audio: file, duration, words: toWords(text, data.alignment) });
}

writeFileSync(new URL('timings.json', outDir), JSON.stringify({ voice: VOICE, segments }, null, 2));
console.log('Voix off prête : public/voice/timings.json');
