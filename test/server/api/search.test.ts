import {
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type MockInstance,
} from "vitest"
import { songs as Songs, artists as Artists } from "~/server/models"
import { callHandler } from "~/test/support/http"
import search from "~/server/api/songs/search.get"

let songsAgg: MockInstance
let artistsAgg: MockInstance

beforeEach(() => {
  songsAgg = vi.spyOn(Songs, "aggregate")
  artistsAgg = vi.spyOn(Artists, "aggregate")
})

afterEach(() => {
  vi.restoreAllMocks()
})

const q = (text: string) =>
  callHandler(search, { path: "/?query=" + encodeURIComponent(text) })

it("merges songs and artists by searchScore desc", async () => {
  songsAgg.mockResolvedValue([
    { title: "a", textScore: 1 },
    { title: "b", textScore: 3 },
  ])
  artistsAgg.mockResolvedValue([{ thaiName: "c", textScore: 2 }])
  expect(
    (await q("ใจ")).body.data.map((r: any) => r.title ?? r.thaiName),
  ).toEqual(["b", "c", "a"])
})

it("queries songIndex/artistIndex with these paths, limit 5", async () => {
  songsAgg.mockResolvedValue([])
  artistsAgg.mockResolvedValue([])
  await q("ใจ")
  const sp = songsAgg.mock.calls[0]![0],
    ap = artistsAgg.mock.calls[0]![0]
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
  songsAgg.mockResolvedValue([])
  artistsAgg.mockResolvedValue([])
  await q("  ทํา ")
  expect(songsAgg.mock.calls[0]![0][0].$search.text.query).toBe("ทำ")
})

it.each(["/", "/?query=", "/?query=%20%20"])(
  "empty query %s → empty result, no Atlas call",
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
