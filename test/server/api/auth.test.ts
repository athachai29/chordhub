import { describe, it, expect, vi } from "vitest"
import { users as Users } from "~~/server/models"
import { callHandler } from "~~/test/support/http"
import { useTestDb, seedUser } from "~~/test/support/db"
import register from "~~/server/api/auth/register.post"
import checkEmail from "~~/server/api/auth/check-email"
import authOptions from "~~/server/api/auth/[...]"

// In the Nitro bundle `import P from "next-auth/providers/x"` is the CJS
// module.exports, so [...].ts calls `P.default(...)`. Vitest interops the
// default away; re-wrap it so the production `.default` call works here.
const { nitroCjsShape } = vi.hoisted(() => ({
  nitroCjsShape: async (importOriginal: () => Promise<any>) => ({
    default: { default: (await importOriginal()).default },
  }),
}))
vi.mock("next-auth/providers/credentials", nitroCjsShape)
vi.mock("next-auth/providers/google", nitroCjsShape)
vi.mock("next-auth/providers/facebook", nitroCjsShape)

useTestDb()

// With the `#auth` stub, NuxtAuthHandler returns the raw next-auth options.
const options = authOptions as any
const authorize = options.providers.find((p: any) => p.id === "credentials")
  .options.authorize
const reg = (body: unknown) => callHandler(register, { method: "POST", body })

describe("POST /api/auth/register", () => {
  it("creates a user with a hashed password", async () => {
    expect(await reg({ email: "a@b.co", password: "secret123" })).toEqual({
      status: 200,
      body: { success: true, body: { message: "User created" } },
    })
    expect((await Users.findOne({ email: "a@b.co" }))!.password).not.toBe(
      "secret123",
    )
  })
  it.each([
    [{ email: "not-an-email", password: "secret123" }, "Invalid email"],
    [
      { email: "a@b.co", password: "short" },
      "Password must be at least 8 characters",
    ],
    [{}, "Invalid email"],
  ])("invalid input %j → 400 %s", async (body, message) => {
    expect(await reg(body)).toEqual({
      status: 400,
      body: { success: false, body: { message } },
    })
  })
  it("taken email → 409, no driver error leaked", async () => {
    await seedUser()
    expect(await reg({ email: "a@b.co", password: "secret123" })).toEqual({
      status: 409,
      body: { success: false, body: { message: "Email already registered" } },
    })
  })
})

it("POST /api/auth/check-email", async () => {
  await seedUser()
  expect(
    (
      await callHandler(checkEmail, {
        method: "POST",
        body: { email: "a@b.co" },
      })
    ).body,
  ).toEqual({
    status: "success",
    message: "Email already exists",
    data: { email: "a@b.co", exists: true },
  })
  expect(
    (
      await callHandler(checkEmail, {
        method: "POST",
        body: { email: "z@b.co" },
      })
    ).body,
  ).toEqual({
    status: "success",
    message: "Email is available",
    data: { email: "z@b.co", exists: false },
  })
})

describe("next-auth options", () => {
  it("jwt session strategy, /login sign-in page", () => {
    expect(options.session).toEqual({ strategy: "jwt" })
    expect(options.pages.signIn).toBe("/login")
  })
  it("credentials authorize: valid → user (FREE_USER fallback); otherwise null", async () => {
    const u = await seedUser()
    await Users.create({ email: "g@b.co" })
    const ok = await authorize({ email: "a@b.co", password: "secret123" })
    expect(String(ok._id)).toBe(String(u._id))
    expect(ok.role).toBe("FREE_USER")
    expect(
      await authorize({ email: "a@b.co", password: "wrong-pass" }),
    ).toBeNull()
    expect(
      await authorize({ email: "nobody@b.co", password: "secret123" }),
    ).toBeNull()
    expect(
      await authorize({ email: "g@b.co", password: "secret123" }),
    ).toBeNull()
  })
  it("authorize keeps ADMIN", async () => {
    await seedUser({ email: "x@b.co", role: "ADMIN" })
    expect(
      (await authorize({ email: "x@b.co", password: "secret123" })).role,
    ).toBe("ADMIN")
  })
  it("redirect allows relative and same-origin URLs only", async () => {
    const r = options.callbacks.redirect,
      baseUrl = "https://chordhub.app"
    expect(await r({ url: "/th/song/1", baseUrl })).toBe(
      "https://chordhub.app/th/song/1",
    )
    expect(await r({ url: "https://chordhub.app/en", baseUrl })).toBe(
      "https://chordhub.app/en",
    )
    expect(await r({ url: "https://evil.example/x", baseUrl })).toBe(baseUrl)
  })
  it("session callback copies token.id and accessToken", async () => {
    expect(
      await options.callbacks.session({
        session: { user: {} },
        token: { id: "m1", accessToken: "at" },
      }),
    ).toEqual({ user: { id: "m1" }, accessToken: "at" })
  })
  it("jwt: credentials sign-in stores the Mongo user id", async () => {
    expect(
      await options.callbacks.jwt({
        token: {},
        user: { id: "m1" },
        account: { provider: "credentials" },
      }),
    ).toEqual({ id: "m1" })
  })
  it("jwt: OAuth sign-in stores the Mongo user id, not the provider profile id", async () => {
    expect(
      await options.callbacks.jwt({
        token: {},
        user: { id: "m1" },
        account: { access_token: "at" },
        profile: { id: "g-123" },
      }),
    ).toEqual({ id: "m1", accessToken: "at" })
  })
  it("jwt: later calls leave the token unchanged", async () => {
    expect(
      await options.callbacks.jwt({ token: { id: "m1", accessToken: "at" } }),
    ).toEqual({ id: "m1", accessToken: "at" })
  })
})
