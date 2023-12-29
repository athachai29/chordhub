import Users from "~/server/models/users"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { email } = query

  const isExists = await Users.findOne({ email: email })

  return {
    status: 200,
    success: true,
    data: {
      exists: !!isExists,
    },
  }
})
