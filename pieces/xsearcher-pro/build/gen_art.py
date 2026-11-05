import numpy as np
from PIL import Image, ImageFilter
W, H = 800, 1040
def fbm(shape, seed, octaves=6, base=3, persist=0.5):
    rng = np.random.default_rng(seed); out = np.zeros(shape); amp = 1; tot = 0
    for o in range(octaves):
        f = base * 2 ** o
        g = rng.random((int(f) + 2, int(f * shape[1] / shape[0]) + 2))
        im = Image.fromarray((g * 255).astype(np.uint8)).resize((shape[1], shape[0]), Image.BICUBIC)
        out += amp * np.asarray(im, np.float32) / 255; tot += amp; amp *= persist
    return out / tot
def cmap(v):  # 0..1 -> noir, rouge profond, #ff443f, orange, blanc chaud
    stops = [(0, (6, 6, 10)), (0.30, (60, 6, 12)), (0.55, (200, 28, 34)), (0.75, (255, 68, 63)), (0.90, (255, 150, 70)), (1, (255, 240, 225))]
    xs = [s[0] for s in stops]; out = np.zeros(v.shape + (3,))
    for c in range(3): out[..., c] = np.interp(v, xs, [s[1][c] for s in stops])
    return out
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32); xn, yn = xx / W, yy / H
def save(a, n): Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(f'../assets/art-{n}.png')
def vignette(a, k=0.55):
    d = np.sqrt((xn - .5) ** 2 + (yn - .5) ** 2) * 1.5; return a * (1 - k * d ** 2)[..., None]
# 1 — Éclipse : planète noire, couronne rouge, étoiles
cx, cy = .5, .42; r = np.sqrt(((xn - cx) * W / H * 1.0) ** 2 * (H / W) ** -2 * 0 + ((xx - cx * W)) ** 2 + (yy - cy * H) ** 2)
R = 230; nz = fbm((H, W), 3, 6, 4)
corona = np.exp(-np.clip(r - R, 0, None) / 90) * (0.7 + 0.6 * nz)
ring = np.exp(-((r - R) / 7) ** 2) * 1.6
v = np.clip(corona * 0.85 + ring, 0, 1.2) * (r > R - 2) + 0
img = cmap(np.clip(v, 0, 1)) * 1.0
st = np.random.default_rng(5).random((H, W)); stars = (st > 0.9988).astype(np.float32); stars = np.asarray(Image.fromarray((stars * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)), np.float32) / 255 * 6
img += (stars * (r > R + 4))[..., None] * np.array([255, 190, 170])
mist = fbm((H, W), 11, 5, 3); img += (cmap(np.clip(mist * .5 - .05, 0, 1)) * 0.5) * (yn[..., None] > .6) * ((yn[..., None] - .6) * 2.2)
save(vignette(img), 1)
# 2 — Soie : rubans fluides
w1 = fbm((H, W), 21, 5, 2); w2 = fbm((H, W), 22, 5, 2)
u = xn + 0.35 * (w1 - .5); vv = yn + 0.35 * (w2 - .5)
s = np.sin((u * 5.5 + vv * 3.2 + w1 * 2.4) * np.pi) * .5 + .5
s = s ** 2.2; hl = np.exp(-((s - .85) / .06) ** 2) * .6
img = cmap(np.clip(s * .85 + hl, 0, 1)); img *= (0.55 + 0.6 * np.sin((vv * 2.0 + w2) * np.pi) ** 2)[..., None]
save(vignette(img, .7), 2)
# 3 — Montagnes : soleil rouge, crêtes brumeuses
sky = cmap(np.clip(0.25 + 0.55 * np.exp(-((yn - .55) / .28) ** 2), 0, 1))
sr = np.sqrt((xx - W * .5) ** 2 + (yy - H * .52) ** 2); sun = np.exp(-(np.clip(sr - 120, 0, None) / 90)) * 1.0
img = sky * 0.8 + cmap(np.clip(sun, 0, 1)) * (sun[..., None] > 0.02) * 0.9
img[sr < 120] = (255, 120, 80)
for i, (base_y, amp, seed, dark) in enumerate([(.55, .12, 31, .55), (.65, .13, 32, .38), (.76, .15, 33, .22), (.88, .12, 34, .08)]):
    prof = fbm((1, W * 2), seed, 7, 2)[0][:W] if False else np.interp(xx[0], np.linspace(0, W, 400), np.random.default_rng(seed).random(400))
    prof = np.convolve(np.pad(prof, 20, mode='edge'), np.ones(41) / 41, 'valid')[:W]
    ridge = (base_y + amp * (prof - .5)) * H
    mask = yy > ridge[None, :]
    fog = np.exp(-(yy - ridge[None, :]) / 140) * (1 - dark) * 0.9
    col = np.array([14, 6, 12]) + fog[..., None] * np.array([150, 28, 30]) * (1 - i * .18)
    img = np.where(mask[..., None], col, img)
img += (cmap(np.clip(fbm((H, W), 41, 5, 3) * .6, 0, 1)) * 0.10)
save(vignette(img, .6), 3)
print('ok')
