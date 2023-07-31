import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { NuxtAuthHandler } from "#auth"
import Users from "../../models/users"

export default NuxtAuthHandler({
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/auth/error", // Error code passed in query string as ?error=
    verifyRequest: "/auth/verify-request", // (used for check email message)
    newUser: "/auth/new-user", // New users will be directed here on first sign in (leave the property out if not of interest)
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        if (account.provider === "credentials") {
          console.log("signIn", { user, account, profile, email, credentials })
        }
        if (account.provider === "google") {
          console.log({ account, profile })
        }
        return true
      } catch (err) {
        console.log(err)
        return false
      }
    },
    async redirect({ url, baseUrl }) {
      return baseUrl
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      console.log("jwt", { token, user, account, profile, isNewUser })
      return token
    },
    async session({ session, user, token }) {
      console.log("session", { session, user, token })
      return session
    },
  },
  secret: process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider.default({
      async authorize(credentials: any, req: any) {
        const { username, password } = credentials

        const user = await Users.findOne({ email: username })
        if (!user) return null

        const validate = await user?.verifyPassword(password)
        if (!validate) return null

        user!.id = user!._id
        return user
      },
    }),
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
})
