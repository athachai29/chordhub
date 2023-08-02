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
    sheet: {
      type: Array,
      default: [],
    },
    note: {
      type: String,
    },
    type: {
      type: String,
      enum: ["NEW_SONG", "EDIT_SONG"],
      require: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
    reason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
  },
)

export default mongoose.model("Requests", schema, "requests")
