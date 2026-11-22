import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

import { test } from 'node:test'

const root = path.resolve(import.meta.dirname, '..')
const read = (file) => JSON.parse(readFileSync(path.join(root, file), 'utf8'))

const median = (values) => {
  const xs = [...values].sort((a, b) => a - b)
  if (xs.length === 0) return null
  const mid = Math.floor(xs.length / 2)
  return xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2
}

const column = (rows, licence, place) => {
  const numbers = []
  let nulls = 0
  for (const row of rows) {
    const value = row[licence][place]
    if (typeof value === 'number') numbers.push(value)
    else nulls += 1
  }
  return {
    median: median(numbers),
    under20: numbers.filter((value) => value < 20).length,
    under50: numbers.filter((value) => value < 50).length,
    under150: numbers.filter((value) => value < 150).length,
    atLeast50: numbers.filter((value) => value >= 50).length,
    atLeast150: numbers.filter((value) => value >= 150).length,
    zero: numbers.filter((value) => value === 0).length,
    counted: numbers.length,
    nulls,
  }
}

const walk = (dir) => {
  const found = []
  for (const name of readdirSync(dir)) {
    const file = path.join(dir, name)
    if (statSync(file).isDirectory()) found.push(...walk(file))
    else found.push(file)
  }
  return found
}

test('the xeno-canto parser accepts a licence on the result row', () => {
  execFileSync('python3', ['spike/identify-sound/count-xc.py', '--self-test'], {
    cwd: root,
  })
})

test('photo counts match the species list and the summary', () => {
  const list = read('data/species-list.json').species
  const taxa = read('spike/identify-photo/taxa.json')
  const counts = read('spike/identify-photo/counts.json')
  assert.deepEqual(
    counts.species.map((row) => row.slug),
    list.map((row) => row.slug),
  )
  assert.deepEqual(
    taxa.species.map((row) => row.slug),
    list.map((row) => row.slug),
  )
  for (const row of counts.species) {
    for (const licence of ['withNc', 'withoutNc']) {
      for (const place of [
        'kruger',
        'southAfrica',
        'restOfSouthAfrica',
        'anywhere',
      ]) {
        const value = row[licence][place]
        assert.ok(value === null || (Number.isInteger(value) && value >= 0))
      }
      const rest = row[licence].restOfSouthAfrica
      const south = row[licence].southAfrica
      const kruger = row[licence].kruger
      if (rest !== null) assert.equal(rest, south - kruger)
      else if (Number.isInteger(south) && Number.isInteger(kruger))
        assert.ok(south < kruger)
    }
    if (row.taxonId === null) {
      for (const licence of ['withNc', 'withoutNc'])
        for (const value of Object.values(row[licence]))
          assert.equal(value, null)
    }
  }
  for (const group of ['all', 'bats', 'notBats']) {
    const rows =
      group === 'all'
        ? counts.species
        : counts.species.filter((row) =>
            group === 'bats'
              ? row.order === 'Chiroptera'
              : row.order !== 'Chiroptera',
          )
    for (const licence of ['withNc', 'withoutNc'])
      for (const place of [
        'kruger',
        'southAfrica',
        'restOfSouthAfrica',
        'anywhere',
      ])
        assert.deepEqual(
          counts.summary[group][licence][place],
          column(rows, licence, place),
        )
  }
  const doc = readFileSync(
    path.join(root, 'docs/identify-photo-spike.md'),
    'utf8',
  )
  const fence = doc.match(/<!-- photo-summary -->\n```json\n([\s\S]*?)\n```/)
  assert.ok(fence)
  assert.deepEqual(JSON.parse(fence[1]), counts.summary)
  assert.match(doc, /Do not train/)
})

test('sound counts leave unread sources null and match their summary', () => {
  const counts = read('spike/identify-sound/counts.json')
  const xc = read('spike/identify-sound/xc.json')
  const models = read('spike/identify-sound/models.json')
  const synonyms = read('spike/identify-sound/synonyms.json')
  assert.equal(counts.macaulayLibrary.reusableClips, null)
  assert.equal(xc.kruger, null)
  for (const row of counts.species) {
    for (const licence of ['withNc', 'withoutNc']) {
      for (const place of ['kruger', 'anywhere']) {
        const clips = row.clips[licence][place]
        const observations = row.observations[licence][place]
        assert.ok(clips === null || (Number.isInteger(clips) && clips >= 0))
        assert.ok(
          observations === null ||
            (Number.isInteger(observations) && observations >= 0),
        )
      }
      assert.equal(row.clips[licence].southAfrica, null)
    }
  }
  const flat = counts.species.map((row) => ({
    withNc: row.observations.withNc,
    withoutNc: row.observations.withoutNc,
    order: row.order,
  }))
  for (const group of ['all', 'bats', 'notBats']) {
    const rows =
      group === 'all'
        ? flat
        : flat.filter((row) =>
            group === 'bats'
              ? row.order === 'Chiroptera'
              : row.order !== 'Chiroptera',
          )
    for (const licence of ['withNc', 'withoutNc'])
      for (const place of [
        'kruger',
        'southAfrica',
        'restOfSouthAfrica',
        'anywhere',
      ])
        assert.deepEqual(
          counts.summary[group][licence][place],
          column(rows, licence, place),
        )
  }
  for (const model of models.models)
    assert.ok(model.matched === null || Number.isInteger(model.matched))
  for (const remap of synonyms.checklistRemapsNotUsed)
    assert.equal(remap.usedForMatching, false)
  const doc = readFileSync(
    path.join(root, 'docs/identify-sound-spike.md'),
    'utf8',
  )
  const fence = doc.match(/<!-- sound-summary -->\n```json\n([\s\S]*?)\n```/)
  assert.ok(fence)
  assert.deepEqual(JSON.parse(fence[1]), counts.summary)
  assert.match(doc, /not a plan/)
})

test('the spike commits no media bytes', () => {
  const banned = /\.(jpg|jpeg|png|gif|webp|wav|mp3|flac|ogg|tflite|onnx|pt)$/i
  for (const file of walk(path.join(root, 'spike')))
    assert.doesNotMatch(file, banned)
})
