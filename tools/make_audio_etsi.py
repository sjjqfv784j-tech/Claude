#!/usr/bin/env python3
"""Bande sonore de « Et si une IA te montrait ta vie dans 10 ans ? » : voix + musique + effets, puis export 1080x1920 yuv420p.

usage : python3 tools/make_audio_etsi.py <video_rendu.mp4> <sortie.mp4>
Les instants viennent de public/voice/etsi/timings.json et des mêmes pauses que src/etsi/EtSiVideoV2.tsx (GAPS, LEAD).
"""
import json, subprocess, sys, wave
import numpy as np

src, dst = sys.argv[1], sys.argv[2]
SR = 48000
T = json.load(open('clawd-video/public/voice/etsi/timings.json'))['segments']
GAPS = [0.25, 0.25, 0.2, 0.25, 0.25, 0.25, 0.25, 0.25, 0.2, 0.25, 0.25, 0.25, 1.5, 0.3, 0.4, 0]
LEAD = 0.1
SCENES = ['bedNight', 'phoneAsk', 'phonePress', 'bedMorning', 'kitchen', 'street', 'officeA', 'officeAI', 'applause', 'homeDoor', 'homeKid', 'homeSmile', 'phoneEnd', 'bedEnd', 'cta', 'loop']

starts, t = [], LEAD
for i, s in enumerate(T):
    starts.append(t); t += s['duration'] + GAPS[i]
starts.append(t)              # la scène « loop »
total = t + 1.0
N = int(total * SR) + SR

def decode(path):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vn', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True)
    return np.frombuffer(r.stdout, np.float32).reshape(-1, 2)

voice = decode(src)
mix_len = max(N, len(voice))
out = np.zeros((mix_len, 2), np.float32)
out[:len(voice)] += voice

rng = np.random.default_rng(7)
def put(buf, at, gain=1.0):
    i = int(at * SR)
    if i < 0 or i >= mix_len: return
    j = min(mix_len, i + len(buf)); out[i:j] += (buf[:j - i] * gain)[:, None]

def env(n, a=0.005, d=0.2):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    e *= np.exp(-np.linspace(0, n / SR, n) / d); return e

def whoosh(dur=0.32):
    n = int(dur * SR); x = rng.standard_normal(n)
    # bruit filtré dont la fréquence monte puis redescend (un « fouet »)
    f = np.linspace(0, 1, n); fc = 300 + 3200 * np.sin(np.pi * f)
    y = np.zeros(n); lp = 0.0
    for k in range(n):
        a = min(0.98, 2 * np.pi * fc[k] / SR); lp += a * (x[k] - lp); y[k] = lp
    y *= np.sin(np.pi * f) ** 1.5
    return y / (np.abs(y).max() + 1e-9)

def tone(freq, dur, d=0.25, harm=(1, 0.4, 0.2)):
    n = int(dur * SR); tt = np.arange(n) / SR
    y = sum(h * np.sin(2 * np.pi * freq * (k + 1) * tt) for k, h in enumerate(harm))
    return y * env(n, 0.003, d) / sum(harm)

def click():
    n = int(0.05 * SR); return (rng.standard_normal(n) * np.exp(-np.linspace(0, 8, n)))

def clap():
    n = int(0.09 * SR); return (rng.standard_normal(n) * np.exp(-np.linspace(0, 9, n)))

W = whoosh()
for i in range(1, 16):
    put(W, starts[i] - 0.06, 0.30)                       # un fouet à chaque changement de scène
# interface du téléphone
put(tone(1320, 0.5, 0.3), starts[1] + 0.35, 0.35)       # la question apparaît
put(click(), starts[2] + 0.5, 0.6)                      # on appuie sur OUI
put(np.concatenate([tone(660 * 2 ** (k / 6), 0.12, 0.1) for k in range(6)]), starts[2] + 0.62, 0.22)  # le chargement
# applaudissements
for k in range(0, int(T[8]['duration'] * 14) + 8):
    put(clap(), starts[8] + 0.1 + k / 14 + rng.uniform(0, 0.03), 0.28 * np.exp(-k / 40))
put(tone(784, 0.5, 0.3), starts[8] + 0.05, 0.2)
# la porte
put(click() * 2, starts[9] + 0.05, 0.5); put(tone(110, 0.25, 0.12, (1, 0.3)), starts[9] + 0.05, 0.5)
# « bien joué ! »
put(np.concatenate([tone(523, 0.12), tone(659, 0.12), tone(784, 0.35, 0.3)]), starts[11] + 0.3, 0.3)
# la phrase qui s'écrit sur le téléphone : petits tics de clavier
for k in range(int((T[12]['duration'] - 0.8) / 0.07)):
    put(click(), starts[12] + 0.5 + k * 0.07, 0.10)
# le clic « abonné »
put(click(), starts[14] + 2.6, 0.6); put(np.concatenate([tone(784, 0.1), tone(1047, 0.4, 0.3)]), starts[14] + 2.65, 0.32)

# musique : une nappe douce qui se coupe avant « Alors, commence aujourd'hui » (le silence), puis revient
def pad(chord, dur):
    n = int(dur * SR); tt = np.arange(n) / SR; y = np.zeros(n)
    for f in chord:
        for dt in (-0.7, 0, 0.7):
            y += np.sin(2 * np.pi * (f + dt) * tt + rng.uniform(0, 6.28))
    y *= 0.5 + 0.5 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.2 * tt))
    return y / (np.abs(y).max() + 1e-9)

mus = np.zeros(mix_len)
chords = [(146.8, 220.0, 349.2), (130.8, 196.0, 329.6), (116.5, 174.6, 293.7), (146.8, 220.0, 369.99)]
t_silence0 = starts[12] + T[12]['duration'] + 0.1   # fin de « …maintenant »
t_back = starts[13]                                   # « Alors, commence aujourd'hui »
seg_len = 6.0
k = 0; cur = 0.0
while cur < total:
    d = min(seg_len, total - cur); y = pad(chords[k % 4], d + 1.0) * 0.5
    a = int(cur * SR); b = min(mix_len, a + len(y)); mus[a:b] += y[:b - a]
    cur += seg_len; k += 1
g = np.ones(mix_len)
tt = np.arange(mix_len) / SR
g *= np.clip(tt / 1.2, 0, 1)                                         # fondu d'entrée
g *= np.clip((total - tt) / 1.5, 0, 1)                               # fondu de sortie
g *= 1 - np.clip((tt - t_silence0) / 0.25, 0, 1) * (1 - np.clip((tt - t_back + 0.2) / 0.5, 0, 1))  # silence avant la fin
mus *= g * 0.07
out += mus[:, None]

peak = np.abs(out).max()
if peak > 0.98: out *= 0.98 / peak
wav = dst + '.mix.wav'
with wave.open(wav, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype('<i2').tobytes())

subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-i', wav,
                '-filter_complex', '[1:a]loudnorm=I=-14.5:TP=-2.5:LRA=11,alimiter=limit=0.84:level=disabled[a]',
                '-map', '0:v', '-map', '[a]',
                '-vf', 'scale=in_range=pc:out_range=tv,format=yuv420p', '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.0', '-preset', 'medium', '-crf', '20', '-r', '30',
                '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', dst], check=True)
print('ok', dst, 'durée', round(total, 1), 's')
