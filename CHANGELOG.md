# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- Scraper guard on `/api/songs/**`: per-user/IP limits of 30/min and 500/day in a Mongo TTL collection, bot-UA refusal, DNS-verified Googlebot/Bingbot exemption, and `Disallow: /api/` in robots.txt. IPv6 clients are counted per /64.
- `POST /api/auth/register` is limited to 5 per IP per day (`NUXT_SCRAPER_GUARD_REGISTER_PER_DAY`), so a scraper can't create accounts to get more per-user allowance.

### Changed

- Song APIs return only public fields. Private and inactive songs are hidden from the song API and search. Artist lists no longer include sheets.
- The song page shows 429/403 guard responses as error pages instead of a 500.
- Nuxt 4.6 (app/ + shared/ layout) on Node 24; @sidebase/nuxt-auth 1.4, @nuxtjs/i18n 10, @nuxtjs/sitemap 7, nuxt-gtag 4.1, Pinia 4.
- Docker image builds on node:24-alpine from the committed yarn.lock.
- Child sitemaps moved to `/__sitemap__/th-TH.xml` and `/__sitemap__/en-US.xml`; the old `/th-TH-sitemap.xml` and `/en-US-sitemap.xml` 301 there.

### Removed

- `GET /api/songs` (the full catalogue). The sitemap reads the DB directly.

### Deploy

- Cloud Run `AUTH_ORIGIN` must become the full auth URL `https://chordhub.app/api/auth` in the same deploy. With the old origin-only value the new revision refuses to boot. `NEXTAUTH_URL` stays `https://chordhub.app`.
- Scraper guard rollout:
  1. Ships with `NUXT_SCRAPER_GUARD_MODE=log`. After a few days, check the Cloud Run logs for `scraper_guard`.
  2. Cross-check the logged `key`s (`ip:...`) against `httpRequest.remoteIp` in the Cloud Run request logs for the same requests. If they differ, or every key is one of a few CDN or load-balancer IPs, set `NUXT_SCRAPER_GUARD_IP_HEADER` (for example `cf-connecting-ip`) or `NUXT_SCRAPER_GUARD_XFF_HOPS_FROM_RIGHT=1`. With Cloudflare, also restrict Cloud Run ingress so the `run.app` URL can't be hit directly with a forged header.
  3. Before enforcing, check the `ua` on `rate_day` lines for link-preview fetchers (LINE, `facebookexternalhit`) sharing IPs. Enforcing would 429 their previews once the shared IP passes 500/day.
  4. When the keys look like real clients and the `would_block` volume is plausible, set the mode to `enforce`.
- The register limit is `NUXT_SCRAPER_GUARD_REGISTER_PER_DAY` (default 5) and follows the same mode: logged as `rate_register` in `log`, 429 in `enforce`. IPv6 clients are keyed per /64 for both the song and register limits.

## [0.0.7] - 2024-01-28

### Added

- Logger on requests.
- #55 A CHANGELOG.md file.
- #59 Bionic Reading in chords.

### Changed

- Move the DB initial connection from server utils to server plugins.
- Lyric font style and increase its size.

### Fixed
