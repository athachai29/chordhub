import userModel from "~/server/models/users"

export default eventHandler(async (event) => {
  try {
    const { username, password } = await readBody(event)

    await userModel.create({ email: username, password })

    return {
      success: true,
      body: { message: "User created" },
    }
  } catch (err) {
    return {
      success: false,
      body: { message: err.message },
    }
  }
})
