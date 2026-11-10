import { describe, it, expect, vi, afterEach } from "vitest"
import {
  createCrawlerVerifier,
  type DnsResolver,
} from "~~/server/utils/verified-crawler"

const nodeDns = vi.hoisted(() => ({
  reverse: vi.fn(),
  resolve4: vi.fn(),
  resolve6: vi.fn(),
}))
vi.mock("node:dns/promises", () => nodeDns)

const GB =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
const CHROME =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
const BING =
  "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)"
const IP = "66.249.66.1"
const BING_IP = "157.55.39.1"
const IP6 = "2001:4860:4801:2008::1"

function fakeDns(reverse: string[] | Error, resolve: string[] = [IP]) {
  const dns = {
    reverse: vi.fn(async (_ip: string) => {
      if (reverse instanceof Error) throw reverse
      return reverse
    }),
    resolve: vi.fn(async (_host: string, _family?: 4 | 6) => resolve),
  }
  return dns satisfies DnsResolver
}

describe("createCrawlerVerifier", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("non-crawler UA → false, no DNS", async () => {
    const dns = fakeDns(["crawl-66-249-66-1.googlebot.com"])
    const verify = createCrawlerVerifier(dns)
    expect(await verify(IP, CHROME)).toBe(false)
    expect(dns.reverse).not.toHaveBeenCalled()
  })

  it("genuine Googlebot → true", async () => {
    const dns = fakeDns(["crawl-66-249-66-1.googlebot.com"], [IP])
    const verify = createCrawlerVerifier(dns)
    expect(await verify(IP, GB)).toBe(true)
    expect(dns.resolve).toHaveBeenCalledWith(
      "crawl-66-249-66-1.googlebot.com",
      4,
    )
  })

  it("tolerates a trailing dot on the PTR hostname", async () => {
    const dns = fakeDns(["crawl-66-249-66-1.googlebot.com."], [IP])
    expect(await createCrawlerVerifier(dns)(IP, GB)).toBe(true)
  })

  it("PTR outside Google → false", async () => {
    const dns = fakeDns(["evil.example.com"])
    expect(await createCrawlerVerifier(dns)(IP, GB)).toBe(false)
  })

  it("suffix must be at the end", async () => {
    const dns = fakeDns(["googlebot.com.evil.net"])
    expect(await createCrawlerVerifier(dns)(IP, GB)).toBe(false)
  })

  it("forward lookup mismatch → false", async () => {
    const dns = fakeDns(["crawl-66-249-66-1.googlebot.com"], ["1.2.3.4"])
    expect(await createCrawlerVerifier(dns)(IP, GB)).toBe(false)
  })

  it("DNS error → false", async () => {
    const dns = fakeDns(Object.assign(new Error("x"), { code: "ENOTFOUND" }))
    expect(await createCrawlerVerifier(dns)(IP, GB)).toBe(false)
  })

  it("result cached for ttl", async () => {
    const dns = fakeDns(["crawl-66-249-66-1.googlebot.com"], [IP])
    let now = 0
    const verify = createCrawlerVerifier(dns, 1000, () => now)
    expect(await verify(IP, GB)).toBe(true)
    now = 999
    expect(await verify(IP, GB)).toBe(true)
    expect(dns.reverse).toHaveBeenCalledTimes(1)
    now = 1001
    expect(await verify(IP, GB)).toBe(true)
    expect(dns.reverse).toHaveBeenCalledTimes(2)
  })

  it("DNS error is cached briefly, not for ttl", async () => {
    const dns = fakeDns(Object.assign(new Error("x"), { code: "ESERVFAIL" }))
    let now = 0
    const verify = createCrawlerVerifier(dns, 86_400_000, () => now)
    expect(await verify(IP, GB)).toBe(false)
    now = 59_999
    expect(await verify(IP, GB)).toBe(false)
    expect(dns.reverse).toHaveBeenCalledTimes(1)
    now = 60_001
    await verify(IP, GB)
    expect(dns.reverse).toHaveBeenCalledTimes(2)
  })

  it("forward-lookup error is also cached briefly", async () => {
    const dns = fakeDns(["crawl-66-249-66-1.googlebot.com"])
    dns.resolve.mockRejectedValue(
      Object.assign(new Error("x"), { code: "ESERVFAIL" }),
    )
    let now = 0
    const verify = createCrawlerVerifier(dns, 86_400_000, () => now)
    expect(await verify(IP, GB)).toBe(false)
    now = 60_001
    expect(await verify(IP, GB)).toBe(false)
    expect(dns.reverse).toHaveBeenCalledTimes(2)
  })

  it("definitive negative is cached for ttl", async () => {
    const dns = fakeDns(["evil.example.com"])
    let now = 0
    const verify = createCrawlerVerifier(dns, 86_400_000, () => now)
    expect(await verify(IP, GB)).toBe(false)
    now = 60_001
    expect(await verify(IP, GB)).toBe(false)
    expect(dns.reverse).toHaveBeenCalledTimes(1)
  })

  it("slow DNS times out to false", async () => {
    vi.useFakeTimers()
    const dns = {
      reverse: vi.fn(() => new Promise<string[]>(() => {})),
      resolve: vi.fn(async () => [IP]),
    }
    const verify = createCrawlerVerifier(dns)
    const result = verify(IP, GB)
    await vi.advanceTimersByTimeAsync(2_000)
    expect(await result).toBe(false)
  })

  it("concurrent calls for one IP share a lookup", async () => {
    const dns = fakeDns(["crawl-66-249-66-1.googlebot.com"], [IP])
    const verify = createCrawlerVerifier(dns)
    const [a, b] = await Promise.all([verify(IP, GB), verify(IP, GB)])
    expect([a, b]).toEqual([true, true])
    expect(dns.reverse).toHaveBeenCalledTimes(1)
  })

  it("Google PTR with a bingbot UA → false", async () => {
    const dns = fakeDns(["crawl-66-249-66-1.googlebot.com"], [IP])
    expect(await createCrawlerVerifier(dns)(IP, BING)).toBe(false)
  })

  it("Google PTR cached for Googlebot does not verify a bingbot UA", async () => {
    const dns = fakeDns(["crawl-66-249-66-1.googlebot.com"], [IP])
    const verify = createCrawlerVerifier(dns)
    expect(await verify(IP, GB)).toBe(true)
    expect(await verify(IP, BING)).toBe(false)
  })

  it("msn PTR with a bingbot UA → true", async () => {
    const dns = fakeDns(["msnbot-157-55-39-1.search.msn.com"], [BING_IP])
    expect(await createCrawlerVerifier(dns)(BING_IP, BING)).toBe(true)
  })

  it("msn PTR with a Googlebot UA → false", async () => {
    const dns = fakeDns(["msnbot-157-55-39-1.search.msn.com"], [BING_IP])
    expect(await createCrawlerVerifier(dns)(BING_IP, GB)).toBe(false)
  })

  it("Googlebot UA accepts a .google.com PTR", async () => {
    const dns = fakeDns(["rate-limited-proxy-66-249-66-1.google.com"], [IP])
    expect(await createCrawlerVerifier(dns)(IP, GB)).toBe(true)
  })

  it("IPv6 forward-resolves AAAA only", async () => {
    const dns = fakeDns(["crawl.googlebot.com"], [IP6])
    expect(await createCrawlerVerifier(dns)(IP6, GB)).toBe(true)
    expect(dns.resolve).toHaveBeenCalledWith("crawl.googlebot.com", 6)
  })

  describe("default node:dns resolver", () => {
    afterEach(() => {
      for (const fn of Object.values(nodeDns)) fn.mockReset()
    })

    it("IPv6: AAAA SERVFAIL is transient even if A succeeds", async () => {
      nodeDns.reverse.mockResolvedValue(["crawl.googlebot.com"])
      nodeDns.resolve4.mockResolvedValue([IP])
      nodeDns.resolve6.mockRejectedValue(
        Object.assign(new Error("x"), { code: "ESERVFAIL" }),
      )
      let now = 0
      const verify = createCrawlerVerifier(undefined, 86_400_000, () => now)
      expect(await verify(IP6, GB)).toBe(false)
      expect(nodeDns.resolve4).not.toHaveBeenCalled()
      now = 60_001
      await verify(IP6, GB)
      expect(nodeDns.reverse).toHaveBeenCalledTimes(2)
    })

    it("IPv4: resolves A only", async () => {
      nodeDns.reverse.mockResolvedValue(["crawl-66-249-66-1.googlebot.com"])
      nodeDns.resolve4.mockResolvedValue([IP])
      expect(await createCrawlerVerifier()(IP, GB)).toBe(true)
      expect(nodeDns.resolve6).not.toHaveBeenCalled()
    })

    it("no records is a definitive negative", async () => {
      nodeDns.reverse.mockResolvedValue(["crawl.googlebot.com"])
      nodeDns.resolve6.mockRejectedValue(
        Object.assign(new Error("x"), { code: "ENODATA" }),
      )
      let now = 0
      const verify = createCrawlerVerifier(undefined, 86_400_000, () => now)
      expect(await verify(IP6, GB)).toBe(false)
      now = 60_001
      await verify(IP6, GB)
      expect(nodeDns.reverse).toHaveBeenCalledTimes(1)
    })
  })
})
