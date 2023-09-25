import Users from "~/server/models/users"

export default defineEventHandler(async (event) => {
  const { sub: userId } = event.context.auth

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
