import Users from "~~/server/models/users"
import { getUserId, unauthorized } from "~~/server/utils/auth"

export default defineEventHandler(async (event) => {
  const userId = getUserId(event)
  if (!userId) return unauthorized(event)

  const user = await Users.findById(userId, "favorites").populate({
    path: "favorites",
    select: "title thaiName engName",
  })

  return {
    status: 200,
    success: true,
    data: user?.favorites || [],
  }
})
