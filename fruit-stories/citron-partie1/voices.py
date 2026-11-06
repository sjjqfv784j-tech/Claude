#!/usr/bin/env python3
"""Génère voice/NN_K.mp3 (ElevenLabs v3, voix de voices.json). Option --best N : N prises par réplique, garde la plus fidèle au texte
(contrôle par transcription : un mot mal prononcé est détecté, pas une voix « moche »). Clé : variable ELEVENLABS_API_KEY."""
import json, os, re, subprocess, sys, difflib
from pathlib import Path
import numpy as np
D = Path(__file__).parent; key = os.environ.get("ELEVENLABS_API_KEY", "proxy-injected")
VOICES = json.loads((D / "voices.json").read_text()); S = json.loads((D / "script.json").read_text())
N = int(sys.argv[sys.argv.index("--best") + 1]) if "--best" in sys.argv else 1
(D / "voice").mkdir(exist_ok=True)
norm = lambda t: re.sub(r"[^a-zàâçéèêëîïôûùüÿœ0-9 ]", "", t.lower())
wh = None
def sim(path, text):
    global wh
    if wh is None:
        from faster_whisper import WhisperModel; wh = WhisperModel("small", compute_type="int8")
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True).stdout
    s, _ = wh.transcribe(np.frombuffer(raw, dtype=np.float32), language="fr")
    return difflib.SequenceMatcher(None, norm(text), norm(" ".join(x.text for x in s))).ratio()
def gen(who, text, direction, out):
    body = json.dumps({"text": (direction + " " if direction else "") + text, "model_id": "eleven_v3", "language_code": "fr", "voice_settings": {"stability": 0.5}})
    r = subprocess.run(["curl", "-sS", "--max-time", "90", "-X", "POST", f"https://api.elevenlabs.io/v1/text-to-speech/{VOICES[who]}?output_format=mp3_44100_128", "-H", f"xi-api-key: {key}", "-H", "Content-Type: application/json", "-d", body, "-o", str(out), "-w", "%{http_code}"], capture_output=True, text=True)
    if r.stdout.strip() != "200":
        msg = Path(out).read_text()[:300] if Path(out).exists() else r.stderr; Path(out).unlink(missing_ok=True); sys.exit(f"ÉCHEC {Path(out).name} ({r.stdout}) : {msg}")
for n, p in enumerate(S["plans"], 1):
    for k, (who, text, *dr) in enumerate(p["lines"], 1):
        out = D / "voice" / f"{n:02d}_{k}.mp3"
        if out.exists() and "--force" not in sys.argv: continue
        best = (-1, None)
        for i in range(N):
            tmp = D / "voice" / f"_t{i}.mp3"; gen(who, text, dr[0] if dr else "", tmp)
            sc = sim(str(tmp), text) if N > 1 else 1
            if sc > best[0]:
                if best[1]: best[1].unlink()
                best = (sc, tmp); tmp.rename(D / "voice" / f"_best{i}.mp3"); best = (sc, D / "voice" / f"_best{i}.mp3")
            else: tmp.unlink()
        best[1].replace(out); print("ok", out.name, "fidélité", round(best[0], 2))
