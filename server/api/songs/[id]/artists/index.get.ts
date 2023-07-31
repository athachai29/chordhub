import songModel from "~/server/models/songs"
import artistModel from "~/server/models/artists"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const artist = await artistModel.findOne({ artistId: id })

  const song = await songModel.find({ _artist: artist._id }).populate("_artist")

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
