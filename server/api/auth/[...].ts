import CredentialsProvider from "next-auth/providers/credentials";
import { NuxtAuthHandler } from "#auth";

import userModel from "../../models/users";

export default NuxtAuthHandler({
  pages: {
    // Change the default behavior to use `/login` as the path for the sign-in page
    signIn: "/login",
  },
  callbacks: {
    // Callback when the JWT is created / updated, see https://next-auth.js.org/configuration/callbacks#jwt-callback
    jwt: async ({ token, user }) => {
      const isSignIn = user ? true : false;
      if (isSignIn) {
        token.jwt = user ? (user as any).access_token || "" : "";
        token.id = user ? user.id || "" : "";
        token.role = user ? (user as any).role || "" : "";
      }
      return Promise.resolve(token);
    },
    // Callback whenever session is checked, see https://next-auth.js.org/configuration/callbacks#session-callback
    session: async ({ session, token }) => {
      (session as any).role = token.role;
      (session as any).uid = token.id;
      return Promise.resolve(session);
    },
  },
  // your authentication configuration here!
  secret: process.env.AUTH_SECRET,
  providers: [
    // @ts-ignore Import is exported on .default during SSR, so we need to call it this way. May be fixed via Vite at some point
    CredentialsProvider.default({
      async authorize(credentials: any) {
        const { username, password } = credentials;

        const user = await userModel.findOne({ email: username });
        const validate = await user?.verifyPassword(password);

        if (validate) {
          // Any object returned will be saved in `user` property of the JWT
          user.id = user._id;

          return user;
        } else {
          // eslint-disable-next-line no-console
          console.error(
            "Warning: Malicious login attempt registered, bad credentials provided"
          );

          // If you return null then an error will be displayed advising the user to check their details.
          return null;

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
  ],
});
