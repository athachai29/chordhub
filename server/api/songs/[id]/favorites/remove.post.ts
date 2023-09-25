import { getToken } from "#auth"

import userModel from "~/server/models/users"

export default defineEventHandler(async (event) => {
  const token = await getToken({ event })
  const { id } = getRouterParams(event)

  const updatedResponse = await userModel.findByIdAndUpdate(
    token!.id,
    {
      $pull: { favorites: id },
    },
    { new: true },
  )
  return {
    success: true,
    data: updatedResponse,
  }
})
