import mongoose from "mongoose"

export default defineNitroPlugin(async (nitro) => {
  try {
    await mongoose.connect(useRuntimeConfig().dbUrl)
  } catch (err: any) {
    console.error("Database connection failed")
    console.error(err.message)
  }
})
