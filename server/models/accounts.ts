import mongoose from "mongoose"

const schema = new mongoose.Schema(
  {
    id: String,
    userId: String,
    type: String,
    provider: String,
    providerAccountId: String,
    refresh_token: String,
    access_token: String,
    expires_at: Number,
    token_type: String,
    scope: String,
    id_token: String,
    session_state: String,
  },
  { timestamps: true, strict: true, strictQuery: true },
)

export default mongoose.model("Accounts", schema, "accounts")
