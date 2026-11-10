import { describe, it, expect } from "vitest"
import { useTestDb } from "~~/test/support/db"
import RateLimits from "~~/server/models/rate-limits"
import { incrementWindow } from "~~/server/utils/rate-limit-store"

useTestDb()

const t = (iso: string) => new Date(iso)

describe("incrementWindow", () => {
  it("counts hits in the same window", async () => {
    const now = t("2026-01-01T12:00:10Z")
    const results = []
    for (let i = 0; i < 3; i++)
      results.push(await incrementWindow("ip:1", 60, now))
    expect(results.map((r) => r.count)).toEqual([1, 2, 3])
    for (const r of results)
      expect(r.resetAt).toEqual(t("2026-01-01T12:01:00Z"))
  })

  it("next window starts from 1", async () => {
    const a = await incrementWindow("ip:1", 60, t("2026-01-01T12:00:59Z"))
    const b = await incrementWindow("ip:1", 60, t("2026-01-01T12:01:00Z"))
    expect(a.count).toBe(1)
    expect(b.count).toBe(1)
  })

  it("keys and window sizes are independent", async () => {
    const now = t("2026-01-01T12:00:10Z")
    expect((await incrementWindow("ip:1", 60, now)).count).toBe(1)
    expect((await incrementWindow("ip:2", 60, now)).count).toBe(1)
    expect((await incrementWindow("ip:1", 86400, now)).count).toBe(1)
  })

  it("concurrent hits are all counted", async () => {
    const now = t("2026-01-01T12:00:10Z")
    const results = await Promise.all(
      Array.from({ length: 20 }, () => incrementWindow("ip:1", 60, now)),
    )
    expect(results.map((r) => r.count).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 20 }, (_, i) => i + 1),
    )
  })

  it("stored doc expires at resetAt via TTL index", async () => {
    const now = t("2026-01-01T12:00:10Z")
    const { resetAt } = await incrementWindow("ip:1", 60, now)
    const windowStart = Math.floor(now.getTime() / 60_000) * 60_000
    const doc = await RateLimits.findById(`ip:1|60|${windowStart}`)
    expect(doc?.expiresAt).toEqual(resetAt)
    const indexes = await RateLimits.collection.indexes()
    expect(indexes).toContainEqual(
      expect.objectContaining({
        key: { expiresAt: 1 },
        expireAfterSeconds: 0,
      }),
    )
  })
})
