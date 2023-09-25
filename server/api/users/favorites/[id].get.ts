import userModel from "~/server/models/users"

export default defineEventHandler(async (event) => {
  const { sub: userId } = event.context.auth

  const { id } = getRouterParams(event)

  const user = await userModel.findOne({ _id: userId, favorites: id })

  return {
    status: 200,
    success: true,
    data: user ? true : false,
  }
})
