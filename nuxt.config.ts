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
  // Not have to specify the key in the runtimeConfig. It can be overriden by env variables.
  runtimeConfig: {
    // The private keys which are only available within server-side
    dbUrl: "",
    authSecret: "",
    googleClientId: "",
    googleClientSecret: "",
    facebookClientId: "",
    facebookClientSecret: "",
    // Keys within public, will be also exposed to the client-side
    public: {
      buyMeACoffeeUrl: "",
      dicebearApiUrl: "",
      siteUrl: "",
      siteDescription: "",
      siteSocialNetworkDescription: "",
    },
  },
  nitro: {
    plugins: ["~/server/index.ts"],
  },
  modules: [
    "@pinia/nuxt",
    "@sidebase/nuxt-auth",
    "nuxt-gtag",
    "@nuxtjs/sitemap",
  ],
  auth: {
    enableGlobalAppMiddleware: true,
    origin: process.env.AUTH_ORIGIN,
    basePath: "/api/auth",
  },
  gtag: {
    initialConsent: true,
  },
  sitemap: {
    sources: ["/api/__sitemap__/urls"],
    exclude: [
      "/artist/**",
      "/editor/**",
      "/login",
      "/profile",
      "/register",
      "/request",
      "/results",
      "/submit",
      "/success",
    ],
  },
})
