import { getToken } from "next-auth/jwt"

export default defineEventHandler(async (event) => {
  /**
   * Because getToken() can't read cookies from the request, we have to parse them manually
   */
  const cookies = parseCookies(event)
  event.node.req.headers.authorization = `Bearer ${cookies["next-auth.session-token"] || cookies["__Secure-next-auth.session-token"]}`
  const user = await getToken({
    req: event.node.req,
    secret: useRuntimeConfig().authSecret,
    logger: console,
  })

  /**
   * If the user is not authenticated, return early
   * Disable this for now, because don't know how to check
   */
  // if (!user) {
  //   return {
  //     status: 401,
  //     success: false,
  //     message: "Unauthorized",
  //   }
  // }

  /**
   * Add the user to the event context, for use in the API route
   */
  event.context.auth = user
})
