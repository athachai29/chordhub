import { it, expect } from "vitest"
import { songs as Songs } from "~~/server/models"
import { useTestDb, seedSong } from "~~/test/support/db"
import sitemapUrls from "~~/server/api/__sitemap__/urls"

useTestDb()

it("sitemap lists public songs straight from the DB", async () => {
  await seedSong()
  await seedSong({ songId: "inactive", flags: { status: "INACTIVE" } })
  await seedSong({
    songId: "private",
    flags: { status: "ACTIVE", isPrivate: true },
  })
  // Raw insert bypasses the schema default, like pre-isPrivate/imported data.
  await Songs.collection.insertOne({
    songId: "legacy",
    title: "legacy",
    flags: { status: "ACTIVE" },
    updatedAt: new Date("2024-01-02T03:04:05.000Z"),
  })
  const urls = (await (sitemapUrls as any)()) as any[]
  expect(urls.map((u: any) => u.url).sort()).toEqual([
    "/song/abc123",
    "/song/legacy",
  ])
  expect(urls.every((u: any) => u.lastmod instanceof Date)).toBe(true)
})
