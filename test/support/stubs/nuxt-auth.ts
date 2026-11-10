// Stand-in for @sidebase/nuxt-auth's `#auth` virtual module in vitest.
// NuxtAuthHandler returns the raw next-auth options so tests can reach callbacks.
export const NuxtAuthHandler = (options: any) => options
export const getToken = async () => null
