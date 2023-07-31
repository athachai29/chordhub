import db from "./db"

export default async () => {
  try {
    await db()

    console.log("Database connected")
  } catch (err) {
    console.log(err)
    console.error("Database connection failed")
  }
}
