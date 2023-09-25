import * as packageJson from "~/package.json"

export default defineEventHandler((event) => {
  return {
    success: true,
    data: {
      message: "CHORDHUB API SERVICE",
      environment: useRuntimeConfig().environment,
      version: packageJson.version,
    },
  }
})
