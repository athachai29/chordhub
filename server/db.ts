import mongoose from "mongoose"

export default async function connect() {
  const { connection } = await mongoose.connect(useRuntimeConfig().mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
  })
  return connection
}
