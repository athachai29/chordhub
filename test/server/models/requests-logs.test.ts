import { it, expect } from "vitest"
import mongoose from "mongoose"
import Requests from "~/server/models/requests"
import Logs from "~/server/models/logs"
import { useTestDb } from "~/test/support/db"

useTestDb()

const req = {
  _user: new mongoose.Types.ObjectId(),
  title: "t",
  type: "NEW_SONG",
}
it("request defaults; artist/source/note optional", async () => {
  expect((await Requests.create(req)).toObject()).toMatchObject({
    status: "PENDING",
    reason: null,
    sheet: [],
  })
})
it.each(["_user", "title", "type"])("request requires %s", async (field) => {
  const doc: any = { ...req }
  delete doc[field]
  await expect(Requests.create(doc)).rejects.toThrow(
    new RegExp(`${field}.*required`),
  )
})
it("request enums", async () => {
  await expect(Requests.create({ ...req, type: "OTHER" })).rejects.toThrow(
    /type/,
  )
  await expect(Requests.create({ ...req, status: "DONE" })).rejects.toThrow(
    /status/,
  )
})
it.each(["type", "songId", "userId", "data"])(
  "log requires %s",
  async (field) => {
    const doc: any = {
      type: "EDITED",
      songId: "s",
      userId: "u",
      data: { a: 1 },
    }
    delete doc[field]
    await expect(Logs.create(doc)).rejects.toThrow(
      new RegExp(`${field}.*required`),
    )
  },
)
it("log type enum", async () => {
  await expect(
    Logs.create({ type: "DELETED", songId: "s", userId: "u", data: {} }),
  ).rejects.toThrow(/type/)
})
