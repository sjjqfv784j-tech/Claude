import asyncio, edge_tts, os, json, subprocess
os.environ.setdefault("SSL_CERT_FILE","/root/.ccr/ca-bundle.crt")
VOICE="fr-FR-VivienneMultilingualNeural"
LINES=[
 ("l1","Une idée en tête. Tout pour la créer. Voici X.GPT."),
 ("l2","Ton espace d'intelligence artificielle : une question, un script, une image."),
 ("l3","Pose ta question. X.GPT répond en temps réel, et garde le fil de toute ta conversation."),
 ("l4","Plusieurs modèles, un seul espace. Claude, ChatGPT, Gemini, DeepSeek, Mistral, Grok. Tu choisis."),
 ("l5","Écris, corrige, améliore ton code. Colle une erreur : X.GPT explique la cause, et propose le correctif."),
 ("l6","Et donne forme à ton imagination : décris l'image, X.GPT la crée."),
 ("l7","Commence gratuitement. Les offres Plus, Ultra et Max arrivent, pour aller plus loin."),
 ("l8","X.GPT. Tes idées, une longueur d'avance. Rendez-vous sur xsearcher point c c."),
]
async def main():
    d={}; W={}
    for k,t in LINES:
        c=edge_tts.Communicate(t,VOICE,rate="+6%",pitch="+2Hz",boundary="WordBoundary",proxy=os.environ.get("HTTPS_PROXY"))
        wb=[]
        with open(f"voice/{k}.mp3","wb") as f:
            async for ch in c.stream():
                if ch["type"]=="audio": f.write(ch["data"])
                elif ch["type"]=="WordBoundary": wb.append([ch["text"],ch["offset"]/1e7,ch["duration"]/1e7])
        W[k]=wb
        o=subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f"voice/{k}.mp3"],capture_output=True,text=True).stdout
        d[k]=float(o); print(k,d[k])
    json.dump(d,open("voice/durations.json","w")); json.dump(W,open("voice/words.json","w"),ensure_ascii=False)
asyncio.run(main())
