import { it, expect } from "vitest"
import { users as Users } from "~/server/models"
import { seedUser, useTestDb } from "~/test/support/db"

useTestDb()

it("hashes password; verifyPassword checks it", async () => {
  // verifyPassword comes from mongoose-bcrypt and is not on the inferred type.
  const u = (await seedUser()) as Awaited<ReturnType<typeof seedUser>> & {
    verifyPassword(password: string, hash?: string): Promise<boolean>
  }
  expect(u.password).not.toBe("secret123")
  expect(await u.verifyPassword("secret123", u.password)).toBe(true)
  expect(await u.verifyPassword("wrong-pass", u.password)).toBe(false)
})
it("rejects passwords shorter than 8", async () => {
  await expect(seedUser({ password: "1234567" })).rejects.toThrow(
    "Password must be at least 8 characters",
  )
})
it("does not re-hash when password unchanged", async () => {
  const u = await seedUser()
  const h = u.password
  u.name = "Pele"
  await u.save()
  expect((await Users.findById(u._id))!.password).toBe(h)
})
it("OAuth user without password or name saves", async () => {
  await expect(Users.create({ email: "g@b.co" })).resolves.toBeTruthy()
})
it("requires email", async () => {
  await expect(Users.create({ name: "x" })).rejects.toThrow(/email.*required/)
})
it("defaults; role has no default; role enum", async () => {
  const u = await seedUser()
  expect(u.toObject()).toMatchObject({
    image: null,
    emailVerified: false,
    favorites: [],
  })
  expect(u.role).toBeUndefined()
  await expect(
    Users.create({ email: "b@b.co", role: "admin" }),
  ).rejects.toThrow(/role/)
})
it("email is unique", async () => {
  await seedUser()
  await expect(Users.create({ email: "a@b.co" })).rejects.toMatchObject({
    code: 11000,
  })
})
