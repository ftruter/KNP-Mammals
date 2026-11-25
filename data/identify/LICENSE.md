# KNP Mammals recognisers: licence and credits

The model files in this folder are released under the Creative Commons
Attribution-NonCommercial-ShareAlike 4.0 licence (CC BY-NC-SA 4.0):
https://creativecommons.org/licenses/by-nc-sa/4.0/

They run in the browser on https://mammals.truter.world/identify.

## Photo recogniser (knp-mammals-photo-int8.tflite)

- 85 Kruger mammal species. Fine-tuned from timm
  `mobilenetv4_conv_medium.e250_r384_in12k` (Apache 2.0).
- Trained on 29,563 iNaturalist photographs by 5,148 photographers, under
  CC0, CC BY, CC BY-SA, CC BY-NC and CC BY-NC-SA. Every photograph, its
  photographer and its licence are listed in
  https://github.com/ftruter/KNP-Mammals/blob/main/data/identify/photo-training.csv.gz
- For black rhinoceros, white rhinoceros and Temminck's ground pangolin the
  list gives no observation number and no place.

## Sound recogniser (knp-mammals-sound-norm-fp16.tflite)

- 10 Kruger mammal species. BirdNET GLOBAL 6K V2.4 (Stefan Kahl, Connor M.
  Wood, Maximilian Eibl and Holger Klinck; CC BY-NC-SA 4.0) with a new
  classifier trained with BirdNET-Analyzer.
- Trained on 288 recordings from iNaturalist and xeno-canto, listed with
  their recordists and licences in
  https://github.com/ftruter/KNP-Mammals/blob/main/data/identify/sound-training.csv.gz
- Noise used to make it robust: ESC-50 (Karol J. Piczak, CC BY-NC 3.0),
  LibriSpeech dev-clean (Vassil Panayotov, Guoguo Chen, Daniel Povey and
  Sanjeev Khudanpur, CC BY 4.0) and synthetic wind.
- Input: 3 seconds of mono audio at 48 kHz. Each window has its mean removed
  and is scaled so that its loudest sample is 0.9, with at most +40 dB of gain.

Kahl, S., Wood, C. M., Eibl, M., & Klinck, H. (2021). BirdNET: A deep learning
solution for avian diversity monitoring. Ecological Informatics 61, 101236.

Bats are omitted from photo recognition because of a lack of quality training
data, and from sound recognition because consumer phones cannot record
ultrasonic sound.
