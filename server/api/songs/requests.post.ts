import mongoose from "mongoose"
import Requests from "~~/server/models/requests"
import { getUserId, unauthorized } from "~~/server/utils/auth"

export default defineEventHandler(async (event) => {
  const userId = getUserId(event)
  if (!userId) return unauthorized(event)

  const { title, artist, source, note, type } = await readBody(event)

  try {
    const request = await Requests.create({
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
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      setResponseStatus(event, 400)
      return { success: false, error: err.message }
    }
    throw err
  }
})
