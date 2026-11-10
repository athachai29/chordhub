import mongoose from "mongoose"

const schema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "PARENT_MERGED", // Parent song merged with child song
        "EDITED", // Song was edited
      ],
      required: true,
    },
    songId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
  },
)

export default mongoose.model("Logs", schema, "logs")
