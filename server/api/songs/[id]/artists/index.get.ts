import { songs as Songs, artists as Artists } from "~/server/models"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const artist = await Artists.findOne({ artistId: id })

  const song = await Songs.find({ _artist: artist?._id }).populate("_artist")

  if (!song) {
    return {
      success: false,
      error: "Song not found",
    }
  }

  return {
    success: true,
    data: song,
  }
})
