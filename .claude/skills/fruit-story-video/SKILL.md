---
name: fruit-story-video
description: Crée une mini-série TikTok verticale (9:16, ~60 s) de drames avec des personnages-fruits en 3D qui se parlent (dialogues à voix d'IA, sous-titres mot par mot, sons TikTok), découpée en Parties avec une fin en suspens. Fournit le script dialogué, la bible des personnages, les prompts image, vidéo et voix, le montage et la publication. Utiliser quand l'utilisateur veut des « fruit stories », une vidéo IA avec une histoire et des fruits qui parlent, ou veut refaire le format du compte @onlyfrubidi_off avec ses propres personnages.
---

# Fruit story : drame dialogué de ~60 s, en série

## Ce que fait vraiment le format (mesuré sur les 11 vidéos du compte)
- **Durée 60 s** (60 à 84 s). **Une histoire = 3 à 5 décors**, qui changent environ toutes les 4 à 6 s, en fondu (très peu de coupes sèches).
- **Les fruits parlent** : dialogues joués à 2 ou 3 voix d'IA + parfois 1 ligne de narration. 110 à 260 mots par vidéo, la star à 174 mots (≈ 2,9 mots/s). Le récit n'est pas un texte qui défile : il est **dit**, et les sous-titres affichent **un mot à la fois**, en blanc gras avec contour noir, en bas de l'écran.
- **Image** : rendu 3D film d'animation, éclairage chaud de cinéma, personnages-fruits très expressifs (têtes en gros plan quand ça crie ou pleure), décors riches (mine, manoir, hôpital, ruelle sous la pluie).
- **Son** : un son TikTok en fond (piano triste, « Kamin », Beethoven), pas de musique sur mesure.
- **Thèmes** : sacrifice (le parent donne sa vie ou sa santé), trahison, honnêteté punie puis récompensée, vengeance. La morale est dite dans la dernière phrase.
- **Série** : la vidéo à 11,3 M de vues (« L'HONNÊTETÉ DE LA BANANE ») s'arrête en pleine phrase (« Tu m'as… ») ; la Partie 2 (1,6 M) et la Partie finale (1,2 M) la suivent. Les histoires isolées (poire, abricot, myrtille) font 50 à 100 k. Médiane du compte : 165 k vues (11 vidéos, petit échantillon : indicatif). La dernière vidéo n'a que 2 k : le format s'use sans suite ni personnage récurrent.
- **Titre** : `Partie N : TITRE EN MAJUSCULES 🍌⛏️` + `#ia #fruit #fruitstory #histoirefruit #pourtoi`.

## Règle de fond
Tes propres personnages, ton propre monde, ton propre scénario. On reprend la **structure**, pas la banane, la grenade ni l'histoire d'un autre compte. Active « contenu généré par IA ».

## Anatomie du hit (60 s) : à reproduire en structure
| Temps | Rôle | Exemple (hit) |
|---|---|---|
| 0–5 s | Accroche : situation + enjeu déjà en place, 1ʳᵉ réplique dès la 1ʳᵉ seconde | « Le jour de paye ! » : trop d'argent dans l'enveloppe |
| 5–14 s | Dilemme moral du héros | « Je devrais le rendre, mais ma famille a faim » |
| 14–27 s | Ironie dramatique : le public apprend que c'est un test du patron | le patron et sa femme parient |
| 27–46 s | Le héros fait le bien, un tiers le trahit | il rend l'argent, la femme le garde et ment |
| 46–60 s | Accusation injuste + **suspens** | « Dehors, voleur ! … Regardez ça ! — Tu m'as… » |
Partie 2 : la preuve sort, le menteur est puni. Partie finale : récompense + une note douce-amère.

## 1. Prompt maître (à coller dans Claude)
```
Tu écris des fruit stories TikTok : drame dialogué de 60 s avec des fruits.
Personnages : crée-en 3 originaux (nom, fruit, vêtements, voix).
Thème : {honnêteté punie puis récompensée / sacrifice d'un parent / trahison}.
Structure : accroche dès la 1re seconde (une réplique + l'enjeu), dilemme du héros,
un secret que le public connaît et pas le héros, une trahison, une accusation
injuste, fin EN SUSPENS en pleine phrase (Partie 1 sur 3).
Contraintes : 150 à 180 mots en tout, répliques de 4 à 12 mots, 2 à 3 voix,
1 ligne de narration max, 5 décors, un seul événement par plan.
Rends : A) bible des personnages (apparence + voix), B) script avec le nom du
personnage devant chaque réplique, C) tableau des plans (n°, durée, décor, action,
réplique, prompt image, prompt vidéo), D) titre « Partie N : … » + hashtags,
E) l'idée des Parties 2 et 3 en 2 lignes.
```

## 2. Prompts de fabrication
- **Bible** (à recoller dans CHAQUE prompt image) : une phrase par personnage, ex. « [OUVRIER] : tête de pêche, salopette en jean usée, regard fatigué ». Style commun : *rendu 3D film d'animation, éclairage cinématographique chaud, peau de fruit détaillée, expressions exagérées, vertical 9:16*.
- **Image** : `style + personnages (bible) + décor + action + émotion + cadrage` (large pour poser le décor, gros plan pour les émotions). Génère d'abord l'image, puis anime.
- **Vidéo (image → vidéo)** : 1 mouvement, ex. « la pêche baisse les yeux et serre l'enveloppe », caméra lente, 4 à 6 s.
- **Voix** : une voix distincte par personnage (grave pour le patron, douce pour l'épouse, enfant pour le fils), ton joué, pas lu. Génère réplique par réplique, puis assemble.
- **Sous-titres mot par mot** calés sur la voix (CapCut « sous-titres auto », style gras blanc + contour, bas de l'écran).

## 3. Montage et publication
1. Assembler plans et voix (CapCut ou ffmpeg), fondus de 0,3 s entre décors.
2. Sous-titres mot par mot, puis un son TikTok à volume bas sous les voix.
3. Export 1080×1920, 30 i/s, h264, voix lisibles (≈ −15 LUFS).
4. Titre + hashtags, étiquette IA, Partie 2 annoncée **seulement si elle est prête**.

## Checklist
- La 1ʳᵉ seconde contient déjà une réplique et un enjeu.
- Les personnages gardent le même visage d'un plan à l'autre.
- Les voix sont intelligibles par-dessus la musique.
- La fin laisse une question ouverte (suspens) ou une morale en une phrase.

## Limites honnêtes
Je n'ai pas pu écouter les voix : les dialogues viennent d'une transcription automatique (noms et mots parfois faux). Les outils exacts du compte (image, vidéo, voix) ne sont pas connus : choisis les tiens. Les vues viennent des statistiques publiques, sur 11 vidéos seulement.
