<script setup lang="ts">
import ogImage from "/og-image.webp"

useHead({
  title: "Artist - ChordHub",
  meta: [
    { name: "description", content: "Any song you can play." },
    {
      property: "og:image",
      content: ogImage,
    },
  ],
})

definePageMeta({
  auth: false,
  validate: (route) => {
    if (!route.query.id) {
      return false
    }

    return true
  },
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

const results = ref([] as Song[])

const onFetch = async () => {
  const { data }: any = await useFetch(
    `/api/songs/${useRoute().query.id}/artists`,
  )
  results.value = data.value.data
}

onFetch()

const onSelectedSong = (song: Song) => {
  useRouter().push({ name: "song", query: { id: song.songId } })
}

/**
 * Google Analytics
 */
const gtag = useGtag()
gtag("set", "page_title", "Artist")
</script>

<template>
  <div class="mb-6 flex flex-col px-4 md:mb-12 md:mt-24 md:px-16">
    <ul class="flex w-3/5 flex-col gap-2">
      <li
        v-for="(result, index) in results"
        :key="index"
        class="border-2 border-black p-4 hover:cursor-pointer hover:bg-black hover:text-white"
        @click="() => onSelectedSong(result)"
      >
        <div>
          <div class="flex justify-between">
            <div class="md:text-2xl">{{ result.title }}</div>
            <div class="text-xs">Song</div>
          </div>
          <div class="md:text-xl">
            {{ result._artist.thaiName || result._artist.engName }}
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
