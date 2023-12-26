import mongoose from "mongoose"

import { users as Users, songs as Songs } from "~/server/models"

export default defineEventHandler(async (event) => {
  const { sub: userId } = event.context.auth ?? {}

  const { id } = getRouterParams(event)

  const session = await mongoose.startSession()
  const song = await Songs.findOne({ songId: id })
    .populate("_artist")
    .session(session)
  await Songs.updateOne(
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
  const isFav = (await Users.exists({ _id: userId, favorites: song!.id }))
    ? true
    : false

  return {
    success: true,
    userProps: { isFav },
    data: song,
  }
})
