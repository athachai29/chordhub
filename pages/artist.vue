<script setup lang="ts">
definePageMeta({ auth: false })

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
  const song = await fetch(`/api/songs/${useRoute().query.id}/artists`)
  const songJson = (await song.json()).data
  results.value = songJson
}

onMounted(async () => {
  onFetch()
})

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
    <ul class="flex flex-col gap-2">
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
