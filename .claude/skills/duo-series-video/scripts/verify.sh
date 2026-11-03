#!/usr/bin/env bash
# Vérifications mesurées d'une vidéo verticale (format, son, rythme, accroche, boucle, débit de la voix) + planche de contact.
# usage (racine du dépôt) : verify.sh <video.mp4> [slug]     → avec un slug, mesure aussi le débit de la voix
set -euo pipefail
V="$1"; SLUG="${2:-}"
ARGS=(--sheet "${V%.mp4}-planche.png")
[ -n "$SLUG" ] && ARGS+=(--timings "clawd-video/public/voice/$SLUG/timings.json")
python3 tools/review_video.py "$V" "${ARGS[@]}"
