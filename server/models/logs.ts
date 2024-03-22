import mongoose from "mongoose"

const schema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "PARENT_MERGED", // Parent song merged with child song
        "EDITED", // Song was edited
      ],
      require: true,
    },
    songId: {
      type: String,
      require: true,
    },
    userId: {
      type: String,
      require: true,
    },
    data: {
      type: Object,
      require: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
  },
)

export default mongoose.model("Logs", schema, "logs")
