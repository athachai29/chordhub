import { it, expect } from "vitest"
import { songs as Songs } from "~/server/models"
import { callHandler } from "~/test/support/http"
import { useTestDb, seedArtist, seedSong, seedUser } from "~/test/support/db"
import getSong from "~/server/api/songs/[id].get"
import listSongs from "~/server/api/songs/index.get"
import artistSongs from "~/server/api/songs/[id]/artists/index.get"

useTestDb()

it("GET /api/songs/:songId returns populated song; views counted after read", async () => {
  await seedSong()
  const res = await callHandler(getSong, { params: { id: "abc123" } })
  expect(res.body).toMatchObject({
    success: true,
    userProps: { isFav: false },
    data: {
      songId: "abc123",
      _artist: { thaiName: "คาราบาว" },
      stats: { views: 0 },
    },
  })
  await callHandler(getSong, { params: { id: "abc123" } })
  expect((await Songs.findOne({ songId: "abc123" }))!.stats!.views).toBe(2)
})

it("isFav true for the session user's favorite", async () => {
  const s = await seedSong()
  const u = await seedUser({ favorites: [s._id] })
  expect(
    (
      await callHandler(getSong, {
        params: { id: "abc123" },
        auth: { sub: String(u._id) },
      })
    ).body.userProps,
  ).toEqual({ isFav: true })
})

it("unknown songId → 200 { success:false, error:'Song not found' }", async () => {
  expect(await callHandler(getSong, { params: { id: "nope" } })).toEqual({
    status: 200,
    body: { success: false, error: "Song not found" },
  })
})

it("GET /api/songs lists only ACTIVE public songs, without sheets", async () => {
  await seedSong()
  await seedSong({ songId: "inactive", flags: { status: "INACTIVE" } })
  await seedSong({
    songId: "private",
    flags: { status: "ACTIVE", isPrivate: true },
  })
  const { body } = await callHandler(listSongs)
  expect(body).toMatchObject({
    success: true,
    total: 1,
    data: [{ songId: "abc123", title: "เมดอินไทยแลนด์" }],
  })
  expect(body.data[0]).not.toHaveProperty("sheet")
  expect(body.data[0]).toHaveProperty("updatedAt")
})

it("GET /api/songs/:artistId/artists lists that artist's ACTIVE public songs", async () => {
  const a2 = await seedArtist({ artistId: "art2" })
  const s = await seedSong()
  await seedSong({ songId: "other", _artist: a2._id })
  await seedSong({
    songId: "hidden",
    _artist: s._artist,
    flags: { status: "INACTIVE" },
  })
  expect(
    (await callHandler(artistSongs, { params: { id: "art1" } })).body.data.map(
      (x: any) => x.songId,
    ),
  ).toEqual(["abc123"])
  expect(
    (await callHandler(artistSongs, { params: { id: "missing" } })).body,
  ).toEqual({ success: true, data: [] })
})
