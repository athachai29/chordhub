import Songs from "~~/server/models/songs"
import Users from "~~/server/models/users"
import { forbidden, getUserId, unauthorized } from "~~/server/utils/auth"

export default defineEventHandler(async (event) => {
  const userId = getUserId(event)
  if (!userId) return unauthorized(event)

  const user = await Users.findById(userId, "role")
  if (user?.role !== "ADMIN") return forbidden(event)

  const { id } = getRouterParams(event)
  const { newSheet } = (await readBody(event)) ?? {}

  if (
    !Array.isArray(newSheet) ||
    !newSheet.every((part) => typeof part === "string")
  ) {
    setResponseStatus(event, 400)
    return { success: false, error: "newSheet must be an array of strings" }
  }

  const updatedResponse = await Songs.findOneAndUpdate(
    { songId: id },
    { $set: { sheet: newSheet } },
    { new: true },
  )

  if (!updatedResponse) return { success: false, error: "Song not found" }

  return {
    success: true,
    data: updatedResponse,
  }
})
