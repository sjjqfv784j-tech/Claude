---
name: fruit-story-video
description: Crée une histoire TikTok verticale (9:16) en IA avec des personnages-fruits en 3D façon film d'animation, voix off française et sous-titres mot par mot (drame, injustice, vengeance, morale). Fournit le prompt maître, la bible des personnages, le découpage en plans, les prompts image et vidéo, et la checklist de publication. Utiliser quand l'utilisateur veut une vidéo IA « avec une histoire », des fruits/légumes qui jouent, un format « storytime » IA, ou veut un prompt pour ce genre de vidéo.
---

# Histoire de fruits en 3D (TikTok 9:16)

Format observé (analyse des images d'un exemple de 3 min 20 ; l'audio n'a pas pu être transcrit) : décors de film très éclairés (mine, manoir, cheminée), personnages-fruits expressifs, un drame social simple, plans courts, un mot de sous-titre à la fois en bas.

**Règle** : crée TES personnages et TON histoire (noms et designs différents). On copie la structure, pas les personnages ni le scénario d'un autre compte. Active l'étiquette « contenu généré par IA ».

## 1. Prompt maître (à coller dans Claude)
```
Tu es scénariste de vidéos TikTok IA. Écris une histoire en français de {60-90} s
avec des personnages-fruits (têtes de fruit, corps humain, vêtements).
Thème : {injustice / trahison / vengeance / bonté récompensée}.
Structure : 1) Accroche choc en 3 s (le conflit déjà visible). 2) Le gentil
est exploité. 3) Le méchant se vante. 4) Retournement. 5) Chute morale en 1 phrase.
Contraintes : phrases de 6 à 12 mots, ≤ 3 mots/s, un plan par phrase,
aucun dialogue en plus de 2 personnages, fin qui donne envie de commenter
(« Tu aurais fait quoi ? »).
Rends : A) bible des personnages (1 ligne chacun), B) texte de la voix off,
C) tableau des plans : n°, durée, décor, action, prompt image, prompt vidéo.
```

## 2. Bible des personnages (à figer, à recoller dans CHAQUE prompt image)
Ex. : « Banane ouvrière : fruit banane jaune tacheté, salopette en jean usée, regard triste » / « Grenade patron : tête de grenade rouge à couronne, costume noir, sourire cruel » / « Myrtille épouse : tête de myrtille bleue, robe rouge satin ». Une phrase de style commune : *« rendu 3D film d'animation, éclairage cinématographique chaud, peau de fruit détaillée, expressions exagérées, vertical 9:16 »*.

## 3. Prompts par plan
- **Image** : `[style commun] + [bible du personnage] + [décor] + [action et émotion] + cadrage (plan moyen / gros plan visage)`. Génère l'image d'abord (cohérence), puis anime.
- **Vidéo (image → vidéo)** : `[décrire le mouvement en 1 phrase : « la banane baisse les yeux et serre l'enveloppe »] + caméra lente (travelling avant) + 4-5 s`. Un seul mouvement par plan.
- Alterner gros plans émotionnels et plans larges du décor ; ~1 plan toutes les 4-5 s.

## 4. Fabrication
1. Images : générateur d'images IA avec le même texte de bible. 2. Animation : outil image→vidéo de ton choix (clips de 4-5 s). 3. Voix off : ElevenLabs ou équivalent, voix grave posée, clé API en variable d'environnement, jamais dans un fichier. 4. Montage : CapCut/ffmpeg, sous-titres mot par mot (blanc, contour noir, bas de l'écran au-dessus de la zone TikTok), musique douce sous la voix (−20 dB). 5. Export 1080×1920, h264, audio −14 LUFS.

## 5. Checklist avant publication
- Les 3 premières secondes montrent déjà le conflit ou le chiffre qui choque.
- Les personnages gardent la même apparence d'un plan à l'autre.
- Pas de texte illisible dans l'image, pas de main déformée en gros plan.
- Fin = question ou « partie 2 » (seulement si elle existe).
- Légende : 1 phrase d'accroche + 3 à 5 hashtags + étiquette IA activée.

## Limites honnêtes
Le volume de vues de l'exemple et la qualité du son n'ont pas été vérifiés. Teste 3 à 5 histoires avant de juger le format.
