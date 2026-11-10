import { it, expect } from "vitest"
import mongoose from "mongoose"
import { songs as Songs, artists as Artists } from "~/server/models"
import { useTestDb } from "~/test/support/db"

useTestDb()

const base = {
  songId: "s1",
  title: "t",
  _artist: new mongoose.Types.ObjectId(),
}

it("song defaults", async () => {
  const s = await Songs.create(base)
  expect(s.toObject()).toMatchObject({
    sheet: [],
    formatter: null,
    parent: null,
    owner: null,
    params: { key: null, ost: null, capo: 0 },
    flags: { status: "INACTIVE", isPrivate: false, manualUpdated: false },
    stats: { views: 0, likes: 0, downloads: 0, shares: 0 },
  })
})
it.each(["songId", "title", "_artist"])("song requires %s", async (field) => {
  const doc: any = { ...base }
  delete doc[field]
  await expect(Songs.create(doc)).rejects.toThrow(
    new RegExp(`${field}.*required`),
  )
})
it("keeps flags.manualUpdated", async () => {
  const { _id } = await Songs.create({
    ...base,
    flags: { manualUpdated: true },
  })
  expect((await Songs.findById(_id).lean())!.flags.manualUpdated).toBe(true)
})
it("rejects unknown flags.status", async () => {
  await expect(
    Songs.create({ ...base, flags: { status: "DELETED" } }),
  ).rejects.toThrow(/flags.status/)
})
it("songId is unique", async () => {
  await Songs.create(base)
  await expect(Songs.create(base)).rejects.toMatchObject({ code: 11000 })
})
it("artist defaults and unique artistId", async () => {
  expect((await Artists.create({ artistId: "a1" })).toObject()).toMatchObject({
    thaiName: "",
    engName: "",
  })
  await expect(Artists.create({ artistId: "a1" })).rejects.toMatchObject({
    code: 11000,
  })
})
