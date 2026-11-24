#!/bin/bash
# Counts only. No photographs, no audio, no training.
set -euo pipefail
cd /agent/repos/KNP-Mammals
python3 spike/identify-photo/map-taxa.py
python3 spike/identify-sound/survey-models.py &
survey_pid=$!
python3 spike/identify-photo/count-photos.py
python3 spike/identify-sound/count-sounds.py
wait "$survey_pid"
echo INAT_DONE
