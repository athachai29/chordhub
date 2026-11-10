// TODO: Declare process.env here

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-11-11",
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
    // Anti-scraping guard for /api/songs*. mode: off | log | enforce.
    scraperGuard: {
      mode: "log",
      perMinute: 30,
      perDay: 500,
      registerPerDay: 5,
      ipHeader: "",
      xffHopsFromRight: 0,
    },
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
    strategy: "prefix",
    locales: [
      {
        code: "th",
        language: "th-TH",
        file: "th-TH.ts",
      },
      {
        code: "en",
        language: "en-US",
        file: "en-US.ts",
      },
    ],
    defaultLocale: "th",
    // v8 redirected every unprefixed route; v10 defaults to "root" only,
    // which 404s next-auth's unprefixed /login sign-in page.
    detectBrowserLanguage: { redirectOn: "no prefix" },
    // baseUrl: 'https://my-nuxt-app.com',
  },
  components: [
    "~/components",
    { path: "~/components/layout", prefix: "Layout" },
    { path: "~/components/base", prefix: "Base" },
  ],
  auth: {
    baseURL: "/api/auth",
    provider: { type: "authjs" },
    globalAppMiddleware: true,
  },
  routeRules: {
    // @nuxtjs/sitemap 5 served the per-locale children at these paths.
    "/th-TH-sitemap.xml": {
      redirect: { to: "/__sitemap__/th-TH.xml", statusCode: 301 },
    },
    "/en-US-sitemap.xml": {
      redirect: { to: "/__sitemap__/en-US.xml", statusCode: 301 },
    },
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
