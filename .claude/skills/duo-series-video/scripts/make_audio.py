#!/usr/bin/env python3
"""Bande sonore d'un épisode « duo » : voix + fouets de transition + effets décrits dans le JSON + musique douce, puis export
1080x1920 yuv420p faststart, loudnorm (-14,5 LUFS) et limiteur (crête < -1 dBTP).

usage (depuis la racine du dépôt) :
  python3 .claude/skills/duo-series-video/scripts/make_audio.py <slug> <video_rendu.mp4> <sortie.mp4>

Lit  clawd-video/src/stories/<slug>.json    (timing + segments[].sfx)
     clawd-video/public/voice/<slug>/timings.json
Effets : { "t": secondes depuis le début de la scène, "type": thump|ding|chime|tick|click|buzz|pop|riser|boom, "n": répétitions (tick), "gain": 0..1 }
timing.music_duck : liste d'indices de scènes pendant lesquelles la musique se coupe (tension avant la chute).
"""
import json, subprocess, sys, wave
import numpy as np

slug, src, dst = sys.argv[1:4]
SR = 48000
story = json.load(open(f'clawd-video/src/stories/{slug}.json'))
T = json.load(open(f'clawd-video/public/voice/{slug}/timings.json'))['segments']
timing = story.get('timing', {})
LEAD = timing.get('lead', 0.05)
GAPS = timing.get('gaps', [0.12] * (len(T)))
LOOPD = timing.get('loop', 0.7)
DUCK = set(timing.get('music_duck', []))

starts, t = [], LEAD
for i, s in enumerate(T):
    starts.append(t); t += s['duration'] + (GAPS[i] if i < len(GAPS) else 0.12)
starts.append(t)                      # scène « loop »
total = t + LOOPD

def decode(path):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vn', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True)
    return np.frombuffer(r.stdout, np.float32).reshape(-1, 2)

voice = decode(src)
L = max(int(total * SR) + SR, len(voice))
out = np.zeros((L, 2), np.float32); out[:len(voice)] += voice
rng = np.random.default_rng(11)

def put(buf, at, gain=1.0):
    i = int(at * SR)
    if i < 0 or i >= L: return
    j = min(L, i + len(buf)); out[i:j] += (buf[:j - i] * gain)[:, None]
def env(n, a=0.003, d=0.2):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na); e *= np.exp(-np.linspace(0, n / SR, n) / d); return e
def tone(freq, dur, d=0.25, harm=(1, 0.4, 0.2)):
    n = int(dur * SR); tt = np.arange(n) / SR
    return sum(h * np.sin(2 * np.pi * freq * (k + 1) * tt) for k, h in enumerate(harm)) * env(n, 0.003, d) / sum(harm)
def noise(dur, d=0.1):
    n = int(dur * SR); return rng.standard_normal(n) * np.exp(-np.linspace(0, n / SR, n) / d)
def whoosh(dur=0.3):
    n = int(dur * SR); x = rng.standard_normal(n); f = np.linspace(0, 1, n); fc = 300 + 3200 * np.sin(np.pi * f)
    y = np.zeros(n); lp = 0.0
    for k in range(n):
        a = min(0.98, 2 * np.pi * fc[k] / SR); lp += a * (x[k] - lp); y[k] = lp
    y *= np.sin(np.pi * f) ** 1.5; return y / (np.abs(y).max() + 1e-9)

def fx(kind, at, n=1, gain=None):
    if kind == 'thump': put(tone(180, 0.35, 0.2, (1, 0.6)), at, gain or 0.5)
    elif kind == 'boom': put(np.concatenate([tone(150, 0.4, 0.25, (1, 0.7, 0.4)), tone(98, 0.6, 0.4, (1, 0.8))]), at, gain or 0.7); put(noise(0.25, 0.08), at, 0.45)
    elif kind == 'ding': put(tone(1320, 0.4, 0.25), at, gain or 0.3)
    elif kind == 'chime': put(np.concatenate([tone(660, 0.1), tone(880, 0.1), tone(1047, 0.35, 0.25)]), at, gain or 0.3)
    elif kind == 'pop': put(tone(700, 0.08, 0.05), at, gain or 0.3)
    elif kind == 'click': put(noise(0.05, 0.02), at, gain or 0.5)
    elif kind == 'buzz': put(np.concatenate([tone(120, 0.22, 0.2, (1, 0.9, 0.6)), tone(100, 0.28, 0.25, (1, 0.9, 0.6))]), at, gain or 0.5)
    elif kind == 'riser': put(np.concatenate([tone(300 * 2 ** (k / 8), 0.12, 0.08) for k in range(12)]), at, gain or 0.25)
    elif kind == 'tick':
        for k in range(n): put(noise(0.03, 0.01), at + k * 0.045, gain or 0.10)

W = whoosh()
for i in range(1, len(T) + 1): put(W, starts[i] - 0.06, 0.30)               # un fouet à chaque changement de scène
for i, seg in enumerate(story['segments']):
    for e in seg.get('sfx', []):
        fx(e['type'], starts[i] + e['t'], e.get('n', 1), e.get('gain'))

# musique : une nappe douce, qui se coupe pendant les scènes de tension
def pad(chord, dur):
    n = int(dur * SR); tt = np.arange(n) / SR; y = np.zeros(n)
    for f in chord:
        for dt in (-0.7, 0, 0.7): y += np.sin(2 * np.pi * (f + dt) * tt + rng.uniform(0, 6.28))
    y *= 0.5 + 0.5 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.25 * tt)); return y / (np.abs(y).max() + 1e-9)
mus = np.zeros(L); chords = [(146.8, 220.0, 349.2), (130.8, 196.0, 329.6), (116.5, 174.6, 293.7), (146.8, 220.0, 369.99)]
cur, k = 0.0, 0
while cur < total:
    y = pad(chords[k % 4], 5.0) * 0.5; a = int(cur * SR); b = min(L, a + len(y)); mus[a:b] += y[:b - a]; cur += 4.0; k += 1
tt = np.arange(L) / SR
g = np.clip(tt / 0.6, 0, 1) * np.clip((total - tt) / 1.0, 0, 1)
for i in DUCK:
    g *= 1 - 0.8 * np.clip((tt - starts[i]) / 0.2, 0, 1) * (1 - np.clip((tt - starts[i + 1] + 0.1) / 0.3, 0, 1))
out += (mus * g * 0.07)[:, None]
peak = np.abs(out).max()
if peak > 0.98: out *= 0.98 / peak
wav = dst + '.mix.wav'
with wave.open(wav, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(out, -1, 1) * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-i', wav, '-filter_complex', '[1:a]loudnorm=I=-14.5:TP=-2.5:LRA=11,alimiter=limit=0.84:level=disabled[a]',
                '-map', '0:v', '-map', '[a]', '-vf', 'scale=in_range=pc:out_range=tv,format=yuv420p', '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.0', '-preset', 'medium', '-crf', '20', '-r', '30',
                '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', dst], check=True)
print('ok', dst, round(total, 1), 's')
