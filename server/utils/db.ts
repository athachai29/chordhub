import mongoose from "mongoose"

export default async function connect() {
  const connection = await mongoose.connect(useRuntimeConfig().dbUrl)

  return connection
}
