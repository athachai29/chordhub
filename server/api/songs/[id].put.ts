import Songs from "~/server/models/songs"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const body = await readBody(event)
  const { newSheet } = body

  const updatedResponse = await Songs.findByIdAndUpdate(id, {
    $set: { sheet: newSheet },
    new: true,
  })

  return {
    success: true,
    data: updatedResponse,
  }
})
