#!/usr/bin/env python3
"""Bande son X.GPT promo : voix off + musique synthétique 120 BPM + effets synchronisés sur chaque animation/clic."""
import json, subprocess, wave
import numpy as np
SR = 48000; DUR = 60.0; N = int(DUR * SR)
rng = np.random.default_rng(5)
L = np.zeros(N, np.float32); R = np.zeros(N, np.float32)          # bus SFX
ML = np.zeros(N, np.float32); MR = np.zeros(N, np.float32)        # bus musique
VO = np.zeros(N, np.float32)                                       # voix
def tt(d): return np.arange(int(d * SR)) / SR
def put(bus, sig, t, g=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N or i + len(sig) <= 0: return
    a = max(0, -i); j = min(N, i + len(sig)); seg = sig[a:a + (j - max(i, 0))]
    gl = g * np.cos((pan + 1) * np.pi / 4); gr = g * np.sin((pan + 1) * np.pi / 4)
    bus[0][max(i, 0):j] += (seg * gl).astype(np.float32); bus[1][max(i, 0):j] += (seg * gr).astype(np.float32)
SFX = (L, R); MUS = (ML, MR)
def env(n, a=.002, d=.2):
    e = np.exp(-np.arange(n) / SR / d); k = max(1, int(a * SR)); e[:k] *= np.linspace(0, 1, k); return e
def noise(d): return rng.standard_normal(int(d * SR))
def hp(x, a=.95):  # one-pole high-pass
    y = np.empty_like(x); p = 0.0; q = 0.0
    for i in range(len(x)):
        p = a * (p + x[i] - q); q = x[i]; y[i] = p
    return y
def lp_sweep(x, f0, f1):  # time-varying one-pole lowpass (cutoff sweep)
    n = len(x); fc = np.geomspace(f0, f1, n); a = 1 - np.exp(-2 * np.pi * fc / SR); y = np.empty(n); s = 0.0
    for i in range(n): s += a[i] * (x[i] - s); y[i] = s
    return y
def bp_sweep(x, f0, f1, q=.15):
    lo = lp_sweep(x, f0 * 1.6, f1 * 1.6); lo2 = lp_sweep(x, f0 * .6, f1 * .6); return (lo - lo2)
def sine(f, d, ph=0): return np.sin(2 * np.pi * f * tt(d) + ph)
def saw(f, d, cut=3000):
    t = tt(d); K = max(1, min(40, int(cut / f))); return sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, K + 1)) * 0.6
def norm(x): return x / (np.abs(x).max() + 1e-9)

# ---------- effets ----------
def whoosh(d=.9, up=True, f0=250, f1=7000):
    n = int(d * SR); x = noise(d); y = bp_sweep(x, f0, f1) if up else bp_sweep(x, f1, f0)
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.6; return norm(y) * e
def boom(d=2.6):
    t = tt(d); f = 38 + 110 * np.exp(-t * 14); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 1.9) + .5 * np.sin(ph * .5) * np.exp(-t * 2.2)
    n = lp_sweep(noise(d), 9000, 200) * np.exp(-t * 3.2) * .55
    return norm(s + n * .8)
def hit(d=.5): # impact court
    t = tt(d); f = 60 + 160 * np.exp(-t * 30); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    return norm(s + lp_sweep(noise(d), 8000, 600) * np.exp(-t * 14) * .6)
def click(d=.09):
    t = tt(d); s = hp(noise(d), .85) * np.exp(-t * 120) * .8 + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 90) * .5
    s2 = np.sin(2 * np.pi * 140 * t) * np.exp(-t * 55) * .6; return norm(s + s2)
def tick(f=2600, d=.03): t = tt(d); return norm(np.sin(2 * np.pi * f * t) * np.exp(-t * 160) + hp(noise(d), .9) * np.exp(-t * 200) * .6)
def pop(f=520, d=.22):
    t = tt(d); ff = f * (1 + 1.4 * np.exp(-t * 28)); s = np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-t * 16); return norm(s + hp(noise(d), .9) * np.exp(-t * 80) * .25)
def chime(f=1318, d=.9):
    t = tt(d); return norm(sum(np.sin(2 * np.pi * f * m * t) * np.exp(-t * (4 + 3 * m)) * a for m, a in [(1, 1), (2.01, .5), (3.02, .25), (4.2, .12)]))
def sparkle(d=1.2):
    out = np.zeros(int(d * SR))
    for k in range(14):
        t0 = k * d / 16; c = chime(1800 + 700 * (k % 5), .35) * (1 - k / 18); out[int(t0 * SR):int(t0 * SR) + len(c)] += c[:len(out) - int(t0 * SR)]
    return norm(out)
def riser(d=1.6, f0=200, f1=9000):
    x = noise(d); y = norm(bp_sweep(x, f0, f1)); n = len(y); e = np.linspace(0, 1, n) ** 2.2
    t = tt(d); tone = np.sin(2 * np.pi * np.cumsum(np.geomspace(f0 * .5, f1 * .12, n)) / SR) * .35
    return norm(y + tone) * e
def glitch(d=.5):
    n = int(d * SR); out = np.zeros(n); r = np.random.default_rng(3)
    for k in range(16):
        s = int(r.random() * n * .9); l = int(SR * (.01 + r.random() * .04)); f = 200 + r.random() * 3000
        out[s:s + l] += (np.sign(np.sin(2 * np.pi * f * np.arange(min(l, n - s)) / SR)) * .5 + hp(r.standard_normal(min(l, n - s)), .8) * .5) * np.exp(-np.arange(min(l, n - s)) / l * 3)
    return norm(out)
def blip(f=900, d=.07): t = tt(d); return norm(np.sin(2 * np.pi * f * t) * np.exp(-t * 45))
def swish(d=.28, up=True): return whoosh(d, up, 900, 6500) * .8

# ---------- placement des effets ----------
S = lambda sig, t, g=1.0, p=0.0: put(SFX, sig, t, g, p)
# Intro
S(riser(2.0, 120, 7000), 1.86, .5); S(sine(48, 1.0) * env(int(SR), .3, .6), 2.9, .5)
S(boom(), 3.86, 1.0); S(hit(), 3.86, .6); S(whoosh(1.2, False), 3.9, .35)
for t in [.55, 1.78]: S(swish(), t - .05, .35)
S(whoosh(.8, True, 400, 5000), 2.9, .5); S(pop(300, .3), 3.35, .6); S(pop(380, .3), 3.59, .4)
# Transitions (centre = frontière)
TB = [6, 12, 20, 30, 40, 46, 54]
S(whoosh(.9, True), 5.6, .8, -.4); S(hit(), 6.0, .7); S(riser(.8), 5.3, .35)                 # lamelles
S(whoosh(1.0, True, 200, 9000), 11.55, .9); S(boom(1.4), 12.0, .55); S(riser(1.0, 300, 8000), 11.1, .35)   # zoom
S(whoosh(.9, False), 19.6, .8, .4); S(hit(), 20.0, .7)                                      # stores horizontaux
S(glitch(.55), 29.7, .8); S(hit(), 30.0, .55); S(whoosh(.5, True), 29.7, .45)               # glitch
S(whoosh(.9, True, 150, 5000), 39.6, .8); S(boom(1.5), 40.0, .65)                           # iris
S(whoosh(.8, True, 500, 9000), 45.6, 1.0, -.7); S(whoosh(.8, False, 500, 9000), 45.9, .8, .7); S(hit(.4), 46.0, .6)  # whip pan
S(riser(1.2, 200, 9000), 53.0, .7); S(boom(1.8), 54.0, .8); S(whoosh(.9, False), 54.0, .5)  # flash
# S2 : chips + clic
for t in [8.68, 9.58, 10.4]: S(pop(600 + (t - 8.68) * 120), t, .8); S(swish(.2), t - .05, .3)
S(whoosh(.6, True), 6.5, .35); S(swish(.4), 7.7, .4)
for t in [11.35]: S(click(), t, 1.0); S(chime(1568, .7), t + .03, .35)
# S3 : saisie, envoi, réponse
S(click(), 12.9, .9)
for i in range(32): S(tick(2200 + (i % 4) * 160), 12.95 + i * (14.2 - 12.95) / 32, .45 + .1 * (i % 3))
S(click(), 14.45, 1.0); S(chime(1318, .8), 14.5, .4); S(pop(700, .2), 14.5, .5)
for i in range(38): S(tick(3000 + (i % 5) * 130, .02), 15.2 + i * .0211, .22)
S(whoosh(.5, True, 400, 4000), 15.7, .5, -.6); S(pop(480, .25), 15.78, .7)
for i in range(70): S(tick(2400 + (i % 6) * 110, .02), 16.0 + i * (2.3 / 70), .16)
for i in range(30): S(tick(3000 + (i % 5) * 130, .02), 18.35 + i * .028, .2)
S(swish(.3), 14.4, .35); S(swish(.3), 15.6, .35)
# S4 : modèles
S(swish(.4), 20.45, .5); S(swish(.3), 21.45, .4)
for t in [22.71, 23.5, 24.6, 25.46, 26.36, 27.26, 27.55, 27.7, 27.85]:
    S(pop(480 + 40 * ((t * 7) % 5), .25), t, .75, ((t * 3) % 2) - 1); S(blip(1400 + 60 * (t % 7), .08), t + .02, .35)
S(riser(1.3, 300, 6000), 27.0, .35)
S(click(), 28.3, 1.0); S(chime(1760, .9), 28.35, .5); S(pop(900, .2), 28.4, .5)
# S5 : code
S(swish(.3), 30.4, .5); S(whoosh(.7, True), 30.3, .35, -.5)
for i in range(26): S(tick(1800 + (i % 7) * 140, .025), 30.8 + i * (2.2 / 26), .3)
S(swish(.4), 33.2, .5); S(whoosh(.5, True), 33.0, .35, .5)
for i in range(18): S(blip(700 + (i % 6) * 90, .05), 33.35 + i * .05, .3)
for t in [35.0, 35.55, 36.45]: S(pop(820, .18), t, .45); S(blip(1500, .06), t + .02, .35)
S(chime(1318, .9), 36.9, .7); S(chime(1760, .9), 36.98, .45); S(pop(500, .25), 36.9, .7)
# S6 : image
S(swish(.4), 40.5, .5); S(whoosh(.6, True), 40.35, .35)
for i in range(38): S(tick(2300 + (i % 4) * 150), 40.7 + i * (1.7 / 38), .38)
S(click(), 42.95, 1.0); S(riser(1.0, 300, 8000), 42.1, .55); S(sparkle(1.6), 43.0, .6); S(whoosh(1.6, True, 200, 5000), 43.0, .35)
S(chime(1568, 1.2), 44.85, .5); S(pop(520, .25), 44.7, .6, -.6); S(pop(620, .25), 44.88, .6, .6); S(swish(.3), 44.65, .4, -.6); S(swish(.3), 44.85, .4, .6)
# S7 : prix
S(chime(1568, .9), 46.9, .6); S(boom(1.0), 46.9, .35); S(pop(380, .3), 46.9, .8); S(whoosh(.4, False), 47.95, .4)
for t, f in [(48.35, 620), (48.95, 760), (49.3, 920)]: S(pop(f, .25), t, .85); S(chime(f * 2, .6), t + .02, .3); S(swish(.25), t - .06, .35)
S(click(), 49.12, 1.0)
S(riser(1.0, 300, 7000), 50.6, .3); S(swish(.5, False), 51.6, .4)
# S8 : final
S(boom(2.2), 54.9, 1.0); S(hit(), 54.9, .6); S(pop(260, .35), 54.45, .6); S(pop(320, .3), 54.7, .5)
S(whoosh(1.0, False), 54.95, .4); S(swish(.3), 55.3, .5); S(swish(.3), 56.2, .5)
S(chime(1318, 1.2), 56.65, .35)
S(pop(560, .3), 57.45, .8); S(pop(660, .3), 57.9, .8); S(riser(1.0, 300, 8000), 57.95, .35)
S(click(), 58.95, 1.0); S(boom(1.6), 59.0, .6); S(sparkle(1.0), 59.0, .5); S(chime(1976, 1.1), 59.02, .5)

# ---------- musique 120 BPM ----------
BPM = 120; BEAT = 60 / BPM
def active(t, spans): return any(a <= t < b for a, b in spans)
KICK = [(6, 40), (46, 54.9), (54.9, 59.0)]; KICKINTRO = [(4.0, 6)]
HAT = [(8, 40), (46, 54.9)]; H16 = [(20, 40), (47, 54.9)]; CLAP = [(12, 40), (46, 54.9)]
BASS = [(6, 40), (46, 59.0)]; ARP = [(12, 59.0)]
PADV = np.interp(np.arange(N) / SR, [0, 3.8, 3.9, 6, 12, 40, 44, 46, 54.8, 54.9, 59, 60], [.35, .8, .15, .5, .6, .7, .5, .7, .7, .9, .8, 0])
CH = [[220, 261.63, 329.63], [174.61, 220, 261.63], [261.63, 329.63, 392], [196, 246.94, 293.66]]
ROOT = [55, 43.65, 65.41, 49]
# kick pour pompage
kick_times = []
for k in range(int(DUR / BEAT)):
    t = k * BEAT
    if active(t, KICK) or active(t, KICKINTRO): kick_times.append(t)
kk = hit(.5)
def kick(d=.45):
    t = tt(d); f = 42 + 150 * np.exp(-t * 32); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * 1.1 + hp(noise(d), .9) * np.exp(-t * 300) * .25
KI = kick()
for t in kick_times: put(MUS, KI, t, .95 if t >= 46 else .8)
duck = np.ones(N)
for t in kick_times:
    i = int(t * SR); n = int(.28 * SR); seg = 1 - .65 * np.exp(-np.arange(min(n, N - i)) / (.09 * SR)); duck[i:i + len(seg)] = np.minimum(duck[i:i + len(seg)], seg)
# pad
padL = np.zeros(N); padR = np.zeros(N)
for b in range(int(DUR / 2)):
    ch = CH[b % 4]; t0 = b * 2.0; d = 2.4
    for j, f in enumerate(ch):
        for dt, pn in [(-.0035, -.5), (.0035, .5)]:
            s = saw(f * (1 + dt), d, 1400) * np.sin(np.pi * np.linspace(0, 1, int(d * SR))) ** .6 * .11
            i = int(t0 * SR); e = min(N, i + len(s))
            (padL if pn < 0 else padR)[i:e] += s[:e - i]
    s = sine(ROOT[b % 4] / 2 * 2, 2.2) * np.sin(np.pi * np.linspace(0, 1, int(2.2 * SR))) ** .5 * .22
    i = int(t0 * SR); e = min(N, i + len(s)); padL[i:e] += s[:e - i]; padR[i:e] += s[:e - i]
ML += (padL * PADV * duck).astype(np.float32); MR += (padR * PADV * duck).astype(np.float32)
# intro drone + build
dr = (sine(55, 3.86) * np.linspace(.1, 1, int(3.86 * SR)) ** 2 * .35 + lp_sweep(noise(3.86), 200, 5000) * np.linspace(0, 1, int(3.86 * SR)) ** 3 * .25)
put(MUS, dr, 0, .6)
# basse
for b in range(int(DUR / 2)):
    for k in range(4):
        for h in range(2):
            t = b * 2.0 + k * BEAT + h * BEAT / 2
            if not active(t, BASS): continue
            f = ROOT[b % 4] * (2 if h == 1 and k % 2 else 1)
            d = .22; s = (saw(f, d, 700) * .5 + sine(f, d) * .6) * env(int(d * SR), .004, .11)
            s *= duck[min(N - 1, int(t * SR))] ** 0.5; put(MUS, s, t, .5)
# hats, claps
HH = hp(noise(.08), .9) * env(int(.08 * SR), .001, .02); H2 = HH * .6
CLP = (hp(noise(.2), .8) * env(int(.2 * SR), .001, .06)) + hp(noise(.2), .8) * env(int(.2 * SR), .012, .05) * .5
for k in range(int(DUR / BEAT * 4)):
    t = k * BEAT / 4
    if k % 2 == 0 and k % 4 != 0 and active(t, HAT): put(MUS, HH, t, .22, .2)       # croches à contretemps
    if k % 2 == 1 and active(t, H16): put(MUS, H2, t, .13, -.2)
for k in range(int(DUR / BEAT)):
    t = k * BEAT
    if k % 4 in (1, 3) and active(t, CLAP): put(MUS, CLP, t, .3)
# arpège
for b in range(int(DUR / 2)):
    ch = CH[b % 4]
    for k in range(16):
        t = b * 2.0 + k * BEAT / 4
        if not active(t, ARP): continue
        f = ch[[0, 1, 2, 1, 0, 2, 1, 2][k % 8]] * (2 if k % 8 in (2, 5) else 1) * (2 if t >= 20 and k % 4 == 3 else 1)
        d = .28; s = (sine(f * 2, d) * .6 + saw(f * 2, d, 3000) * .25) * env(int(d * SR), .002, .09)
        g = (.1 if t < 40 else .13) * (.6 if 40 <= t < 46 else 1) * (1 if t < 54.9 else .6)
        put(MUS, s * duck[min(N - 1, int(t * SR))] ** .5, t, g, [-.5, .5, 0, .3][k % 4])
# silence avant le boom d'intro
for (a, b) in [(3.78, 3.86)]:
    ML[int(a * SR):int(b * SR)] *= np.linspace(1, .05, int(b * SR) - int(a * SR)); MR[int(a * SR):int(b * SR)] *= np.linspace(1, .05, int(b * SR) - int(a * SR))
# fondus musique
ff = np.ones(N); ff[int(59.1 * SR):] = np.linspace(1, 0, N - int(59.1 * SR)) ** 1.5
ML *= ff; MR *= ff

# ---------- voix ----------
D = json.load(open('voice/durations.json'))
LS = {'l1': .5, 'l2': 6.4, 'l3': 12.4, 'l4': 20.4, 'l5': 30.4, 'l6': 40.4, 'l7': 46.4, 'l8': 54.4}
def dec(p):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-'], capture_output=True)
    return np.frombuffer(r.stdout, np.float32).astype(np.float64)
for k, t in LS.items():
    v = dec(f'voice/{k}.mp3'); v = v / (np.abs(v).max() + 1e-9) * .9
    # fondus courts
    f = int(.01 * SR); v[:f] *= np.linspace(0, 1, f); v[-f:] *= np.linspace(1, 0, f)
    i = int(t * SR); VO[i:i + len(v)] += v[:N - i]
# légère présence + réverbe courte sur la voix
def conv(x, ir):
    n = len(x) + len(ir); nf = 1 << (n - 1).bit_length(); return np.fft.irfft(np.fft.rfft(x, nf) * np.fft.rfft(ir, nf), nf)[:len(x)]
ir = rng.standard_normal(int(.9 * SR)) * np.exp(-np.arange(int(.9 * SR)) / SR / .22) * np.linspace(0, 1, int(.9 * SR)) ** .1; ir[:int(.012 * SR)] = 0; ir /= np.abs(ir).sum() ** .5 * 6
vwet = conv(VO, ir)
# ducking de la musique et des SFX sous la voix
def fsm(x, w):
    k = np.hanning(w); k /= k.sum(); nf = 1 << (len(x) + w).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, nf) * np.fft.rfft(k, nf), nf)[:len(x) + w]; return y[w // 2:w // 2 + len(x)]
venv = np.minimum(1, fsm(np.abs(VO), int(.08 * SR)) * 6)
smooth = np.clip(fsm(venv, int(.25 * SR)), 0, 1)
mduck = 1 - .55 * smooth; sduck = 1 - .3 * smooth

# ---------- mix ----------
rev_ir = rng.standard_normal(int(1.8 * SR)) * np.exp(-np.arange(int(1.8 * SR)) / SR / .55); rev_ir[:int(.02 * SR)] = 0; rev_ir /= np.abs(rev_ir).sum() ** .5 * 7
mrev = conv(ML + MR, rev_ir) * .5; srev = conv(L + R, rev_ir) * .35
outL = VO * 1.0 + vwet * .55 + (ML * .6 + mrev * .7) * mduck + (L * .95 + srev * .5) * sduck
outR = VO * 1.0 + vwet * .55 + (MR * .6 + mrev * .7) * mduck + (R * .95 + srev * .5) * sduck
out = np.stack([outL, outR], 1)
out /= np.abs(out).max() * 1.05
pcm = (np.clip(out, -1, 1) * 32767).astype(np.int16)
with wave.open('out/audio_raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', out.shape, 'peak', np.abs(out).max())
