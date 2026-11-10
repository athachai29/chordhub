import Songs from "~/server/models/songs"

export default defineEventHandler(async () => {
  const sheets = await Songs.find(
    { "flags.status": "ACTIVE", "flags.isPrivate": { $ne: true } },
    "songId title updatedAt",
  )

  return {
    success: true,
    total: sheets.length,
    data: sheets,
  }
})
