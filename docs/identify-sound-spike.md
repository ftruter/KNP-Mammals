# Identify by sound: counts

Batch 1 of issue 40. This is a count and a label survey, not a training run and not a page. No audio was downloaded, and no route was added.

## Recommendation

Do not add `/identify/sound` until the owner accepts an existing model and the species it cannot name, including bats a phone microphone cannot hear. The species files already hold 12 playable recordings across 9 species. A model trained on those recordings is not a plan.

The largest numeric overlap is 18 of 143 in `birdnet-plus-v3-global-12k` (BirdNET+ V3.0 Global 12K). That is not a decision to use the model or to add `/identify/sound`.

## Phone and bats

41 of 143 listed species are bats (order Chiroptera). Most echolocation is above a phone microphone, so a phone page cannot name those calls. Bat-detector hardware is out of this issue.

Fetched pages that state a sample rate:

- The fetched BSG-BAT card says the model takes 384 kHz ultrasonic audio.
- The fetched BattyBirdNET card says bat recordings at 256 kHz are passed to BirdNET without resampling.

## iNaturalist

Observations are research-grade, non-captive, and have at least one sound under CC0, CC BY, CC BY-SA, CC BY-NC, or CC BY-NC-SA. The without-NC count drops the two NC licences. A clip is a sound file with one of those licence codes on the returned observations. South Africa clips were not paged, so those clip cells are null. ND observations are counted separately and are not reusable.

Rest of South Africa is the South Africa observation total minus the Kruger total, with the same limit as the photo count: it is null when the South Africa total is smaller.

Anywhere observations, with NC: median 0, under 20: 136, under 50: 142, under 150: 142, at least 50: 0, at least 150: 0, zero: 99, null: 1.

Anywhere observations, without NC: median 0, under 20: 142, under 50: 142, under 150: 142, at least 50: 0, at least 150: 0, zero: 121, null: 1.

Kruger observations, with NC: median 0, under 20: 142, under 50: 142, under 150: 142, at least 50: 0, at least 150: 0, zero: 132, null: 1.

Clips with NC: 335 anywhere across 43 species (1 null), and 19 in Kruger across 10 species. Clips without NC: 47 anywhere across 21 species.

iNaturalist and xeno-canto are separate counts. They were not deduplicated, and the totals are not added.

<!-- sound-summary -->
```json
{
  "all": {
    "species": 143,
    "withNc": {
      "kruger": {
        "median": 0.0,
        "under20": 142,
        "under50": 142,
        "under150": 142,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 132,
        "counted": 142,
        "nulls": 1
      },
      "southAfrica": {
        "median": 0.0,
        "under20": 138,
        "under50": 142,
        "under150": 142,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 110,
        "counted": 142,
        "nulls": 1
      },
      "restOfSouthAfrica": {
        "median": 0.0,
        "under20": 140,
        "under50": 142,
        "under150": 142,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 114,
        "counted": 142,
        "nulls": 1
      },
      "anywhere": {
        "median": 0.0,
        "under20": 136,
        "under50": 142,
        "under150": 142,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 99,
        "counted": 142,
        "nulls": 1
      }
    },
    "withoutNc": {
      "kruger": {
        "median": 0.0,
        "under20": 142,
        "under50": 142,
        "under150": 142,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 139,
        "counted": 142,
        "nulls": 1
      },
      "southAfrica": {
        "median": 0.0,
        "under20": 142,
        "under50": 142,
        "under150": 142,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 131,
        "counted": 142,
        "nulls": 1
      },
      "restOfSouthAfrica": {
        "median": 0.0,
        "under20": 142,
        "under50": 142,
        "under150": 142,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 133,
        "counted": 142,
        "nulls": 1
      },
      "anywhere": {
        "median": 0.0,
        "under20": 142,
        "under50": 142,
        "under150": 142,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 121,
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
        "under20": 40,
        "under50": 40,
        "under150": 40,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 38,
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
        "zero": 34,
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
        "zero": 36,
        "counted": 40,
        "nulls": 1
      },
      "anywhere": {
        "median": 0.0,
        "under20": 39,
        "under50": 40,
        "under150": 40,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 30,
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
        "zero": 38,
        "counted": 40,
        "nulls": 1
      },
      "southAfrica": {
        "median": 0.0,
        "under20": 40,
        "under50": 40,
        "under150": 40,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 37,
        "counted": 40,
        "nulls": 1
      },
      "restOfSouthAfrica": {
        "median": 0.0,
        "under20": 40,
        "under50": 40,
        "under150": 40,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 39,
        "counted": 40,
        "nulls": 1
      },
      "anywhere": {
        "median": 0.0,
        "under20": 40,
        "under50": 40,
        "under150": 40,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 34,
        "counted": 40,
        "nulls": 1
      }
    }
  },
  "notBats": {
    "species": 102,
    "withNc": {
      "kruger": {
        "median": 0.0,
        "under20": 102,
        "under50": 102,
        "under150": 102,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 94,
        "counted": 102,
        "nulls": 0
      },
      "southAfrica": {
        "median": 0.0,
        "under20": 99,
        "under50": 102,
        "under150": 102,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 76,
        "counted": 102,
        "nulls": 0
      },
      "restOfSouthAfrica": {
        "median": 0.0,
        "under20": 101,
        "under50": 102,
        "under150": 102,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 78,
        "counted": 102,
        "nulls": 0
      },
      "anywhere": {
        "median": 0.0,
        "under20": 97,
        "under50": 102,
        "under150": 102,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 69,
        "counted": 102,
        "nulls": 0
      }
    },
    "withoutNc": {
      "kruger": {
        "median": 0.0,
        "under20": 102,
        "under50": 102,
        "under150": 102,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 101,
        "counted": 102,
        "nulls": 0
      },
      "southAfrica": {
        "median": 0.0,
        "under20": 102,
        "under50": 102,
        "under150": 102,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 94,
        "counted": 102,
        "nulls": 0
      },
      "restOfSouthAfrica": {
        "median": 0.0,
        "under20": 102,
        "under50": 102,
        "under150": 102,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 94,
        "counted": 102,
        "nulls": 0
      },
      "anywhere": {
        "median": 0.0,
        "under20": 102,
        "under50": 102,
        "under150": 102,
        "atLeast50": 0,
        "atLeast150": 0,
        "zero": 87,
        "counted": 102,
        "nulls": 0
      }
    }
  }
}
```


| Species | Kruger observations | Anywhere observations | Kruger clips | Anywhere clips | Anywhere without NC | ND observations anywhere |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Calcochloris obtusirostris | 0 | 0 | 0 | 0 | 0 | 0 |
| Neamblysomus julianae | 0 | 0 | 0 | 0 | 0 | 0 |
| Aepyceros melampus | 0 | 2 | 0 | 2 | 0 | 0 |
| Alcelaphus buselaphus lichtensteinii | 0 | 0 | 0 | 0 | 0 | 0 |
| Cephalophorus natalensis | 0 | 0 | 0 | 0 | 0 | 0 |
| Connochaetes taurinus | 0 | 4 | 0 | 5 | 1 | 0 |
| Damaliscus lunatus | 0 | 0 | 0 | 0 | 0 | 0 |
| Hippotragus equinus | 0 | 1 | 0 | 1 | 0 | 0 |
| Hippotragus niger | 0 | 1 | 0 | 1 | 0 | 0 |
| Kobus ellipsiprymnus | 0 | 0 | 0 | 0 | 0 | 0 |
| Nesotragus moschatus | 0 | 0 | 0 | 0 | 0 | 0 |
| Oreotragus oreotragus | 0 | 3 | 0 | 3 | 2 | 0 |
| Ourebia ourebi | 0 | 0 | 0 | 0 | 0 | 0 |
| Pelea capreolus | 0 | 2 | 0 | 2 | 1 | 0 |
| Raphicerus campestris | 0 | 0 | 0 | 0 | 0 | 0 |
| Raphicerus sharpei | 0 | 0 | 0 | 0 | 0 | 0 |
| Redunca arundinum | 0 | 2 | 0 | 3 | 0 | 0 |
| Redunca fulvorufula | 0 | 1 | 0 | 1 | 0 | 0 |
| Sylvicapra grimmia | 0 | 0 | 0 | 0 | 0 | 0 |
| Syncerus caffer | 0 | 2 | 0 | 2 | 0 | 0 |
| Tragelaphus angasii | 0 | 0 | 0 | 0 | 0 | 0 |
| Tragelaphus oryx | 0 | 0 | 0 | 0 | 0 | 0 |
| Tragelaphus strepsiceros | 0 | 1 | 0 | 1 | 0 | 0 |
| Tragelaphus sylvaticus | 0 | 0 | 0 | 0 | 0 | 0 |
| Giraffa giraffa | 0 | 0 | 0 | 0 | 0 | 0 |
| Hippopotamus amphibius | 1 | 8 | 1 | 8 | 1 | 0 |
| Phacochoerus africanus | 0 | 1 | 0 | 1 | 0 | 0 |
| Potamochoerus larvatus | 0 | 0 | 0 | 0 | 0 | 0 |
| Lupulella adusta | 0 | 1 | 0 | 4 | 0 | 0 |
| Lupulella mesomelas | 1 | 23 | 1 | 26 | 2 | 0 |
| Lycaon pictus | 0 | 3 | 0 | 3 | 0 | 0 |
| Otocyon megalotis | 0 | 0 | 0 | 0 | 0 | 0 |
| Acinonyx jubatus | 0 | 1 | 0 | 1 | 0 | 0 |
| Caracal caracal | 0 | 1 | 0 | 1 | 0 | 0 |
| Felis lybica | 0 | 0 | 0 | 0 | 0 | 0 |
| Leptailurus serval | 0 | 0 | 0 | 0 | 0 | 0 |
| Panthera leo | 1 | 24 | 1 | 30 | 3 | 0 |
| Panthera pardus | 0 | 3 | 0 | 3 | 0 | 0 |
| Atilax paludinosus | 0 | 0 | 0 | 0 | 0 | 0 |
| Helogale parvula | 0 | 1 | 0 | 2 | 0 | 0 |
| Herpestes ichneumon | 0 | 0 | 0 | 0 | 0 | 0 |
| Herpestes sanguineus | 0 | 0 | 0 | 0 | 0 | 0 |
| Ichneumia albicauda | 0 | 3 | 0 | 5 | 0 | 0 |
| Mungos mungo | 0 | 5 | 0 | 6 | 2 | 0 |
| Paracynictis selousi | 0 | 0 | 0 | 0 | 0 | 0 |
| Rhynchogale melleri | 0 | 0 | 0 | 0 | 0 | 0 |
| Crocuta crocuta | 10 | 45 | 10 | 49 | 6 | 0 |
| Parahyaena brunnea | 0 | 0 | 0 | 0 | 0 | 0 |
| Proteles cristatus | 0 | 0 | 0 | 0 | 0 | 0 |
| Ictonyx striatus | 0 | 0 | 0 | 0 | 0 | 0 |
| Lutra capensis | 0 | 0 | 0 | 0 | 0 | 0 |
| Mellivora capensis | 0 | 0 | 0 | 0 | 0 | 0 |
| Civettictis civetta | 0 | 0 | 0 | 0 | 0 | 0 |
| Genetta felina | 0 | 0 | 0 | 0 | 0 | 0 |
| Genetta fieldiana | 0 | 0 | 0 | 0 | 0 | 0 |
| Taphozous mauritianus | 0 | 0 | 0 | 0 | 0 | 0 |
| Hipposideros caffer | null | null | null | null | null | null |
| Hipposideros commersoni | 0 | 0 | 0 | 0 | 0 | 0 |
| Miniopterus natalensis | 0 | 0 | 0 | 0 | 0 | 0 |
| Mops ansorgei | 0 | 0 | 0 | 0 | 0 | 0 |
| Mops condylurus | 0 | 0 | 0 | 0 | 0 | 0 |
| Mops midas | 0 | 0 | 0 | 0 | 0 | 0 |
| Mops pumilus | 0 | 0 | 0 | 0 | 0 | 0 |
| Tadarida aegyptiaca | 0 | 0 | 0 | 0 | 0 | 0 |
| Tadarida fulminans | 0 | 0 | 0 | 0 | 0 | 0 |
| Nycteris thebaica | 0 | 1 | 0 | 1 | 0 | 0 |
| Nycteris woodi | 0 | 0 | 0 | 0 | 0 | 0 |
| Epomophorus crypturus | 0 | 3 | 0 | 3 | 1 | 0 |
| Epomophorus wahlbergi | 0 | 26 | 0 | 27 | 6 | 0 |
| Rousettus aegyptiacus | 0 | 9 | 0 | 9 | 1 | 0 |
| Rhinolophus blasii | 0 | 1 | 0 | 1 | 0 | 0 |
| Rhinolophus clivosus | 0 | 2 | 0 | 2 | 0 | 0 |
| Rhinolophus darlingi | 0 | 0 | 0 | 0 | 0 | 0 |
| Rhinolophus fumigatus | 0 | 0 | 0 | 0 | 0 | 0 |
| Rhinolophus hildebrandtii | 0 | 0 | 0 | 0 | 0 | 0 |
| Rhinolophus landeri | 0 | 1 | 0 | 1 | 1 | 0 |
| Rhinolophus simulator | 0 | 0 | 0 | 0 | 0 | 0 |
| Rhinolophus swinnyi | 0 | 0 | 0 | 0 | 0 | 0 |
| Afronycteris nanus | 0 | 0 | 0 | 0 | 0 | 0 |
| Cnephaeus hottentotus | 1 | 1 | 1 | 1 | 1 | 0 |
| Glauconycteris variegata | 0 | 0 | 0 | 0 | 0 | 0 |
| Kerivoula argentata | 0 | 0 | 0 | 0 | 0 | 0 |
| Kerivoula lanosa | 0 | 0 | 0 | 0 | 0 | 0 |
| Laephotis angolensis | 0 | 0 | 0 | 0 | 0 | 0 |
| Laephotis capensis | 0 | 1 | 0 | 1 | 0 | 0 |
| Myotis bocagii | 0 | 0 | 0 | 0 | 0 | 0 |
| Myotis tricolor | 0 | 0 | 0 | 0 | 0 | 0 |
| Myotis welwitschii | 0 | 0 | 0 | 0 | 0 | 0 |
| Neoromicia anchieta | 0 | 0 | 0 | 0 | 0 | 0 |
| Neoromicia zuluensis | 0 | 0 | 0 | 0 | 0 | 0 |
| Nycticeinops schlieffenii | 0 | 0 | 0 | 0 | 0 | 0 |
| Pipistrellus hesperidus | 0 | 0 | 0 | 0 | 0 | 0 |
| Pipistrellus rusticus | 0 | 0 | 0 | 0 | 0 | 0 |
| Scotophilus borbonicus | 0 | 0 | 0 | 0 | 0 | 0 |
| Scotophilus dinganii | 1 | 1 | 1 | 1 | 1 | 0 |
| Vansonia rueppellii | 0 | 0 | 0 | 0 | 0 | 0 |
| Atelerix frontalis | 0 | 0 | 0 | 0 | 0 | 0 |
| Crocidura cyanea | 0 | 0 | 0 | 0 | 0 | 0 |
| Crocidura fuscomurina | 0 | 0 | 0 | 0 | 0 | 0 |
| Crocidura hirta | 0 | 0 | 0 | 0 | 0 | 0 |
| Crocidura mariquensis | 0 | 0 | 0 | 0 | 0 | 0 |
| Crocidura silacea | 0 | 0 | 0 | 0 | 0 | 0 |
| Suncus lixa | 0 | 0 | 0 | 0 | 0 | 0 |
| Heterohyrax brucei | 0 | 4 | 0 | 5 | 0 | 0 |
| Procavia capensis | 0 | 7 | 0 | 8 | 2 | 0 |
| Lepus capensis | 0 | 0 | 0 | 0 | 0 | 0 |
| Lepus saxatilis | 0 | 0 | 0 | 0 | 0 | 0 |
| Pronolagus crassicaudatus | 0 | 0 | 0 | 0 | 0 | 0 |
| Elephantulus brachyrhynchus | 0 | 0 | 0 | 0 | 0 | 0 |
| Elephantulus myurus | 0 | 0 | 0 | 0 | 0 | 0 |
| Petrodromus tetradactylus | 0 | 0 | 0 | 0 | 0 | 0 |
| Equus quagga | 0 | 2 | 0 | 3 | 1 | 0 |
| Ceratotherium simum | 0 | 0 | 0 | 0 | 0 | 0 |
| Diceros bicornis | 0 | 0 | 0 | 0 | 0 | 0 |
| Smutsia temminckii | 0 | 0 | 0 | 0 | 0 | 0 |
| Chlorocebus pygerythrus | 1 | 34 | 1 | 39 | 3 | 0 |
| Papio ursinus | 1 | 28 | 1 | 31 | 4 | 0 |
| Galago moholi | 0 | 1 | 0 | 2 | 1 | 0 |
| Otolemur crassicaudatus | 1 | 3 | 1 | 3 | 0 | 0 |
| Loxodonta africana | 0 | 13 | 0 | 20 | 1 | 1 |
| Cryptomys hottentotus | 0 | 0 | 0 | 0 | 0 | 0 |
| Graphiurus murinus | 0 | 0 | 0 | 0 | 0 | 0 |
| Hystrix africaeaustralis | 0 | 1 | 0 | 1 | 0 | 0 |
| Aethomys chrysophilus | 0 | 0 | 0 | 0 | 0 | 0 |
| Dasymys incomtus | 0 | 0 | 0 | 0 | 0 | 0 |
| Gerbilliscus leucogaster | 0 | 0 | 0 | 0 | 0 | 0 |
| Grammomys dolichurus | 0 | 0 | 0 | 0 | 0 | 0 |
| Lemniscomys rosalia | 0 | 0 | 0 | 0 | 0 | 0 |
| Mastomys coucha | 0 | 0 | 0 | 0 | 0 | 0 |
| Mastomys natalensis | 0 | 0 | 0 | 0 | 0 | 0 |
| Micaelamys namaquensis | 0 | 0 | 0 | 0 | 0 | 0 |
| Mus minutoides | 0 | 0 | 0 | 0 | 0 | 0 |
| Otomys angoniensis | 0 | 0 | 0 | 0 | 0 | 0 |
| Thallomys paedulcus | 0 | 0 | 0 | 0 | 0 | 0 |
| Cricetomys ansorgei | 0 | 0 | 0 | 0 | 0 | 0 |
| Dendromus melanotis | 0 | 0 | 0 | 0 | 0 | 0 |
| Dendromus mystacalis | 0 | 0 | 0 | 0 | 0 | 0 |
| Saccostomus campestris | 0 | 0 | 0 | 0 | 0 | 0 |
| Steatomys pratensis | 0 | 0 | 0 | 0 | 0 | 0 |
| Pedetes capensis | 0 | 0 | 0 | 0 | 0 | 0 |
| Paraxerus cepapi | 1 | 15 | 1 | 16 | 2 | 0 |
| Thryonomys swinderianus | 0 | 0 | 0 | 0 | 0 | 0 |
| Orycteropus afer | 0 | 0 | 0 | 0 | 0 | 0 |

## xeno-canto

Public explore HTML at xeno-canto.org/explore. API v3 was not called because it requires a member key and this project has none. No audio was downloaded. ND recordings are counted separately and are not reusable.

The terms page says each recordist chooses a Creative Commons licence. BY-NC-ND is named as the most restrictive of the licences they describe. Terms page: https://xeno-canto.org/about/terms.

xeno-canto has no place for Kruger National Park (iNaturalist place 69020). A country filter is not that park, so the Kruger count is null.

Anywhere, reusable (with NC): 112 recordings across 30 species, with 0 species null.

Anywhere, without NC: 0 recordings, 0 species null.

Anywhere, ND (link only): 68 recordings, 0 species null.

South Africa, reusable (with NC): 39 recordings across 13 species, with 0 species null.

<!-- xc-summary -->
```json
{
  "anywhere": {
    "withNc": {
      "speciesWithAny": 30,
      "recordings": 112,
      "counted": 143,
      "nulls": 0
    },
    "withoutNc": {
      "speciesWithAny": 0,
      "recordings": 0,
      "counted": 143,
      "nulls": 0
    },
    "nd": {
      "speciesWithAny": 31,
      "recordings": 68,
      "counted": 143,
      "nulls": 0
    }
  },
  "southAfrica": {
    "withNc": {
      "speciesWithAny": 13,
      "recordings": 39,
      "counted": 143,
      "nulls": 0
    },
    "withoutNc": {
      "speciesWithAny": 0,
      "recordings": 0,
      "counted": 143,
      "nulls": 0
    },
    "nd": {
      "speciesWithAny": 10,
      "recordings": 11,
      "counted": 143,
      "nulls": 0
    }
  }
}
```


| Species | Anywhere with NC | Anywhere without NC | Anywhere ND | South Africa with NC |
| --- | ---: | ---: | ---: | ---: |
| Calcochloris obtusirostris | 0 | 0 | 0 | 0 |
| Neamblysomus julianae | 0 | 0 | 0 | 0 |
| Aepyceros melampus | 5 | 0 | 1 | 4 |
| Alcelaphus buselaphus lichtensteinii | 0 | 0 | 0 | 0 |
| Cephalophorus natalensis | 0 | 0 | 0 | 0 |
| Connochaetes taurinus | 3 | 0 | 0 | 1 |
| Damaliscus lunatus | 0 | 0 | 0 | 0 |
| Hippotragus equinus | 0 | 0 | 0 | 0 |
| Hippotragus niger | 0 | 0 | 0 | 0 |
| Kobus ellipsiprymnus | 1 | 0 | 0 | 0 |
| Nesotragus moschatus | 2 | 0 | 0 | 0 |
| Oreotragus oreotragus | 0 | 0 | 0 | 0 |
| Ourebia ourebi | 0 | 0 | 0 | 0 |
| Pelea capreolus | 0 | 0 | 0 | 0 |
| Raphicerus campestris | 0 | 0 | 0 | 0 |
| Raphicerus sharpei | 0 | 0 | 0 | 0 |
| Redunca arundinum | 0 | 0 | 0 | 0 |
| Redunca fulvorufula | 0 | 0 | 0 | 0 |
| Sylvicapra grimmia | 0 | 0 | 0 | 0 |
| Syncerus caffer | 3 | 0 | 0 | 2 |
| Tragelaphus angasii | 0 | 0 | 0 | 0 |
| Tragelaphus oryx | 0 | 0 | 1 | 0 |
| Tragelaphus strepsiceros | 0 | 0 | 2 | 0 |
| Tragelaphus sylvaticus | 0 | 0 | 2 | 0 |
| Giraffa giraffa | 0 | 0 | 0 | 0 |
| Hippopotamus amphibius | 18 | 0 | 4 | 11 |
| Phacochoerus africanus | 2 | 0 | 0 | 0 |
| Potamochoerus larvatus | 0 | 0 | 1 | 0 |
| Lupulella adusta | 0 | 0 | 0 | 0 |
| Lupulella mesomelas | 2 | 0 | 1 | 1 |
| Lycaon pictus | 0 | 0 | 0 | 0 |
| Otocyon megalotis | 0 | 0 | 1 | 0 |
| Acinonyx jubatus | 0 | 0 | 0 | 0 |
| Caracal caracal | 0 | 0 | 0 | 0 |
| Felis lybica | 0 | 0 | 0 | 0 |
| Leptailurus serval | 0 | 0 | 0 | 0 |
| Panthera leo | 9 | 0 | 5 | 1 |
| Panthera pardus | 2 | 0 | 6 | 2 |
| Atilax paludinosus | 0 | 0 | 0 | 0 |
| Helogale parvula | 0 | 0 | 0 | 0 |
| Herpestes ichneumon | 5 | 0 | 0 | 0 |
| Herpestes sanguineus | 1 | 0 | 0 | 1 |
| Ichneumia albicauda | 0 | 0 | 0 | 0 |
| Mungos mungo | 0 | 0 | 0 | 0 |
| Paracynictis selousi | 0 | 0 | 0 | 0 |
| Rhynchogale melleri | 0 | 0 | 0 | 0 |
| Crocuta crocuta | 7 | 0 | 2 | 5 |
| Parahyaena brunnea | 0 | 0 | 0 | 0 |
| Proteles cristatus | 0 | 0 | 0 | 0 |
| Ictonyx striatus | 0 | 0 | 0 | 0 |
| Lutra capensis | 0 | 0 | 0 | 0 |
| Mellivora capensis | 0 | 0 | 0 | 0 |
| Civettictis civetta | 0 | 0 | 0 | 0 |
| Genetta felina | 0 | 0 | 0 | 0 |
| Genetta fieldiana | 0 | 0 | 0 | 0 |
| Taphozous mauritianus | 2 | 0 | 2 | 0 |
| Hipposideros caffer | 3 | 0 | 1 | 0 |
| Hipposideros commersoni | 0 | 0 | 0 | 0 |
| Miniopterus natalensis | 0 | 0 | 2 | 0 |
| Mops ansorgei | 0 | 0 | 0 | 0 |
| Mops condylurus | 0 | 0 | 0 | 0 |
| Mops midas | 0 | 0 | 0 | 0 |
| Mops pumilus | 0 | 0 | 11 | 0 |
| Tadarida aegyptiaca | 0 | 0 | 1 | 0 |
| Tadarida fulminans | 0 | 0 | 0 | 0 |
| Nycteris thebaica | 5 | 0 | 0 | 0 |
| Nycteris woodi | 0 | 0 | 0 | 0 |
| Epomophorus crypturus | 0 | 0 | 0 | 0 |
| Epomophorus wahlbergi | 0 | 0 | 0 | 0 |
| Rousettus aegyptiacus | 2 | 0 | 0 | 0 |
| Rhinolophus blasii | 9 | 0 | 0 | 0 |
| Rhinolophus clivosus | 0 | 0 | 0 | 0 |
| Rhinolophus darlingi | 1 | 0 | 0 | 0 |
| Rhinolophus fumigatus | 0 | 0 | 0 | 0 |
| Rhinolophus hildebrandtii | 0 | 0 | 0 | 0 |
| Rhinolophus landeri | 0 | 0 | 2 | 0 |
| Rhinolophus simulator | 0 | 0 | 0 | 0 |
| Rhinolophus swinnyi | 0 | 0 | 0 | 0 |
| Afronycteris nanus | 7 | 0 | 1 | 0 |
| Cnephaeus hottentotus | 0 | 0 | 0 | 0 |
| Glauconycteris variegata | 0 | 0 | 0 | 0 |
| Kerivoula argentata | 0 | 0 | 0 | 0 |
| Kerivoula lanosa | 0 | 0 | 0 | 0 |
| Laephotis angolensis | 0 | 0 | 0 | 0 |
| Laephotis capensis | 0 | 0 | 0 | 0 |
| Myotis bocagii | 1 | 0 | 0 | 0 |
| Myotis tricolor | 0 | 0 | 0 | 0 |
| Myotis welwitschii | 0 | 0 | 0 | 0 |
| Neoromicia anchieta | 0 | 0 | 0 | 0 |
| Neoromicia zuluensis | 0 | 0 | 0 | 0 |
| Nycticeinops schlieffenii | 0 | 0 | 2 | 0 |
| Pipistrellus hesperidus | 1 | 0 | 1 | 0 |
| Pipistrellus rusticus | 0 | 0 | 1 | 0 |
| Scotophilus borbonicus | 0 | 0 | 0 | 0 |
| Scotophilus dinganii | 0 | 0 | 1 | 0 |
| Vansonia rueppellii | 0 | 0 | 0 | 0 |
| Atelerix frontalis | 0 | 0 | 0 | 0 |
| Crocidura cyanea | 0 | 0 | 0 | 0 |
| Crocidura fuscomurina | 0 | 0 | 0 | 0 |
| Crocidura hirta | 0 | 0 | 0 | 0 |
| Crocidura mariquensis | 0 | 0 | 0 | 0 |
| Crocidura silacea | 0 | 0 | 0 | 0 |
| Suncus lixa | 0 | 0 | 0 | 0 |
| Heterohyrax brucei | 0 | 0 | 0 | 0 |
| Procavia capensis | 3 | 0 | 3 | 1 |
| Lepus capensis | 0 | 0 | 0 | 0 |
| Lepus saxatilis | 0 | 0 | 0 | 0 |
| Pronolagus crassicaudatus | 0 | 0 | 0 | 0 |
| Elephantulus brachyrhynchus | 0 | 0 | 0 | 0 |
| Elephantulus myurus | 0 | 0 | 0 | 0 |
| Petrodromus tetradactylus | 0 | 0 | 0 | 0 |
| Equus quagga | 1 | 0 | 1 | 0 |
| Ceratotherium simum | 2 | 0 | 1 | 0 |
| Diceros bicornis | 0 | 0 | 0 | 0 |
| Smutsia temminckii | 0 | 0 | 0 | 0 |
| Chlorocebus pygerythrus | 4 | 0 | 1 | 0 |
| Papio ursinus | 6 | 0 | 3 | 6 |
| Galago moholi | 0 | 0 | 2 | 0 |
| Otolemur crassicaudatus | 1 | 0 | 1 | 0 |
| Loxodonta africana | 2 | 0 | 2 | 2 |
| Cryptomys hottentotus | 0 | 0 | 0 | 0 |
| Graphiurus murinus | 0 | 0 | 0 | 0 |
| Hystrix africaeaustralis | 0 | 0 | 0 | 0 |
| Aethomys chrysophilus | 0 | 0 | 0 | 0 |
| Dasymys incomtus | 0 | 0 | 0 | 0 |
| Gerbilliscus leucogaster | 0 | 0 | 0 | 0 |
| Grammomys dolichurus | 0 | 0 | 0 | 0 |
| Lemniscomys rosalia | 0 | 0 | 0 | 0 |
| Mastomys coucha | 0 | 0 | 0 | 0 |
| Mastomys natalensis | 0 | 0 | 0 | 0 |
| Micaelamys namaquensis | 0 | 0 | 0 | 0 |
| Mus minutoides | 0 | 0 | 0 | 0 |
| Otomys angoniensis | 0 | 0 | 0 | 0 |
| Thallomys paedulcus | 0 | 0 | 0 | 0 |
| Cricetomys ansorgei | 0 | 0 | 0 | 0 |
| Dendromus melanotis | 0 | 0 | 0 | 0 |
| Dendromus mystacalis | 0 | 0 | 0 | 0 |
| Saccostomus campestris | 0 | 0 | 0 | 0 |
| Steatomys pratensis | 0 | 0 | 0 | 0 |
| Pedetes capensis | 0 | 0 | 0 | 0 |
| Paraxerus cepapi | 2 | 0 | 3 | 2 |
| Thryonomys swinderianus | 0 | 0 | 0 | 0 |
| Orycteropus afer | 0 | 0 | 0 | 0 |

## Macaulay Library

Reuse terms were not readable. https://www.macaulaylibrary.org/media-asset-licensing/ returned 404. https://birds.cornell.edu/home/terms-of-use/ returned 403. The about page does not state a licence. The reusable clip count is null.

## Models

Exact scientific name, then an iNaturalist accepted name from taxa.json. Checklist remaps in synonyms.json were not applied. No model weights were downloaded.

Checklist remaps from `data/species-list.json` are in `synonyms.json` with `usedForMatching` false. They were not applied.

| Model | Scientific names parsed | Mammal labels in the file | Of these species | Licence read from the fetched page |
| --- | ---: | ---: | ---: | --- |
| `birdnet-plus-v3-global-12k` | 11711 | 419 | 18 | Apache License 2.0 |
| `birdnet-v2.4` | 6514 | null | 0 | CC BY-NC-SA 4.0 |
| `bsg-bat-v0.21` | 21 | null | 0 | CC BY 4.0 |
| `batdetect2-uk-same-onnx` | 0 | null | null | CC BY-NC 4.0 |
| `battybirdnet-bavaria-256khz` | 22 | null | 0 | CC BY-NC-SA 4.0 |
| `battybirdnet-bavaria-256khz-high` | 22 | null | 0 | CC BY-NC-SA 4.0 |
| `battybirdnet-eu-256khz` | 28 | null | 1 | CC BY-NC-SA 4.0 |
| `battybirdnet-scotland-256khz` | 9 | null | 0 | CC BY-NC-SA 4.0 |
| `battybirdnet-southwales-256khz` | 28 | null | 0 | CC BY-NC-SA 4.0 |
| `battybirdnet-sweden-256khz` | 17 | null | 0 | CC BY-NC-SA 4.0 |
| `battybirdnet-uk-256khz` | 14 | null | 0 | CC BY-NC-SA 4.0 |
| `battybirdnet-usa-256khz` | 32 | null | 0 | CC BY-NC-SA 4.0 |
| `battybirdnet-usa-east-256khz` | 16 | null | 0 | CC BY-NC-SA 4.0 |
| `battybirdnet-usa-east-256khz-high` | 16 | null | 0 | CC BY-NC-SA 4.0 |
| `battybirdnet-usa-west-256khz` | 22 | null | 0 | CC BY-NC-SA 4.0 |
| `echo-edge-bat-classifier-331` | null | null | null | null |
| `beats-bean-bats` | null | null | null | CC BY 4.0 |
| `openbeats-large-i3-bats` | null | null | null | CC BY 4.0 |
| `batai-mobilenet-onnx` | null | null | null | Apache License 2.0 |
| `naturelm-audio` | null | null | null | null |

Matched names, where the overlap is a number:

- `birdnet-plus-v3-global-12k`: Aepyceros melampus, Chlorocebus pygerythrus, Connochaetes taurinus, Crocuta crocuta, Epomophorus wahlbergi, Equus quagga, Helogale parvula, Hippopotamus amphibius, Loxodonta africana, Lupulella mesomelas, Mungos mungo, Otolemur crassicaudatus, Panthera leo, Papio ursinus, Paraxerus cepapi, Procavia capensis, Rousettus aegyptiacus, Syncerus caffer
- `birdnet-v2.4`: none
- `bsg-bat-v0.21`: none
- `battybirdnet-bavaria-256khz`: none
- `battybirdnet-bavaria-256khz-high`: none
- `battybirdnet-eu-256khz`: Rhinolophus blasii
- `battybirdnet-scotland-256khz`: none
- `battybirdnet-southwales-256khz`: none
- `battybirdnet-sweden-256khz`: none
- `battybirdnet-uk-256khz`: none
- `battybirdnet-usa-256khz`: none
- `battybirdnet-usa-east-256khz`: none
- `battybirdnet-usa-east-256khz-high`: none
- `battybirdnet-usa-west-256khz`: none

## Gaps

- label file has no scientific names, so the overlap is null (1): batdetect2-uk-same-onnx
- no label file URL. Overlap is null. (5): echo-edge-bat-classifier-331, beats-bean-bats, openbeats-large-i3-bats, batai-mobilenet-onnx, naturelm-audio
- taxon id is null, so sound counts are null (1): hipposideros-caffer


Species whose iNaturalist taxon id is null, so the iNaturalist sound count is null: Hipposideros caffer.

## Not decided

Using any model in the table, including one with a numeric overlap, is not decided. Neither is the choice to leave `/identify/sound` absent if no model is accepted. The photo-count report lists the other open questions from the plan. No model weights were downloaded and no hosted model was created.

## BirdNET+ acceptable-use file

Fetched from the Zenodo record and copied here so the conditions are not paraphrased.

```text
# BirdNET V3.0 Acceptable Use Policy

## Purpose

BirdNET is an open scientific project developed to support biodiversity research, wildlife conservation, environmental education, and citizen science.

This policy applies to the BirdNET V3.0 models — the trained model weights and any converted or quantized versions of them, such as TensorFlow/LiteRT, TorchScript, ONNX, and Core ML exports. It applies in the same way to the BirdNET+ Geomodel distributed with this project, which predicts where and when species occur, and to its converted versions.

We encourage broad adoption of the BirdNET V3.0 models for lawful and responsible purposes that contribute to the understanding and protection of nature.

## Responsible Use

Users should:

- Comply with all applicable laws and regulations.
- Respect privacy and local recording regulations, including where autonomous recording units are deployed.
- Use BirdNET predictions responsibly, recognizing that model outputs are probabilistic and may contain false positives or false negatives.
- Verify observations where appropriate before making scientific, conservation, or management decisions.
- Consider the potential ecological impact of publishing sensitive species locations.
- Account for the additional accuracy tradeoffs introduced by reduced-precision (FP16, INT8) versions of the models when interpreting results.

## Unacceptable Uses

BirdNET should not be used to facilitate activities that harm wildlife, ecosystems, or people.

Examples include, but are not limited to:

- Assisting or facilitating poaching or the illegal capture, trade, harassment, or exploitation of wildlife.
- Intentionally locating endangered or sensitive species for harmful purposes.
- Supporting activities that violate conservation laws or protected-area regulations.
- Using BirdNET as part of weapons systems, military targeting, or military surveillance intended to cause harm.
- Using BirdNET-based devices or applications for covert surveillance of people.
- Knowingly using BirdNET in ways that violate applicable laws or regulations.

## Scientific Integrity

Users are encouraged to:

- Cite BirdNET in scientific publications.
- Report suspected model errors or biases.
- Share improvements and contribute back to the project whenever possible.
- Clearly distinguish model predictions from verified biological observations.
- Report the model version and precision used, so results remain reproducible.

## Branding

Forks, derivative applications, or redistributed versions should not use the name "BirdNET", "BirdNET+", "BirdNET V3.0", associated package names, or official project branding in a manner that could reasonably imply endorsement by the original project or its maintainers.

Please choose a distinct name and branding for derivative applications unless explicit written permission has been granted.

## Feedback

We welcome reports of misuse, security concerns, or ethical issues.

Contact:

ccb-birdnet@cornell.edu
```
