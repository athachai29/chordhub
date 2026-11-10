# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed

- Nuxt 4.6 (app/ + shared/ layout) on Node 24; @sidebase/nuxt-auth 1.4, @nuxtjs/i18n 10, @nuxtjs/sitemap 7, nuxt-gtag 4.1, Pinia 4.
- Docker image builds on node:24-alpine from the committed yarn.lock.
- Child sitemaps moved to `/__sitemap__/th-TH.xml` and `/__sitemap__/en-US.xml`; the old `/th-TH-sitemap.xml` and `/en-US-sitemap.xml` 301 there.

### Deploy

- Cloud Run `AUTH_ORIGIN` must become the full auth URL `https://chordhub.app/api/auth` in the same deploy. With the old origin-only value the new revision refuses to boot. `NEXTAUTH_URL` stays `https://chordhub.app`.

## [0.0.7] - 2024-01-28

### Added

- Logger on requests.
- #55 A CHANGELOG.md file.
- #59 Bionic Reading in chords.

### Changed

- Move the DB initial connection from server utils to server plugins.
- Lyric font style and increase its size.

### Fixed
