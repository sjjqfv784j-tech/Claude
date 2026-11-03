#!/usr/bin/env python3
"""Crée le squelette d'un épisode « duo » à partir de l'épisode de référence (clawd-video/src/claude/).

usage (racine du dépôt) : python3 .claude/skills/duo-series-video/scripts/new_episode.py <slug> ["Titre de l'épisode"]

Crée      clawd-video/src/<slug>/Scenes.tsx        les scènes (à RÉÉCRIRE pour l'histoire : décors, cartes, accessoires)
          clawd-video/src/<slug>/<Slug>Video.tsx   la composition (sous-titres, minutage, boucle) — normalement inchangée
          clawd-video/src/stories/<slug>.json      le script (répliques, voix, effets sonores, minutage)
Modifie   clawd-video/src/Root.tsx                 enregistre la composition « <Slug> »
Ne touche jamais aux épisodes existants.
"""
import json, pathlib, re, sys

if len(sys.argv) < 2:
    print(__doc__); sys.exit(2)
slug = sys.argv[1]
title = sys.argv[2] if len(sys.argv) > 2 else f"Sam & Pixel : {slug}"
if not re.fullmatch(r'[a-z0-9][a-z0-9-]*', slug):
    sys.exit("le slug doit être en minuscules, chiffres et tirets (ex. sam-et-la-facture)")
pascal = ''.join(p.capitalize() for p in slug.split('-'))
camel = pascal[0].lower() + pascal[1:]

root = pathlib.Path.cwd()
base = root / 'clawd-video' / 'src'
ref = base / 'claude'
skill = root / '.claude' / 'skills' / 'duo-series-video'
for need in [ref / 'ScenesClaude.tsx', ref / 'ClaudeVideo.tsx', base / 'Root.tsx', skill / 'templates' / 'episode.story.json']:
    if not need.exists(): sys.exit(f"fichier introuvable : {need} (lancez le script depuis la racine du dépôt)")
dst = base / slug
if dst.exists() or (base / 'stories' / f'{slug}.json').exists():
    sys.exit(f"« {slug} » existe déjà : choisissez un autre nom (jamais d'écrasement)")
dst.mkdir()

scenes = (ref / 'ScenesClaude.tsx').read_text()
scenes = scenes.replace('ClaudeSceneView', f'{pascal}SceneView').replace('CScene', f'{pascal}Scene').replace('CProps', f'{pascal}Props')
(dst / 'Scenes.tsx').write_text(scenes)

video = (ref / 'ClaudeVideo.tsx').read_text()
video = video.replace("'../stories/claude1.json'", f"'../stories/{slug}.json'")
video = video.replace("from '../claude/ScenesClaude'", "from './Scenes'")
video = video.replace('ClaudeSceneView as SceneView, type CScene as SceneId', f'{pascal}SceneView as SceneView, type {pascal}Scene as SceneId')
video = video.replace('ClaudeVideo', f'{pascal}Video').replace('ClaudeTimed', f'{pascal}Timed').replace('buildClaude', f'build{pascal}').replace('claudeFrames', f'{camel}Frames').replace('CLAUDE1', 'EP')
(dst / f'{pascal}Video.tsx').write_text(video)

story = json.loads((skill / 'templates' / 'episode.story.json').read_text())
story['title'] = title
(base / 'stories' / f'{slug}.json').write_text(json.dumps(story, ensure_ascii=False, indent=2))
n = len(story['segments'])

root_tsx = (base / 'Root.tsx').read_text()
imp = f"import {{ {pascal}Video, build{pascal}, {camel}Frames }} from './{slug}/{pascal}Video';"
m = list(re.finditer(r"^import .*$", root_tsx, re.M))[-1]
root_tsx = root_tsx[:m.end()] + '\n' + imp + root_tsx[m.end():]
comp = f'''    <Composition
      id="{pascal}"
      component={{{pascal}Video}}
      width={{1080}}
      height={{1920}}
      fps={{FPS}}
      durationInFrames={{300}}
      defaultProps={{{{ timeline: build{pascal}(null) }}}}
      calculateMetadata={{async () => {{
        const voice = await loadVoice('voice/{slug}', {n});
        const timeline = build{pascal}(voice as never);
        return {{ durationInFrames: {camel}Frames(timeline), props: {{ timeline }} }};
      }}}}
    />
'''
k = root_tsx.rfind('  </>')
root_tsx = root_tsx[:k] + comp + root_tsx[k:]
(base / 'Root.tsx').write_text(root_tsx)

print(f"""Épisode « {slug} » créé (composition « {pascal} », {n} répliques d'exemple).
Étapes suivantes :
 1. écrire le script          clawd-video/src/stories/{slug}.json
 2. générer les voix          cd clawd-video && ELEVENLABS_API_KEY=... node scripts/voice.mjs {slug}
 3. réécrire les scènes       clawd-video/src/{slug}/Scenes.tsx  (une scène par réplique ; les ids de scène du JSON doivent exister)
 4. vérifier le code          cd clawd-video && npx tsc -p .
 5. rendre                    npx remotion render src/index.ts {pascal} out/{slug}.mp4 --concurrency=4
 6. bande sonore + export     python3 .claude/skills/duo-series-video/scripts/make_audio.py {slug} clawd-video/out/{slug}.mp4 out/{slug}-final.mp4
 7. vérifications mesurées    .claude/skills/duo-series-video/scripts/verify.sh out/{slug}-final.mp4 {slug}""")
