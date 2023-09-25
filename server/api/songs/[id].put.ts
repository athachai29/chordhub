import songModel from "~/server/models/songs"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const body = await readBody(event)
  const { newSheet } = body

  const updatedResponse = await songModel.findByIdAndUpdate(id, {
    $set: { sheet: newSheet },
    new: true,
  })
  return {
    success: true,
    data: updatedResponse,
  }
})
