import db from "~/server/utils/db"

export default async () => {
  try {
    await db()
  } catch (err) {
    console.log(err)
    console.error("Database connection failed")
  }
}
