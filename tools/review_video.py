#!/usr/bin/env python3
"""Vérifications mesurées d'une vidéo verticale (TikTok / Reels / Shorts), dans l'esprit de tools/review.mjs du skill animate.

usage : python3 tools/review_video.py <video.mp4> [--max 60] [--timings public/voice/etsi/timings.json] [--sheet out.png]

Contrôles : format (codec, couleurs, faststart), durée, son (volume, crête, silences), rythme (coupes, passages sans mouvement),
accroche (image 1 : texte et mouvement), boucle (dernière image proche de la première), débit de la voix.
Chaque contrôle donne PASS / WARN / FAIL avec le chiffre mesuré. Les seuils viennent des règles du skill short-form-video
(un changement visuel toutes les 2 à 4 s, sous-titres dès la première seconde, boucle) et des plateformes (yuv420p, 1080x1920).
"""
import json, re, subprocess, sys
import numpy as np

args = sys.argv[1:]
if not args:
    print(__doc__); sys.exit(2)
video = args[0]
def opt(k, d=None):
    return args[args.index(k) + 1] if k in args else d
MAXS = float(opt('--max', 75))
timings = opt('--timings')
sheet = opt('--sheet')

def sh(cmd):
    return subprocess.run(cmd, capture_output=True)

res = []  # (niveau, nom, détail)
def add(ok, name, detail, warn=False):
    res.append(('PASS' if ok else ('WARN' if warn else 'FAIL'), name, detail))

# ---------- format ----------
p = json.loads(sh(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', video]).stdout)
v = next(s for s in p['streams'] if s['codec_type'] == 'video')
a = next((s for s in p['streams'] if s['codec_type'] == 'audio'), None)
dur = float(p['format']['duration'])
W, H = int(v['width']), int(v['height'])
fps = eval(v['r_frame_rate'])
head = open(video, 'rb').read(300000)
i, j = head.find(b'moov'), head.find(b'mdat')
faststart = 0 < i < j
add(v['codec_name'] == 'h264', 'codec vidéo', v['codec_name'])
add(v.get('pix_fmt') == 'yuv420p', 'couleurs compatibles (yuv420p)', v.get('pix_fmt'))
add(faststart, 'lecture immédiate (faststart)', 'oui' if faststart else 'non : les infos sont à la fin du fichier')
add((W, H) == (1080, 1920), 'format 1080x1920 (9:16)', f'{W}x{H}')
add(15 <= fps <= 61, 'images par seconde', f'{fps:.0f}')
add(a is not None, 'piste audio', 'oui' if a else 'AUCUNE')
add(7 <= dur <= 75, 'durée', f'{dur:.1f} s', warn=True)
add(float(p['format']['size']) < 120e6, 'poids du fichier', f"{float(p['format']['size'])/1e6:.1f} Mo")

# ---------- son ----------
if a:
    r = sh(['ffmpeg', '-hide_banner', '-nostats', '-t', str(MAXS), '-i', video, '-af', 'ebur128=peak=true,silencedetect=n=-45dB:d=1.2', '-vn', '-f', 'null', '-']).stderr.decode()
    lufs = re.findall(r'I:\s+(-?[\d.]+) LUFS', r); peak = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r)
    lufs = float(lufs[-1]) if lufs else None; peak = float(peak[-1]) if peak else None
    add(lufs is not None and -17 <= lufs <= -12, 'volume (cible -16 à -13 LUFS)', f'{lufs} LUFS')
    add(peak is not None and peak <= -1, 'crête sans saturation (<= -1 dBTP)', f'{peak} dBTP')
    sil = re.findall(r'silence_start: ([\d.]+)', r); sile = re.findall(r'silence_end: ([\d.]+)', r)
    long_sil = [(float(x), float(y)) for x, y in zip(sil, sile) if float(y) - float(x) > 2.5]
    add(not long_sil, 'pas de silence de plus de 2,5 s', 'aucun' if not long_sil else ', '.join(f'{x:.1f}-{y:.1f}s' for x, y in long_sil), warn=True)

# ---------- images : mouvement, coupes ----------
RATE = 6
raw = sh(['ffmpeg', '-v', 'error', '-t', str(MAXS), '-i', video, '-vf', f'fps={RATE},scale=108:192,format=gray', '-f', 'rawvideo', '-']).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, 192, 108).astype(np.int16)
d = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))              # changement moyen entre deux images
cut_thr = max(14.0, d.mean() * 5)
cuts = [k / RATE for k, x in enumerate(d) if x > cut_thr]
# on fusionne les coupes collées (un fondu = plusieurs images)
merged = []
for t in cuts:
    if not merged or t - merged[-1] > 0.5: merged.append(t)
n = len(fr) / RATE
iv = np.diff([0] + merged + [n]) if merged else np.array([n])
add(len(merged) >= n / 6, 'un changement de plan toutes les ~2 à 6 s', f'{len(merged)} coupes, intervalle moyen {iv.mean():.1f} s, max {iv.max():.1f} s', warn=True)
# passages sans mouvement : fenêtre de 0,5 s dont le changement est très faible
win = max(1, RATE // 2)
motion = np.convolve(d, np.ones(win) / win, 'same')
still = motion < 0.25
runs, start = [], None
for k, s in enumerate(still):
    if s and start is None: start = k
    if (not s or k == len(still) - 1) and start is not None:
        if (k - start) / RATE >= 3.0: runs.append((start / RATE, k / RATE))
        start = None
add(not runs, 'aucun passage immobile de plus de 3 s', 'aucun' if not runs else ', '.join(f'{x:.1f}-{y:.1f}s' for x, y in runs), warn=True)

# ---------- accroche ----------
first = fr[:int(2 * RATE)]
move_first = np.abs(np.diff(first, axis=0)).mean() if len(first) > 1 else 0
add(move_first > 0.5, 'du mouvement dans les 2 premières secondes', f'{move_first:.2f}', warn=True)
# texte contrasté (blanc cerné de noir) dans la bande haute pendant les 2 premières secondes
full = sh(['ffmpeg', '-v', 'error', '-ss', '1.0', '-i', video, '-frames:v', '1', '-vf', 'scale=270:480,format=gray', '-f', 'rawvideo', '-']).stdout
if full:
    img = np.frombuffer(full, np.uint8).reshape(480, 270)
    band = img[int(480 * 0.05):int(480 * 0.30)]
    txt = ((band > 235).mean() > 0.01) and ((band < 25).mean() > 0.01)
    add(txt, 'texte lisible dès la 1ʳᵉ seconde (blanc cerné de noir, en haut)', 'oui' if txt else 'non détecté', warn=True)

# ---------- boucle ----------
lastf = fr[-1]; firstf = fr[0]
loop = np.abs(lastf - firstf).mean()
add(loop < 12, 'boucle : la dernière image ressemble à la première', f'écart {loop:.1f} (typique entre deux images : {np.median(d):.2f})', warn=True)

# ---------- voix ----------
if timings:
    segs = json.load(open(timings))['segments']
    rows = []
    for s in segs:
        w = sum(1 for x in s['words'] if re.search(r'\w', x['text'])); rows.append(w / max(0.1, s['duration']))
    worst = max(rows)
    add(worst <= 3.8, 'débit de la voix <= 3,8 mots/s', f'moyenne {np.mean(rows):.2f}, max {worst:.2f}', warn=True)
    words = sum(1 for s in segs for x in s['words'] if re.search(r'\w', x['text']))
    add(True, 'volume de texte', f'{words} mots en {dur:.0f} s')

# ---------- planche ----------
if sheet:
    sh(['ffmpeg', '-v', 'error', '-y', '-t', str(MAXS), '-i', video, '-vf', 'fps=1/3,scale=160:-1,tile=10x3', '-frames:v', '1', sheet])

# ---------- rapport ----------
print(f'== {video}')
w = max(len(n) for _, n, _ in res)
for lvl, n, dtl in res:
    print(f'  {lvl:<4}  {n:<{w}}  {dtl}')
bad = sum(1 for l, *_ in res if l == 'FAIL'); warn = sum(1 for l, *_ in res if l == 'WARN')
print(f'  => {len(res) - bad - warn} PASS, {warn} WARN, {bad} FAIL')
