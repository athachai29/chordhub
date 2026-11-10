import RateLimits from "~~/server/models/rate-limits"

/**
 * Fixed-window counter backed by MongoDB. One atomic upsert per call; the
 * document id encodes key, window size and window start, so each window gets
 * its own counter that the TTL index removes after it ends.
 */
export async function incrementWindow(
  key: string,
  windowSeconds: number,
  now: Date = new Date(),
): Promise<{ count: number; resetAt: Date }> {
  const windowMs = windowSeconds * 1000
  const windowStartMs = Math.floor(now.getTime() / windowMs) * windowMs
  const resetAt = new Date(windowStartMs + windowMs)
  const doc = await RateLimits.findOneAndUpdate(
    { _id: `${key}|${windowSeconds}|${windowStartMs}` },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: resetAt } },
    { upsert: true, new: true },
  )
  return { count: doc.count, resetAt }
}
