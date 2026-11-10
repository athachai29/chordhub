import * as nodeDnsPromises from "node:dns/promises"
import { isIP } from "node:net"

export type DnsResolver = {
  reverse(ip: string): Promise<string[]>
  /** Forward lookup of one address family (A for 4, AAAA for 6). */
  resolve(host: string, family?: 4 | 6): Promise<string[]>
}

/**
 * Each crawler's UA is only trusted from its own PTR domains: a Google IP
 * sending a bingbot UA (or vice versa) is not verified.
 */
export const CRAWLER_FAMILIES = [
  {
    name: "google",
    ua: /Googlebot/i,
    hostSuffixes: [".googlebot.com", ".google.com"],
  },
  { name: "bing", ua: /bingbot/i, hostSuffixes: [".search.msn.com"] },
] as const

type CrawlerFamily = (typeof CRAWLER_FAMILIES)[number]["name"]

export const CRAWLER_UA = /Googlebot|bingbot/i
export const CRAWLER_HOST_SUFFIXES: string[] = CRAWLER_FAMILIES.flatMap(
  (f) => f.hostSuffixes,
)

const MAX_CACHE_ENTRIES = 10_000

const NO_RECORDS = new Set(["ENODATA", "ENOTFOUND"])
const VERIFY_TIMEOUT_MS = 2_000

function isNoRecords(err: unknown): boolean {
  return NO_RECORDS.has((err as { code?: string } | null)?.code ?? "")
}

function hostFamily(host: string): CrawlerFamily | undefined {
  return CRAWLER_FAMILIES.find((f) =>
    f.hostSuffixes.some((s) => host.endsWith(s)),
  )?.name
}

const nodeDns: DnsResolver = {
  reverse: (ip) => nodeDnsPromises.reverse(ip),
  // Only the family being verified is resolved, so a failure of the other
  // family can't turn into a definitive negative. "No records" is a
  // definitive []; any other failure (SERVFAIL, timeout) rejects so the
  // caller can treat it as transient.
  resolve: async (host, family = 4) => {
    try {
      return await (family === 6
        ? nodeDnsPromises.resolve6(host)
        : nodeDnsPromises.resolve4(host))
    } catch (err) {
      if (isNoRecords(err)) return []
      throw err
    }
  },
}

/** `family` is the crawler the IP verified as, if any. */
type Outcome = { family?: CrawlerFamily; transient: boolean }

/**
 * Build a verifier implementing the documented reverse-then-forward DNS check
 * for Googlebot/Bingbot. A UA match alone is never trusted: the IP's PTR must
 * end in a domain of the UA's crawler and resolve back to the same IP.
 *
 * Definitive outcomes are cached per IP for `ttlMs`; outcomes caused by a DNS
 * error or the 2s timeout are cached only for `errorTtlMs`. Concurrent calls
 * for one IP share a single lookup.
 */
export function createCrawlerVerifier(
  dns: DnsResolver = nodeDns,
  ttlMs = 86_400_000,
  now: () => number = Date.now,
  errorTtlMs = 60_000,
): (ip: string, ua: string) => Promise<boolean> {
  const cache = new Map<string, { family?: CrawlerFamily; expires: number }>()
  const inFlight = new Map<string, Promise<CrawlerFamily | undefined>>()

  async function lookup(ip: string): Promise<Outcome> {
    try {
      const hosts = await dns.reverse(ip)
      const host = hosts
        .map((h) => h.toLowerCase().replace(/\.$/, ""))
        .find((h) => hostFamily(h))
      if (!host) return { transient: false }
      const addrs = await dns.resolve(host, isIP(ip) === 6 ? 6 : 4)
      return {
        family: addrs.includes(ip) ? hostFamily(host) : undefined,
        transient: false,
      }
    } catch (err) {
      // A reverse lookup with no PTR record is definitive, not transient.
      return { transient: !isNoRecords(err) }
    }
  }

  async function verifyIp(ip: string): Promise<CrawlerFamily | undefined> {
    let timer: ReturnType<typeof setTimeout> | undefined
    const timeout = new Promise<Outcome>((resolve) => {
      timer = setTimeout(() => resolve({ transient: true }), VERIFY_TIMEOUT_MS)
    })
    let outcome: Outcome
    try {
      outcome = await Promise.race([lookup(ip), timeout])
    } finally {
      clearTimeout(timer)
    }

    if (cache.size > MAX_CACHE_ENTRIES) cache.clear()
    cache.set(ip, {
      family: outcome.family,
      expires: now() + (outcome.transient ? errorTtlMs : ttlMs),
    })
    return outcome.family
  }

  // The cache stores which crawler an IP verified as, so one lookup serves
  // every UA from that IP and a mismatched UA is still refused.
  return async (ip, ua) => {
    const uaFamily = CRAWLER_FAMILIES.find((f) => f.ua.test(ua))?.name
    if (!uaFamily) return false

    const hit = cache.get(ip)
    if (hit && hit.expires > now()) return hit.family === uaFamily

    let pending = inFlight.get(ip)
    if (!pending) {
      pending = verifyIp(ip).finally(() => inFlight.delete(ip))
      inFlight.set(ip, pending)
    }
    return (await pending) === uaFamily
  }
}
