import { songs as songModel, artists as artistModel } from "~/server/models"

export default defineEventHandler(async (event) => {
  try {
    const { query } = getQuery(event)

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
        $limit: 5,
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
        $limit: 5,
      },
    ]

    const songs = await songModel.aggregate(songPipeline)
    const artist = await artistModel.aggregate(artistPipeline)

    return {
      success: true,
      data: [...songs, ...artist].sort((a, b) => b.textScore - a.textScore),
    }
  } catch (error: any) {
    console.error(error)

    return {
      success: false,
      error: error.message,
    }
  }
})
