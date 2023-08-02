import mongoose from "mongoose"

import songModel from "../../models/songs"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const session = await mongoose.startSession()
  const song = await songModel
    .findOne({ songId: id })
    .populate("_artist")
    .session(session)
  await songModel.updateOne(
    { songId: id },
    { $inc: { "stats.views": 1 } },
    { session },
  )
  await session.endSession()

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
