import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { NuxtAuthHandler } from "#auth"
import dbConnect from "~/server/utils/db"
import { users as Users, accounts as Accounts } from "~/server/models"
import CustomAdapter from "~/server/models/nextauth/customAdapter"

/**
 * @see https://next-auth.js.org/configuration/options#options
 */
export default NuxtAuthHandler({
  adapter: CustomAdapter(dbConnect, { Accounts, Users }),
  pages: {
    signIn: "/login",
    signOut: "/logout",
    // error: "/auth/error", // Error code passed in query string as ?error=
    // verifyRequest: "/auth/verify-request", // (used for check email message)
    // newUser: "/auth/new-user", // New users will be directed here on first sign in (leave the property out if not of interest)
  },
  callbacks: {
    async signIn({
      user,
      account,
      profile,
      email,
      credentials,
    }: {
      user: any
      account: {
        provider: string
      }
      profile: any
      email: any
      credentials: any
    }) {
      try {
        // TODO: Should do something for collecting user data here?
        if (account.provider === "credentials") {
          // console.log("signIn", { user, account, profile, email, credentials })
        }
        if (account.provider === "google") {
          // console.log({ account, profile })
        }

        return true
      } catch (err) {
        console.error(err)
        return false
      }
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      try {
        return baseUrl
      } catch (err) {
        console.error(err)
        return baseUrl
      }
    },
    async jwt({
      token,
      user,
      account,
      profile,
      isNewUser,
    }: {
      token: {
        id: string
        role: string
      }
      user: any
      account: any
      profile: any
      isNewUser: boolean
    }) {
      try {
        if (user) {
          token.id = user.id
          token.role = user.role
        }

        return token
      } catch (err) {
        console.error(err)
        return token
      }
    },
    async session({
      session,
      user,
      token,
    }: {
      session: {
        user: {
          id: string
          role: string
        }
      }
      user: any
      token: any
    }) {
      try {
        if (token) {
          session.user.id = token.id
          session.user.role = token.role
        }

        return session
      } catch (err) {
        console.error(err)
        return session
      }
    },
  },
  secret: useRuntimeConfig().authSecret,
  providers: [
    CredentialsProvider.default({
      async authorize(credentials: any, req: any) {
        try {
          const { email, password } = credentials

          const user = await Users.findOne({ email: email })
          if (!user || !user.password) return null

          const validate = await user.verifyPassword(password, user.password)
          if (!validate) return null

          user.id = user._id
          user.role = user.role || "FREE_USER"
          return user
        } catch (err) {
          console.error(err)
          return null
        }
      },
    }),
    GoogleProvider.default({
      clientId: useRuntimeConfig().googleClientId,
      clientSecret: useRuntimeConfig().googleClientSecret,
    }),
    FacebookProvider.default({
      clientId: useRuntimeConfig().facebookClientId,
      clientSecret: useRuntimeConfig().facebookClientSecret,
    }),
  ],
  session: {
    strategy: "jwt",
  },
})
