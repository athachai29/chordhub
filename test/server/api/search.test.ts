import {
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type MockInstance,
} from "vitest"
import { songs as Songs, artists as Artists } from "~~/server/models"
import { callHandler } from "~~/test/support/http"
import { useTestDb, seedArtist, seedSong } from "~~/test/support/db"
import search from "~~/server/api/songs/search.get"

useTestDb()

// $search only exists on Atlas: stub those pipelines, let the rest hit the
// in-memory Mongo.
const atlas = { songs: [] as any[], artists: [] as any[] }

function stubSearch(model: any, hits: () => any[]): MockInstance {
  const real = model.aggregate.bind(model)
  return vi
    .spyOn(model, "aggregate")
    .mockImplementation(((pipeline: any[]) =>
      pipeline[0]?.$search ? Promise.resolve(hits()) : real(pipeline)) as any)
}

const searchPipeline = (agg: MockInstance) =>
  agg.mock.calls.map((c) => c[0]).find((p) => p[0]?.$search)

let songsAgg: MockInstance
let artistsAgg: MockInstance

beforeEach(() => {
  atlas.songs = []
  atlas.artists = []
  songsAgg = stubSearch(Songs, () => atlas.songs)
  artistsAgg = stubSearch(Artists, () => atlas.artists)
})

afterEach(() => {
  vi.restoreAllMocks()
})

const q = (text: string) =>
  callHandler(search, { path: "/?query=" + encodeURIComponent(text) })

const labels = (res: { body: any }) =>
  res.body.data.map((r: any) => r.title ?? r.thaiName)

it("merges songs and artists by searchScore desc", async () => {
  atlas.songs = [
    { songId: "a", title: "a", textScore: 1 },
    { songId: "b", title: "b", textScore: 3 },
  ]
  atlas.artists = [{ artistId: "c", thaiName: "c", textScore: 2 }]
  expect(labels(await q("ใจ"))).toEqual(["b", "c", "a"])
})

it("queries songIndex/artistIndex with these paths, limit 5", async () => {
  await q("ใจ")
  const sp = searchPipeline(songsAgg),
    ap = searchPipeline(artistsAgg)
  expect(sp[0].$search).toEqual({
    index: "songIndex",
    text: { query: "ใจ", path: ["title", "sheet", "params.ost"] },
  })
  expect(ap[0].$search).toEqual({
    index: "artistIndex",
    text: { query: "ใจ", path: ["thaiName", "engName"] },
  })
  expect(sp).toContainEqual({ $limit: 5 })
  expect(ap).toContainEqual({ $limit: 5 })
})

it("normalizes the query before searching", async () => {
  await q("  ทํา ")
  expect(searchPipeline(songsAgg)[0].$search.text.query).toBe("ทำ")
})

// #58: Atlas tokenizes an unspaced Thai run as one term, so "ใจสั่ง" never
// matched "ใจสั่งมา".
it("finds songs whose title contains the Thai fragment", async () => {
  await seedSong({ songId: "s1", title: "หัวใจสั่งให้รัก" })
  await seedSong({ songId: "s2", title: "ใจสั่งมา" })
  await seedSong({ songId: "s3", title: "ขอให้เธอใจดี" })
  const res = await q("ใจสั่ง")
  expect(labels(res)).toEqual(["ใจสั่งมา", "หัวใจสั่งให้รัก"])
  expect(res.body.data[0]).toMatchObject({
    songId: "s2",
    resultType: "song",
    _artist: { thaiName: "คาราบาว" },
  })
})

it("ranks exact, then prefix, then shorter titles first", async () => {
  await seedSong({ songId: "s1", title: "ในหลวงในดวงใจ" })
  await seedSong({ songId: "s2", title: "ดวงใจกับความรัก" })
  await seedSong({ songId: "s3", title: "ดวงใจ" })
  await seedSong({ songId: "s4", title: "พ่อหลวงในดวงใจ" })
  expect(labels(await q("ดวงใจ"))).toEqual([
    "ดวงใจ",
    "ดวงใจกับความรัก",
    "ในหลวงในดวงใจ",
    "พ่อหลวงในดวงใจ",
  ])
})

it("matches the OST field too", async () => {
  await seedSong({ songId: "s1", title: "x", params: { ost: "แก้วตาในดวงใจ" } })
  expect(labels(await q("แก้วตา"))).toEqual(["x"])
})

it("finds artists by Thai or English name fragment, case-insensitive", async () => {
  await seedArtist()
  expect(labels(await q("ราบา"))).toEqual(["คาราบาว"])
  expect((await q("CARAB")).body.data[0]).toMatchObject({
    artistId: "art1",
    engName: "Carabao",
    resultType: "artist",
  })
})

it("substring hits come first; Atlas hits fill the rest without duplicates", async () => {
  await seedSong({ songId: "s1", title: "ใจสั่งมา" })
  atlas.songs = [
    { songId: "s1", title: "ใจสั่งมา", textScore: 9 },
    { songId: "s9", title: "lyrics hit", textScore: 2 },
  ]
  expect(labels(await q("ใจสั่ง"))).toEqual(["ใจสั่งมา", "lyrics hit"])
})

it("caps each result type at 5", async () => {
  for (let i = 0; i < 7; i++)
    await seedSong({ songId: "s" + i, title: "ใจ " + i })
  atlas.songs = [{ songId: "s9", title: "ใจ 9", textScore: 1 }]
  const res = await q("ใจ")
  expect(res.body.data).toHaveLength(5)
  expect(labels(res)).not.toContain("ใจ 9")
})

it("treats regex metacharacters literally", async () => {
  await seedSong({ songId: "s1", title: "สมองสั่งการช้า (DELAY)" })
  await seedSong({ songId: "s2", title: "DELAY" })
  expect(labels(await q("(delay)"))).toEqual(["สมองสั่งการช้า (DELAY)"])
})

it("matches titles stored with a decomposed sara am", async () => {
  await seedSong({ songId: "s1", title: "จําใจเจ็บ" }) // ํา, not ำ
  expect(labels(await q("จำใจ"))).toEqual(["จําใจเจ็บ"])
})

it.each(["/", "/?query=", "/?query=%20%20"])(
  "empty query %s → empty result, no DB call",
  async (path) => {
    expect((await callHandler(search, { path })).body).toEqual({
      success: true,
      data: [],
    })
    expect(songsAgg).not.toHaveBeenCalled()
  },
)

it("aggregate failure → { success:false, error }", async () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
  songsAgg.mockRejectedValue(new Error("boom"))
  expect((await q("x")).body).toEqual({ success: false, error: "boom" })
  expect(consoleError).toHaveBeenCalled()
})
