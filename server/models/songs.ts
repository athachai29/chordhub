import mongoose from "mongoose";

import artists from "./artists";

const schema = new mongoose.Schema(
  {
    _artist: {
      type: mongoose.Types.ObjectId,
      require: true,
      ref: artists,
    },
    uid: {
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
    },
    formatter: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
  }
);

export default mongoose.model("Songs", schema, "songs");
