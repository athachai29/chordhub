/** @return { import("next-auth/adapters").Adapter } */
export default (client, options = {}) => {
  return {
    async createUser(user) {
      return await options.Users.create(user)
    },
    async getUser(id) {
      return
    },
    async getUserByEmail(email) {
      return
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const account = await options.Accounts.findOne({ providerAccountId })
      if (!account) return null
      const user = await options.Users.findById(account.userId)
      if (!user) return null
      return user
    },
    async updateUser(user) {
      return
    },
    async deleteUser(userId) {
      return
    },
    async linkAccount(account) {
      return await options.Accounts.create(account)
    },
    async unlinkAccount({ providerAccountId, provider }) {
      return
    },
    async createSession({ sessionToken, userId, expires }) {
      return
    },
    async getSessionAndUser(sessionToken) {
      return
    },
    async updateSession({ sessionToken }) {
      return
    },
    async deleteSession(sessionToken) {
      return
    },
    async createVerificationToken({ identifier, expires, token }) {
      return
    },
    async useVerificationToken({ identifier, token }) {
      return
    },
  }
}
