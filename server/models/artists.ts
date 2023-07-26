import mongoose from "mongoose"

const schema = new mongoose.Schema(
  {
    artistId: {
      type: String,
      require: true,
      unique: true,
    },
    thaiName: {
      type: String,
      default: "",
    },
    engName: {
      type: String,
      default: "",
    },
    params: {},
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
  }
)

export default mongoose.model("Artists", schema, "artists")
