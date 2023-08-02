import mongoose from "mongoose"

import users from "./users"

const schema = new mongoose.Schema(
  {
    _user: {
      type: mongoose.Types.ObjectId,
      require: true,
      ref: users,
    },
    title: {
      type: String,
      require: true,
    },
    artist: {
      type: String,
      require: true,
    },
    source: {
      type: String,
      require: true,
    },
    note: {
      type: String,
    },
    type: {
      type: String,
      enum: ["NEW_SONG", "ERROR_SONG", "BUG_REPORT"],
      require: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
  },
)

export default mongoose.model("Requests", schema, "requests")
