import {
  createScraperGuard,
  type GuardConfig,
} from "~~/server/utils/scraper-guard"
import { incrementWindow } from "~~/server/utils/rate-limit-store"
import { createCrawlerVerifier } from "~~/server/utils/verified-crawler"

export default createScraperGuard(
  () => useRuntimeConfig().scraperGuard as GuardConfig,
  {
    increment: incrementWindow,
    isVerifiedCrawler: createCrawlerVerifier(),
    log: (e) => console.warn(JSON.stringify(e)),
    now: Date.now,
  },
)
