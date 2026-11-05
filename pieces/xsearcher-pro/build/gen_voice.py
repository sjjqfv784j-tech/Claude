import asyncio, os, json, subprocess, sys, edge_tts
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'fr-FR-VivienneMultilingualNeural'
RATE = sys.argv[2] if len(sys.argv) > 2 else '+8%'
OUT = sys.argv[3] if len(sys.argv) > 3 else 'voice'
SEG = [
 ("s1", "Une idée en tête ?"),
 ("s2", "Avec X G P T, tu as tout pour la créer."),
 ("s3", "Pose tes questions, dans ta langue."),
 ("s4", "Écris et améliore ton code."),
 ("s5", "Crée des images, en quelques secondes."),
 ("s6", "Claude, ChatGPT, Gemini, DeepSeek… Plusieurs modèles, un seul espace."),
 ("s7", "X G P T. Une longueur d'avance. Xsearcher point C C."),
]
async def one(k, text):
    c = edge_tts.Communicate(text, VOICE, rate=RATE, pitch='+0Hz', boundary='WordBoundary', proxy=os.environ.get('HTTPS_PROXY'))
    words = []
    with open(f'{OUT}/{k}.mp3', 'wb') as f:
        async for ch in c.stream():
            if ch['type'] == 'audio': f.write(ch['data'])
            elif ch['type'] == 'WordBoundary':
                words.append({'t': ch['offset'] / 1e7, 'd': ch['duration'] / 1e7, 'w': ch['text']})
    d = float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f'{OUT}/{k}.mp3']))
    return {'id': k, 'text': text, 'dur': d, 'words': words}
async def main():
    os.makedirs(OUT, exist_ok=True)
    res = [await one(k, t) for k, t in SEG]
    json.dump(res, open(f'{OUT}/timings.json', 'w'), ensure_ascii=False, indent=1)
    for r in res: print(r['id'], round(r['dur'], 2), [w['w'] for w in r['words']][:12])
asyncio.run(main())
