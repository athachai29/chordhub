import { checkAuthOrigin } from "~~/server/utils/auth-origin"

export default defineNitroPlugin(() => {
  const message = checkAuthOrigin(process.env.AUTH_ORIGIN, !import.meta.dev)
  if (!message) return

  // Fail the boot in production so Cloud Run keeps serving the old revision.
  if (!import.meta.dev) throw new Error(message)
  console.error(message)
})
