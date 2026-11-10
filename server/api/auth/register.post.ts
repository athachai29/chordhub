import Users from "~~/server/models/users"
import { isEmailValid, isPasswordValid } from "#shared/utils/validators"

const fail = (event: any, status: number, message: string) => {
  setResponseStatus(event, status)
  return { success: false, body: { message } }
}

export default eventHandler(async (event) => {
  try {
    const { email, password } = await readBody(event)

    if (!isEmailValid(email ?? "")) return fail(event, 400, "Invalid email")
    if (!isPasswordValid(password ?? ""))
      return fail(event, 400, "Password must be at least 8 characters")

    await Users.create({ email, password })

    return {
      success: true,
      body: { message: "User created" },
    }
  } catch (err: any) {
    if (err?.code === 11000) return fail(event, 409, "Email already registered")
    return {
      success: false,
      body: { message: err.message },
    }
  }
})
