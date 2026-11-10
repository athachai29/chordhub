import { isIP } from "node:net"
import { getRequestHeader, type H3Event } from "h3"

export type IpConfig = { ipHeader: string; xffHopsFromRight: number }

function normalize(value: string | undefined): string | undefined {
  if (!value) return undefined
  const ip = value.trim().replace(/^::ffff:/i, "")
  return isIP(ip) !== 0 ? ip : undefined
}

/**
 * Resolve the client IP used to key rate-limit counters.
 *
 * 1. `cfg.ipHeader` set: first value of that header; no fallback if absent
 *    (falling back to X-Forwarded-For would key on CDN IPs).
 * 2. X-Forwarded-For present: entry `xffHopsFromRight` from the right. The
 *    left side is client-controlled, so the default is the rightmost entry.
 * 3. Otherwise the socket address.
 */
export function getClientIp(event: H3Event, cfg: IpConfig): string | undefined {
  if (cfg.ipHeader) {
    const header = getRequestHeader(event, cfg.ipHeader)
    return normalize(header?.split(",")[0])
  }

  const xff = getRequestHeader(event, "x-forwarded-for")
  if (xff) {
    const parts = xff
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
    return normalize(parts[parts.length - 1 - cfg.xffHopsFromRight])
  }

  return normalize(event.node.req.socket?.remoteAddress)
}

function hextets(part: string): string[] {
  if (!part) return []
  // A trailing dotted quad (e.g. 64:ff9b::192.0.2.1) fills the last 32 bits.
  return part.split(":").flatMap((h) => (h.includes(".") ? ["0", "0"] : [h]))
}

/**
 * Rate-limit key for a client IP. IPv4 is used as is. IPv6 is keyed by its
 * /64 (a single host usually controls a whole /64), formatted as the first
 * four hextets, lowercase and zero-padded: `2001:0db8:0000:0000::/64`.
 */
export function rateLimitKeyForIp(ip: string): string {
  if (isIP(ip) !== 6) return ip
  const addr = ip.toLowerCase().replace(/%.*$/, "")
  const [head, tail] = addr.split("::")
  let groups = hextets(head ?? "")
  if (tail !== undefined) {
    const rest = hextets(tail)
    groups = [
      ...groups,
      ...Array<string>(8 - groups.length - rest.length).fill("0"),
      ...rest,
    ]
  }
  return `${groups
    .slice(0, 4)
    .map((h) => h.padStart(4, "0"))
    .join(":")}::/64`
}
