import { bestRecording, displayImage } from './offline.js'

/**
 * The photograph and the call a search card shows for each species.
 * scripts/seed.mjs builds `index/search-samples` from this, so the search
 * page reads one document instead of opening a species file for every hit.
 *
 * The choice is the one the installed app saves for offline use
 * (`displayImage` and `bestRecording`), so a card shows and plays a file
 * that the phone already has. Only the fields a page needs to load the file
 * and credit it are kept.
 */

const MEDIA_FIELDS = [
  'key',
  'hosted',
  'fileUrl',
  'license',
  'licenceUrl',
  'author',
  'source',
  'aiGenerated',
  'view',
  'alt',
]

const pick = (item) =>
  Object.fromEntries(
    MEDIA_FIELDS.filter((field) => item?.[field] != null).map((field) => [
      field,
      item[field],
    ]),
  )

const callTypeOf = (details, recording) => {
  for (const call of Array.isArray(details?.calls) ? details.calls : [])
    if (Array.isArray(call?.recordings) && call.recordings.includes(recording))
      return typeof call.type === 'string' ? call.type : null
  return null
}

/** One species' sample, or null when it has neither a photograph nor a clip. */
export const sampleFor = (details) => {
  const image = displayImage(details)
  const clip = bestRecording(details)
  if (!image && !clip) return null
  const sample = {}
  if (image) sample.image = pick(image.item)
  if (clip) {
    sample.call = pick(clip.item)
    const type = callTypeOf(details, clip.item)
    if (type) sample.call.type = type
  }
  return sample
}

/** `index/search-samples`: a sample for each species that has one, by slug.
 * `details` is a Map from slug to the species details file. */
export const buildSearchSamples = (details) => {
  const samples = {}
  for (const slug of [...details.keys()].sort()) {
    const sample = sampleFor(details.get(slug))
    if (sample) samples[slug] = sample
  }
  return { samples }
}
