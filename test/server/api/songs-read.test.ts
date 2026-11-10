import { it, expect } from "vitest"
import { songs as Songs } from "~~/server/models"
import { callHandler } from "~~/test/support/http"
import { useTestDb, seedArtist, seedSong, seedUser } from "~~/test/support/db"
import getSong from "~~/server/api/songs/[id].get"
import artistSongs from "~~/server/api/songs/[id]/artists/index.get"

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
    },
  })
  expect(Object.keys(res.body.data).sort()).toEqual([
    "_artist",
    "_id",
    "params",
    "sheet",
    "songId",
    "title",
    "updatedAt",
  ])
  expect(Object.keys(res.body.data._artist).sort()).toEqual([
    "_id",
    "artistId",
    "engName",
    "thaiName",
  ])
  expect((await Songs.findOne({ songId: "abc123" }))!.stats!.views).toBe(1)
  await callHandler(getSong, { params: { id: "abc123" } })
  expect((await Songs.findOne({ songId: "abc123" }))!.stats!.views).toBe(2)
})

it("INACTIVE song → Song not found, views not counted", async () => {
  await seedSong({ flags: { status: "INACTIVE" } })
  const res = await callHandler(getSong, { params: { id: "abc123" } })
  expect(res.body).toEqual({ success: false, error: "Song not found" })
  expect((await Songs.findOne({ songId: "abc123" }))!.stats!.views).toBe(0)
})

it("private song hidden from anonymous and other users, shown to its owner", async () => {
  const u = await seedUser()
  const other = await seedUser({ email: "other@b.co" })
  await seedSong({
    owner: u._id,
    flags: { status: "ACTIVE", isPrivate: true },
  })
  const notFound = { success: false, error: "Song not found" }
  expect(
    (await callHandler(getSong, { params: { id: "abc123" } })).body,
  ).toEqual(notFound)
  expect(
    (
      await callHandler(getSong, {
        params: { id: "abc123" },
        auth: { sub: String(other._id) },
      })
    ).body,
  ).toEqual(notFound)
  expect(
    (
      await callHandler(getSong, {
        params: { id: "abc123" },
        auth: { sub: String(u._id) },
      })
    ).body.success,
  ).toBe(true)
})

it("legacy song without flags.isPrivate is readable", async () => {
  const a = await seedArtist()
  // Raw insert bypasses the schema default, like pre-isPrivate/imported data.
  await Songs.collection.insertOne({
    songId: "legacy",
    title: "legacy",
    _artist: a._id,
    flags: { status: "ACTIVE" },
  })
  const res = await callHandler(getSong, { params: { id: "legacy" } })
  expect(res.body.success).toBe(true)
})

it("non-ObjectId session sub still reads a public song", async () => {
  await seedSong()
  const res = await callHandler(getSong, {
    params: { id: "abc123" },
    auth: { sub: "google-oauth-123" },
  })
  expect(res.body).toMatchObject({ success: true, userProps: { isFav: false } })
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

it("GET /api/songs/:artistId/artists lists that artist's ACTIVE public songs", async () => {
  const a2 = await seedArtist({ artistId: "art2" })
  const s = await seedSong()
  await seedSong({ songId: "other", _artist: a2._id })
  await seedSong({
    songId: "hidden",
    _artist: s._artist,
    flags: { status: "INACTIVE" },
  })
  await seedSong({
    songId: "priv",
    _artist: s._artist,
    flags: { status: "ACTIVE", isPrivate: true },
  })
  // Legacy song without flags.isPrivate (raw insert skips the default) is public.
  await Songs.collection.insertOne({
    songId: "legacy",
    _artist: s._artist,
    flags: { status: "ACTIVE" },
  })
  expect(
    (await callHandler(artistSongs, { params: { id: "art1" } })).body.data
      .map((x: any) => x.songId)
      .sort(),
  ).toEqual(["abc123", "legacy"])
  expect(
    (await callHandler(artistSongs, { params: { id: "missing" } })).body,
  ).toEqual({ success: true, data: [] })
})

it("artist song list omits sheet, owner, flags, stats", async () => {
  await seedSong()
  const { body } = await callHandler(artistSongs, { params: { id: "art1" } })
  expect(Object.keys(body.data[0]).sort()).toEqual([
    "_artist",
    "_id",
    "songId",
    "title",
    "updatedAt",
  ])
  expect(Object.keys(body.data[0]._artist).sort()).toEqual([
    "_id",
    "artistId",
    "engName",
    "thaiName",
  ])
})
