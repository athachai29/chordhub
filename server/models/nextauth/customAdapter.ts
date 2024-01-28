import { users as Users, accounts as Accounts } from "~/server/models"

/** @return { import("next-auth/adapters").Adapter } */
export default (options: {
  Users: typeof Users
  Accounts: typeof Accounts
}) => {
  return {
    async createUser(user: any) {
      const res = await options.Users.create(user)
      return {
        ...res,
        id: res._id,
      }
    },
    async getUser(id: string) {
      return
    },
    async getUserByEmail(email: string) {
      return
    },
    async getUserByAccount({
      providerAccountId,
      provider,
    }: {
      providerAccountId: string
      provider: string
    }) {
      const account = await options.Accounts.findOne({ providerAccountId })
      if (!account) return null
      const user = await options.Users.findById(account.userId)
      if (!user) return null
      return user
    },
    async updateUser(user: object) {
      return
    },
    async deleteUser(userId: string) {
      return
    },
    async linkAccount(account: {
      providerId: string
      providerAccountId: string
      userId: string
    }) {
      return await options.Accounts.create(account)
    },
    async unlinkAccount({
      providerAccountId,
      provider,
    }: {
      providerAccountId: string
      provider: string
    }) {
      return
    },
    async createSession({
      sessionToken,
      userId,
      expires,
    }: {
      sessionToken: string
      userId: string
      expires: Date
    }) {
      return
    },
    async getSessionAndUser(sessionToken: string) {
      return
    },
    async updateSession({
      sessionToken,
      expires,
    }: {
      sessionToken: string
      expires: Date
    }) {
      return
    },
    async deleteSession(sessionToken: string) {
      return
    },
    async createVerificationToken({
      identifier,
      expires,
      token,
    }: {
      identifier: string
      expires: Date
      token: string
    }) {
      return
    },
    async useVerificationToken({
      identifier,
      token,
    }: {
      identifier: string
      token: string
    }) {
      return
    },
  }
}
