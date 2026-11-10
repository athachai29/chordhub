import { getRequestHeader, setResponseHeader, setResponseStatus } from "h3"
import type { EventHandler, H3Event } from "h3"
import { forbidden } from "~~/server/utils/auth"
import {
  getClientIp,
  rateLimitKeyForIp,
  type IpConfig,
} from "~~/server/utils/client-ip"
import type { incrementWindow } from "~~/server/utils/rate-limit-store"

export type GuardConfig = IpConfig & {
  mode: "off" | "log" | "enforce"
  perMinute: number
  perDay: number
  registerPerDay: number
}

export type GuardLogEntry = {
  evt: "scraper_guard"
  /** Cloud Logging severity, so entries can be filtered at WARNING. */
  severity: "WARNING"
  action: "blocked" | "would_block" | "error"
  reason:
    | "bot_ua"
    | "rate_minute"
    | "rate_day"
    | "rate_register"
    | "store_error"
  key?: string
  path: string
  /** Truncated to 256 chars. */
  ua: string
}

export type GuardDeps = {
  increment: typeof incrementWindow
  isVerifiedCrawler: (ip: string, ua: string) => Promise<boolean>
  log: (e: GuardLogEntry) => void
  now: () => number
}

export const BOT_UA =
  /python-requests|python-urllib|python-httpx|aiohttp|scrapy|curl\/|wget\/|go-http-client|okhttp|libwww-perl|java\/|node-fetch|axios\/|headlesschrome|phantomjs|selenium|puppeteer|playwright/i

const GUARDED_PREFIX = "/api/songs"
const REGISTER_PATH = "/api/auth/register"
const MAX_LOGGED_UA = 256

type Window = Awaited<ReturnType<typeof incrementWindow>>

/** `event.path` without the query string. */
function pathOnly(event: H3Event): string {
  const q = event.path.indexOf("?")
  return q === -1 ? event.path : event.path.slice(0, q)
}

/**
 * The request path, percent-decoded, without the query string. Built from
 * `event.path` rather than a URL so a malformed Host header can't throw.
 * Returns undefined when the path can't be decoded.
 */
function decodedPath(event: H3Event): string | undefined {
  const raw = pathOnly(event)
  try {
    return decodeURI(raw)
  } catch {
    return undefined
  }
}

export function createScraperGuard(
  getConfig: () => GuardConfig,
  deps: GuardDeps,
): EventHandler {
  return async (event) => {
    const cfg = getConfig()
    if (cfg.mode === "off") return undefined

    const decoded = decodedPath(event)
    const isRegister =
      event.method === "POST" &&
      decoded !== undefined &&
      decoded.replace(/\/+$/, "") === REGISTER_PATH
    // An undecodable path is guarded: the router may still reach a song route.
    const isSongs = decoded === undefined || decoded.startsWith(GUARDED_PREFIX)
    if (!isRegister && !isSongs) return undefined

    const path = decoded ?? pathOnly(event)
    const enforce = cfg.mode === "enforce"
    const action = enforce ? "blocked" : "would_block"
    const ua = getRequestHeader(event, "user-agent") ?? ""

    const log = (
      e: Pick<GuardLogEntry, "action" | "reason"> & { key?: string },
    ) =>
      deps.log({
        evt: "scraper_guard",
        severity: "WARNING",
        ...e,
        path,
        ua: ua.slice(0, MAX_LOGGED_UA),
      })

    const tooManyRequests = (resetAt: Date) => {
      setResponseStatus(event, 429)
      setResponseHeader(
        event,
        "Retry-After",
        Math.max(1, Math.ceil((resetAt.getTime() - deps.now()) / 1000)),
      )
      return { success: false, error: "Too Many Requests" }
    }

    // Account creation is throttled per IP so a scraper can't mint accounts
    // to get fresh `u:<sub>` allowances. No bot-UA check or crawler exemption.
    if (isRegister) {
      const ip = getClientIp(event, cfg)
      if (!ip) return undefined
      const key = `register:${rateLimitKeyForIp(ip)}`
      let day: Window
      try {
        day = await deps.increment(key, 86_400)
      } catch {
        log({ action: "error", reason: "store_error", key })
        return undefined
      }
      if (day.count <= cfg.registerPerDay) return undefined
      log({ action, reason: "rate_register", key })
      return enforce ? tooManyRequests(day.resetAt) : undefined
    }

    const sub = event.context.auth?.sub
    const ip = sub ? undefined : getClientIp(event, cfg)
    const key = sub
      ? `u:${sub}`
      : ip
        ? `ip:${rateLimitKeyForIp(ip)}`
        : undefined

    if (ua && BOT_UA.test(ua)) {
      log({ action, reason: "bot_ua", ...(key ? { key } : {}) })
      if (enforce) return forbidden(event)
    }

    if (!key) return undefined
    // Crawler verification needs the full address, not the /64 key.
    if (ip && (await deps.isVerifiedCrawler(ip, ua))) return undefined

    let minute: Window
    let day: Window
    try {
      ;[minute, day] = await Promise.all([
        deps.increment(key, 60),
        deps.increment(key, 86_400),
      ])
    } catch {
      log({ action: "error", reason: "store_error", key })
      return undefined
    }

    const overMinute = minute.count > cfg.perMinute
    if (!overMinute && day.count <= cfg.perDay) return undefined

    const reason = overMinute ? "rate_minute" : "rate_day"
    log({ action, reason, key })
    if (!enforce) return undefined
    return tooManyRequests((overMinute ? minute : day).resetAt)
  }
}
