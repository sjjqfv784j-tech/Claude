#!/usr/bin/env python3
"""Assemble une fruit story. Usage: python3 build.py prompts | build [sortie.mp4]
Fichiers optionnels (sinon plan provisoire / silence) :
  clips/NN.mp4 ou images/NN.png|jpg   (NN = numéro de plan sur 2 chiffres)
  voice/NN_K.mp3|wav                  (K = numéro de réplique dans le plan, dès 1)
  music/music.mp3                     (son de fond, mixé bas)"""
import json, subprocess, sys, textwrap, tempfile
from pathlib import Path
D = Path(__file__).parent
S = json.loads((D / "script.json").read_text())
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FPS, W, H = 30, 1080, 1920

def run(*a):
    r = subprocess.run([str(x) for x in a], capture_output=True, text=True)
    if r.returncode: sys.exit("ERREUR ffmpeg:\n" + r.stderr[-1500:])
    return r.stdout

def dur(p):
    return float(run("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p).strip())

def find(pattern):
    for ext in pattern:
        f = D / ext
        if f.exists(): return f

def prompts():
    out = ["# Prompts de production : " + S["title"], "", f"Style commun : {S['style']}", ""]
    for n, p in enumerate(S["plans"], 1):
        looks = "; ".join(f"{S['characters'][w]['name']} : {S['characters'][w]['look']}" for w in p["who"])
        out += [f"## Plan {n:02d}", f"**Image** : {S['style']}. {looks}. Décor : {p['setting']}. Action : {p['action']}.", f"**Vidéo (image → vidéo, 4 à 6 s)** : {p['motion']}."]
        for k, (who, text) in enumerate(p["lines"], 1):
            out.append(f"**Voix {n:02d}_{k}** ({S['characters'][who]['voice']}) — {S['characters'][who]['name']} : « {text} »")
        out.append("")
    out += ["## Publication", f"Titre : {S['title']}", f"Hashtags : {S['hashtags']}", "Activer « contenu généré par IA ». Annoncer la Partie 2 seulement si elle est prête."]
    (D / "prompts.md").write_text("\n".join(out)); print("prompts.md écrit")

def ass_time(t):
    h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60
    return f"{h}:{m:02d}:{s:05.2f}"

def build(outfile):
    tmp = Path(tempfile.mkdtemp(prefix="fruit_")); segs, auds, events, t0 = [], [], [], 0.0
    for n, p in enumerate(S["plans"], 1):
        vf, lines = [], []
        for k, (who, text) in enumerate(p["lines"], 1):
            v = find([f"voice/{n:02d}_{k}.mp3", f"voice/{n:02d}_{k}.wav"])
            d = dur(v) if v else max(1.2, len(text.split()) / 2.8)
            lines.append((who, text, v, d))
        d_plan = max(3.5, sum(l[3] for l in lines) + 0.3 * len(lines) + 0.4)
        # sous-titres mot par mot
        t = t0 + 0.2
        for who, text, v, d in lines:
            words = text.split(); tot = sum(len(w) + 2 for w in words); tt = t
            for w in words:
                dw = d * (len(w) + 2) / tot
                events.append((tt, tt + dw, w)); tt += dw
            t += d + 0.3
        # audio du plan
        wav = tmp / f"a{n:02d}.wav"; ins, flt, labels, pos = [], [], [], 0.0
        for i, (who, text, v, d) in enumerate(lines):
            if v:
                ins += ["-i", v]; flt.append(f"[{len(labels)}:a]aresample=44100,aformat=channel_layouts=mono,adelay={int((0.2 + pos) * 1000)}[a{len(labels)}]"); labels.append(f"[a{len(labels)}]")
            pos += d + 0.3
        if labels:
            run("ffmpeg", "-y", *ins, "-filter_complex", ";".join(flt) + f";{''.join(labels)}amix=inputs={len(labels)}:normalize=0,apad=whole_dur={d_plan},atrim=0:{d_plan}[o]", "-map", "[o]", "-ar", 44100, wav)
        else:
            run("ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", d_plan, wav)
        auds.append(wav)
        # vidéo du plan
        seg = tmp / f"s{n:02d}.mp4"; fade = f"fade=t=in:st=0:d=0.25,fade=t=out:st={d_plan-0.25:.2f}:d=0.25,format=yuv420p"
        clip, img = find([f"clips/{n:02d}.mp4"]), find([f"images/{n:02d}.png", f"images/{n:02d}.jpg"])
        if clip:
            run("ffmpeg", "-y", "-stream_loop", -1, "-i", clip, "-t", d_plan, "-an", "-vf", f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},{fade}", "-c:v", "libx264", "-crf", 18, seg)
        elif img:
            fr = int(d_plan * FPS)
            run("ffmpeg", "-y", "-loop", 1, "-i", img, "-t", d_plan, "-vf", f"scale={W*2}:{H*2}:force_original_aspect_ratio=increase,crop={W*2}:{H*2},zoompan=z='min(zoom+0.0007,1.12)':d={fr}:s={W}x{H}:fps={FPS},{fade}", "-c:v", "libx264", "-crf", 18, seg)
        else:
            tf = tmp / f"t{n:02d}.txt"; tf.write_text(f"PLAN {n:02d}\n\n" + "\n".join(textwrap.wrap(p["setting"], 26)) + "\n\n" + "\n".join(textwrap.wrap(p["action"], 26)))
            run("ffmpeg", "-y", "-f", "lavfi", "-i", f"color=c=0x20182a:s={W}x{H}:r={FPS}:d={d_plan}", "-vf", f"drawtext=fontfile={FONT}:textfile={tf}:fontcolor=0xE8D9B0:fontsize=54:line_spacing=14:x=(w-text_w)/2:y=(h-text_h)/2-250,{fade}", "-c:v", "libx264", "-crf", 20, seg)
        segs.append(seg); t0 += d_plan
    lst = tmp / "v.txt"; lst.write_text("".join(f"file '{s}'\n" for s in segs))
    alst = tmp / "a.txt"; alst.write_text("".join(f"file '{a}'\n" for a in auds))
    ass = tmp / "sub.ass"
    ass.write_text("[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\n\n[V4+ Styles]\n"
        "Format: Name,Fontname,Fontsize,PrimaryColour,OutlineColour,BackColour,Bold,Outline,Shadow,Alignment,MarginL,MarginR,MarginV\n"
        "Style: W,DejaVu Sans,96,&H00FFFFFF,&H00000000,&H00000000,1,7,0,2,60,60,430\n\n[Events]\nFormat: Layer,Start,End,Style,Text\n"
        + "".join(f"Dialogue: 0,{ass_time(a)},{ass_time(b)},W,{w.upper()}\n" for a, b, w in events))
    music = find(["music/music.mp3"])
    cmd = ["ffmpeg", "-y", "-f", "concat", "-safe", 0, "-i", lst, "-f", "concat", "-safe", 0, "-i", alst]
    if music:
        cmd += ["-stream_loop", -1, "-i", music]
        af = "[1:a][2:a]amix=inputs=2:weights=1 0.18:duration=first:normalize=0,loudnorm=I=-15:TP=-1.5:LRA=7[a]"
    else:
        af = "[1:a]loudnorm=I=-15:TP=-1.5:LRA=7[a]"
    cmd += ["-filter_complex", f"[0:v]ass={ass}[v];{af}", "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", 20, "-preset", "medium", "-pix_fmt", "yuv420p", "-r", FPS, "-c:a", "aac", "-b:a", "192k", "-ar", 44100, "-movflags", "+faststart", "-t", t0, outfile]
    run(*cmd); print(f"{outfile} ({t0:.1f} s)")

if __name__ == "__main__":
    a = sys.argv[1:] or ["build"]
    prompts() if a[0] == "prompts" else build(a[1] if len(a) > 1 else str(D / "out" / "partie1.mp4"))
