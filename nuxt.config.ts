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
    mongoUrl: process.env.MONGODB_URI,
    buyMeACoffeeUrl: process.env.BUY_ME_A_COFFEE_URL,
    authSecret: process.env.AUTH_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    authOrigin: process.env.AUTH_ORIGIN,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    facebookClientId: process.env.FACEBOOK_CLIENT_ID,
    facebookClientSecret: process.env.FACEBOOK_CLIENT_SECRET,
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
