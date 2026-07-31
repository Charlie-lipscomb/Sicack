export function truncate(str, max = 220) {
  const s = String(str || '')
  if (s.length <= max) return s
  return s.slice(0, max).trimEnd() + '…'
}

export function isValidHttpUrl(value) {
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}
