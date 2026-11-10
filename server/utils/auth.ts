import type { H3Event } from "h3"
import { setResponseStatus } from "h3"

export function getUserId(event: H3Event): string | undefined {
  return event.context.auth?.sub
}

export function unauthorized(event: H3Event): {
  success: false
  error: "Unauthorized"
} {
  setResponseStatus(event, 401)
  return { success: false, error: "Unauthorized" }
}

export function forbidden(event: H3Event): {
  success: false
  error: "Forbidden"
} {
  setResponseStatus(event, 403)
  return { success: false, error: "Forbidden" }
}
