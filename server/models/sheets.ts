import mongoose from "mongoose"

const schema = new mongoose.Schema(
  {
    _user: {
      type: mongoose.Types.ObjectId,
      require: true,
      ref: "Users",
    },
    sheet: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
  },
)

export default mongoose.model("Sheets", schema, "sheets")
