# Histoires de fruits — version gratuite

Ce kit fait le même genre de vidéo que les sites payants de « fruit drama » : vidéo verticale 9:16, personnages fruits qui parlent avec des voix différentes, sous-titres mot par mot, musique et bruitages, accroche au début et question à la fin.

Tout est fait en code dans ce dépôt. Les seuls coûts éventuels sont les voix ElevenLabs, sur ton propre compte.

Exemple : `fruit-fraise-final.mp4` (« Elle rentre plus tôt… et découvre tout », 37 s).

## Faire un nouvel épisode (4 étapes)

1. **Écrire l'histoire** : copie `clawd-video/src/stories/fruit-fraise.json` en `fruit-<nom>.json`, puis change le casting, les voix et les répliques (voir le format plus bas).
2. **Déclarer l'épisode** : ajoute une ligne dans `clawd-video/src/fruit/registry.ts` :
   ```ts
   import pomme from '../stories/fruit-pomme.json';
   // ...
   pomme: pomme as unknown as FruitStory,
   ```
3. **Générer les voix** (ElevenLabs, avec les minutages mot par mot) :
   ```bash
   cd clawd-video && NODE_USE_ENV_PROXY=1 ELEVENLABS_API_KEY=ta_cle node scripts/voice.mjs fruit-pomme
   ```
4. **Rendre la vidéo, puis ajouter la musique et les bruitages** :
   ```bash
   cd clawd-video && npx remotion render src/index.ts Fruit-pomme out/fruit-pomme-raw.mp4
   ```
   ```bash
   cd .. && python3 tools/make_audio_fruit.py pomme clawd-video/out/fruit-pomme-raw.mp4 pieces/histoire-de-fruits/fruit-pomme-final.mp4
   ```

Pour voir l'épisode en direct pendant que tu le modifies : `cd clawd-video && npm run studio`.

## Format du JSON

```jsonc
{
  "title": "titre de la publication",
  "series": "DRAME DE FRUITS · ÉPISODE 2",   // petit bandeau en haut
  "ending": "TU AURAIS FAIT QUOI ?",          // bandeau de la question finale
  "voices": { "n": "<voice_id narrateur>", "a": "<voice_id>", "b": "<voice_id>" },
  "cast": {
    "a": { "name": "Pomme", "fruit": "apple", "acc": ["bow"] }
  },
  "segments": [
    {
      "speaker": "a",            // clé de "voices" ; "n" = narrateur (pas de bouche qui bouge)
      "bg": "kitchen",           // décor
      "focus": "a",              // personnage cadré par la caméra
      "show": [{ "id": "a", "x": 540, "emo": "angry", "enter": "pop" }],
      "fx": ["shake", "flash"],
      "prop": "cake",
      "hook": "TEXTE D'ACCROCHE",  // gros bandeau (1re scène)
      "text": "La réplique dite par la voix.",
      "highlight": ["réplique"]    // mots en jaune dans les sous-titres
    }
  ]
}
```

| Option | Valeurs |
|---|---|
| `fruit` | `strawberry` (fraise), `banana`, `peach` (pêche), `apple`, `orange`, `lemon`, `grape` (raisin), `kiwi` |
| `acc` (accessoires) | `bow` (nœud), `earrings`, `tie` (cravate), `lashes` (cils), `necklace` (collier) |
| `emo` | `neutral`, `happy`, `smug` (sûr de lui), `angry`, `shocked`, `scared`, `sad`, `wink` (clin d'œil) |
| dans `show` | `x` (0–1080, 540 = centre), `enter`: `left` / `right` / `pop`, `glasses`, `tears`, `sweat`, `scale` |
| `bg` | `street`, `kitchen`, `market` (nuit), `sunset`, `bedroom`, `office` |
| `fx` | `hook`, `shake`, `flash`, `zoom`, `hearts`, `rain`, `sparkles`, `question` |
| `prop` | `cake` (gâteau), `keys` (clés dans la main du personnage qui parle) |

**Voix qui fonctionnent avec ce compte** : narrateur `YV28ox2c5Cuh5rim0LrW`, homme `O31r762Gb3WFygrEOGh0`, femme `XB0fDUnXU5powFXDhCwa`, jeune femme `cgSgspJ2msm6clMCkdW9`. Autres voix testées : `21m00Tcm4TlvDq8ikWAM`, `pFZP5JQG7iQjIQuC4Bku`, `EXAVITQu4vr4xnSDxMaL`, `pNInz6obpgDQGcFmaJgB`, `onwK4e9ZLuTAKqWW03F9`, `N2lVS1w4EtoT3dr4eOWO`, `FGY2WhTYpPnrIDTdsKH5`.

## Recette d'un bon épisode (30–45 s)
- La 1re phrase montre déjà le conflit, avec un bandeau `hook`.
- Une révélation au milieu, marquée par `shake` et `flash` (la musique se coupe toute seule).
- Un retournement : le personnage trahi reprend le dessus.
- Une fin sur une question au public (`question`) pour faire réagir en commentaire.
- Des répliques courtes (une idée par réplique) et 3 personnages au maximum.

## Différence avec le site payant
Le site payant génère des images « 3D réalistes » avec une IA d'images. Ici, les personnages sont des dessins vectoriels animés (style dessin animé). C'est gratuit et illimité, et les personnages restent identiques d'un épisode à l'autre. Pour un rendu 3D réaliste, il faudrait un générateur d'images ou de vidéos IA, qui sont presque tous payants.
