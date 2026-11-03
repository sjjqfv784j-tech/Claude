# Règles mesurées (sorties de nos propres vidéos et du contrôle tools/review_video.py)

| Sujet | Règle | Pourquoi / mesure |
|---|---|---|
| Première image | texte lisible + mouvement immédiat | présentation de chaîne ratée : page vide, mouvement 1,1 ; épisodes suivants : 3 à 6 |
| Rythme | un plan toutes les 3 à 4 s | épisode Claude : 3,2 s ; compte de référence : 3,0 s sur sa meilleure vidéo |
| Voix | ≤ 3,5 mots/s (3,8 toléré) | au-delà, les phrases courtes paraissent précipitées |
| Silence | pas de silence > 2,5 s ; un silence court avant la chute est voulu (`music_duck`) | |
| Son | −14,5 LUFS visés, crête ≤ −1 dBTP | loudnorm + limiteur ; les deux sont dans make_audio.py |
| Format | h264 High 4.0, yuv420p, 30 i/s, AAC, faststart, ~8–10 Mo | `yuvj420p` et HEVC ont fait « marcher pas » des fichiers |
| Boucle | dernière image = première (même scène figée, mêmes sous-titres) | écart mesuré < 12 |
| Fin | numéro de partie + question OUI/NON à l'écran | 0 commentaire sur la présentation de chaîne : la question n'était que dans la légende |
| Sam | bouche fermée quand il parle, balancement de tête, étiquette « SAM » | l'animation de bouche faisait moche |
| Décor | un assis = une chaise dessinée, pieds au sol | pieds flottants signalés par l'utilisatrice/l'utilisateur |
| Dernière image | doit exister (pas de fond noir) | bug d'arrondi corrigé : `ceil` |
| Sécurité | titre et texte importants dans le centre 900×1400 ; haut 120 px, bas 320 px, droite 120 px libres | zone cachée par l'interface |
