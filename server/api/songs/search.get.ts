import { songs as songModel, artists as artistModel } from "~~/server/models"
import { normalizeThai } from "#shared/utils/thai"

const LIMIT = 5

/**
 * Case-insensitive "contains" regex. Also accepts the decomposed sara am
 * (U+0E4D U+0E32) that some stored titles still use.
 */
function containsRegex(query: string) {
  const escaped = query
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/ำ/g, "(?:ำ|ํา)")
  return new RegExp(escaped, "i")
}

/** 0 exact, 1 prefix, 2 contains, 3 no match ($toLower is ASCII-only). */
function matchRank(field: string, query: string) {
  const value = { $toLower: { $ifNull: [field, ""] } }
  const pos = { $indexOfCP: [value, query.toLowerCase()] }
  return {
    $switch: {
      branches: [
        { case: { $eq: [value, query.toLowerCase()] }, then: 0 },
        { case: { $eq: [pos, 0] }, then: 1 },
        { case: { $gt: [pos, 0] }, then: 2 },
      ],
      default: 3,
    },
  }
}

/** Substring hits first, then Atlas hits not already listed. */
function mergeHits(substring: any[], fullText: any[], key: string) {
  const seen = new Set(substring.map((r) => r[key]))
  return [...substring, ...fullText.filter((r) => !seen.has(r[key]))].slice(
    0,
    LIMIT,
  )
}

function byRelevance(a: any, b: any) {
  const aSub = a.matchRank !== undefined
  const bSub = b.matchRank !== undefined
  if (aSub && bSub) return a.matchRank - b.matchRank
  if (aSub !== bSub) return aSub ? -1 : 1
  return b.textScore - a.textScore
}

export default defineEventHandler(async (event) => {
  try {
    const query = normalizeThai(String(getQuery(event).query ?? ""))

    if (!query) {
      return { success: true, data: [] }
    }

    const regex = containsRegex(query)

    /**
     * Substring match on titles and names. Atlas Search tokenizes an unspaced
     * Thai run as a single term, so a fragment like "ใจสั่ง" never matches
     * "ใจสั่งมา" there.
     */
    const songSubstringPipeline = [
      { $match: { $or: [{ title: regex }, { "params.ost": regex }] } },
      {
        $addFields: {
          matchRank: { $min: [matchRank("$title", query), 2] },
          titleLength: { $strLenCP: "$title" },
        },
      },
      { $sort: { matchRank: 1, titleLength: 1, _id: 1 } },
      { $limit: LIMIT },
      {
        $lookup: {
          from: "artists",
          localField: "_artist",
          foreignField: "_id",
          as: "_artist",
        },
      },
      {
        $project: {
          _id: 0,
          title: 1,
          songId: 1,
          _artist: { $arrayElemAt: ["$_artist", 0] },
          matchRank: 1,
          resultType: "song",
        },
      },
    ]

    const artistSubstringPipeline = [
      { $match: { $or: [{ thaiName: regex }, { engName: regex }] } },
      {
        $addFields: {
          matchRank: {
            $min: [matchRank("$thaiName", query), matchRank("$engName", query)],
          },
        },
      },
      { $sort: { matchRank: 1, _id: 1 } },
      { $limit: LIMIT },
      {
        $project: {
          _id: 0,
          thaiName: 1,
          engName: 1,
          artistId: 1,
          matchRank: 1,
          resultType: "artist",
        },
      },
    ]

    /**
     * Full text search
     */
    const songPipeline = [
      {
        $search: {
          index: "songIndex",
          text: {
            query: query,
            path: ["title", "sheet", "params.ost"],
          },
        },
      },
      {
        $lookup: {
          from: "artists",
          localField: "_artist",
          foreignField: "_id",
          as: "_artist",
        },
      },
      {
        $project: {
          _id: 0,
          title: 1,
          songId: 1,
          _artist: 1,
        },
      },
      {
        $addFields: {
          _artist: {
            $arrayElemAt: ["$_artist", 0],
          },
          textScore: { $meta: "searchScore" },
          resultType: "song",
        },
      },
      {
        $limit: LIMIT,
      },
    ]

    const artistPipeline = [
      {
        $search: {
          index: "artistIndex",
          text: {
            query: query,
            path: ["thaiName", "engName"],
          },
        },
      },
      {
        $project: {
          _id: 0,
          thaiName: 1,
          engName: 1,
          artistId: 1,
        },
      },
      {
        $addFields: {
          textScore: { $meta: "searchScore" },
          resultType: "artist",
        },
      },
      {
        $limit: LIMIT,
      },
    ]

    const [songSubstring, songs, artistSubstring, artist] = await Promise.all([
      songModel.aggregate(songSubstringPipeline as any[]),
      songModel.aggregate(songPipeline),
      artistModel.aggregate(artistSubstringPipeline as any[]),
      artistModel.aggregate(artistPipeline),
    ])

    return {
      success: true,
      data: [
        ...mergeHits(songSubstring, songs, "songId"),
        ...mergeHits(artistSubstring, artist, "artistId"),
      ].sort(byRelevance),
    }
  } catch (error: any) {
    console.error(error)

    return {
      success: false,
      error: error.message,
    }
  }
})
