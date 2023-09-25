import requestModel from "~/server/models/requests"

export default defineEventHandler(async (event) => {
  const { title, artist, source, note, type, userId } = await readBody(event)

  const request = await requestModel.create({
    title,
    artist,
    source,
    note,
    type,
    _user: userId,
  })

  return {
    status: 200,
    success: true,
    data: request,
  }
})
