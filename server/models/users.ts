import mongoose from "mongoose"
import * as bcrypt from "bcrypt"

import songs from "./songs"

const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    name: {
      type: String,
      require: true,
    },
    // flags: {
    //   isEmailConfirmed: {
    //     type: Boolean,
    //     default: false,
    //   },
    // },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: songs,
      },
    ],
    role: {
      type: String,
      enum: ["ADMIN", "FREE_USER", "SUBSCRIBER"],
    },
    image: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, strict: true, strictQuery: true },
)

schema.pre("save", async function (next) {
  // only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next()

  if (this.password && this.password.length < 8) {
    throw new Error("Password must be at least 8 characters")
  }

  this.password = await bcrypt.hash(this.password!, 10)
})

schema.methods.verifyPassword = async function (
  password: string,
  hash: string,
) {
  return await bcrypt.compare(password, hash)
}

export default mongoose.model("Users", schema, "users")
