import { it, expect } from "vitest"
import { callHandler } from "~~/test/support/http"

it("GET /api/health", async () => {
  expect(
    await callHandler((await import("~~/server/api/health")).default),
  ).toEqual({
    status: 200,
    body: { status: "ok", message: "Service is running" },
  })
})

it("GET /api returns package version", async () => {
  expect(
    (await callHandler((await import("~~/server/api/index")).default)).body,
  ).toMatchObject({
    success: true,
    data: { message: "CHORDHUB API SERVICE", version: "0.0.7" },
  })
})

it("unknown /api/* route is 404", async () => {
  expect(
    (await callHandler((await import("~~/server/api/[...]")).default)).status,
  ).toBe(404)
})

it("harness passes body, params and auth through", async () => {
  const echo = eventHandler(async (e) => ({
    got: await readBody(e),
    params: getRouterParams(e),
    auth: e.context.auth,
  }))
  expect(
    (
      await callHandler(echo, {
        method: "POST",
        body: { a: 1 },
        params: { id: "x" },
        auth: { sub: "u1" },
      })
    ).body,
  ).toEqual({ got: { a: 1 }, params: { id: "x" }, auth: { sub: "u1" } })
})
