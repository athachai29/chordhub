<script setup lang="ts">
const localePath = useLocalePath()

const title = ref("Artist - ChordHub")

useSeoMeta({
  title: title,
  description: `${useRuntimeConfig().public.siteDescription}`,

  ogTitle: title,
  ogUrl: `${useRuntimeConfig().public.siteUrl}${useRoute().path}`,

  twitterTitle: title,
})

definePageMeta({
  auth: false,
  validate: (route) => !!route.query.id,
})

type Song = {
  _id: string
  title: string
  artist: string
  sheet: string[]
  _artist: {
    thaiName: string
    engName: string
  }
  songId: string
}

const { data: results }: any = await useFetch(
  `/api/songs/${useRoute().query.id}/artists`,
  {
    transform: (res: any) => res.data,
  },
)

const onSelectedSong = (song: Song) => {
  navigateTo({
    path: localePath(`/song/${(song as Song).songId}`),
  })
}

/**
 * Google Analytics
 */
const gtag = useGtag()
gtag("set", "page_title", "Artist")
</script>

<template>
  <div class="mb-6 mt-24 flex flex-col px-4 md:mb-12 md:px-16">
    <ul class="flex flex-col gap-2 lg:w-2/5">
      <li
        v-for="(result, index) in results"
        :key="index"
        class="rounded-lg border-2 border-black p-4 hover:cursor-pointer hover:bg-black hover:text-white"
        @click="() => onSelectedSong(result)"
      >
        <div>
          <div class="flex justify-between">
            <div class="md:text-2xl">{{ result.title }}</div>
            <div class="text-xs">{{ $t("general.label_song") }}</div>
          </div>
          <div class="md:text-xl">
            {{ result._artist.thaiName || result._artist.engName }}
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
