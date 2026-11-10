import { MongoMemoryServer } from "mongodb-memory-server"

export default async function () {
  const server = await MongoMemoryServer.create()
  process.env.MONGO_TEST_URI = server.getUri()
  return async () => {
    await server.stop()
  }
}
