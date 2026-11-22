# Identify by photo: counts

Batch 1 of issue 40. This is a count, not a training run and not a page. No photograph was downloaded, and no route was added.

## Recommendation

Do not train, and do not add `/identify/photo`, until the owner accepts which of these species a model would leave uncovered. The tables below are that list. They do not decide whether the totals are enough, whether NC photographs may be used, or whose machine would run the training.

Of 143 listed species, 1 has a null anywhere total because the name did not resolve. Those nulls are not counted as zero.

## How the count was made

Each scientific name was searched on the iNaturalist taxa API. An active Mammalia taxon was kept only when its name was the same, or iNaturalist returned our name as the matched synonym of exactly one taxon. A stored `inatTaxonId` was compared and was not used when the search failed.

The observation count is research-grade, non-captive, and has at least one photo under CC0, CC BY, CC BY-SA, CC BY-NC, or CC BY-NC-SA. The without-NC count drops the two NC licences. ND and all-rights-reserved are excluded. Kruger is iNaturalist place 69020 (Kruger National Park, ZA). South Africa is place 6986 (South Africa). Anywhere has no place filter.

Rest of South Africa is the South Africa total minus the Kruger total. That is the rest of the country only when every Kruger observation is also inside the South Africa place. This pass did not compare coordinates. When the South Africa total is smaller than the Kruger total, the rest is null.

A median or an under-20, under-50, or under-150 count uses only species whose total is a number. `null` in the summary is the number of species left unknown.

## Summary

Anywhere, with NC: median 216, under 20: 44, under 50: 55, under 150: 68, at least 50: 87, at least 150: 74, zero: 7, null: 1.

Anywhere, without NC: median 39, under 20: 67, under 50: 75, under 150: 96, at least 50: 67, at least 150: 46, zero: 30, null: 1.

Kruger, with NC: median 1.5, under 20: 92, under 50: 103, under 150: 113, at least 50: 39, at least 150: 29, zero: 63, null: 1.

Kruger, without NC: median 0, under 20: 111, under 50: 117, under 150: 126, at least 50: 25, at least 150: 16, zero: 76, null: 1.

Rest of South Africa, with NC: median 78.5, under 20: 55, under 50: 67, under 150: 81, at least 50: 75, at least 150: 61, zero: 22, null: 1.

Rest of South Africa, without NC: median 10, under 20: 77, under 50: 94, under 150: 115, at least 50: 48, at least 150: 27, zero: 41, null: 1.

Bats, order Chiroptera, are 41 of 143.

Bats anywhere, with NC: median 10.5, under 20: 28, under 50: 32, under 150: 36, at least 50: 8, at least 150: 4, zero: 6, null: 1.

Other species anywhere, with NC: median 794.5, under 20: 16, under 50: 23, under 150: 32, at least 50: 79, at least 150: 70, zero: 1, null: 0.

<!-- photo-summary -->
```json
{
  "all": {
    "species": 143,
    "withNc": {
      "kruger": {
        "median": 1.5,
        "under20": 92,
        "under50": 103,
        "under150": 113,
        "atLeast50": 39,
        "atLeast150": 29,
        "zero": 63,
        "counted": 142,
        "nulls": 1
      },
      "southAfrica": {
        "median": 88.5,
        "under20": 53,
        "under50": 64,
        "under150": 77,
        "atLeast50": 78,
        "atLeast150": 65,
        "zero": 21,
        "counted": 142,
        "nulls": 1
      },
      "restOfSouthAfrica": {
        "median": 78.5,
        "under20": 55,
        "under50": 67,
        "under150": 81,
        "atLeast50": 75,
        "atLeast150": 61,
        "zero": 22,
        "counted": 142,
        "nulls": 1
      },
      "anywhere": {
        "median": 216.0,
        "under20": 44,
        "under50": 55,
        "under150": 68,
        "atLeast50": 87,
        "atLeast150": 74,
        "zero": 7,
        "counted": 142,
        "nulls": 1
      }
    },
    "withoutNc": {
      "kruger": {
        "median": 0.0,
        "under20": 111,
        "under50": 117,
        "under150": 126,
        "atLeast50": 25,
        "atLeast150": 16,
        "zero": 76,
        "counted": 142,
        "nulls": 1
      },
      "southAfrica": {
        "median": 15.5,
        "under20": 76,
        "under50": 90,
        "under150": 110,
        "atLeast50": 52,
        "atLeast150": 32,
        "zero": 37,
        "counted": 142,
        "nulls": 1
      },
      "restOfSouthAfrica": {
        "median": 10.0,
        "under20": 77,
        "under50": 94,
        "under150": 115,
        "atLeast50": 48,
        "atLeast150": 27,
        "zero": 41,
        "counted": 142,
        "nulls": 1
      },
      "anywhere": {
        "median": 39.0,
        "under20": 67,
        "under50": 75,
        "under150": 96,
        "atLeast50": 67,
        "atLeast150": 46,
        "zero": 30,
        "counted": 142,
        "nulls": 1
      }
    }
  },
  "bats": {
    "species": 41,
    "withNc": {
      "kruger": {
        "median": 0.0,
        "under20": 39,
        "under50": 39,
        "under150": 40,
        "atLeast50": 1,
        "atLeast150": 0,
        "zero": 32,
        "counted": 40,
        "nulls": 1
      },
      "southAfrica": {
        "median": 1.0,
        "under20": 33,
        "under50": 36,
        "under150": 38,
        "atLeast50": 4,
        "atLeast150": 2,
        "zero": 19,
        "counted": 40,
        "nulls": 1
      },
      "restOfSouthAfrica": {
        "median": 0.5,
        "under20": 33,
        "under50": 36,
        "under150": 39,
        "atLeast50": 4,
        "atLeast150": 1,
        "zero": 20,
        "counted": 40,
        "nulls": 1
      },
      "anywhere": {
        "median": 10.5,
        "under20": 28,
        "under50": 32,
        "under150": 36,
        "atLeast50": 8,
        "atLeast150": 4,
        "zero": 6,
        "counted": 40,
        "nulls": 1
      }
    },
    "withoutNc": {
      "kruger": {
        "median": 0.0,
        "under20": 40,
        "under50": 40,
        "under150": 40,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 36,
        "counted": 40,
        "nulls": 1
      },
      "southAfrica": {
        "median": 0.0,
        "under20": 39,
        "under50": 40,
        "under150": 40,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 28,
        "counted": 40,
        "nulls": 1
      },
      "restOfSouthAfrica": {
        "median": 0.0,
        "under20": 39,
        "under50": 40,
        "under150": 40,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 29,
        "counted": 40,
        "nulls": 1
      },
      "anywhere": {
        "median": 0.0,
        "under20": 36,
        "under50": 40,
        "under150": 40,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 21,
        "counted": 40,
        "nulls": 1
      }
    }
  },
  "notBats": {
    "species": 102,
    "withNc": {
      "kruger": {
        "median": 14.5,
        "under20": 53,
        "under50": 64,
        "under150": 73,
        "atLeast50": 38,
        "atLeast150": 29,
        "zero": 31,
        "counted": 102,
        "nulls": 0
      },
      "southAfrica": {
        "median": 328.5,
        "under20": 20,
        "under50": 28,
        "under150": 39,
        "atLeast50": 74,
        "atLeast150": 63,
        "zero": 2,
        "counted": 102,
        "nulls": 0
      },
      "restOfSouthAfrica": {
        "median": 272.5,
        "under20": 22,
        "under50": 31,
        "under150": 42,
        "atLeast50": 71,
        "atLeast150": 60,
        "zero": 2,
        "counted": 102,
        "nulls": 0
      },
      "anywhere": {
        "median": 794.5,
        "under20": 16,
        "under50": 23,
        "under150": 32,
        "atLeast50": 79,
        "atLeast150": 70,
        "zero": 1,
        "counted": 102,
        "nulls": 0
      }
    },
    "withoutNc": {
      "kruger": {
        "median": 2.5,
        "under20": 71,
        "under50": 77,
        "under150": 86,
        "atLeast50": 25,
        "atLeast150": 16,
        "zero": 40,
        "counted": 102,
        "nulls": 0
      },
      "southAfrica": {
        "median": 51.5,
        "under20": 37,
        "under50": 50,
        "under150": 70,
        "atLeast50": 52,
        "atLeast150": 32,
        "zero": 9,
        "counted": 102,
        "nulls": 0
      },
      "restOfSouthAfrica": {
        "median": 44.0,
        "under20": 38,
        "under50": 54,
        "under150": 75,
        "atLeast50": 48,
        "atLeast150": 27,
        "zero": 12,
        "counted": 102,
        "nulls": 0
      },
      "anywhere": {
        "median": 104.5,
        "under20": 31,
        "under50": 35,
        "under150": 56,
        "atLeast50": 67,
        "atLeast150": 46,
        "zero": 9,
        "counted": 102,
        "nulls": 0
      }
    }
  }
}
```


## Species with no allowed photograph anywhere

These resolved species have an anywhere total of zero with NC included. Unresolved names are in the gaps, not in this list.

Tadarida fulminans, Rhinolophus swinnyi, Neoromicia anchieta, Neoromicia zuluensis, Pipistrellus rusticus, Scotophilus borbonicus, Crocidura silacea.

## Species already on the site

This is a count of files already in `data/species/details`, not the iNaturalist pool. An AI-generated image is an illustration, not a photograph. ND and all-rights-reserved would not be counted as displayable; the file count of those is in `site-files.json`.

Displayable photographs: 107 species, 381 files (265 without NC, 116 NC).

Illustrations: 1.

Species with no displayable photograph: 36.

## All species

| Species | Taxon | Match | Kruger | Rest of South Africa | Anywhere | Kruger without NC | Rest without NC | Anywhere without NC |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Calcochloris obtusirostris | 42519 | same name | 0 | 1 | 5 | 0 | 0 | 0 |
| Neamblysomus julianae | 42531 | same name | 0 | 35 | 35 | 0 | 2 | 2 |
| Aepyceros melampus | 42278 | same name | 2333 | 4238 | 14236 | 481 | 730 | 2306 |
| Alcelaphus buselaphus lichtensteinii | 132659 | same name | 10 | 1 | 140 | 1 | 0 | 13 |
| Cephalophorus natalensis | 1431002 | same name | 0 | 687 | 720 | 0 | 103 | 107 |
| Connochaetes taurinus | 42280 | same name | 1269 | 3146 | 9888 | 237 | 495 | 1488 |
| Damaliscus lunatus | 42276 | same name | 167 | 422 | 3027 | 26 | 51 | 361 |
| Hippotragus equinus | 42332 | same name | 32 | 200 | 1614 | 6 | 38 | 113 |
| Hippotragus niger | 42334 | same name | 111 | 628 | 1447 | 14 | 87 | 193 |
| Kobus ellipsiprymnus | 42328 | same name | 1462 | 2105 | 9078 | 245 | 266 | 1201 |
| Nesotragus moschatus | 74770 | same name | 0 | 41 | 716 | 0 | 1 | 444 |
| Oreotragus oreotragus | 42384 | same name | 403 | 2097 | 3214 | 66 | 402 | 561 |
| Ourebia ourebi | 42380 | same name | 0 | 124 | 901 | 0 | 39 | 100 |
| Pelea capreolus | 42336 | same name | 0 | 1023 | 1058 | 0 | 197 | 205 |
| Raphicerus campestris | 42375 | same name | 946 | 2109 | 4219 | 158 | 350 | 687 |
| Raphicerus sharpei | 42374 | same name | 150 | 47 | 258 | 34 | 6 | 45 |
| Redunca arundinum | 42305 | same name | 39 | 508 | 873 | 9 | 59 | 102 |
| Redunca fulvorufula | 42306 | same name | 1 | 416 | 438 | 0 | 71 | 73 |
| Sylvicapra grimmia | 42424 | same name | 250 | 2253 | 3352 | 41 | 420 | 544 |
| Syncerus caffer | 42405 | same name | 1768 | 2893 | 12100 | 300 | 515 | 1640 |
| Tragelaphus angasii | 42342 | same name | 711 | 3031 | 4172 | 116 | 515 | 687 |
| Tragelaphus oryx | 75192 | same name | 54 | 3031 | 5304 | 9 | 501 | 803 |
| Tragelaphus strepsiceros | 42339 | same name | 1538 | 4573 | 9302 | 287 | 683 | 1416 |
| Tragelaphus sylvaticus | 1431867 | same name | 776 | 3300 | 6088 | 117 | 494 | 912 |
| Giraffa giraffa | 1510571 | same name | 2514 | 5038 | 11205 | 475 | 725 | 1694 |
| Hippopotamus amphibius | 42149 | same name | 1851 | 2517 | 12260 | 323 | 361 | 1710 |
| Phacochoerus africanus | 42122 | same name | 1253 | 3915 | 12236 | 215 | 603 | 1713 |
| Potamochoerus larvatus | 42138 | same name | 2 | 542 | 733 | 2 | 162 | 185 |
| Lupulella adusta | 1210965 | same name | 46 | 137 | 846 | 11 | 7 | 65 |
| Lupulella mesomelas | 1210966 | same name | 413 | 1951 | 5814 | 80 | 281 | 838 |
| Lycaon pictus | 42093 | same name | 651 | 507 | 2036 | 96 | 57 | 248 |
| Otocyon megalotis | 42095 | same name | 0 | 635 | 1289 | 0 | 102 | 184 |
| Acinonyx jubatus | 41955 | same name | 418 | 990 | 4270 | 77 | 125 | 500 |
| Caracal caracal | 42042 | same name | 10 | 959 | 1264 | 0 | 143 | 164 |
| Felis lybica | 371414 | same name | 92 | 305 | 906 | 8 | 40 | 107 |
| Leptailurus serval | 42025 | same name | 22 | 258 | 1107 | 3 | 21 | 98 |
| Panthera leo | 41964 | same name | 1838 | 3039 | 15137 | 307 | 484 | 1924 |
| Panthera pardus | 41963 | same name | 1010 | 1894 | 7554 | 165 | 244 | 935 |
| Atilax paludinosus | 41919 | same name | 2 | 880 | 1129 | 0 | 147 | 183 |
| Helogale parvula | 41906 | same name | 655 | 421 | 1960 | 120 | 45 | 288 |
| Herpestes ichneumon | 41900 | same name | 0 | 162 | 1162 | 0 | 40 | 124 |
| Herpestes sanguineus | 74414 | same name | 235 | 556 | 1450 | 48 | 59 | 195 |
| Ichneumia albicauda | 41939 | same name | 16 | 146 | 717 | 1 | 14 | 71 |
| Mungos mungo | 41921 | same name | 115 | 880 | 3263 | 16 | 100 | 376 |
| Paracynictis selousi | 41937 | same name | 0 | 3 | 15 | 0 | 1 | 2 |
| Rhynchogale melleri | 41941 | same name | 0 | 25 | 30 | 0 | 1 | 1 |
| Crocuta crocuta | 41886 | same name | 1823 | 1091 | 7355 | 300 | 113 | 947 |
| Parahyaena brunnea | 500648 | same name | 0 | 390 | 647 | 0 | 59 | 84 |
| Proteles cristatus | 1306005 | same name | 0 | 337 | 435 | 0 | 53 | 60 |
| Ictonyx striatus | 41822 | same name | 0 | 248 | 322 | 0 | 43 | 51 |
| Lutra capensis | 1638841 | same name | 18 | 844 | 947 | 4 | 167 | 178 |
| Mellivora capensis | 41834 | same name | 135 | 405 | 984 | 22 | 58 | 117 |
| Civettictis civetta | 41627 | same name | 59 | 287 | 1072 | 6 | 27 | 100 |
| Genetta felina | 925659 | same name | 33 | 302 | 452 | 6 | 48 | 71 |
| Genetta fieldiana | 1643992 | same name | 129 | 454 | 1491 | 20 | 47 | 345 |
| Taphozous mauritianus | 41380 | same name | 51 | 121 | 436 | 3 | 14 | 35 |
| Hipposideros caffer | null | null | null | null | null | null | null | null |
| Hipposideros commersoni | 851027 | iNaturalist synonym | 0 | 0 | 49 | 0 | 0 | 7 |
| Miniopterus natalensis | 57530 | same name | 0 | 13 | 24 | 0 | 1 | 1 |
| Mops ansorgei | 1430965 | same name | 0 | 0 | 2 | 0 | 0 | 0 |
| Mops condylurus | 765544 | same name | 0 | 0 | 11 | 0 | 0 | 0 |
| Mops midas | 765553 | same name | 0 | 1 | 2 | 0 | 0 | 0 |
| Mops pumilus | 1370990 | same name | 1 | 13 | 31 | 0 | 3 | 3 |
| Tadarida aegyptiaca | 41300 | same name | 0 | 40 | 55 | 0 | 9 | 13 |
| Tadarida fulminans | 41296 | same name | 0 | 0 | 0 | 0 | 0 | 0 |
| Nycteris thebaica | 41192 | same name | 11 | 93 | 176 | 5 | 14 | 26 |
| Nycteris woodi | 41190 | same name | 0 | 0 | 2 | 0 | 0 | 1 |
| Epomophorus crypturus | 64485 | same name | 0 | 1 | 130 | 0 | 0 | 19 |
| Epomophorus wahlbergi | 40811 | same name | 0 | 238 | 260 | 0 | 40 | 43 |
| Rousettus aegyptiacus | 75042 | same name | 0 | 40 | 376 | 0 | 6 | 43 |
| Rhinolophus blasii | 40673 | same name | 0 | 0 | 19 | 0 | 0 | 3 |
| Rhinolophus clivosus | 320633 | same name | 0 | 4 | 17 | 0 | 0 | 0 |
| Rhinolophus darlingi | 338548 | same name | 1 | 0 | 2 | 0 | 0 | 0 |
| Rhinolophus fumigatus | 40684 | same name | 0 | 0 | 11 | 0 | 0 | 1 |
| Rhinolophus hildebrandtii | 183175 | same name | 0 | 2 | 7 | 0 | 0 | 0 |
| Rhinolophus landeri | 40680 | same name | 0 | 0 | 10 | 0 | 0 | 0 |
| Rhinolophus simulator | 40693 | same name | 0 | 0 | 4 | 0 | 0 | 0 |
| Rhinolophus swinnyi | 40670 | same name | 0 | 0 | 0 | 0 | 0 | 0 |
| Afronycteris nanus | 1431034 | same name | 1 | 8 | 27 | 0 | 0 | 1 |
| Cnephaeus hottentotus | 1596136 | same name | 1 | 5 | 6 | 1 | 0 | 1 |
| Glauconycteris variegata | 57549 | same name | 0 | 3 | 11 | 0 | 0 | 0 |
| Kerivoula argentata | 40456 | same name | 0 | 0 | 4 | 0 | 0 | 0 |
| Kerivoula lanosa | 40468 | same name | 0 | 1 | 1 | 0 | 0 | 0 |
| Laephotis angolensis | 40531 | same name | 0 | 0 | 2 | 0 | 0 | 0 |
| Laephotis capensis | 1431030 | same name | 0 | 91 | 93 | 0 | 16 | 17 |
| Myotis bocagii | 74698 | same name | 0 | 0 | 19 | 0 | 0 | 1 |
| Myotis tricolor | 40279 | same name | 0 | 10 | 18 | 0 | 2 | 2 |
| Myotis welwitschii | 40336 | same name | 1 | 2 | 18 | 0 | 1 | 1 |
| Neoromicia anchieta | 1431023 | same name | 0 | 0 | 0 | 0 | 0 | 0 |
| Neoromicia zuluensis | 765532 | same name | 0 | 0 | 0 | 0 | 0 | 0 |
| Nycticeinops schlieffenii | 57550 | same name | 0 | 0 | 7 | 0 | 0 | 0 |
| Pipistrellus hesperidus | 57536 | same name | 0 | 2 | 2 | 0 | 0 | 0 |
| Pipistrellus rusticus | 40361 | same name | 0 | 0 | 0 | 0 | 0 | 0 |
| Scotophilus borbonicus | 40441 | same name | 0 | 0 | 0 | 0 | 0 | 0 |
| Scotophilus dinganii | 40436 | same name | 4 | 36 | 61 | 2 | 1 | 4 |
| Vansonia rueppellii | 1431041 | same name | 0 | 0 | 5 | 0 | 0 | 0 |
| Atelerix frontalis | 43056 | same name | 0 | 84 | 104 | 0 | 4 | 5 |
| Crocidura cyanea | 46777 | same name | 0 | 21 | 21 | 0 | 2 | 2 |
| Crocidura fuscomurina | 46592 | same name | 0 | 3 | 5 | 0 | 1 | 1 |
| Crocidura hirta | 46621 | same name | 0 | 1 | 3 | 0 | 0 | 0 |
| Crocidura mariquensis | 46612 | same name | 0 | 1 | 1 | 0 | 0 | 0 |
| Crocidura silacea | 46772 | same name | 0 | 0 | 0 | 0 | 0 | 0 |
| Suncus lixa | 1370725 | same name | 0 | 1 | 1 | 0 | 1 | 1 |
| Heterohyrax brucei | 43088 | same name | 26 | 43 | 1227 | 7 | 11 | 174 |
| Procavia capensis | 43086 | same name | 38 | 4989 | 7307 | 4 | 928 | 1305 |
| Lepus capensis | 57560 | same name | 0 | 219 | 511 | 0 | 23 | 67 |
| Lepus saxatilis | 43125 | same name | 84 | 576 | 743 | 10 | 81 | 97 |
| Pronolagus crassicaudatus | 43158 | same name | 0 | 4 | 4 | 0 | 0 | 0 |
| Elephantulus brachyrhynchus | 43211 | same name | 1 | 9 | 17 | 0 | 1 | 1 |
| Elephantulus myurus | 43213 | same name | 13 | 73 | 115 | 2 | 8 | 14 |
| Petrodromus tetradactylus | 43226 | same name | 12 | 10 | 289 | 2 | 0 | 193 |
| Equus quagga | 43335 | same name | 1962 | 6137 | 17783 | 382 | 958 | 2668 |
| Ceratotherium simum | 43348 | same name | 652 | 2712 | 5456 | 114 | 324 | 685 |
| Diceros bicornis | 43350 | same name | 35 | 230 | 2107 | 10 | 51 | 288 |
| Smutsia temminckii | 75083 | same name | 9 | 68 | 192 | 2 | 8 | 17 |
| Chlorocebus pygerythrus | 68137 | same name | 1043 | 4797 | 10352 | 165 | 758 | 1447 |
| Papio ursinus | 57556 | same name | 1220 | 5690 | 9087 | 201 | 1118 | 1622 |
| Galago moholi | 43561 | same name | 44 | 197 | 352 | 5 | 27 | 44 |
| Otolemur crassicaudatus | 43567 | same name | 104 | 218 | 426 | 17 | 33 | 61 |
| Loxodonta africana | 43694 | same name | 3733 | 5527 | 22455 | 666 | 1053 | 3370 |
| Cryptomys hottentotus | 43749 | same name | 0 | 148 | 148 | 0 | 58 | 58 |
| Graphiurus murinus | 45848 | same name | 3 | 66 | 107 | 3 | 8 | 13 |
| Hystrix africaeaustralis | 44173 | same name | 43 | 3680 | 4090 | 8 | 756 | 799 |
| Aethomys chrysophilus | 45573 | same name | 0 | 3 | 12 | 0 | 2 | 6 |
| Dasymys incomtus | 45632 | same name | 0 | 0 | 1 | 0 | 0 | 0 |
| Gerbilliscus leucogaster | 74367 | same name | 3 | 9 | 28 | 0 | 3 | 6 |
| Grammomys dolichurus | 45253 | same name | 6 | 15 | 23 | 2 | 4 | 7 |
| Lemniscomys rosalia | 45500 | same name | 7 | 45 | 69 | 1 | 3 | 6 |
| Mastomys coucha | 45328 | same name | 0 | 3 | 3 | 0 | 1 | 1 |
| Mastomys natalensis | 45326 | same name | 0 | 4 | 17 | 0 | 3 | 7 |
| Micaelamys namaquensis | 851046 | same name | 1 | 54 | 72 | 1 | 14 | 17 |
| Mus minutoides | 44716 | same name | 4 | 103 | 147 | 1 | 27 | 33 |
| Otomys angoniensis | 45439 | same name | 0 | 5 | 6 | 0 | 0 | 0 |
| Thallomys paedulcus | 45414 | same name | 8 | 4 | 36 | 1 | 0 | 3 |
| Cricetomys ansorgei | 1453959 | same name | 5 | 8 | 225 | 0 | 1 | 152 |
| Dendromus melanotis | 44971 | same name | 0 | 25 | 35 | 0 | 2 | 3 |
| Dendromus mystacalis | 44976 | same name | 0 | 1 | 6 | 0 | 0 | 0 |
| Saccostomus campestris | 44509 | same name | 3 | 23 | 51 | 0 | 5 | 11 |
| Steatomys pratensis | 44923 | same name | 0 | 1 | 7 | 0 | 0 | 0 |
| Pedetes capensis | 45929 | same name | 41 | 161 | 281 | 10 | 26 | 52 |
| Paraxerus cepapi | 46110 | same name | 808 | 641 | 2612 | 126 | 85 | 387 |
| Thryonomys swinderianus | 46279 | same name | 13 | 119 | 207 | 0 | 22 | 23 |
| Orycteropus afer | 47062 | same name | 3 | 661 | 1028 | 0 | 145 | 158 |

## Gaps

- ambiguous exact name: 1565169 complex Hipposideros caffer; 40761 species Hipposideros caffer (1): hipposideros-caffer
- stored inatTaxonId differs from the scientific-name match (1): hipposideros-commersoni
- taxon id is null, so photo counts are null (1): hipposideros-caffer


## Not decided

This batch does not answer these questions from the plan:

1. What is close enough to train? The suggested bar was how many species have at least 50 allowed photographs anywhere, with and without NC. Bats can be left uncovered if the owner would rather the model cover animals a visitor can photograph.
2. Train on CC BY-NC photographs, and license the weights CC BY-NC-SA 4.0?
3. Is the one training run on the owner's machine?
4. Should a later public training manifest omit observation ids for black rhino, white rhino, pangolin, and Juliana's golden mole?
5. Add Playwright for browser tests, or keep a node:test stand-in?
6. Is a short `/credits` page acceptable in a later photo-page pull request?

No cloud GPU, hosted model, new bucket, or public model repository was created. The site already binds an R2 bucket for species media. This batch does not add a model file.
