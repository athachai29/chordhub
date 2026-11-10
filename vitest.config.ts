import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

const root = fileURLToPath(new URL(".", import.meta.url))

export default defineConfig({
  resolve: {
    alias: [
      { find: /^~\//, replacement: root },
      { find: /^@\//, replacement: root },
    ],
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    setupFiles: ["test/support/nitro-globals.ts"],
    globalSetup: ["test/support/global-setup.ts"],
    pool: "forks",
    testTimeout: 20_000,
  },
})
