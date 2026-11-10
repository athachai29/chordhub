import { createServer } from "node:http"
import type { AddressInfo } from "node:net"
import {
  createApp,
  defineEventHandler,
  toNodeListener,
  type EventHandler,
} from "h3"

export type CallOptions = {
  method?: string
  path?: string
  params?: Record<string, string>
  body?: unknown
  auth?: Record<string, unknown> | null
  headers?: Record<string, string>
  middleware?: EventHandler[]
}

export async function callHandler(
  handler: EventHandler,
  opts: CallOptions = {},
): Promise<{ status: number; body: any }> {
  const app = createApp()
  app.use(
    defineEventHandler((event) => {
      if (opts.params) event.context.params = opts.params
      if ("auth" in opts) event.context.auth = opts.auth
    }),
  )
  for (const mw of opts.middleware ?? []) app.use(mw)
  app.use(handler)

  const server = createServer(toNodeListener(app))
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
  try {
    const { port } = server.address() as AddressInfo
    const hasBody = opts.body !== undefined
    const res = await fetch(`http://127.0.0.1:${port}${opts.path ?? "/"}`, {
      method: opts.method ?? "GET",
      headers: {
        ...(hasBody ? { "content-type": "application/json" } : {}),
        ...opts.headers,
      },
      body: hasBody ? JSON.stringify(opts.body) : undefined,
    })
    const text = await res.text()
    let body: any
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
    return { status: res.status, body }
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
}
