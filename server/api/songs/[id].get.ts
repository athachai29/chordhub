import songModel from "../../models/songs"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const song = await songModel.findOne({ songId: id }).populate("_artist")

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
