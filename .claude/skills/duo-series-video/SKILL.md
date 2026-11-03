---
name: duo-series-video
description: Fabrique un épisode de série TikTok « duo » de 35 à 45 secondes dans le style des séries d'humour IA (deux personnages récurrents qui dialoguent, un accessoire à l'écran avec un chiffre ou une erreur, des sous-titres mot par mot avec mots-clés en orange, une chute froide, une question en fin). Utiliser quand l'utilisateur veut « une vidéo comme celle de Malo et Claude », un sketch IA, un épisode numéroté, une série à plusieurs parties, ou veut transformer une idée en vidéo TikTok complète (script, voix, animation en code, bande sonore, vérifications, légende). Travaille dans le dépôt Claude (dossiers clawd-video/ et tools/) avec NOS personnages Sam et Pixel.
---

# Épisode de série « duo » (TikTok, 9:16)

Tu produis un épisode **complet et vérifié** : idée → script → voix → scènes en code → rendu → bande sonore → contrôles mesurés → légende. Tout le code vit dans `clawd-video/` (Remotion) et `tools/`. Les épisodes déjà faits servent de modèles : `src/claude/` (dialogue + cartes), `src/menti/` (chat d'IA), `src/etsi/` (histoire en décors).

## Règles de fond (non négociables)
1. **Personnages originaux uniquement : Sam (humain, pull bleu, barbe, foulard rouge) et Pixel (le point terracotta, l'IA).** Ne reproduis jamais les personnages, les blagues ni le nom de série d'un autre compte (pas de « X & Claude #N »). On reprend un *schéma* (structure, rythme), pas des contenus. Série nommée « Sam & Pixel #N ».
2. **Aucune affirmation fausse à l'écran.** Pour un fait sur un produit (Claude Code, un prix…), vérifie-le dans la documentation officielle (WebFetch/WebSearch) et cite-le dans la réponse. Si on nomme Claude ou un produit : mention « vidéo non officielle, non affiliée à Anthropic » à l'écran.
3. **Rien de secret dans les fichiers ni dans le chat** : la clé ElevenLabs se passe par variable d'environnement (`ELEVENLABS_API_KEY=… node …`), jamais écrite dans un fichier ni commitée.
4. **« Fini » = mesuré.** Un épisode n'est livré qu'après `verify.sh` sans FAIL, relecture de la planche de contact, et avec la liste honnête de ce qui n'a pas pu être vérifié (écoute du son, test sur téléphone).
5. **Étiquette « contenu généré par IA »** à activer à la publication.

## La recette (mesurée, voir references/)
- **Accroche en 1 s** : le résultat ou le chiffre qui choque + texte lisible dès la première image + mouvement immédiat (zoom d'entrée).
- **Un enjeu concret** : de l'argent, une peur, un problème de travail (« 800 € de facture », « clé piratée »). Dans le compte étudié, les titres avec un montant ou une peur ont une médiane de vues 2,5 à 3 fois plus haute (petits échantillons : indicatif).
- **Trois temps** : (1) accroche + accessoire à l'écran avec le chiffre, (2) aggravation en champ/contrechamp (une réplique = un plan), (3) **chute froide** en une phrase.
- **Un plan toutes les 3 à 4 s**, jamais plus de 6 s sans changement visuel ; un accessoire d'écran (facture, erreur, code, devis) toutes les ~8 s.
- **Fin** : numéro de partie + question à choix simple (OUI/NON, A/B) + dernière image = première image (boucle).
- **Durée 35–45 s.** Sous-titres mot par mot, style `box` (blanc, mots-clés en pastille orange, en bas au-dessus de la zone cachée par TikTok) ou `outline` (en haut).
- Attentes réalistes : même la meilleure vidéo de l'exemple (39 500 vues) n'a que 22 commentaires (0,47 commentaire pour 1 000 vues en médiane). Ne pas juger un épisode aux commentaires ; regarder likes (≈4,4 %), partages, durée moyenne de visionnage.

## Étapes
1. **Idée + titre.** Formule : `<Situation concrète avec enjeu> <emoji> | Sam & Pixel #N <phrase qui pose la situation>`. Une seule idée par épisode.
2. **Squelette** : `python3 .claude/skills/duo-series-video/scripts/new_episode.py <slug> "Titre"` (crée scènes, composition, JSON, enregistre dans Root.tsx ; n'écrase rien).
3. **Script** `clawd-video/src/stories/<slug>.json` : une réplique par scène, ≤ 3,5 mots/s, `highlight` = les 1 à 3 mots forts, `sfx` par scène (types : thump, boom, ding, chime, tick, click, buzz, pop, riser), `timing` (lead, gaps, loop, captions, music_duck). Modèle : `templates/episode.story.json`. Voix : `s` = Sam (Marcel), `c` = Pixel (Victoria).
4. **Voix** : `cd clawd-video && ELEVENLABS_API_KEY=… node scripts/voice.mjs <slug>` (donne `public/voice/<slug>/timings.json`).
5. **Scènes** : réécris `src/<slug>/Scenes.tsx` (une scène par réplique, ids = ceux du JSON). Réutilise `Figure` (Sam, `sam` + poses), le point Pixel, `Card`, `Check`. **Sam ne bouge pas la bouche** (rendu moche) : voix + étiquette « SAM » + léger balancement. Posture : assis = chaise dessinée, pieds au sol.
6. **Compiler et rendre** : `cd clawd-video && npx tsc -p . && npx remotion render src/index.ts <Composition> out/<slug>.mp4 --concurrency=4`.
7. **Son + export** : `python3 .claude/skills/duo-series-video/scripts/make_audio.py <slug> clawd-video/out/<slug>.mp4 out/<slug>-final.mp4` (fouets, effets, musique douce, loudnorm, crête < −1 dBTP, h264 yuv420p faststart).
8. **Contrôles** : `.claude/skills/duo-series-video/scripts/verify.sh out/<slug>-final.mp4 <slug>` → corriger tout FAIL ; lire la planche `*-planche.png` ; vérifier à l'œil la 1ʳᵉ et la dernière image.
9. **Publication** : légende courte (accroche en 1ʳᵉ ligne), 3 à 5 hashtags, commentaire épinglé avec la question OUI/NON, étiquette IA activée, « vidéo non officielle » si un produit est nommé. Série : annoncer « Partie 2 demain » seulement si c'est vrai.

## Seuils de `tools/review_video.py`
h264 + yuv420p + faststart · 1080×1920 · 15–60 i/s · −16 à −13 LUFS · crête ≤ −1 dBTP · pas de silence > 2,5 s · coupe toutes les 2–6 s · pas de passage immobile > 3 s · mouvement dès les 2 premières secondes · texte lisible dès 1 s · boucle (dernière ≈ première image) · débit ≤ 3,8 mots/s.

## Dépannage rapide
- « La vidéo ne marche pas » : `scripts/encode_safe.sh in.mp4 out.mp4` (corrige yuvj420p, HEVC, infos à la fin).
- Dernière image noire : la dernière scène doit couvrir `ceil((start+durée)*fps)` (déjà géré dans le gabarit).
- Pas de son dans l'aperçu : l'aperçu intégré démarre souvent muet ; envoyer le fichier en pièce jointe.

## Fichiers
`scripts/new_episode.py` · `scripts/make_audio.py` · `scripts/verify.sh` · `scripts/encode_safe.sh` · `templates/episode.story.json` · `references/analyse-compte.md` · `references/regles.md`
