#!/usr/bin/env python3
"""Bande sonore d'une « histoire de fruits » : voix (déjà dans la vidéo) + musique dramatique + bruitages, tout synthétisé (aucun droit à payer).
Lit l'histoire (clawd-video/src/stories/fruit-<id>.json) et les minutages des voix pour placer les effets.
usage : python3 tools/make_audio_fruit.py <id> <video_rendue.mp4> <sortie.mp4>"""
import json, subprocess, sys, wave
import numpy as np

sid, src, dst = sys.argv[1], sys.argv[2], sys.argv[3]
SR = 48000
story = json.load(open(f'clawd-video/src/stories/fruit-{sid}.json'))
T = json.load(open(f'clawd-video/public/voice/fruit-{sid}/timings.json'))['segments']
tm = story.get('timing', {})
lead, gap, tail = tm.get('lead', 0.05), tm.get('gap', 0.15), tm.get('tail', 1.2)
starts, t = [], lead
for s in T:
    starts.append(t); t += s['duration'] + gap
total = starts[-1] + T[-1]['duration'] + tail
segs = story['segments']

def decode(path):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vn', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True)
    return np.frombuffer(r.stdout, np.float32).reshape(-1, 2)

voice = decode(src)
L = max(int(total * SR) + SR, len(voice))
out = np.zeros((L, 2), np.float32)
out[:len(voice)] += voice
rng = np.random.default_rng(7)

def put(buf, at, gain=1.0):
    i = int(at * SR)
    if i < 0 or i >= L: return
    j = min(L, i + len(buf)); out[i:j] += (buf[:j - i] * gain)[:, None]
def env(n, a=0.003, d=0.2):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na); return e * np.exp(-np.linspace(0, n / SR, n) / d)
def tone(f, dur, d=0.25, harm=(1, 0.4, 0.2)):
    n = int(dur * SR); tt = np.arange(n) / SR
    return sum(h * np.sin(2 * np.pi * f * (k + 1) * tt) for k, h in enumerate(harm)) * env(n, 0.003, d) / sum(harm)
def lowpass(x, fc):
    a = min(0.99, 2 * np.pi * fc / SR); y = np.zeros_like(x); lp = 0.0
    for k in range(len(x)): lp += a * (x[k] - lp); y[k] = lp
    return y
def whoosh(dur=0.35):
    n = int(dur * SR); x = rng.standard_normal(n); f = np.linspace(0, 1, n); fc = 300 + 3000 * np.sin(np.pi * f)
    y = np.zeros(n); lp = 0.0
    for k in range(n):
        a = min(0.98, 2 * np.pi * fc[k] / SR); lp += a * (x[k] - lp); y[k] = lp
    y *= np.sin(np.pi * f) ** 1.5; return y / (np.abs(y).max() + 1e-9)
def boom(dur=1.6):
    n = int(dur * SR); tt = np.arange(n) / SR
    y = np.sin(2 * np.pi * (55 * np.exp(-tt * 1.5) + 30) * tt) * np.exp(-tt / 0.6)
    y += lowpass(rng.standard_normal(n), 400) * np.exp(-tt / 0.25) * 2
    return y / (np.abs(y).max() + 1e-9)
def stab(chord, dur=1.4):  # accord de cordes « dun dun dun »
    n = int(dur * SR); tt = np.arange(n) / SR; y = np.zeros(n)
    for f in chord:
        for dt in (-1.2, 0, 1.2): y += np.sign(np.sin(2 * np.pi * (f + dt) * tt)) * 0.3 + np.sin(2 * np.pi * (f + dt) * tt)
    y = lowpass(y, 1800) * env(n, 0.01, 0.5); return y / (np.abs(y).max() + 1e-9)
def chime(f0=1320):
    return np.concatenate([tone(f0, 0.12, 0.1), tone(f0 * 1.26, 0.12, 0.1), tone(f0 * 1.5, 0.5, 0.3)])

W = whoosh()
for i, s in enumerate(segs):
    fx = set(s.get('fx', []))
    at = starts[i]
    if i > 0 and s['bg'] != segs[i - 1]['bg']: put(W, at - 0.12, 0.35)
    if 'hook' in fx: put(boom(), at, 0.55)
    if 'shake' in fx or 'flash' in fx:
        put(boom(), at - 0.02, 0.7); put(stab((146.8, 174.6, 220.0)), at, 0.35)
    if 'hearts' in fx:
        for k in range(4): put(tone(1568 + 200 * k, 0.25, 0.15), at + 0.2 + k * 0.5, 0.08)
    if 'zoom' in fx: put(W, at - 0.05, 0.3); put(chime(880), at + 0.1, 0.18)
    if 'sparkles' in fx: put(chime(1760), at + 0.1, 0.15)
    if 'question' in fx: put(np.concatenate([tone(659, 0.1), tone(880, 0.1), tone(1175, 0.45, 0.3)]), at + 0.4, 0.3)
    if 'rain' in fx:
        d = T[i]['duration'] + gap; n = int(d * SR); r = lowpass(rng.standard_normal(n), 2500) * 0.5
        r *= np.clip(np.arange(n) / (0.3 * SR), 0, 1) * np.clip((n - np.arange(n)) / (0.3 * SR), 0, 1); put(r, at, 0.25)
    if s.get('prop') == 'keys':
        for k in range(6): put(tone(3000 + rng.uniform(-400, 400), 0.08, 0.04, (1, 0.5)), at + 0.3 + k * 0.07, 0.12)

# musique : arpège en mineur (tension) qui se tait au moment du choc puis revient
moods = {'street': 'light', 'kitchen': 'tense', 'market': 'sad', 'sunset': 'light'}
CH = {'light': [(261.6, 329.6, 392.0), (220.0, 261.6, 329.6), (174.6, 220.0, 261.6), (196.0, 246.9, 293.7)],
      'tense': [(146.8, 174.6, 220.0), (138.6, 174.6, 207.7), (146.8, 174.6, 220.0), (130.8, 164.8, 196.0)],
      'sad': [(110.0, 130.8, 164.8), (87.3, 110.0, 130.8), (98.0, 123.5, 146.8), (82.4, 103.8, 123.5)]}
mus = np.zeros(L)
beat = 60 / 96
def mood_at(tt):
    k = max(i for i in range(len(starts)) if starts[i] <= tt + 1e-6) if tt >= starts[0] else 0
    return moods.get(segs[k]['bg'], 'tense')
cur, step = 0.0, 0
while cur < total:
    ch = CH[mood_at(cur)][(step // 8) % 4]
    f = ch[step % 3] * (2 if step % 8 >= 4 else 1)
    put_arr = tone(f, beat * 0.9, 0.25, (1, 0.3)) * 0.5
    i = int(cur * SR); j = min(L, i + len(put_arr)); mus[i:j] += put_arr[:j - i]
    if step % 4 == 0:  # basse
        b = tone(ch[0] / 2, beat * 3.5, 0.9, (1, 0.5, 0.2)) * 0.6
        j = min(L, i + len(b)); mus[i:j] += b[:j - i]
    cur += beat / 2; step += 1
tt = np.arange(L) / SR
g = np.clip(tt / 0.4, 0, 1) * np.clip((total - tt) / 1.0, 0, 1)
for i, s in enumerate(segs):  # silence dramatique sur le choc
    if 'shake' in s.get('fx', []):
        g *= 1 - 0.9 * np.clip((tt - starts[i] + 0.05) / 0.05, 0, 1) * (1 - np.clip((tt - starts[i] - 1.2) / 0.6, 0, 1))
out += (mus * g * 0.09)[:, None]

peak = np.abs(out).max()
if peak > 0.98: out *= 0.98 / peak
wav = dst + '.mix.wav'
with wave.open(wav, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(out, -1, 1) * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-i', wav, '-filter_complex', '[1:a]loudnorm=I=-14.5:TP=-1.5:LRA=11[a]',
                '-map', '0:v', '-map', '[a]', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
                '-movflags', '+faststart', '-t', f'{total:.2f}', dst], check=True)
subprocess.run(['rm', '-f', wav])
print('OK', dst, f'{total:.1f}s')
