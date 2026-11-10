import { it, expect } from "vitest"
import mongoose from "mongoose"
import { songs as Songs } from "~~/server/models"
import { callHandler } from "~~/test/support/http"
import { useTestDb, seedSong, seedUser } from "~~/test/support/db"
import putSong from "~~/server/api/songs/[id].put"
import postRequest from "~~/server/api/songs/requests.post"

useTestDb()

const body = { newSheet: ["[G]new"] }
const put = (id: string, auth: Record<string, unknown> | undefined) =>
  callHandler(putSong, { method: "PUT", params: { id }, body, auth })

it("PUT without session → 401, sheet unchanged", async () => {
  await seedSong()
  expect(await put("abc123", undefined)).toEqual({
    status: 401,
    body: { success: false, error: "Unauthorized" },
  })
  expect((await Songs.findOne({ songId: "abc123" }))!.sheet).toEqual(["[C]old"])
})

it("PUT by non-admin → 403", async () => {
  await seedSong()
  const u = await seedUser({ role: "FREE_USER" })
  expect((await put("abc123", { sub: String(u._id) })).status).toBe(403)
})

it("PUT by admin, addressed by songId → updated doc", async () => {
  await seedSong()
  const a = await seedUser({ role: "ADMIN" })
  const res = await put("abc123", { sub: String(a._id) })
  expect(res).toMatchObject({
    status: 200,
    body: { success: true, data: { songId: "abc123", sheet: ["[G]new"] } },
  })
})

it("PUT by admin, unknown songId → { success:false, error:'Song not found' }", async () => {
  const a = await seedUser({ role: "ADMIN" })
  expect((await put("nope", { sub: String(a._id) })).body).toEqual({
    success: false,
    error: "Song not found",
  })
})

it("PUT with non-string[] newSheet → 400", async () => {
  await seedSong()
  const a = await seedUser({ role: "ADMIN" })
  const res = await callHandler(putSong, {
    method: "PUT",
    params: { id: "abc123" },
    body: { newSheet: "x" },
    auth: { sub: String(a._id) },
  })
  expect(res).toEqual({
    status: 400,
    body: { success: false, error: "newSheet must be an array of strings" },
  })
})

it("POST /api/songs/requests without session → 401", async () => {
  expect(
    (
      await callHandler(postRequest, {
        method: "POST",
        body: { title: "t", type: "NEW_SONG" },
      })
    ).status,
  ).toBe(401)
})

it("POST /api/songs/requests takes _user from the session, not the body", async () => {
  const u = await seedUser()
  const spoof = new mongoose.Types.ObjectId().toString()
  const res = await callHandler(postRequest, {
    method: "POST",
    auth: { sub: String(u._id) },
    body: {
      title: "t",
      artist: "a",
      source: "",
      note: "n",
      type: "NEW_SONG",
      userId: spoof,
    },
  })
  expect(res.body).toMatchObject({
    success: true,
    data: { _user: String(u._id), status: "PENDING" },
  })
})

it("POST /api/songs/requests invalid type → 400", async () => {
  const u = await seedUser()
  const res = await callHandler(postRequest, {
    method: "POST",
    auth: { sub: String(u._id) },
    body: { title: "t", type: "OTHER" },
  })
  expect(res.status).toBe(400)
  expect(res.body.success).toBe(false)
})
