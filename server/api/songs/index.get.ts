import Songs from "~/server/models/songs"

export default defineEventHandler(async () => {
  const sheets = await Songs.find({})

  return {
    success: true,
    total: sheets.length,
    data: sheets,
  }
})
