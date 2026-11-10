const AUTH_PATH = "/api/auth"

/**
 * nuxt-auth (>= 0.6) reads AUTH_ORIGIN as the full auth base URL, path
 * included. An origin-only value makes SSR call `/session` instead of
 * `/api/auth/session`. Returns null when the value is usable.
 */
export function checkAuthOrigin(
  value: string | undefined,
  isProduction: boolean,
): string | null {
  if (!value) {
    return isProduction
      ? `AUTH_ORIGIN is not set; nuxt-auth needs the full auth URL, e.g. https://chordhub.app${AUTH_PATH}`
      : null
  }

  let url: URL
  try {
    url = new URL(value)
  } catch {
    return `AUTH_ORIGIN is not a valid URL (got ${value})`
  }

  if (url.pathname.replace(/\/+$/, "") !== AUTH_PATH) {
    return `AUTH_ORIGIN must include the auth path ${AUTH_PATH} (got ${value})`
  }
  return null
}
