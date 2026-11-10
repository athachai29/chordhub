import mongoose from "mongoose"

import users from "./users"

const schema = new mongoose.Schema(
  {
    _user: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: users,
    },
    title: {
      type: String,
      required: true,
    },
    artist: {
      type: String,
    },
    source: {
      type: String,
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
      required: true,
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
