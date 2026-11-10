import { songs as Songs, artists as Artists } from "~~/server/models"
import {
  PUBLIC_SONG_FILTER,
  PUBLIC_ARTIST_FIELDS,
} from "~~/server/utils/public-songs"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const artist = await Artists.findOne({ artistId: id })

  // Unknown artist: don't query with `_artist: undefined`.
  if (!artist) {
    return { success: true, data: [] }
  }

  const song = await Songs.find(
    { _artist: artist._id, ...PUBLIC_SONG_FILTER },
    "songId title updatedAt _artist",
  ).populate("_artist", PUBLIC_ARTIST_FIELDS)

  return {
    success: true,
    data: song,
  }
})
