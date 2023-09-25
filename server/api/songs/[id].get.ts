import mongoose from "mongoose"

import songModel from "~/server/models/songs"
import userModel from "~/server/models/users"

export default defineEventHandler(async (event) => {
  const { sub: userId } = event.context.auth ?? {}

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

  /**
   * Check out this song as a favorite of this user.
   */
  const isFav = (await userModel.exists({ _id: userId, favorites: song!.id }))
    ? true
    : false

  return {
    success: true,
    userProps: { isFav },
    data: song,
  }
})
