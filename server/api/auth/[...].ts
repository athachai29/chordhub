import CredentialsProvider from "next-auth/providers/credentials"
import { NuxtAuthHandler } from "#auth"

import userModel from "../../models/users"

export default NuxtAuthHandler({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true
    },
    async redirect({ url, baseUrl }) {
      return baseUrl
    },
    async session({ session, user, token }) {
      return session
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      return token
    },
  },
  secret: process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider.default({
      async authorize(credentials: any, req: any) {
        const { username, password } = credentials

        const user = await userModel.findOne({ email: username })
        if (!user) return null

        const validate = await user?.verifyPassword(password)
        if (!validate) return null

        user!.id = user!._id
        return user
      },
    }),
  ],
})
