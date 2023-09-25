import Requests from "~/server/models/requests"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const total = await Requests.countDocuments({
    _user: id,
  })
  return {
    total: total,
  }
})
