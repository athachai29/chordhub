import mongoose from "mongoose"

const config = useRuntimeConfig()

export default async function connect() {
  const { connection } = await mongoose.connect(config.mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
  })
  return connection
}
