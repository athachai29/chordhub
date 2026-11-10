import { asSitemapUrl, defineSitemapEventHandler } from '#imports'
import Songs from '~~/server/models/songs'
import { PUBLIC_SONG_FILTER } from '~~/server/utils/public-songs'

export default defineSitemapEventHandler(async () => {
  const songs = await Songs.find(PUBLIC_SONG_FILTER, 'songId updatedAt').lean()
  return songs.map(({ songId, updatedAt }) =>
    asSitemapUrl({ url: `/song/${songId}`, lastmod: new Date(updatedAt) }),
  )
})
