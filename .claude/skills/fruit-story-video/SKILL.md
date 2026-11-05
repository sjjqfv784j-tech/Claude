---
name: fruit-story-video
description: Crée une histoire TikTok verticale (9:16) en IA avec des personnages-fruits en 3D façon film d'animation, récit en sous-titres mot par mot, sur une musique TikTok (drame, injustice, vengeance, morale). Fournit le prompt maître, la bible des personnages, le découpage en plans, les prompts image et vidéo, et la checklist de publication. Utiliser quand l'utilisateur veut une vidéo IA « avec une histoire », des fruits/légumes qui jouent, un format « storytime » IA, ou veut un prompt pour ce genre de vidéo.
---

# Histoire de fruits en 3D (TikTok 9:16)

Format observé (exemple de 3 min 20, images + audio mesurés) : décors de film très éclairés (mine, manoir, cheminée), personnages-fruits expressifs, un drame social simple, plans de 3 à 5 s. **L'histoire est racontée par le texte** : un mot du récit s'affiche seul en bas, comme un sous-titre. Le son est seulement une musique de fond TikTok (−15 LUFS, crête −3,8 dBFS, sans silence), pas de voix off ni chanson sur mesure.

**Règle** : crée TES personnages et TON histoire (noms et designs différents). On copie la structure, pas les personnages ni le scénario d'un autre compte. Active l'étiquette « contenu généré par IA ».

## 1. Prompt maître (à coller dans Claude)
```
Tu es scénariste de vidéos TikTok IA. Écris une histoire en français de {60-90} s
avec des personnages-fruits (têtes de fruit, corps humain, vêtements).
Thème : {injustice / trahison / vengeance / bonté récompensée}.
Structure : 1) Accroche choc en 3 s (le conflit déjà visible). 2) Le gentil
est exploité. 3) Le méchant se vante. 4) Retournement. 5) Chute morale en 1 phrase.
Contraintes : phrases de 6 à 12 mots, un plan par phrase,
aucun dialogue en plus de 2 personnages, fin qui donne envie de commenter
(« Tu aurais fait quoi ? »).
Rends : A) bible des personnages (1 ligne chacun), B) le récit en phrases courtes, prêt à être affiché mot par mot,
C) tableau des plans : n°, durée, décor, action, prompt image, prompt vidéo.
```

## 2. Bible des personnages (à figer, à recoller dans CHAQUE prompt image)
Ex. : « Banane ouvrière : fruit banane jaune tacheté, salopette en jean usée, regard triste » / « Grenade patron : tête de grenade rouge à couronne, costume noir, sourire cruel » / « Myrtille épouse : tête de myrtille bleue, robe rouge satin ». Une phrase de style commune : *« rendu 3D film d'animation, éclairage cinématographique chaud, peau de fruit détaillée, expressions exagérées, vertical 9:16 »*.

## 3. Prompts par plan
- **Image** : `[style commun] + [bible du personnage] + [décor] + [action et émotion] + cadrage (plan moyen / gros plan visage)`. Génère l'image d'abord (cohérence), puis anime.
- **Vidéo (image → vidéo)** : `[décrire le mouvement en 1 phrase : « la banane baisse les yeux et serre l'enveloppe »] + caméra lente (travelling avant) + 4-5 s`. Un seul mouvement par plan.
- Alterner gros plans émotionnels et plans larges du décor ; ~1 plan toutes les 4-5 s.

## 4. Fabrication
1. Images : générateur d'images IA avec le même texte de bible. 2. Animation : outil image→vidéo de ton choix (clips de 4-5 s). 3. Montage : CapCut/ffmpeg, plans calés sur les phrases, récit affiché mot par mot (blanc, contour noir, bas de l'écran au-dessus de la zone TikTok), minuté sur ~3 mots/s. 4. Musique : ajoute un son tendance depuis TikTok à la publication (volume bas), ou un montage sans musique si tu exportes avant. Export 1080×1920, h264, audio ≈ −15 LUFS, crête ≤ −1 dBTP.

## 5. Checklist avant publication
- Les 3 premières secondes montrent déjà le conflit ou le chiffre qui choque.
- Les personnages gardent la même apparence d'un plan à l'autre.
- Pas de texte illisible dans l'image, pas de main déformée en gros plan.
- Fin = question ou « partie 2 » (seulement si elle existe).
- Légende : 1 phrase d'accroche + 3 à 5 hashtags + étiquette IA activée.

## Limites honnêtes
Le volume de vues de l'exemple n'a pas été vérifié, et je n'ai pas pu « écouter » : seulement des mesures audio et une transcription automatique. Teste 3 à 5 histoires avant de juger le format.
