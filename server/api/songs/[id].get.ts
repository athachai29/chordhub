import mongoose from "mongoose"
import { users as Users, songs as Songs } from "~~/server/models"
import {
  PUBLIC_ARTIST_FIELDS,
  PUBLIC_SONG_FIELDS,
  visibleSongFilter,
} from "~~/server/utils/public-songs"

export default defineEventHandler(async (event) => {
  const { sub: userId } = event.context.auth ?? {}

  const { id } = getRouterParams(event)

  const song = await Songs.findOne(
    { songId: id, ...visibleSongFilter(userId) },
    PUBLIC_SONG_FIELDS,
  ).populate("_artist", PUBLIC_ARTIST_FIELDS)

  if (!song) {
    return {
      success: false,
      error: "Song not found",
    }
  }

  await Songs.updateOne({ _id: song._id }, { $inc: { "stats.views": 1 } })

  /**
   * Check out this song as a favorite of this user.
   */
  const isFav = mongoose.isValidObjectId(userId)
    ? (await Users.exists({ _id: userId, favorites: song.id }))
      ? true
      : false
    : false

  return {
    success: true,
    userProps: { isFav },
    data: song,
  }
})
