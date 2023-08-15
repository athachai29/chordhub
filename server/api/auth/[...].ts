import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { NuxtAuthHandler } from "#auth"
import Users from "../../models/users"
import CustomAdapter from "../../models/nextauth/customAdapter"
import dbConnect from "../../db"
import Accounts from "../../models/accounts"

export default NuxtAuthHandler({
  adapter: CustomAdapter(dbConnect, { Accounts, Users }),
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/auth/error", // Error code passed in query string as ?error=
    verifyRequest: "/auth/verify-request", // (used for check email message)
    // newUser: "/auth/new-user", // New users will be directed here on first sign in (leave the property out if not of interest)
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
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
    async redirect({ url, baseUrl }) {
      try {
        return baseUrl
      } catch (err) {
        console.error(err)
        return baseUrl
      }
    },
    async jwt({ token, user, account, profile, isNewUser }) {
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
    async session({ session, user, token }) {
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
        const { username, password } = credentials

        const user = await Users.findOne({ email: username })
        if (!user) return null

        const validate = await user?.verifyPassword(password)
        if (!validate) return null

        user.id = user._id
        user.role = user.role || "FREE_USER"
        return user
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
