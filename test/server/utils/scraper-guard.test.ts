import { createServer, request } from "node:http"
import type { AddressInfo } from "node:net"
import { describe, it, expect, vi } from "vitest"
import { createApp, eventHandler, getResponseHeader, toNodeListener } from "h3"
import { callHandler } from "~~/test/support/http"
import {
  BOT_UA,
  createScraperGuard,
  type GuardConfig,
  type GuardDeps,
} from "~~/server/utils/scraper-guard"

const NOW = 1_700_000_000_000
const CHROME =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
const GOOGLEBOT =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
const BASE: GuardConfig = {
  mode: "enforce",
  perMinute: 30,
  perDay: 500,
  registerPerDay: 5,
  ipHeader: "",
  xffHopsFromRight: 0,
}
const echo = eventHandler(() => ({ success: true }))

function setup(
  cfg: Partial<GuardConfig> = {},
  counts: { minute?: number; day?: number } = {},
) {
  const increment = vi.fn(async (_key: string, windowSeconds: number) => ({
    count: windowSeconds === 60 ? counts.minute ?? 1 : counts.day ?? 1,
    resetAt: new Date(NOW + 12_000),
  }))
  const deps = {
    increment,
    isVerifiedCrawler: vi.fn().mockResolvedValue(false),
    log: vi.fn(),
    now: () => NOW,
  }
  const guard = createScraperGuard(
    () => ({ ...BASE, ...cfg }),
    deps as unknown as GuardDeps,
  )
  return { guard, deps, increment }
}

function call(
  guard: ReturnType<typeof createScraperGuard>,
  opts: {
    method?: string
    path?: string
    headers?: Record<string, string>
    auth?: Record<string, unknown> | null
  } = {},
) {
  return callHandler(echo, {
    middleware: [guard],
    method: opts.method,
    path: opts.path ?? "/api/songs/abc123",
    headers: {
      "x-forwarded-for": "203.0.113.7",
      "user-agent": CHROME,
      ...opts.headers,
    },
    ...("auth" in opts ? { auth: opts.auth } : {}),
  })
}

/** Raw node:http GET, for headers fetch won't send verbatim (e.g. a bad Host). */
async function rawGet(
  guard: ReturnType<typeof createScraperGuard>,
  path: string,
  headers: Record<string, string>,
) {
  const app = createApp()
  app.use(guard)
  app.use(echo)
  const server = createServer(toNodeListener(app))
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
  try {
    const { port } = server.address() as AddressInfo
    return await new Promise<number>((resolve, reject) => {
      const req = request(
        { host: "127.0.0.1", port, path, headers, setHost: false },
        (res) => {
          res.resume()
          res.on("end", () => resolve(res.statusCode ?? 0))
        },
      )
      req.on("error", reject)
      req.end()
    })
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
}

describe("scraper guard", () => {
  it("ignores paths outside /api/songs", async () => {
    const { guard, increment } = setup()
    const res = await call(guard, { path: "/api/health" })
    expect(res.status).toBe(200)
    expect(increment).not.toHaveBeenCalled()
  })

  it("mode off does nothing", async () => {
    const { guard, increment, deps } = setup({ mode: "off" })
    const res = await call(guard, {
      headers: { "user-agent": "python-requests/2.31.0" },
    })
    expect(res.status).toBe(200)
    expect(increment).not.toHaveBeenCalled()
    expect(deps.log).not.toHaveBeenCalled()
  })

  it("BOT_UA matches scripted clients, not browsers or link previews", () => {
    for (const ua of [
      "python-requests/2.31.0",
      "Scrapy/2.11.0 (+https://scrapy.org)",
      "curl/8.4.0",
      "Wget/1.21.4",
      "Go-http-client/1.1",
      "python-httpx/0.27.0",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36",
    ]) {
      expect(BOT_UA.test(ua), ua).toBe(true)
    }
    for (const ua of [
      CHROME,
      GOOGLEBOT,
      "facebookexternalhit/1.1",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Line/13.20.0",
      "Mozilla/5.0 (chordhub-smoke)",
    ]) {
      expect(BOT_UA.test(ua), ua).toBe(false)
    }
  })

  it("enforce: bot UA -> 403 before counting", async () => {
    const { guard, increment, deps } = setup()
    const res = await call(guard, {
      headers: { "user-agent": "python-requests/2.31.0" },
    })
    expect(res).toEqual({
      status: 403,
      body: { success: false, error: "Forbidden" },
    })
    expect(increment).not.toHaveBeenCalled()
    expect(deps.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: "blocked", reason: "bot_ua" }),
    )
  })

  it("log mode: bot UA passes and is logged", async () => {
    const { guard, deps } = setup({ mode: "log" })
    const res = await call(guard, {
      headers: { "user-agent": "python-requests/2.31.0" },
    })
    expect(res.status).toBe(200)
    expect(deps.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: "would_block", reason: "bot_ua" }),
    )
  })

  it("empty UA is not treated as a bot", async () => {
    const { guard } = setup()
    const res = await call(guard, { headers: { "user-agent": "" } })
    expect(res.status).toBe(200)
  })

  it("enforce: over perMinute -> 429 with Retry-After", async () => {
    const { guard, deps } = setup({}, { minute: 31 })
    let retryAfter: unknown
    const spy = eventHandler(async (event) => {
      const result = await guard(event)
      retryAfter = getResponseHeader(event, "retry-after")
      return result
    })
    const res = await call(spy as ReturnType<typeof createScraperGuard>)
    expect(res.status).toBe(429)
    expect(String(retryAfter)).toBe("12")
    expect(res.body).toEqual({ success: false, error: "Too Many Requests" })
    expect(deps.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "blocked",
        reason: "rate_minute",
        key: "ip:203.0.113.7",
      }),
    )
  })

  it("enforce: over perDay -> 429 rate_day", async () => {
    const { guard, deps } = setup({}, { minute: 5, day: 501 })
    const res = await call(guard)
    expect(res.status).toBe(429)
    expect(deps.log).toHaveBeenCalledWith(
      expect.objectContaining({ reason: "rate_day" }),
    )
  })

  it("log mode never blocks", async () => {
    const { guard, deps } = setup({ mode: "log" }, { minute: 31 })
    const res = await call(guard)
    expect(res.status).toBe(200)
    expect(deps.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: "would_block", reason: "rate_minute" }),
    )
  })

  it("guards query-string paths", async () => {
    const { guard, increment } = setup()
    await call(guard, { path: "/api/songs/search?query=x" })
    expect(increment).toHaveBeenCalled()
  })

  it("logged-in user is keyed by user id", async () => {
    const { guard, increment, deps } = setup()
    const res = await call(guard, { auth: { sub: "u1" } })
    expect(res.status).toBe(200)
    expect(increment).toHaveBeenCalledWith("u:u1", 60)
    expect(increment).toHaveBeenCalledWith("u:u1", 86_400)
    expect(deps.isVerifiedCrawler).not.toHaveBeenCalled()
  })

  it("verified crawler skips counting", async () => {
    const { guard, increment, deps } = setup()
    deps.isVerifiedCrawler.mockResolvedValue(true)
    const res = await call(guard, { headers: { "user-agent": GOOGLEBOT } })
    expect(res.status).toBe(200)
    expect(deps.isVerifiedCrawler).toHaveBeenCalledWith(
      "203.0.113.7",
      GOOGLEBOT,
    )
    expect(increment).not.toHaveBeenCalled()
  })

  it("unresolvable IP fails open", async () => {
    const { guard, increment, deps } = setup({ ipHeader: "cf-connecting-ip" })
    const res = await call(guard)
    expect(res.status).toBe(200)
    expect(increment).not.toHaveBeenCalled()
    expect(deps.log).not.toHaveBeenCalled()
  })

  it("store error fails open", async () => {
    const { guard, increment, deps } = setup()
    increment.mockRejectedValue(new Error("mongo down"))
    const res = await call(guard)
    expect(res.status).toBe(200)
    expect(deps.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: "error", reason: "store_error" }),
    )
  })

  it("percent-encoded /api/%73ongs is still counted", async () => {
    const { guard, increment } = setup()
    await call(guard, { path: "/api/%73ongs/abc123" })
    expect(increment).toHaveBeenCalledWith("ip:203.0.113.7", 60)
  })

  it("enforce: bot UA on /api/%73ongs -> 403", async () => {
    const { guard } = setup()
    const res = await call(guard, {
      path: "/api/%73ongs/abc123",
      headers: { "user-agent": "python-requests/2.31.0" },
    })
    expect(res.status).toBe(403)
  })

  it("malformed Host header does not break unrelated routes", async () => {
    const { guard } = setup()
    const status = await rawGet(guard, "/api/health", {
      host: "a b",
      "user-agent": CHROME,
      "x-forwarded-for": "203.0.113.7",
    })
    expect(status).toBe(200)
  })

  it("malformed Host header on a song path is still guarded, not a 500", async () => {
    const { guard, increment } = setup()
    const status = await rawGet(guard, "/api/songs/abc123", {
      host: "a b",
      "user-agent": CHROME,
      "x-forwarded-for": "203.0.113.7",
    })
    expect(status).toBe(200)
    expect(increment).toHaveBeenCalled()
  })

  it("malformed percent escape is treated as guarded, no 500", async () => {
    const { guard, increment } = setup()
    const res = await call(guard, { path: "/api/songs/%E0%A4%A" })
    expect(res.status).toBe(200)
    expect(increment).toHaveBeenCalled()
  })

  it("two IPv6 addresses in one /64 share a counter key", async () => {
    const { guard, increment } = setup()
    await call(guard, { headers: { "x-forwarded-for": "2001:db8::1" } })
    await call(guard, {
      headers: { "x-forwarded-for": "2001:DB8:0:0:ffff::2" },
    })
    const keys = increment.mock.calls.map(([key]) => key)
    expect(new Set(keys)).toEqual(new Set(["ip:2001:0db8:0000:0000::/64"]))
  })

  it("IPv6 crawler verification gets the full address, not the /64", async () => {
    const { guard, deps } = setup()
    await call(guard, {
      headers: { "x-forwarded-for": "2001:db8::1", "user-agent": GOOGLEBOT },
    })
    expect(deps.isVerifiedCrawler).toHaveBeenCalledWith(
      "2001:db8::1",
      GOOGLEBOT,
    )
  })

  describe("register throttle", () => {
    const register = (
      guard: ReturnType<typeof createScraperGuard>,
      extra: { method?: string; headers?: Record<string, string> } = {},
    ) =>
      call(guard, {
        method: "POST",
        path: "/api/auth/register",
        ...extra,
      })

    it("enforce: 6th register POST -> 429 rate_register", async () => {
      const { guard, deps, increment } = setup({}, { day: 6 })
      let retryAfter: unknown
      const spy = eventHandler(async (event) => {
        const result = await guard(event)
        retryAfter = getResponseHeader(event, "retry-after")
        return result
      })
      const res = await register(spy as ReturnType<typeof createScraperGuard>)
      expect(res.status).toBe(429)
      expect(res.body).toEqual({ success: false, error: "Too Many Requests" })
      expect(String(retryAfter)).toBe("12")
      expect(increment).toHaveBeenCalledTimes(1)
      expect(increment).toHaveBeenCalledWith("register:203.0.113.7", 86_400)
      expect(deps.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "blocked",
          reason: "rate_register",
          key: "register:203.0.113.7",
        }),
      )
    })

    it("5th register POST passes", async () => {
      const { guard, deps } = setup({}, { day: 5 })
      const res = await register(guard)
      expect(res.status).toBe(200)
      expect(deps.log).not.toHaveBeenCalled()
    })

    it("bot UA and crawler exemption do not apply to register", async () => {
      const { guard, deps, increment } = setup({}, { day: 1 })
      const res = await register(guard, {
        headers: { "user-agent": "python-requests/2.31.0" },
      })
      expect(res.status).toBe(200)
      expect(increment).toHaveBeenCalledWith("register:203.0.113.7", 86_400)
      expect(deps.isVerifiedCrawler).not.toHaveBeenCalled()
      expect(deps.log).not.toHaveBeenCalled()
    })

    it("GET /api/auth/register is not counted", async () => {
      const { guard, increment } = setup({}, { day: 6 })
      const res = await call(guard, { path: "/api/auth/register" })
      expect(res.status).toBe(200)
      expect(increment).not.toHaveBeenCalled()
    })

    it("trailing slash and query string are still counted", async () => {
      const { guard, increment } = setup()
      await call(guard, { method: "POST", path: "/api/auth/register/?x=1" })
      expect(increment).toHaveBeenCalledWith("register:203.0.113.7", 86_400)
    })

    it("log mode passes and logs would_block", async () => {
      const { guard, deps } = setup({ mode: "log" }, { day: 6 })
      const res = await register(guard)
      expect(res.status).toBe(200)
      expect(deps.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "would_block",
          reason: "rate_register",
        }),
      )
    })

    it("IPv6 register is keyed per /64", async () => {
      const { guard, increment } = setup()
      await register(guard, { headers: { "x-forwarded-for": "2001:db8::1" } })
      expect(increment).toHaveBeenCalledWith(
        "register:2001:0db8:0000:0000::/64",
        86_400,
      )
    })

    it("no resolvable IP fails open", async () => {
      const { guard, increment } = setup({ ipHeader: "cf-connecting-ip" })
      const res = await register(guard)
      expect(res.status).toBe(200)
      expect(increment).not.toHaveBeenCalled()
    })

    it("store error fails open", async () => {
      const { guard, increment, deps } = setup()
      increment.mockRejectedValue(new Error("mongo down"))
      const res = await register(guard)
      expect(res.status).toBe(200)
      expect(deps.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "error",
          reason: "store_error",
          key: "register:203.0.113.7",
        }),
      )
    })
  })

  describe("log entries", () => {
    it("bot_ua entry carries the IP key", async () => {
      const { guard, deps } = setup()
      await call(guard, { headers: { "user-agent": "python-requests/2.31.0" } })
      expect(deps.log).toHaveBeenCalledWith(
        expect.objectContaining({ reason: "bot_ua", key: "ip:203.0.113.7" }),
      )
    })

    it("bot_ua entry carries the user key when logged in", async () => {
      const { guard, deps } = setup()
      await call(guard, {
        headers: { "user-agent": "python-requests/2.31.0" },
        auth: { sub: "u1" },
      })
      expect(deps.log).toHaveBeenCalledWith(
        expect.objectContaining({ reason: "bot_ua", key: "u:u1" }),
      )
    })

    it("ua is truncated to 256 chars", async () => {
      const { guard, deps } = setup({}, { minute: 31 })
      await call(guard, { headers: { "user-agent": "A".repeat(1000) } })
      expect(deps.log.mock.calls[0][0].ua).toBe("A".repeat(256))
    })

    it("every entry has severity WARNING", async () => {
      const { guard, deps } = setup({ mode: "log" }, { minute: 31 })
      await call(guard, { headers: { "user-agent": "python-requests/2.31.0" } })
      expect(deps.log).toHaveBeenCalledTimes(2)
      for (const [entry] of deps.log.mock.calls) {
        expect(entry.severity).toBe("WARNING")
      }
    })
  })
})
