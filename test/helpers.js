import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectEntries } from '../scripts/seed.mjs'
import { handleRequest } from '../src/worker.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export const repoRoot = root

export const ORIGIN = 'https://mammals.example'

export const readJson = async (relative) =>
  JSON.parse(await readFile(path.join(root, relative), 'utf8'))

/** KV entries from `collectEntries()`, keyed as the Worker stores them. */
export const loadStore = async () => {
  const entries = await collectEntries()
  const records = Object.fromEntries(
    entries.map((entry) => [entry.key, entry.value]),
  )
  return { entries, records }
}

/**
 * In-memory KV. `get` returns the stored text, or parsed JSON when asked.
 * There is no R2 bucket: `/images` and `/audio` need a bucket passed in.
 */
export const mockKv = (records) => ({
  async get(key, type) {
    const value = records[key]
    if (value == null) return null
    if (type === 'json') return JSON.parse(value)
    return value
  },
})

export const workerEnv = (records) => ({ MAMMALS_KV: mockKv(records) })

export const fetchPage = (pathname, env, init) =>
  handleRequest(new Request(`${ORIGIN}${pathname}`, init), env)
