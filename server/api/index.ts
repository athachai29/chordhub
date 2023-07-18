import * as packageJson from "../../package.json"

export default defineEventHandler((event) => {
  return {
    success: true,
    data: {
      message: "CHORDHUB API SERVICE",
      environment: process.env.NODE_ENV,
      version: packageJson.version,
    },
  }
})
