#!/usr/bin/env python3
"""Bande sonore de « J'ai demandé à Claude de faire ma vidéo (partie 1/3) » : voix + musique + effets, export 1080x1920 yuv420p.
usage : python3 tools/make_audio_claude.py <video_rendu.mp4> <sortie.mp4>"""
import json, subprocess, sys, wave
import numpy as np
src, dst = sys.argv[1], sys.argv[2]
SR = 48000
T = json.load(open('clawd-video/public/voice/claude1/timings.json'))['segments']
GAPS = [0.12, 0.12, 0.12, 0.12, 0.1, 0.12, 0.12, 0.1, 0.12, 0.3, 0]
LEAD = 0.05
starts, t = [], LEAD
for i, s in enumerate(T):
    starts.append(t); t += s['duration'] + GAPS[i]
starts.append(t)                       # scène « loop »
total = t + 0.7
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
def noise(dur, d=0.1): n = int(dur * SR); return rng.standard_normal(n) * np.exp(-np.linspace(0, n / SR, n) / d)
def whoosh(dur=0.3):
    n = int(dur * SR); x = rng.standard_normal(n); f = np.linspace(0, 1, n); fc = 300 + 3200 * np.sin(np.pi * f)
    y = np.zeros(n); lp = 0.0
    for k in range(n):
        a = min(0.98, 2 * np.pi * fc[k] / SR); lp += a * (x[k] - lp); y[k] = lp
    y *= np.sin(np.pi * f) ** 1.5; return y / (np.abs(y).max() + 1e-9)
W = whoosh()
for i in range(1, 11): put(W, starts[i] - 0.06, 0.30)                                   # un fouet à chaque scène
put(tone(180, 0.35, 0.2, (1, 0.6)), starts[0] + 0.02, 0.5)                                # l'accroche : un coup sourd dès la première image
put(np.concatenate([tone(523, 0.1), tone(659, 0.1), tone(784, 0.3, 0.2)]), starts[0] + 1.6, 0.25)  # « vidéo prête »
put(tone(1320, 0.4, 0.25), starts[1] + 0.3, 0.3)                                          # le lien arrive
for k in range(11): put(noise(0.03, 0.01), starts[1] + 1.3 + k / 14, 0.12)                # « fais pareil » tapé
for k in range(22): put(noise(0.03, 0.01), starts[2] + 0.2 + k / 26, 0.10)                # la commande
put(tone(1047, 0.3, 0.2), starts[2] + 1.3, 0.25)
for k in range(8): put(tone(600 + 90 * k, 0.06, 0.04), starts[2] + 2.2 + k * 0.125, 0.14)   # les images qui apparaissent
for t0 in (0.3 + 0.9, 1.3 + 0.9): put(tone(1047, 0.35, 0.22), starts[3] + t0, 0.25)       # script, voix : terminé
for k in range(18): put(noise(0.02, 0.01), starts[3] + 2.4 + k * 0.05, 0.08)              # scènes en cours
put(np.concatenate([tone(392, 0.1), tone(523, 0.1), tone(659, 0.3, 0.2)]), starts[3] + 3.3, 0.25)
put(tone(220, 0.25, 0.15, (1, 0.5)), starts[4] + 0.08, 0.5)                               # « En code ? » : un sursaut
for k in range(24): put(noise(0.02, 0.01), starts[5] + 0.2 + k / 18, 0.09)                # le code qui se tape
put(np.concatenate([tone(660, 0.08), tone(880, 0.08), tone(1175, 0.3, 0.22)]), starts[5] + 1.85, 0.3)  # le point apparaît
put(tone(1047, 0.25, 0.15), starts[6] + 0.45, 0.2); put(tone(1047, 0.25, 0.15), starts[6] + 0.95, 0.2)
put(np.concatenate([tone(120, 0.22, 0.2, (1, 0.9, 0.6)), tone(100, 0.28, 0.25, (1, 0.9, 0.6))]), starts[6] + 1.45, 0.5)   # pieds : ✗
put(np.concatenate([tone(523, 0.1), tone(784, 0.1), tone(1047, 0.35, 0.25)]), starts[6] + 2.25, 0.3)                 # pieds : corrigé ✓
put(tone(147, 0.9, 0.6, (1, 0.6)), starts[7] + 0.05, 0.28)                                # « Et si ça ne me plaît pas ? »
for k in range(8): put(tone(500, 0.04, 0.03), starts[8] + 0.2 + k * 0.17, 0.12)           # je refais…
put(np.concatenate([tone(523, 0.1), tone(659, 0.1), tone(1047, 0.4, 0.28)]), starts[8] + 1.65, 0.3)
put(np.concatenate([tone(660, 0.1), tone(880, 0.1), tone(1047, 0.35, 0.25)]), starts[9] + 0.15, 0.3)   # la question
# musique douce qui se coupe sur la phase « menace » et revient pour la question
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
g *= 1 - 0.8 * np.clip((tt - starts[7]) / 0.2, 0, 1) * (1 - np.clip((tt - starts[8] + 0.1) / 0.3, 0, 1))
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
