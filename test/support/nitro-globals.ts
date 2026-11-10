import {
  defineEventHandler,
  eventHandler,
  getQuery,
  getRouterParams,
  readBody,
  setResponseStatus,
  parseCookies,
} from "h3"

export const testRuntimeConfig = {
  dbUrl: "",
  authSecret: "test-secret",
  googleClientId: "test",
  googleClientSecret: "test",
  facebookClientId: "test",
  facebookClientSecret: "test",
  public: {
    buyMeACoffeeUrl: "",
    dicebearApiUrl: "",
    siteUrl: "",
    siteDescription: "",
    siteSocialNetworkDescription: "",
  },
}

Object.assign(globalThis, {
  defineEventHandler,
  eventHandler,
  getQuery,
  getRouterParams,
  readBody,
  setResponseStatus,
  parseCookies,
  useRuntimeConfig: () => testRuntimeConfig,
  defineNitroPlugin: (p: unknown) => p,
})
