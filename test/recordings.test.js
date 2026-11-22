import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { test } from 'node:test'
import { licenceForbidsDerivatives } from '../src/labels.js'
import { licenceAllowed } from '../scripts/publish-media.mjs'

const detailsDir = path.join('data', 'species', 'details')

const EXACT_PLACE = new Map([
  ['ceratotherium-simum.json', 'Kruger National Park'],
  ['diceros-bicornis.json', 'Kruger National Park'],
  ['smutsia-temminckii.json', 'Kruger National Park'],
  ['neamblysomus-julianae.json', 'southwestern Kruger National Park'],
])

const FACILITY =
  /\b(?:camps?|roads?|water[\s-]?holes?|hides?|picnic(?:\s+sites?)?|gates?|skukuza)\b/i

const textOf = (value) => (typeof value === 'string' ? value : '')

const facilityHit = (place, note) => {
  const texts = [textOf(place), textOf(note)].filter((value) => value !== '')
  if (!texts.some((value) => /kruger/i.test(value))) return ''
  return texts.find((value) => FACILITY.test(value)) ?? ''
}

const reserved = (license) =>
  typeof license === 'string' && /all[-\s]+rights[-\s]+reserved/i.test(license)

const recordingsOf = (doc) =>
  (Array.isArray(doc.calls) ? doc.calls : []).flatMap((call) =>
    Array.isArray(call?.recordings) ? call.recordings : [],
  )

test('recording checks reject a blocked licence and a Kruger facility name', () => {
  assert.equal(licenceAllowed('CC BY-NC'), true)
  assert.equal(licenceAllowed('CC BY-NC-SA 4.0'), true)
  assert.equal(licenceAllowed('CC BY-NC-ND 4.0'), false)
  assert.equal(licenceForbidsDerivatives('CC BY-NC-ND 4.0'), true)
  assert.equal(reserved('all rights reserved'), true)
  assert.equal(reserved('CC BY-NC 4.0'), false)
  assert.match(facilityHit('Skukuza, Kruger National Park', ''), /Skukuza/i)
  assert.match(
    facilityHit('Satara Camp Road, Kruger National Park', ''),
    /Camp/i,
  )
  assert.match(
    facilityHit('Lake Panic Bird Hide, Kruger National Park', ''),
    /Hide/i,
  )
  assert.match(
    facilityHit(
      'Kruger National Park',
      'Field recording made during a sleepover at Sable Hide.',
    ),
    /Hide/i,
  )
  assert.equal(
    facilityHit(
      'Kruger National Park, Bushbuckridge, Mpumalanga, South Africa',
      'Field recording made early in the morning.',
    ),
    '',
  )
  assert.equal(facilityHit('Limpopo, South Africa', 'beside a road'), '')
})

test('stored recordings cite an allowed licence and a usable place', async () => {
  const names = (await readdir(detailsDir)).filter((name) =>
    name.endsWith('.json'),
  )
  const problems = []
  for (const name of names) {
    const doc = JSON.parse(await readFile(path.join(detailsDir, name), 'utf8'))
    const exact = EXACT_PLACE.get(name)
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
      const hit = facilityHit(recording?.place, recording?.note)
      if (hit) problems.push(`${label} names a facility: ${hit}`)
      if (exact && recording?.place !== exact)
        problems.push(`${label} place must be ${exact}`)
    }
  }
  assert.deepEqual(problems, [])
})
