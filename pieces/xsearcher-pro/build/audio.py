#!/usr/bin/env python3
"""Bande sonore de la pub X.GPT (25 s) : voix off + musique + effets calés sur l'image. Sortie : build/mix.wav (48 kHz stéréo)."""
import json, subprocess, sys, os
import numpy as np
from scipy import signal

SR = 48000; DUR = 25.0; N = int(SR * DUR)
D = os.path.dirname(os.path.abspath(__file__))
VSTART = [0.40, 2.75, 5.95, 8.35, 10.55, 13.15, 19.55]
rng = np.random.default_rng(2026)
voice_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, 'voice')

def sos(kind, f, order=2): return signal.butter(order, f, kind, fs=SR, output='sos')
def lp(x, f, o=2): return signal.sosfilt(sos('low', f, o), x)
def hp(x, f, o=2): return signal.sosfilt(sos('high', f, o), x)
def bp(x, f1, f2, o=2): return signal.sosfilt(sos('band', [f1, f2], o), x)
def t_(d): return np.arange(int(d * SR)) / SR
def env(n, a=0.003, d=0.2, shape=1.0):
    e = np.exp(-np.arange(n) / SR / d) ** shape; na = max(1, int(a * SR)); e[:na] *= np.linspace(0, 1, na); return e
def tone(f, d, dec=0.25, harm=(1, .4, .2), a=0.003):
    tt = t_(d); y = sum(h * np.sin(2 * np.pi * f * (k + 1) * tt) for k, h in enumerate(harm)); return y / sum(harm) * env(len(tt), a, dec)
def bell(f, d=1.4, dec=0.5):
    tt = t_(d); y = np.sin(2 * np.pi * f * tt) + .5 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt * 6) + .3 * np.sin(2 * np.pi * f * 5.4 * tt) * np.exp(-tt * 10)
    return y * env(len(tt), 0.002, dec) * .6
def add(*bs):
    L = max(len(b) for b in bs); o = np.zeros(L)
    for b in bs: o[:len(b)] += b
    return o
def noise(d): return rng.standard_normal(int(d * SR))
def sweep_noise(d, f0, f1, q=3.0):
    """bruit filtré dont la fréquence centrale glisse de f0 à f1 (whoosh)"""
    n = int(d * SR); x = rng.standard_normal(n); out = np.zeros(n); blk = 512
    for i in range(0, n, blk):
        k = i / n; fc = f0 * (f1 / f0) ** k; bw = fc / q
        s = signal.butter(2, [max(30, fc - bw), min(SR / 2 - 100, fc + bw)], 'band', fs=SR, output='sos')
        out[i:i + blk] = signal.sosfilt(s, x[i:i + blk])  # (léger clic aux jonctions masqué par l'enveloppe)
    return out
def whoosh(d, f0, f1, shape='sin', q=2.5, peak=0.5):
    y = sweep_noise(d, f0, f1, q); n = len(y); k = np.linspace(0, 1, n)
    e = np.sin(np.pi * k) ** 1.6 if shape == 'sin' else (k ** 3 if shape == 'in' else (1 - k) ** 2 * np.minimum(1, k * 40))
    y = y * e; return y / (np.abs(y).max() + 1e-9)
def boom(d=1.6, f0=95, f1=34, dec=0.7):
    tt = t_(d); f = f1 + (f0 - f1) * np.exp(-tt * 9); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) + .25 * np.sin(2 * ph)) * env(len(tt), 0.002, dec)
def crash(d=1.4, dec=0.45): return hp(noise(d), 1500) * env(int(d * SR), 0.001, dec)
def tick(f=2200, d=0.02): return (hp(noise(d), 1200) * env(int(d * SR), 0.0005, d / 3) + .5 * np.sin(2 * np.pi * f * t_(d)) * env(int(d * SR), 0.0005, d / 4))
def kick(): tt = t_(.28); f = 48 + 90 * np.exp(-tt * 38); return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.001, .11) + .25 * tick(1500, .006)[:len(tt)].mean() * 0
def snare():
    b = lp(noise(.25), 7000) * env(int(.25 * SR), .001, .07) * .8; t = tone(190, .15, .05, (1,)); b[:len(t)] += t * .5; return b
def hat(o=False): d = .22 if o else .06; return hp(noise(d), 7000, 3) * env(int(d * SR), .0005, .05 if o else .015)
def clap():
    y = np.zeros(int(.3 * SR))
    for dt in (0, .011, .023): i = int(dt * SR); n = noise(.2); y[i:i + len(n)] += bp(n, 900, 3500) * env(len(n), .0005, .06)
    return y
def reverb_ir(d=1.6, damp=0.7):
    n = int(d * SR); ir = rng.standard_normal((n, 2)) * np.exp(-np.arange(n)[:, None] / SR / (d / 4.2)); ir[:int(.012 * SR)] *= np.linspace(0, 1, int(.012 * SR))[:, None]
    ir[:, 0] = lp(ir[:, 0], 6500 * damp + 1500); ir[:, 1] = lp(ir[:, 1], 6500 * damp + 1500); return ir / np.sqrt((ir ** 2).sum(0).max()) * 2.2

dry = np.zeros((N, 2)); sfx_send = np.zeros((N, 2)); music = np.zeros((N, 2)); voice_bus = np.zeros((N, 2))
def put(buf, t0, gain=1.0, pan=0.0, send=0.0, bus=None, dst=None):
    bus = dry if dst is None else dst
    i = int(t0 * SR)
    if i >= N or i < -len(buf): return
    a = max(0, -i); i = max(0, i); j = min(N, i + len(buf) - a); seg = buf[a:a + (j - i)]
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    bus[i:j, 0] += seg * gain * l * 1.414; bus[i:j, 1] += seg * gain * r * 1.414
    if send: sfx_send[i:j, 0] += seg * send * l * 1.414; sfx_send[i:j, 1] += seg * send * r * 1.414

# ---------------------------------------------------------------- VOIX
def decode(p):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-af',
        'highpass=f=85,equalizer=f=200:t=q:w=1:g=1.5,equalizer=f=3200:t=q:w=1:g=3,equalizer=f=7500:t=q:w=1.5:g=1.5,acompressor=threshold=0.09:ratio=3.2:attack=4:release=90:makeup=3.5,alimiter=limit=0.9',
        '-f', 'f32le', '-'], capture_output=True)
    return np.frombuffer(r.stdout, np.float32).astype(np.float64)
T = json.load(open(os.path.join(voice_dir, 'timings.json')))
vmask = np.zeros(N)
for s, st in zip(T, VSTART):
    v = decode(os.path.join(voice_dir, s['id'] + '.mp3')); put(v, st, 1.05, 0.0, send=0.16, dst=voice_bus)
    i = int(st * SR); vmask[i:i + len(v)] = np.maximum(vmask[i:i + len(v)], np.abs(v))
vm = signal.sosfilt(sos('low', 14, 2), vmask); vm = np.clip(vm / (vm.max() + 1e-9) * 3.0, 0, 1)  # enveloppe voix lissée (pour le ducking)

# ---------------------------------------------------------------- MUSIQUE (La mineur, 120 bpm)
BEAT = .5
chords = [(55.0, [220, 261.63, 329.63]), (43.65, [174.61, 220, 261.63]), (65.41, [261.63, 329.63, 392.0]), (49.0, [196, 246.94, 293.66])]
def bar_chord(t): return chords[int(t / (4 * BEAT)) % 4]
# pad : saws désaccordées, filtre qui s'ouvre
def pad(f, d, cutoff):
    tt = t_(d); y = np.zeros(len(tt))
    for det in (-.12, 0, .12): y += signal.sawtooth(2 * np.pi * f * (1 + det * .01) * tt)
    return lp(y / 3, cutoff, 2)
tpos = 0.0
while tpos < DUR:
    b, ch = bar_chord(tpos); d = 4 * BEAT
    cut = np.interp(tpos, [0, 2.4, 13, 17.5, 19.4, 25], [500, 900, 1400, 2400, 3600, 2200])
    amp = np.interp(tpos, [0, 2.4, 3, 13, 19.4, 24, 25], [.0, .0, .16, .2, .3, .26, .0])
    if tpos < 2.4: amp = np.interp(tpos, [0, 2.0], [.02, .12])
    for f in ch:
        y = pad(f, d + .5, cut) * env(int((d + .5) * SR), .6, 1e9) * np.minimum(1, np.linspace(1, 0, int((d + .5) * SR)) * 6)
        put(y, tpos, amp * .55, dst=music, send=0.0)
    tpos += d
# basse : croches
tpos = 2.5
while tpos < 24.0:
    b, ch = bar_chord(tpos); pat = [0, .75, 1.5, 2.25, 3.0]
    amp = np.interp(tpos, [2.5, 5.5, 19.4], [.45, .62, .8])
    for pb in pat:
        tt = tpos + pb * BEAT
        if tt < 24.2: put(tone(b, .32, .16, (1, .5, .25)) * 1.0, tt, amp * .75, dst=music)
    tpos += 4 * BEAT
put(tone(55, 2.4, 1.5, (1, .3)), 0.0, .35, dst=music)  # drone d'intro
# batterie
KICK, HAT, HATO, CLAP, SN = kick(), hat(), hat(True), clap(), snare()
def groove(t0, t1, kv=.7, hats=True, clapv=0., kick_beats=(0, 1, 2, 3)):
    t = t0
    while t < t1 - 1e-6:
        bar = (t - 0) / (4 * BEAT)
        for bt in range(4):
            tt = t + bt * BEAT
            if tt >= t1: break
            if bt in kick_beats: put(KICK, tt, kv, dst=music)
            if hats:
                put(HAT, tt + BEAT * .5, .13, pan=.3, dst=music); put(HATO, tt + BEAT * .5 if bt % 2 else tt + BEAT * .75, .0, dst=music)
                put(HAT, tt + BEAT * .25, .06, pan=-.3, dst=music); put(HAT, tt + BEAT * .75, .06, pan=.4, dst=music)
            if clapv and bt in (1, 3): put(CLAP, tt, clapv, dst=music)
        t += 4 * BEAT
groove(2.5, 5.5, .55, False, 0, (0, 2))
groove(5.5, 10.5, .7, True, 0)
groove(10.5, 13.0, .74, True, .32)
groove(13.0, 17.5, .74, True, .34)
for k, tt in enumerate(np.linspace(17.5, 18.1, 10)): put(SN, tt, .22 + .35 * k / 9, dst=music)   # roulement de caisse claire avant le drop
groove(18.5, 19.5, .78, True, .34)
groove(19.5, 23.5, .86, True, .4)
put(KICK, 23.5, .9, dst=music)

# ---------------------------------------------------------------- EFFETS SONORES (calés sur l'image)
S = lambda *a, **k: put(*a, **k)
# intro : ligne qui se dessine, étincelle, mots qui claquent
S(sweep_noise(.5, 500, 5000, 3) * env(int(.5 * SR), .02, .25) * .4, 0.04, .3, pan=0, send=.3)
for tt, g in [(0.49, .55), (0.62, .6), (0.87, .55), (1.22, .85)]:
    S(boom(.35, 130, 55, .14), tt - .02, g, send=.1); S(tick(1800, .02), tt - .01, .3)
crackle = np.zeros(int(.5 * SR))
for k in range(26): i = int(rng.random() * .4 * SR); n = tick(rng.uniform(2500, 6000), .012); crackle[i:i + len(n)] += n * rng.uniform(.3, 1)
S(crackle, 0.62, .35, pan=.2, send=.3)
# montée → implosion → impact
S(whoosh(1.4, 250, 7000, 'in', 2.0), 1.0, .6, send=.3)
S(sweep_noise(1.4, 200, 1500, 4) * np.linspace(0, 1, int(1.4 * SR)) ** 2 * .3, 1.0, .3)
S(tone(220, 1.4, 5, (1, .5)) * np.linspace(0, 1, int(1.4 * SR)) ** 3 * 0, 1.0, .1)
S(boom(2.2, 100, 30, 1.0), 2.38, 1.0, send=.15); S(crash(1.6, .5), 2.4, .5, send=.4); S(bell(880, 1.8, .7), 2.42, .22, send=.6)
S(whoosh(.9, 3500, 250, 'out', 2.0), 2.45, .45, send=.3)
S(bell(1760, 1.5, .6), 2.62, .12, pan=.4, send=.7); S(bell(2637, 1.2, .5), 2.74, .09, pan=-.4, send=.7)
# logo → site
S(whoosh(.6, 400, 4500, 'sin', 2.5), 3.18, .5, pan=-.2, send=.3); S(boom(.6, 110, 50, .22), 3.42, .5)
S(whoosh(.5, 600, 6000, 'sin', 3), 3.5, .3, pan=.3, send=.3)
S(sweep_noise(.3, 2000, 7000, 4) * env(int(.3 * SR), .01, .15) * .4, 4.6, .3, pan=.1)    # soulignement
S(bell(1568, 1.0, .4), 4.62, .1)
S(whoosh(.7, 300, 2800, 'sin', 2), 4.78, .16, pan=.3)                                       # glisse du curseur
S(tick(2600, .014), 5.52, .55, send=.15); S(tick(1700, .012), 5.62, .3, send=.1)           # clic
S(whoosh(.28, 200, 5000, 'in', 2.0), 5.54, .75, send=.2)
S(boom(.8, 120, 45, .3), 5.80, .8, send=.1); S(crash(.7, .25), 5.8, .3, send=.3); S(bell(1319, 1.2, .5), 5.84, .15, send=.6)
# chat
S(add(tone(480, .12, .06, (1, .3)), tone(960, .1, .05, (1,)) * .4), 6.02, .35, pan=.2, send=.25)
S(whoosh(.45, 300, 3000, 'sin', 2.2), 5.9, .3, pan=.2, send=.3)
for k in range(26): S(tick(rng.uniform(1800, 3500), .016), 6.62 + k * 0.034 + rng.uniform(0, .01), rng.uniform(.18, .32), pan=rng.uniform(-.3, .3))
for i in range(7): S(tone(520 + 95 * i, .11, .05, (1, .3)) * .9, 7.04 + .12 * i, .3, pan=(-1) ** i * .4, send=.3)
S(bell(1175, 1.2, .5), 7.1, .22, send=.5); S(whoosh(.5, 500, 5500, 'sin', 3), 7.0, .25, pan=.4)
# whip pan → code
S(whoosh(.42, 150, 7500, 'sin', 1.6), 8.0, .85, pan=.3, send=.25); S(boom(.4, 100, 50, .12), 8.28, .5)
for k in range(22): S(add(tick(rng.uniform(700, 1500), .03), boom(.05, 220, 150, .02) * .3), 8.5 + k * .0395 + rng.uniform(0, .01), rng.uniform(.25, .5), pan=rng.uniform(-.4, .4))
S(tone(110, .32, .3, (1, .8, .6)) * (1 + .6 * np.sin(2 * np.pi * 22 * t_(.32))) * .5, 9.05, .45)   # bug
S(bell(1568, 1.2, .5), 9.36, .22, send=.5); S(bell(2093, 1.0, .4), 9.44, .14, pan=.3, send=.5); S(boom(.4, 90, 50, .15), 9.37, .5)
S(whoosh(.5, 800, 9000, 'sin', 3), 9.38, .3, pan=-.2, send=.3)
glit = np.zeros(int(1.0 * SR))
for k in range(36): i = int(rng.random() * .6 * SR); n = bell(rng.uniform(2800, 5200), .25, .08); glit[i:i + len(n)] += n * rng.uniform(.2, .6)
S(glit, 9.42, .3, pan=.0, send=.5)
S(tone(600, .08, .04, (1,)) * 1.0, 9.5, .3)
# volets → images
S(whoosh(.3, 200, 6000, 'sin', 2), 10.2, .55, pan=-.4, send=.2); S(boom(.6, 110, 40, .25), 10.44, .85, send=.1); S(crash(.5, .18), 10.45, .3)
S(whoosh(.3, 5500, 250, 'out', 2), 10.48, .5, pan=.4, send=.2)
S(whoosh(.5, 400, 3500, 'sin', 2.5), 10.55, .25); S(tone(700, .08, .05, (1, .3)), 10.95, .25, send=.3)
for k in range(17): S(tick(rng.uniform(1500, 3200), .018), 10.86 + k * .0392, rng.uniform(.22, .36), pan=rng.uniform(-.3, .3))
S(tick(2800, .014), 11.5, .5, send=.1); S(tick(1700, .012), 11.6, .3)
for i, tt in enumerate([11.6, 11.72, 11.84]):
    S(whoosh(.5, 400, 5000, 'sin', 2.2), tt, .5, pan=(-.5, 0, .5)[i], send=.3); S(boom(.4, 100, 50, .12), tt + .22, .35)
for i, tt in enumerate([11.8, 11.92, 12.04]): S(sweep_noise(.65, 900, 9000, 4) * env(int(.65 * SR), .05, .3) * .35, tt, .45, pan=(-.4, 0, .4)[i], send=.3)
S(sweep_noise(.5, 2000, 12000, 5) * np.linspace(0, 1, int(.5 * SR)) * .3, 12.0, .3)
for i, (f, tt) in enumerate([(1760, 12.42), (2093, 12.54), (2637, 12.66)]): S(bell(f, 1.4, .6), tt, .22, pan=(-.4, 0, .4)[i], send=.6); S(tone(900 + 200 * i, .07, .03, (1, .3)), tt + .01, .25)
S(glit, 12.38, .3, send=.5)
# glitch → modèles
gl = np.zeros(int(.4 * SR))
for k in range(18):
    i = int(rng.random() * .3 * SR); n = rng.standard_normal(int(rng.uniform(.01, .04) * SR)); n = np.repeat(n[::8], 8)[:len(n)]; gl[i:i + len(n)] += n * rng.uniform(.3, 1)
S(gl, 12.93, .4, pan=.0, send=.2); S(boom(.7, 80, 30, .35), 13.05, .8); S(whoosh(.3, 200, 7000, 'sin', 2), 12.98, .5)
NOTES = [440, 523.25, 659.25, 783.99, 880, 1046.5, 1318.5]
for f, tt in zip(NOTES, [13.2, 13.97, 15.11, 15.97, 16.45, 16.6, 16.75]):
    S(bell(f, 1.6, .6), tt, .26, send=.55); S(boom(.3, 120, 55, .1), tt - .02, .55, send=.1); S(tone(f / 2, .35, .15, (1, .5, .3)), tt, .18)
    S(whoosh(.35, 300, 5000, 'sin', 2.4), tt - .12, .28, pan=np.sin(tt * 3) * .6, send=.3)
S(whoosh(.7, 400, 9000, 'sin', 2), 16.88, .5, send=.3); S(bell(1760, 1.4, .5), 16.98, .15, send=.6); S(boom(.4, 100, 50, .15), 16.97, .5)
S(whoosh(1.0, 300, 9000, 'in', 1.8), 17.2, .65, send=.35)
S(sweep_noise(1.0, 1500, 12000, 6) * np.linspace(0, 1, int(1.0 * SR)) ** 2 * .3, 17.15, .4)
S(boom(2.6, 105, 28, 1.3), 18.1, 1.0, send=.15); S(crash(2.0, .7), 18.12, .65, send=.4); S(bell(1175, 2.2, 1.0), 18.15, .28, send=.7)
S(whoosh(1.0, 6000, 200, 'out', 2.0), 18.14, .6, send=.4)
S(tick(2000, .02), 18.25, .4); S(tone(880, .1, .05, (1, .4)), 18.24, .22, send=.3)
# final
S(whoosh(.32, 200, 9000, 'in', 1.6), 19.14, .85, send=.3)
S(boom(3.0, 110, 26, 1.5), 19.45, 1.0, send=.15); S(crash(2.4, .9), 19.46, .75, send=.5)
S(whoosh(1.1, 5000, 200, 'out', 2.0), 19.5, .6, send=.4)
for i in range(3): S(bell([880, 1318.5, 1760][i], 2.0, .8), 19.5 + .1 * i, .18, pan=(-.4, 0, .4)[i], send=.7)
S(tone(55, 2.0, 1.2, (1, .3)), 19.46, .5)
S(tone(660, .09, .04, (1, .3)), 20.5, .3, send=.4); S(bell(1568, 1.2, .5), 20.5, .14, send=.6)
for tt in (20.62, 21.0): S(whoosh(.45, 300, 4500, 'sin', 2.4), tt - .05, .4, pan=.2 if tt < 21 else -.2, send=.3); S(boom(.35, 100, 50, .1), tt + .12, .45)
S(tone(660, .09, .04, (1, .3)), 22.2, .35, send=.4)
for k in range(12): S(add(tone(820 + (k % 4) * 70, .035, .02, (1, .3)), tick(2500, .012) * .4), 22.35 + k * .0917, .3, pan=rng.uniform(-.2, .2))
S(tone(500, .09, .04, (1, .3)), 22.9, .3, send=.3); S(whoosh(.4, 300, 4000, 'sin', 2.4), 22.82, .25, send=.3)
S(tick(2600, .014), 23.42, .6, send=.15); S(tick(1700, .012), 23.52, .3)
S(boom(2.0, 100, 32, 1.0), 23.44, .8, send=.2); S(crash(1.6, .5), 23.45, .45, send=.5)
for i, f in enumerate([440, 523.25, 659.25, 987.77]): S(bell(f, 2.2, 1.0), 23.46 + .02 * i, .2, pan=(-.4, -.1, .1, .4)[i], send=.8)
pad_end = sum(pad(f, 1.8, 2400) for f in (220, 261.63, 329.63, 493.88)) * env(int(1.8 * SR), .05, .7) * .12
put(pad_end, 23.45, 1.0, dst=music)

# ---------------------------------------------------------------- MIX
ir = reverb_ir(1.5)
wet = np.stack([signal.fftconvolve(sfx_send[:, c], ir[:, c])[:N] for c in range(2)], 1)
duck = 1 - .72 * vm                       # musique et effets baissent sous la voix
music_g = np.interp(t_(DUR)[:N] if False else np.arange(N) / SR, [0, 2.4, 3, 13, 19.4, 24, 25], [.9, .95, .85, .85, 1.0, .95, .7])
mix = voice_bus * 1.25 + (music * .22 * music_g[:, None]) * np.clip(duck, .28, 1)[:, None] + dry * .42 * np.clip(1 - .6 * vm, .38, 1)[:, None] + wet * .34 * np.clip(1 - .5 * vm, .5, 1)[:, None]
mix = mix * np.minimum(1, (DUR - np.arange(N) / SR) / .55)[:, None]
mix = np.tanh(mix * .9) / np.tanh(.9)                    # limiteur doux
peak = np.abs(mix).max(); mix = mix / peak * .93
out = (mix * 32767).astype('<i2')
import wave
with wave.open(os.path.join(D, 'mix_raw.wav'), 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', os.path.join(D, 'mix_raw.wav'), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=9,alimiter=limit=0.89', '-ar', '48000', os.path.join(D, 'mix.wav')], check=True)
print('ok', peak)
# --- contrôle d'équilibre
def rms(x): return 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
vm_on = vm > .25
voice_part = voice_bus * 1.25
other = (music * .22 * music_g[:, None]) * np.clip(duck, .28, 1)[:, None] + dry * .42 * np.clip(1 - .6 * vm, .38, 1)[:, None] + wet * .34 * np.clip(1 - .5 * vm, .5, 1)[:, None]
print('pendant la voix : voix %.1f dB, reste %.1f dB (écart %.1f)' % (rms(voice_part[vm_on]), rms(other[vm_on]), rms(voice_part[vm_on]) - rms(other[vm_on])))
for a, b in [(0, 2.4), (2.4, 5.9), (5.9, 13), (13, 19.4), (19.4, 25)]:
    i, j = int(a * SR), int(b * SR); print(a, b, 'voix %.1f reste %.1f' % (rms(voice_part[i:j]), rms(other[i:j])))
