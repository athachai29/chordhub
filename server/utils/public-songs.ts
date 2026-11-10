import mongoose from "mongoose"
import type { FilterQuery } from "mongoose"

/** A legacy song with no `flags.isPrivate` counts as public. */
export const PUBLIC_SONG_FILTER = {
  "flags.status": "ACTIVE",
  "flags.isPrivate": { $ne: true },
}

export const PUBLIC_SONG_FIELDS = "songId title sheet params updatedAt _artist"

export const PUBLIC_ARTIST_FIELDS = "artistId thaiName engName"

/**
 * Public songs, plus the user's own songs when `userId` is an ObjectId
 * (OAuth session subs may not be, and would throw a CastError).
 */
export function visibleSongFilter(userId?: string): FilterQuery<any> {
  return mongoose.isValidObjectId(userId)
    ? { $or: [PUBLIC_SONG_FILTER, { owner: userId }] }
    : PUBLIC_SONG_FILTER
}
