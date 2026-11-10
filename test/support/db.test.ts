import { it, expect } from "vitest"
import { artists } from "~~/server/models"
import { seedArtist, seedSong, useTestDb } from "~~/test/support/db"

useTestDb()

it("default seedSong calls share one default artist", async () => {
  const a = await seedSong()
  const b = await seedSong({ songId: "inactive" })
  expect(String(b._artist)).toBe(String(a._artist))
  expect(await artists.countDocuments({ artistId: "art1" })).toBe(1)
})
it("seedSong reuses an artist already seeded with the default artistId", async () => {
  const art = await seedArtist()
  expect(String((await seedSong())._artist)).toBe(String(art._id))
})
