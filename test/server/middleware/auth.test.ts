import { it, expect } from "vitest"
import { eventHandler } from "h3"
import { encode } from "next-auth/jwt"
import { callHandler } from "~~/test/support/http"
import mw from "~~/server/middleware/auth"

const echo = eventHandler((e) => ({ auth: e.context.auth ?? null }))

it.each(["next-auth.session-token", "__Secure-next-auth.session-token"])(
  "reads %s into context.auth",
  async (name) => {
    const jwt = await encode({ token: { sub: "u1" }, secret: "test-secret" })
    expect(
      (
        await callHandler(echo, {
          middleware: [mw],
          headers: { cookie: `${name}=${jwt}` },
        })
      ).body.auth,
    ).toMatchObject({ sub: "u1" })
  },
)
it("no cookie → auth null and the request still reaches the route", async () => {
  // Reaching `echo` proves the global middleware returned nothing (it must never return).
  expect(await callHandler(echo, { middleware: [mw] })).toEqual({
    status: 200,
    body: { auth: null },
  })
})
it("token signed with another secret → auth null", async () => {
  const jwt = await encode({ token: { sub: "u1" }, secret: "other" })
  expect(
    (
      await callHandler(echo, {
        middleware: [mw],
        headers: { cookie: `next-auth.session-token=${jwt}` },
      })
    ).body.auth,
  ).toBeNull()
})
