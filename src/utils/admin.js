/** Official support / admin username (case-insensitive) */
export const ADMIN_USERNAME = 'Sicack'

export function isAdminUser(user) {
  if (!user) return false
  return String(user.username || '').toLowerCase() === ADMIN_USERNAME.toLowerCase()
}

export function isAdminUsername(name) {
  return String(name || '').toLowerCase() === ADMIN_USERNAME.toLowerCase()
}

/** Public-facing display name — never expose real Sicack email */
export function publicDisplayName(username) {
  if (isAdminUsername(username)) return 'Sicack Support'
  return username || 'member'
}

/** Email shown in UI — hidden for Sicack account */
export function publicEmail(username, email) {
  if (isAdminUsername(username)) return null
  return email || null
}

/** Sanitize a user profile object for public UI */
export function publicProfile(profile) {
  if (!profile) return profile
  const username = profile.username || ''
  if (isAdminUsername(username)) {
    return {
      ...profile,
      username: 'Sicack Support',
      email: null,
      displayLabel: 'Sicack Support',
    }
  }
  return { ...profile, displayLabel: username }
}
