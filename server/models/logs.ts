import mongoose from "mongoose"

const schema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["PARENT_MERGED"],
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
