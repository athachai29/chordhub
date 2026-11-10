import Users from "~/server/models/users"
import { getUserId, unauthorized } from "~/server/utils/auth"

export default defineEventHandler(async (event) => {
  const userId = getUserId(event)
  if (!userId) return unauthorized(event)

  const { id } = getRouterParams(event)

  const user = await Users.findOne({ _id: userId, favorites: id })

  return {
    status: 200,
    success: true,
    data: user ? true : false,
  }
})
