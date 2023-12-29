import Users from "~/server/models/users"

export default eventHandler(async (event) => {
  try {
    const { email, password } = await readBody(event)

    await Users.create({ email, password })

    return {
      success: true,
      body: { message: "User created" },
    }
  } catch (err: any) {
    return {
      success: false,
      body: { message: err.message },
    }
  }
})
