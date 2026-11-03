#!/usr/bin/env bash
# Réencode n'importe quelle vidéo dans un format qui se lit partout : h264 High 4.0, yuv420p, 30 i/s, AAC, lecture immédiate (faststart).
# Corrige le défaut « la vidéo ne marche pas » (couleurs yuvj420p, infos à la fin du fichier, HEVC).
# usage : encode_safe.sh <entrée.mp4> <sortie.mp4>
set -euo pipefail
ffmpeg -v error -y -i "$1" -vf "scale=in_range=pc:out_range=tv,format=yuv420p" -c:v libx264 -profile:v high -level 4.0 -preset medium -crf 20 -r 30 \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$2"
ffmpeg -v error -i "$2" -f null - && echo "ok : $2 se décode sans erreur"
