export function timeAgo(timestamp, { long = false } = {}) {
  if (!timestamp) return ''
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 45) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return long ? `${minutes}m ago` : `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return long ? `${hours}h ago` : `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return long ? `${days}d ago` : `${days}d`
  if (days < 365) {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  }
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
