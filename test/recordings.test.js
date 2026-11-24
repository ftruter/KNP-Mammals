import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { test } from 'node:test'
import { licenceForbidsDerivatives } from '../src/labels.js'
import { licenceAllowed } from '../scripts/publish-media.mjs'

const detailsDir = path.join('data', 'species', 'details')
const PARK = 'Kruger National Park'

const RESTRICTED = new Set([
  'ceratotherium-simum.json',
  'diceros-bicornis.json',
  'smutsia-temminckii.json',
])

const FACILITY =
  /\b(?:camps?|roads?|water[\s-]?holes?|hides?|picnic(?:\s+sites?)?|gates?|skukuza)\b/i

const OBSERVATION_REF =
  /\b(?:inaturalist|xeno-?canto)\b|\bXC\d+\b|observations?\/\d+|\bobservation\s+\d+/i

const textOf = (value) => (typeof value === 'string' ? value : '')

const reserved = (license) =>
  typeof license === 'string' && /all[-\s]+rights[-\s]+reserved/i.test(license)

const recordingsOf = (doc) =>
  (Array.isArray(doc.calls) ? doc.calls : []).flatMap((call) =>
    Array.isArray(call?.recordings) ? call.recordings : [],
  )

const restrictedProblem = (place, note) => {
  const placeText = textOf(place)
  const noteText = textOf(note)
  if (placeText !== PARK) return placeText || '(missing place)'
  const visible = `${placeText}\n${noteText}`
  const ref = visible.match(OBSERVATION_REF)
  if (ref) return ref[0]
  const facility = noteText.match(FACILITY)
  return facility ? facility[0] : ''
}

test('recording checks reject a blocked licence', () => {
  assert.equal(licenceAllowed('CC BY-NC'), true)
  assert.equal(licenceAllowed('CC BY-NC-SA 4.0'), true)
  assert.equal(licenceAllowed('CC BY-NC-ND 4.0'), false)
  assert.equal(licenceForbidsDerivatives('CC BY-NC-ND 4.0'), true)
  assert.equal(reserved('all rights reserved'), true)
  assert.equal(reserved('CC BY-NC 4.0'), false)
})

test('only rhino and pangolin recordings drop place detail and catalogue ids', () => {
  assert.equal(RESTRICTED.has('neamblysomus-julianae.json'), false)
  assert.equal(
    restrictedProblem(
      PARK,
      'Field recording from Kruger National Park. The observation does not name the call type.',
    ),
    '',
  )
  assert.match(
    restrictedProblem('Skukuza, Kruger National Park', ''),
    /Skukuza/,
  )
  assert.match(
    restrictedProblem('Sable Hide, Mopani, Kruger National Park', ''),
    /Sable Hide/,
  )
  assert.match(
    restrictedProblem(
      PARK,
      'Field recording made from the Lake Panic Bird Hide.',
    ),
    /Hide/,
  )
  assert.match(
    restrictedProblem(PARK, 'iNaturalist observation 91042075'),
    /iNaturalist/,
  )
  assert.match(restrictedProblem(PARK, 'xeno-canto XC1148048'), /xeno-canto/)
})

test('stored recordings cite an allowed licence and a usable place', async () => {
  const names = (await readdir(detailsDir)).filter((name) =>
    name.endsWith('.json'),
  )
  const problems = []
  for (const name of names) {
    const doc = JSON.parse(await readFile(path.join(detailsDir, name), 'utf8'))
    for (const recording of recordingsOf(doc)) {
      const label = `${name} ${recording?.key ?? '(no key)'}`
      if (
        typeof recording?.author !== 'string' ||
        recording.author.trim() === ''
      )
        problems.push(`${label} lacks author`)
      if (
        typeof recording?.source !== 'string' ||
        recording.source.trim() === ''
      )
        problems.push(`${label} lacks source`)
      if (licenceForbidsDerivatives(recording?.license))
        problems.push(`${label} uses an ND licence`)
      if (reserved(recording?.license))
        problems.push(`${label} is all-rights-reserved`)
      if (!licenceAllowed(recording?.license))
        problems.push(`${label} licence is not allowed`)
      if (!RESTRICTED.has(name)) continue
      const hit = restrictedProblem(recording?.place, recording?.note)
      if (hit) problems.push(`${label} restricted place text: ${hit}`)
    }
  }
  assert.deepEqual(problems, [])
})
