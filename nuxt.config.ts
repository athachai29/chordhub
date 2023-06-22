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
    jwtSecret: process.env.JWT_SECRET,
  },
  nitro: {
    plugins: ["~/server/index.ts"],
  },
  modules: ["@pinia/nuxt", "@sidebase/nuxt-auth"],
  auth: {
    globalAppMiddleware: true,
  },
});
