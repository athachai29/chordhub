import { describe, it, expect } from "vitest"
import { eventHandler } from "h3"
import { callHandler } from "~~/test/support/http"
import {
  getClientIp,
  rateLimitKeyForIp,
  type IpConfig,
} from "~~/server/utils/client-ip"

const DEFAULT: IpConfig = { ipHeader: "", xffHopsFromRight: 0 }
const XFF = "6.6.6.6, 203.0.113.7"

async function resolveIp(headers: Record<string, string>, cfg: IpConfig) {
  const { body } = await callHandler(
    eventHandler((e) => ({ ip: getClientIp(e, cfg) ?? null })),
    { headers },
  )
  return body.ip
}

describe("getClientIp", () => {
  it("uses the rightmost XFF entry by default (client-prepended entries ignored)", async () => {
    expect(await resolveIp({ "x-forwarded-for": XFF }, DEFAULT)).toBe(
      "203.0.113.7",
    )
  })

  it("hops=1 skips a load-balancer entry", async () => {
    expect(
      await resolveIp(
        { "x-forwarded-for": XFF },
        { ipHeader: "", xffHopsFromRight: 1 },
      ),
    ).toBe("6.6.6.6")
  })

  it("returns undefined when hops run past the list", async () => {
    expect(
      await resolveIp(
        { "x-forwarded-for": "203.0.113.7" },
        { ipHeader: "", xffHopsFromRight: 1 },
      ),
    ).toBeNull()
  })

  it("ipHeader wins over XFF", async () => {
    expect(
      await resolveIp(
        { "cf-connecting-ip": "198.51.100.4", "x-forwarded-for": XFF },
        { ipHeader: "cf-connecting-ip", xffHopsFromRight: 0 },
      ),
    ).toBe("198.51.100.4")
  })

  it("ipHeader configured but absent does not fall back to XFF", async () => {
    expect(
      await resolveIp(
        { "x-forwarded-for": XFF },
        { ipHeader: "cf-connecting-ip", xffHopsFromRight: 0 },
      ),
    ).toBeNull()
  })

  it("rejects non-IP garbage", async () => {
    expect(await resolveIp({ "x-forwarded-for": "hello" }, DEFAULT)).toBeNull()
  })

  it("accepts IPv6", async () => {
    expect(await resolveIp({ "x-forwarded-for": "2001:db8::1" }, DEFAULT)).toBe(
      "2001:db8::1",
    )
  })

  it("strips a leading ::ffff: from IPv4-mapped addresses", async () => {
    expect(
      await resolveIp({ "x-forwarded-for": "::ffff:203.0.113.7" }, DEFAULT),
    ).toBe("203.0.113.7")
  })

  it("falls back to the socket address with no headers", async () => {
    expect(await resolveIp({}, DEFAULT)).toBe("127.0.0.1")
  })
})

describe("rateLimitKeyForIp", () => {
  it("leaves IPv4 unchanged", () => {
    expect(rateLimitKeyForIp("203.0.113.7")).toBe("203.0.113.7")
  })

  it("keys IPv6 by its expanded, lowercase /64", () => {
    expect(rateLimitKeyForIp("2001:db8::1")).toBe("2001:0db8:0000:0000::/64")
    expect(rateLimitKeyForIp("2001:DB8:0:0:ffff::2")).toBe(
      "2001:0db8:0000:0000::/64",
    )
    expect(rateLimitKeyForIp("2001:db8:1:2:3:4:5:6")).toBe(
      "2001:0db8:0001:0002::/64",
    )
    expect(rateLimitKeyForIp("::1")).toBe("0000:0000:0000:0000::/64")
  })

  it("handles :: inside the /64 and a trailing dotted quad", () => {
    expect(rateLimitKeyForIp("2001:db8::5:6:7:8")).toBe(
      "2001:0db8:0000:0000::/64",
    )
    expect(rateLimitKeyForIp("2001::1:2:3:4:5:6")).toBe(
      "2001:0000:0001:0002::/64",
    )
    expect(rateLimitKeyForIp("64:ff9b::192.0.2.1")).toBe(
      "0064:ff9b:0000:0000::/64",
    )
  })
})
