// TODO: Declare process.env here

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["~/assets/css/app.css"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    mongoUrl: process.env.NUXT_MONGODB_URI,
    authSecret: process.env.NUXT_AUTH_SECRET,
    // nextAuthUrl: process.env.NUXT_NEXTAUTH_URL,
    // authOrigin: process.env.AUTH_ORIGIN,
    googleClientId: process.env.NUXT_GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.NUXT_GOOGLE_CLIENT_SECRET,
    facebookClientId: process.env.NUXT_FACEBOOK_CLIENT_ID,
    facebookClientSecret: process.env.NUXT_FACEBOOK_CLIENT_SECRET,
    public: {
      buyMeACoffeeUrl: process.env.BUY_ME_A_COFFEE_URL,
    },
  },
  nitro: {
    plugins: ["~/server/index.ts"],
  },
  modules: ["@pinia/nuxt", "@sidebase/nuxt-auth", "nuxt-gtag"],
  auth: {
    enableGlobalAppMiddleware: true,
    origin: process.env.AUTH_ORIGIN,
    basePath: "/api/auth",
  },
  gtag: {
    initialConsent: true,
  },
})
