import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
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
);

export default mongoose.model("Artists", schema, "artists");
