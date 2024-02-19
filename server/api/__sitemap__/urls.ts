import { asSitemapUrl, defineSitemapEventHandler } from '#imports'

export default defineSitemapEventHandler(async () => {
  // fetch data directly in the correct type
  const songs = await $fetch<ReturnType<typeof asSitemapUrl>>('/api/songs')
  return [
    // dynamic urls
    ...songs.data.map((item) => asSitemapUrl({ url: `/song/${item.songId}`, lastmod: new Date(item.updatedAt) })),
  ]
})
