# Analyse de lynkai.lives-on.dev

Copie de l'interface publique : `index.html`, `style.css`, `app.js`.

## Où se trouve le prompt
Les prompts système sont écrits en clair dans `app.js` (objet `PERSONAS`, ligne ~59).
Le menu « Mode de l'assistant » choisit l'un d'eux : general, code, roblox, cyber, teacher.

## Comment il est contrôlé
`app.js` (~ligne 586) envoie à `POST /api/chat` :
- `messages` : les 30 derniers messages
- `systemInstruction` : le texte de `PERSONAS[mode choisi]`
- `temperature` : le curseur
- `modelProvider` : gemini / groq-llama / openrouter-free (gemini forcé si une image est jointe)

C'est le navigateur qui envoie le prompt, pas le serveur. Le reste (clés d'API, crédits,
modération via /api/moderation/*) se passe côté serveur et n'est pas visible.
Connexion : Supabase (config chargée depuis /api/config).
