#!/usr/bin/env python3
"""Images 3D style « Pixar » pour une histoire de fruits, via Pollinations (modèle gratuit flux-klein).
- Personnages : clawd-video/public/fruit3d/<id>/ref/<perso>.jpg (créés depuis "cast[x].look" si absents)
- Plans : un par segment ("shot" dans le JSON), en réutilisant les images de référence des personnages présents ("refs").
usage : python3 tools/fruit3d_images.py <id> [numéros de plans à refaire...]
La clé Pollinations est ajoutée par le proxy (ou mets POLLINATIONS_KEY)."""
import base64, json, os, subprocess, sys, time, urllib.parse
from concurrent.futures import ThreadPoolExecutor
sid = sys.argv[1]; only = {int(x) for x in sys.argv[2:]}
story = json.load(open(f'clawd-video/src/stories/fruit-{sid}.json'))
d = f'clawd-video/public/fruit3d/{sid}'; os.makedirs(f'{d}/ref', exist_ok=True)
STYLE = story.get('style3d', '3D animated film still in the style of a modern Pixar movie, warm cinematic lighting, shallow depth of field, highly detailed, vertical 9:16.')
KEY = os.environ.get('POLLINATIONS_KEY', 'proxy-injected'); AUTH = ['-H', f'Authorization: Bearer {KEY}']
def txt2img(out, prompt, seed=11):
    u = 'https://gen.pollinations.ai/image/' + urllib.parse.quote(STYLE + ' ' + prompt) + f'?model=klein&width=768&height=1344&seed={seed}&nologo=true'
    subprocess.run(['curl', '-s', '-m', '300', '-o', out, *AUTH, u], check=True)
def edit(out, refs, prompt):
    names = ' and '.join(f"the {story['cast'][r]['who']} from image {i + 1}" for i, r in enumerate(refs))
    p = f"{STYLE} Characters: {names}. Keep every character exactly as in the reference images (same head, face, clothes). {prompt}"
    args = ['curl', '-s', '-m', '300', *AUTH, 'https://gen.pollinations.ai/v1/images/edits', '-F', 'model=klein', '-F', 'size=768x1344', '-F', f'prompt={p}']
    for r in refs: args += ['-F', f'image[]=@{d}/ref/{r}.jpg']
    for attempt in range(5):
        raw = subprocess.run(args, capture_output=True, text=True).stdout
        try: res = json.loads(raw)
        except ValueError: res = {'error': raw[:200] or 'réponse vide'}
        if 'data' in res: break
        print(out, 'nouvel essai :', str(res)[:120]); time.sleep(10 * (attempt + 1))
    else: raise SystemExit(f'{out}: échec')
    open(out, 'wb').write(base64.b64decode(res['data'][0]['b64_json']))
for k, c in story['cast'].items():
    if not os.path.exists(f'{d}/ref/{k}.jpg'): txt2img(f'{d}/ref/{k}.jpg', c['look']); print('ref', k)
def shot(i):
    s = story['segments'][i]; out = f'{d}/shot-{i}.jpg'
    if (only and i not in only) or (not only and os.path.exists(out)): return
    if s.get('refs'): edit(out, s['refs'], s['shot'])
    else: txt2img(out, s['shot'], 20 + i)
    print('plan', i, 'ok')
with ThreadPoolExecutor(2) as ex: list(ex.map(shot, range(len(story['segments']))))
