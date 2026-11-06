#!/usr/bin/env python3
"""Crée une voix française sur mesure par personnage (ElevenLabs Voice Design) -> voices.json."""
import base64, json, os, subprocess, sys, tempfile
from pathlib import Path
D = Path(__file__).parent; key = os.environ.get("ELEVENLABS_API_KEY", "proxy-injected")
SAMPLE = {
 "LEO": "Grand-père, ton horloge est finie ! Demain, elle gagne le concours, et personne ne pourra jamais te la prendre, je te le promets, regarde comme elle brille !",
 "NOIX": "Mon petit Léo, ne la montre à personne avant l'heure. J'ai passé trente ans de ma vie sur cette horloge, et je veux qu'elle reste notre secret encore une nuit.",
 "ARTICHAUT": "Mesdames et messieurs, voici mon chef-d'œuvre ! Trente ans de travail, de sueur et de génie, et personne dans cette salle ne pourra me dire le contraire.",
 "NARRATEUR": "Mais le patron écoutait derrière la porte, et dans l'ombre du couloir, un sourire cruel venait de naître sur son visage, pendant que la nuit tombait sur la ville.",
}
DESC = {
 "LEO": "Un garçon français natif d'environ 20 ans, voix claire, sincère et très expressive, accent parisien naturel, ton de dessin animé, enregistrement studio propre.",
 "NOIX": "Un vieil homme français natif d'environ 75 ans, voix chaude, douce et un peu tremblante, fatiguée mais bienveillante, accent français naturel, enregistrement studio propre.",
 "ARTICHAUT": "Un homme français natif d'environ 50 ans, voix grave, lente, mielleuse et menaçante, ton de méchant de film, accent français naturel, enregistrement studio propre.",
 "NARRATEUR": "Un narrateur français natif d'environ 45 ans, voix posée et chaleureuse de conteur de livre audio, accent français neutre, enregistrement studio propre.",
}
def api(path, body):
    r = subprocess.run(["curl", "-sS", "--max-time", "120", "-X", "POST", f"https://api.elevenlabs.io{path}", "-H", f"xi-api-key: {key}", "-H", "Content-Type: application/json", "-d", json.dumps(body)], capture_output=True, text=True)
    try: return json.loads(r.stdout)
    except Exception: sys.exit("réponse illisible : " + r.stdout[:300])
import numpy as np, re, difflib
from faster_whisper import WhisperModel
wh = WhisperModel("small", compute_type="int8")
norm = lambda t: re.sub(r"[^a-zàâçéèêëîïôûùüÿœ0-9 ]", "", t.lower())
out = json.loads((D / "voices.json").read_text()) if (D / "voices.json").exists() else {}
for who in DESC:
    if who in out: continue
    d = api("/v1/text-to-voice/design", {"voice_description": DESC[who], "text": SAMPLE[who], "model_id": "eleven_ttv_v3"})
    if "previews" not in d: sys.exit(f"{who}: {str(d)[:300]}")
    best = None
    for p in d["previews"]:
        mp3 = Path(tempfile.mkdtemp()) / "p.mp3"; mp3.write_bytes(base64.b64decode(p["audio_base_64"]))
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", mp3, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True).stdout
        s, _ = wh.transcribe(np.frombuffer(raw, dtype=np.float32), language="fr")
        sim = difflib.SequenceMatcher(None, norm(SAMPLE[who]), norm(" ".join(x.text for x in s))).ratio()
        print(who, p["generated_voice_id"], "lisibilité", round(sim, 2))
        if not best or sim > best[0]: best = (sim, p["generated_voice_id"])
    v = api("/v1/text-to-voice", {"voice_name": f"FruitStory {who}", "voice_description": DESC[who], "generated_voice_id": best[1]})
    if "voice_id" not in v: sys.exit(f"{who}: {str(v)[:300]}")
    out[who] = v["voice_id"]; (D / "voices.json").write_text(json.dumps(out, indent=1)); print("créée", who, v["voice_id"])
