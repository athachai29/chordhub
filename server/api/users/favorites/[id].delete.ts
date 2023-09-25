import Users from "~/server/models/users"

export default defineEventHandler(async (event) => {
  const { sub: userId } = event.context.auth

  const { id } = getRouterParams(event)

  const updatedResponse = await Users.findByIdAndUpdate(
    userId,
    {
      $pull: {
        favorites: id,
      },
    },
    { new: true },
  )

  return {
    status: 200,
    success: true,
    data: updatedResponse,
  }
})
