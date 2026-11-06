#!/usr/bin/env python3
"""Génère voice/NN_K.mp3 avec ElevenLabs. Clé : variable ELEVENLABS_API_KEY (jamais dans un fichier)."""
import json, os, subprocess, sys
from pathlib import Path
D = Path(__file__).parent
VOICES = {"LEO": "ErXwobaYiN019PkySvjV", "NOIX": "D38z5RcWu1voky8WS1ja", "ARTICHAUT": "pNInz6obpgDQGcFmaJgB", "NARRATEUR": "onwK4e9ZLuTAKqWW03F9"}
SET = {"LEO": (0.45, 0.35), "NOIX": (0.35, 0.45), "ARTICHAUT": (0.4, 0.5), "NARRATEUR": (0.55, 0.2)}
key = os.environ.get("ELEVENLABS_API_KEY", "proxy-injected")
S = json.loads((D / "script.json").read_text()); (D / "voice").mkdir(exist_ok=True)
for n, p in enumerate(S["plans"], 1):
    for k, (who, text) in enumerate(p["lines"], 1):
        out = D / "voice" / f"{n:02d}_{k}.mp3"
        if out.exists() and "--force" not in sys.argv: continue
        st, sy = SET[who]
        body = json.dumps({"text": text, "model_id": "eleven_multilingual_v2", "language_code": "fr", "voice_settings": {"stability": st, "similarity_boost": 0.8, "style": sy, "use_speaker_boost": True}})
        r = subprocess.run(["curl", "-sS", "--max-time", "90", "-X", "POST", f"https://api.elevenlabs.io/v1/text-to-speech/{VOICES[who]}?output_format=mp3_44100_128",
                            "-H", f"xi-api-key: {key}", "-H", "Content-Type: application/json", "-d", body, "-o", str(out), "-w", "%{http_code}"], capture_output=True, text=True)
        if r.stdout.strip() != "200":
            msg = out.read_text()[:300] if out.exists() else r.stderr; out.unlink(missing_ok=True); sys.exit(f"ÉCHEC {out.name} ({r.stdout}) : {msg}")
        print("ok", out.name)
