import mongoose from "mongoose"

import artistModel from "./artists"

const schema = new mongoose.Schema(
  {
    _artist: {
      type: mongoose.Types.ObjectId,
      require: true,
      ref: artistModel,
    },
    songId: {
      type: String,
      require: true,
      unique: true,
    },
    title: {
      type: String,
      require: true,
    },
    sheet: {
      type: Array,
      default: [],
    },
    params: {
      key: {
        type: String,
        default: null,
      },
      ost: {
        type: String,
        default: null,
      },
      capo: {
        type: Number,
        default: 0,
      },
    },
    flags: {
      status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "INACTIVE",
      },
      isPrivate: {
        type: Boolean,
        default: false,
      },
    },
    formatter: {
      type: String,
      default: null,
    },
    sources: [
      {
        name: {
          type: String,
          default: null,
        },
        url: {
          type: String,
          default: null,
        },
      },
    ],
    stats: {
      views: {
        type: Number,
        default: 0,
      },
      likes: {
        type: Number,
        default: 0,
      },
      // PDF, PNG Version
      downloads: {
        type: Number,
        default: 0,
      },
      shares: {
        type: Number,
        default: 0,
      },
    },
    parent: {
      type: mongoose.Types.ObjectId, // _song
      default: null,
    },
    owner: {
      type: mongoose.Types.ObjectId, // _user
      default: null,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
  },
)

export default mongoose.model("Songs", schema, "songs")
