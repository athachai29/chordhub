import { randomUUID } from "node:crypto"
import mongoose from "mongoose"
import { afterAll, afterEach, beforeAll } from "vitest"
import { artists, songs, users } from "~/server/models"

export function useTestDb(): void {
  beforeAll(async () => {
    const uri = process.env.MONGO_TEST_URI
    if (!uri)
      throw new Error("MONGO_TEST_URI is not set (globalSetup missing?)")
    await mongoose.connect(uri, { dbName: "t_" + randomUUID() })
    await Promise.all(Object.values(mongoose.models).map((m) => m.init()))
  })

  afterEach(async () => {
    await Promise.all(
      Object.values(mongoose.connection.collections).map((c) =>
        c.deleteMany({}),
      ),
    )
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
  })
}

export function seedArtist(overrides: object = {}) {
  return artists.create({
    artistId: "art1",
    thaiName: "คาราบาว",
    engName: "Carabao",
    ...overrides,
  })
}

export async function seedSong(overrides: Record<string, any> = {}) {
  // Find-or-create the default artist: artistId is unique, so creating
  // "art1" on every call would throw E11000 on the second default seedSong.
  const _artist =
    "_artist" in overrides
      ? overrides._artist
      : ((await artists.findOne({ artistId: "art1" })) ?? (await seedArtist()))
          ._id
  return songs.create({
    songId: "abc123",
    title: "เมดอินไทยแลนด์",
    sheet: ["[C]old"],
    flags: { status: "ACTIVE" },
    _artist,
    ...overrides,
  })
}

export function seedUser(overrides: object = {}) {
  return users.create({
    email: "a@b.co",
    password: "secret123",
    ...overrides,
  })
}
