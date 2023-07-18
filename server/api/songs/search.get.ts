import { songs as songModel } from "../../models"

export default defineEventHandler(async (event) => {
  try {
    const { query } = getQuery(event)

    const sheet = await songModel
      .find({
        active: true,
        title: new RegExp(query, "i"),
      })
      .populate("_artist", "thaiName engName")

    return {
      success: true,
      data: sheet,
    }
  } catch (error) {
    console.error(error)

    return {
      success: false,
      error: error.message,
    }
  }
})
