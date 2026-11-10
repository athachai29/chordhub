import { it, expect } from "vitest"
import { users as Users, accounts as Accounts } from "~~/server/models"
import CustomAdapter from "~~/server/models/nextauth/customAdapter"
import { useTestDb, seedUser } from "~~/test/support/db"

useTestDb()

const adapter = CustomAdapter({ Users, Accounts })
const link = (uid: string, provider: string, id: string) =>
  adapter.linkAccount({
    provider,
    type: "oauth",
    providerAccountId: id,
    userId: uid,
  } as any)

it("linkAccount + getUserByAccount round-trip; unknown → null", async () => {
  const u = await Users.create({ email: "g@b.co" })
  await link(String(u._id), "google", "g-1")
  expect(
    (await adapter.getUserByAccount({
      provider: "google",
      providerAccountId: "g-1",
    }))!.email,
  ).toBe("g@b.co")
  expect(
    await adapter.getUserByAccount({
      provider: "google",
      providerAccountId: "nope",
    }),
  ).toBeNull()
})
it("matches on provider AND providerAccountId", async () => {
  const u = await Users.create({ email: "g@b.co" })
  await link(String(u._id), "google", "same-id")
  expect(
    await adapter.getUserByAccount({
      provider: "facebook",
      providerAccountId: "same-id",
    }),
  ).toBeNull()
})
it("account whose user was deleted → null", async () => {
  const u = await Users.create({ email: "g@b.co" })
  await link(String(u._id), "google", "g-1")
  await Users.deleteOne({ _id: u._id })
  expect(
    await adapter.getUserByAccount({
      provider: "google",
      providerAccountId: "g-1",
    }),
  ).toBeNull()
})
it("getUserByEmail finds an existing user, else null", async () => {
  await seedUser()
  expect((await adapter.getUserByEmail("a@b.co"))!.email).toBe("a@b.co")
  expect(await adapter.getUserByEmail("z@b.co")).toBeNull()
})
it("createUser returns a plain user with string id", async () => {
  const created = await adapter.createUser({ email: "n@b.co", name: "N" })
  expect(created).toMatchObject({
    email: "n@b.co",
    name: "N",
    id: String((await Users.findOne({ email: "n@b.co" }))!._id),
  })
})
