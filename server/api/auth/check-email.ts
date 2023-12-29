import Users from "~/server/models/users"

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event)

  const isExists = await Users.findOne({ email: email })

  return {
    status: "success",
    message: !!isExists ? "Email already exists" : "Email is available",
    data: {
      email: email,
      exists: !!isExists,
    },
  }
})
