import mongoose from "mongoose"

export default defineNitroPlugin(async (nitro) => {
  try {
    await mongoose.connect(useRuntimeConfig().dbUrl)

    mongoose.connection.on("connected", () => {
      console.log("Database connected")
    })

    mongoose.connection.on("disconnected", () => {
      console.log("Database disconnected")
    })

    nitro.hooks.hookOnce("close", async () => {
      await mongoose.connection.close()
      console.log("Database connection closed")
    })
  } catch (err) {
    console.error("Database connection failed")
    console.error(err)
  }
})
