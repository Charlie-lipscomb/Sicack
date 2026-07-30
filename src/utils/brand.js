/** Single source for brand assets (files live in /public) */
export const LOGO_FILE = 'F45885C9-39DA-4B67-A1D1-F292D6B83525.png'

export function logoUrl() {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${LOGO_FILE}`
}
