import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { test } from 'node:test'
import vm from 'node:vm'
import { creditModel } from '../src/credit.js'
import {
  NO_OBSERVATION_REFS,
  catalogueNumber,
  readerCallText,
} from '../src/labels.js'
import { fetchPage, loadStore, repoRoot, workerEnv } from './helpers.js'

const { records } = await loadStore()
const env = workerEnv(records)
const page = async (pathname) => (await fetchPage(pathname, env)).text()

const WILDEBEEST = '/species/connochaetes-taurinus'
const CURATOR =
  /sources? (?:used|consulted)|in this session|for this file|recordings?\b|recordist|inaturalist|xeno-canto|observations? (?:does|do) not|grade [A-E]\b|file ?names?|date ?stamps?|\.(?:mp3|wav|m4a|ogg)\b/i

/** What a reader is told about the call, not the players or credit lines. */
const callCopy = (html) =>
  [...html.matchAll(/<p class="call-copy">([\s\S]*?)<\/p>/g)]
    .map((found) => found[1])
    .join('\n')

const callSection = (html) =>
  html.match(/<h2 id="calls">[\s\S]*?(?=\n<h2|$)/)?.[0] ?? ''

test('reader call text keeps the voice and drops notes about the research', () => {
  assert.equal(
    readerCallText(
      'A loud grunt. A general call is not described in the sources used here.',
    ),
    'A loud grunt.',
  )
  assert.equal(
    readerCallText(
      'A research-grade recording from Kruger is included. The observation does not identify the call type.',
    ),
    '',
  )
  assert.equal(
    readerCallText(
      'Calls of aggression have been recorded, without a further description in the sources used.',
    ),
    'Calls of aggression have been recorded.',
  )
  assert.equal(
    readerCallText(
      'A low rumble. The filename is a date stamp. Grade A from a garden.',
    ),
    'A low rumble.',
  )
  assert.equal(
    readerCallText(
      'It says males give warning calls, and that females are not described as giving them.',
    ),
    'It says males give warning calls, and that females are not described as giving them.',
  )
  assert.equal(readerCallText(null), '')
})

test('no stored call text shows a curator note to a reader', async () => {
  const dir = path.join(repoRoot, 'data/species/details')
  for (const name of await readdir(dir)) {
    const doc = JSON.parse(await readFile(path.join(dir, name), 'utf8'))
    for (const call of doc.calls ?? [])
      assert.doesNotMatch(readerCallText(call.description), CURATOR, name)
  }
})

test('a call with a clip has one large play and stop control and no grade', async () => {
  const html = await page(WILDEBEEST)
  const calls = callSection(html)
  assert.equal([...calls.matchAll(/class="call-player"/g)].length, 1)
  assert.match(calls, /<button type="button" class="call-play" hidden/)
  assert.match(calls, /data-play="Play call" data-stop="Stop call"/)
  assert.match(
    calls,
    /<audio controls preload="none" src="\/audio\/xeno-canto\/XC1148048"><\/audio>/,
  )
  assert.match(html, /<a href="#calls">Hear its call<\/a>/)
  assert.match(calls, /A loud nasal grunt or bellow/)
  assert.doesNotMatch(calls, /sex-specific|sources used here/)
  assert.match(
    calls,
    /xeno-canto catalogue number: <a href="https:\/\/xeno-canto\.org\/1148048">XC1148048<\/a>/,
  )
  assert.doesNotMatch(html, /Quality [A-E]/)
  assert.doesNotMatch(callCopy(calls), /XC1148048|xeno-canto/)
})

test('several clips on one call are numbered, and research notes stay off the page', async () => {
  const html = await page('/species/crocuta-crocuta')
  const calls = callSection(html)
  assert.equal([...calls.matchAll(/class="call-player"/g)].length, 3)
  for (const label of [
    'Play call 1 of 3',
    'Play call 2 of 3',
    'Play call 3 of 3',
  ])
    assert.ok(calls.includes(`data-play="${label}"`), label)
  assert.doesNotMatch(calls, /do not name the call type/)
  assert.doesNotMatch(callCopy(calls), /inaturalist|recording/i)
  assert.doesNotMatch(html, /Recording inaturalist/)
})

test('a clip with no description still shows its type and player', async () => {
  const html = await page('/species/chlorocebus-pygerythrus')
  const calls = callSection(html)
  assert.match(calls, /<span class="call-type">Call<\/span><\/p>/)
  assert.match(calls, /class="call-player"/)
  assert.doesNotMatch(calls, /research-grade|does not identify/)
})

test('a call that only says what the sources lacked is not shown', async () => {
  const html = await page('/species/hippotragus-niger')
  assert.doesNotMatch(html, /not found in the sources/)
  assert.doesNotMatch(html, /<h2 id="calls">/)
  assert.doesNotMatch(html, /Hear its call/)
  const md = await page('/species/hippotragus-niger.md')
  assert.doesNotMatch(md, /sources used here/)
  assert.doesNotMatch(md, /## Calls/)
})

test('no species page shows an empty calls heading or a curator note', async () => {
  const index = JSON.parse(records['index/species'])
  for (const row of index.species) {
    const html = await page(`/species/${row.slug}`)
    const section = callSection(html)
    if (section) assert.match(section, /class="call-item"/, row.slug)
    assert.doesNotMatch(callCopy(section), CURATOR, row.slug)
    assert.doesNotMatch(html, /Quality [A-E]\b/, row.slug)
  }
})

test('markdown calls drop research notes and name the xeno-canto number only', async () => {
  const md = await page(`${WILDEBEEST}.md`)
  assert.match(md, /xeno-canto catalogue number: XC1148048/)
  const calls = md.match(/## Calls[\s\S]*?(?=\n## )/)[0]
  assert.doesNotMatch(calls, /Quality [A-E]|sources used here|sex-specific/)
  assert.doesNotMatch(md, /Quality [A-E]\b/)
  const hyaena = await page('/species/crocuta-crocuta.md')
  assert.doesNotMatch(
    hyaena.match(/## Calls[\s\S]*?(?=\n## )/)[0],
    /do not name the call type/,
  )
})

test('the credits page and its markdown show the catalogue number, not the grade', async () => {
  for (const pathname of ['/credits', '/credits.md']) {
    const text = await page(pathname)
    assert.match(
      text,
      /xeno-canto catalogue number: (?:<[^>]+>)?XC1148048/,
      pathname,
    )
    assert.doesNotMatch(text, /Quality [A-E]\b/, pathname)
  }
  const index = JSON.parse(records['index/credits'])
  const wildebeest = index.species.find(
    (group) => group.slug === 'connochaetes-taurinus',
  )
  assert.equal(wildebeest.recordings[0].quality, undefined)
})

test('the catalogue number is read from the key and hidden for rhino and pangolin', () => {
  assert.equal(catalogueNumber('xeno-canto/XC1148048'), 'XC1148048')
  assert.equal(catalogueNumber('inaturalist/125798020'), '')
  assert.equal(
    catalogueNumber('otolemur-crassicaudatus/kruger-skukuza.mp3'),
    '',
  )
  assert.equal(catalogueNumber(undefined), '')
  assert.deepEqual([...NO_OBSERVATION_REFS].sort(), [
    'ceratotherium-simum',
    'diceros-bicornis',
    'smutsia-temminckii',
  ])
  const clip = {
    key: 'xeno-canto/XC1',
    source: 'https://xeno-canto.org/1',
    author: 'A B',
    license: 'CC BY-NC 4.0',
    quality: 'A',
  }
  const flat = (model) => JSON.stringify(model.lines)
  assert.match(flat(creditModel(clip, 'recording', null)), /XC1/)
  assert.doesNotMatch(flat(creditModel(clip, 'recording', null)), /Quality/)
  assert.doesNotMatch(
    flat(creditModel(clip, 'recording', null, { catalogue: false })),
    /XC1|catalogue/,
  )
})

/** The page script, run against a small stand-in for the document. */
class Node {
  constructor(attrs = {}) {
    this.attrs = { ...attrs }
    this.handlers = {}
    this.hidden = true
    this.children = {}
    this.dataset = {}
    this.textContent = ''
    this.style = {}
    this.classes = new Set()
    this.classList = {
      add: (name) => this.classes.add(name),
      toggle: (name, on) =>
        on ? this.classes.add(name) : this.classes.delete(name),
      contains: (name) => this.classes.has(name),
    }
  }
  getAttribute(name) {
    return this.attrs[name] ?? null
  }
  setAttribute(name, value) {
    this.attrs[name] = value
  }
  removeAttribute(name) {
    delete this.attrs[name]
  }
  addEventListener(type, handler) {
    ;(this.handlers[type] ??= []).push(handler)
  }
  fire(type) {
    for (const handler of this.handlers[type] ?? []) handler({})
  }
  querySelector(selector) {
    return this.children[selector] ?? null
  }
}

const fakeAudio = () => {
  const audio = new Node({ src: '/audio/x', controls: '' })
  audio.paused = true
  audio.ended = false
  audio.duration = 10
  audio.currentTime = 0
  audio.play = () => {
    audio.paused = false
    audio.fire('play')
    return Promise.resolve()
  }
  audio.pause = () => {
    audio.paused = true
    audio.fire('pause')
  }
  return audio
}

const fakePlayer = () => {
  const player = new Node()
  const button = new Node()
  const label = new Node()
  label.dataset = { play: 'Play call', stop: 'Stop call' }
  label.textContent = 'Play call'
  const bar = new Node()
  const status = new Node()
  const audio = fakeAudio()
  player.children = {
    '.call-play': button,
    audio,
    '.call-play-label': label,
    '.call-play-meter-bar': bar,
    '.call-play-status': status,
  }
  return { player, button, label, bar, status, audio }
}

const runPage = async (players) => {
  const source = (
    await readFile(path.join(repoRoot, 'src/client/app.js'), 'utf8')
  ).replace('export const compareSortKeys', 'const compareSortKeys')
  const document = {
    querySelectorAll: (selector) =>
      selector === '.call-player' ? players.map((one) => one.player) : [],
    querySelector: () => null,
    addEventListener() {},
    documentElement: { classList: { add() {} } },
  }
  const window = {
    location: {
      origin: 'https://m.test',
      href: 'https://m.test/',
      pathname: '/',
      search: '',
    },
    matchMedia: () => ({ matches: false }),
    requestAnimationFrame: (fn) => fn(),
    addEventListener() {},
  }
  vm.runInNewContext(source, {
    document,
    window,
    URL,
    URLSearchParams,
    console,
  })
}

test('the page script turns each clip into one play and stop button, one at a time', async () => {
  const one = fakePlayer()
  const two = fakePlayer()
  await runPage([one, two])
  for (const item of [one, two]) {
    assert.equal(item.button.hidden, false)
    assert.equal(item.audio.getAttribute('controls'), null)
    assert.equal(item.player.classes.has('is-ready'), true)
  }
  one.button.fire('click')
  assert.equal(one.audio.paused, false)
  assert.equal(one.label.textContent, 'Stop call')
  assert.equal(one.button.getAttribute('aria-pressed'), 'true')
  assert.equal(one.player.classes.has('is-playing'), true)

  two.button.fire('click')
  assert.equal(one.audio.paused, true)
  assert.equal(one.label.textContent, 'Play call')
  assert.equal(two.audio.paused, false)

  two.audio.currentTime = 4
  two.button.fire('click')
  assert.equal(two.audio.paused, true)
  assert.equal(two.audio.currentTime, 0)
  assert.equal(two.label.textContent, 'Play call')
  assert.equal(two.button.getAttribute('aria-pressed'), 'false')
})

test('a clip that cannot play says so and goes back to Play', async () => {
  const one = fakePlayer()
  one.audio.play = () => Promise.reject(new Error('blocked'))
  await runPage([one])
  one.button.fire('click')
  await new Promise((resolve) => setImmediate(resolve))
  assert.equal(one.status.textContent, 'This call could not be played.')
  assert.equal(one.label.textContent, 'Play call')
})
