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
