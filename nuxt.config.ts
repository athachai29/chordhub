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
  modules: [
    "@pinia/nuxt",
    "@sidebase/nuxt-auth",
    "nuxt-gtag",
    "@nuxtjs/sitemap",
    "@nuxtjs/i18n",
  ],
  i18n: {
    vueI18n: "./i18n.config.ts", // if you are using custom path, default
    strategy: "prefix",
    locales: [
      {
        code: "th",
        iso: "th-TH",
      },
      {
        code: "en",
        iso: "en-US",
      },
    ],
    defaultLocale: "th",
    // baseUrl: 'https://my-nuxt-app.com',
  },
  components: [
    "~/components",
    { path: "~/components/layout", prefix: "Layout" },
    { path: "~/components/base", prefix: "Base" },
  ],
  nitro: {
    plugins: ["~/server/index.ts"],
  },
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
