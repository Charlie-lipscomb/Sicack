const buckets = new Map()

/** Client-side rate limit. Returns true if allowed. */
export function allowAction(key, { limit = 5, windowMs = 60_000 } = {}) {
  const now = Date.now()
  const entry = buckets.get(key) || { times: [] }
  entry.times = entry.times.filter((t) => now - t < windowMs)
  if (entry.times.length >= limit) {
    buckets.set(key, entry)
    return false
  }
  entry.times.push(now)
  buckets.set(key, entry)
  return true
}
