# Recordings

A clip lives on the species file, in `calls[].recordings[]`. The page plays it from the bucket when `hosted` is true, and from `fileUrl` otherwise. Cleaning a file and putting it in the bucket belong to issue 37. Leave an existing `hosted` flag as it is. A newly added clip stays a hotlink (`hosted` false) until that work is done.

## What to store

`source`, `fileUrl`, `author`, `license`, and `licenceUrl`. `aiGenerated` is false. `quality` is the xeno-canto letter when the response has one, and is omitted for iNaturalist.

## Licences

Allowed: CC0, CC BY, CC BY-SA, CC BY-NC, CC BY-NC-SA. ND and all-rights-reserved are not added, including as link-only.

## Which file

One new playable clip per empty slot. Stop at the first file that passes the filters. Lookups, in order:

1. iNaturalist observations for the species taxon, research grade, with a sound, in place 69020. If that set is empty, one follow-up for place 6986 is part of the same lookup.
2. xeno-canto API v3 for `gen:` and `sp:`, only when `XENO_CANTO_API_KEY` is available. Take the author, grade, licence, and file URL from the response. Skip unrated files.
3. Wikimedia Commons audio (ogg, wav, webm, or mp3) for the scientific name. Read the licence off that file.

When several files are in hand, use this order: a file the page can play, then grade A before B, then C, D, and E; a matching call type before a mismatch; Kruger, then the rest of South Africa, then southern Africa, then elsewhere. Do not replace a grade A clip. Fill a male or female slot only when the source labels the sex.

## Place

Keep as much place detail as the source gives, including a camp, road, waterhole, hide, picnic site, or gate when the source names one. A clip from outside Kruger keeps its real place and is not labelled Kruger.

White rhinoceros, black rhinoceros, and Temminck's pangolin are the exception. The recording place is "Kruger National Park" and nothing finer, and the place and note do not cite an iNaturalist or xeno-canto observation. Juliana's golden mole keeps the full place the source gives.

## Left out

In-hand, dead, or handled animals. Spectrogram images. For bats, rest-camp, roof, and building recordings. A file identified only to a lumped parent. Time-expanded, pitch-shifted, denoised, or ultrasonic files. A sourced sentence may still describe an ultrasonic call.

Macaulay Library is not a lookup. Freesound, YouTube, Skinner, and Stuart are out of this work.
