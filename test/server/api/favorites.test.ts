import { beforeEach, it, expect } from "vitest"
import { users as Users } from "~/server/models"
import { callHandler } from "~/test/support/http"
import { useTestDb, seedSong, seedUser } from "~/test/support/db"
import listFav from "~/server/api/users/favorites/index.get"
import getFav from "~/server/api/users/favorites/[id].get"
import putFav from "~/server/api/users/favorites/[id].put"
import delFav from "~/server/api/users/favorites/[id].delete"

useTestDb()

let s: Awaited<ReturnType<typeof seedSong>>
let u: Awaited<ReturnType<typeof seedUser>>
let auth: { sub: string }

beforeEach(async () => {
  s = await seedSong()
  u = await seedUser()
  auth = { sub: String(u._id) }
})

it("PUT is idempotent, GET reflects state, DELETE removes", async () => {
  const p = { params: { id: String(s._id) }, auth }
  await callHandler(putFav, { ...p, method: "PUT" })
  await callHandler(putFav, { ...p, method: "PUT" })
  expect((await Users.findById(u._id))!.favorites).toHaveLength(1)
  expect((await callHandler(getFav, p)).body).toEqual({
    status: 200,
    success: true,
    data: true,
  })
  await callHandler(delFav, { ...p, method: "DELETE" })
  expect((await callHandler(getFav, p)).body.data).toBe(false)
})

it("GET /api/users/favorites lists populated favorites", async () => {
  await Users.updateOne({ _id: u._id }, { $set: { favorites: [s._id] } })
  expect((await callHandler(listFav, { auth })).body).toMatchObject({
    success: true,
    data: [{ title: "เมดอินไทยแลนด์" }],
  })
})

it.each([
  ["list", () => listFav],
  ["get", () => getFav],
  ["put", () => putFav],
  ["delete", () => delFav],
])("%s without a session → 401", async (_n, h) => {
  expect(await callHandler(h(), { params: { id: String(s._id) } })).toEqual({
    status: 401,
    body: { success: false, error: "Unauthorized" },
  })
})
