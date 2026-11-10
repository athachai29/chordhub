import { describe, expect, it } from "vitest"
import { checkAuthOrigin } from "~/server/utils/auth-origin"

describe("checkAuthOrigin", () => {
  it("accepts the full auth URL", () => {
    expect(checkAuthOrigin("https://chordhub.app/api/auth", true)).toBeNull()
    expect(checkAuthOrigin("http://localhost:3000/api/auth/", false)).toBeNull()
  })

  it("rejects an origin without the auth path", () => {
    expect(checkAuthOrigin("https://chordhub.app", true)).toContain("/api/auth")
  })

  it("rejects a non-URL", () => {
    expect(checkAuthOrigin("chordhub.app/api/auth", true)).toContain(
      "not a valid URL",
    )
  })

  it("requires the variable only in production", () => {
    expect(checkAuthOrigin(undefined, true)).toContain("not set")
    expect(checkAuthOrigin("", true)).toContain("not set")
    expect(checkAuthOrigin(undefined, false)).toBeNull()
  })
})
