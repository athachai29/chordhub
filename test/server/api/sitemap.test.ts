import { it, expect, vi, afterEach } from "vitest"

afterEach(() => {
  delete (globalThis as any).$fetch
})

it("sitemap urls are built from /api/songs", async () => {
  const $fetch = vi.fn().mockResolvedValue({
    data: [{ songId: "abc123", updatedAt: "2024-01-02T03:04:05.000Z" }],
  })
  ;(globalThis as any).$fetch = $fetch
  const urls = await (await import("~~/server/api/__sitemap__/urls")).default()
  expect($fetch).toHaveBeenCalledWith("/api/songs")
  expect(urls).toEqual([
    { url: "/song/abc123", lastmod: new Date("2024-01-02T03:04:05.000Z") },
  ])
})
