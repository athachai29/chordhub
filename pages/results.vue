<script setup lang="ts">
import ogImage from "/og-image.webp"

useHead({
  title: "Results - ChordHub",
  meta: [
    { name: "description", content: "Any song you can play." },
    {
      property: "og:image",
      content: ogImage,
    },
  ],
})

definePageMeta({ auth: false })

type Song = {
  title: string
  _artist: {
    thaiName: string
    engName: string
  }
  songId: string
  resultType: string
}

type Artist = {
  thaiName: string
  engName: string
  artistId: string
  resultType: string
}

type Result = Song | Artist

const keyword = ref(useRoute().query.search as string)
const resultForKeyword = ref(useRoute().query.search as string)
const results = ref<Result[]>([])
const isLoading = ref(false)

const onFetch = async () => {
  isLoading.value = true
  const { data }: any = await useFetch(
    `/api/songs/search/?query=${keyword.value}`,
  )

  results.value = data.value.data
  isLoading.value = false
}

onFetch()

const onSearch = () => {
  if (keyword.value.trim() === "") return

  onFetch()
  resultForKeyword.value = keyword.value.trim()
  navigateTo({
    path: "/results",
    query: { search: keyword.value.trim() },
  })
}

const onSelectedSong = (song: Result) => {
  navigateTo({
    path: "/song",
    query: { id: (song as Song).songId },
  })
}

const onSelectedArtist = (artist: Result) => {
  navigateTo({
    path: "/artist",
    query: { id: (artist as Artist).artistId },
  })
}

/**
 * Google Analytics
 */
const gtag = useGtag()
gtag("set", "page_title", "Results")
gtag("event", "search", {
  search_term: keyword.value,
})
</script>

<template>
  <!-- BEGIN: SEARCH BAR -->
  <div class="my-6 flex flex-col px-4 pt-16 md:my-12 md:px-16 md:pt-8">
    <form @submit.prevent="onSearch">
      <div class="flex">
        <input
          id="search-bar"
          type="text"
          class="placeholder-svg mr-4 w-1/2 rounded-none border border-black bg-transparent px-4 py-2 focus:outline-none lg:w-1/3"
          placeholder="Search with Song or Artist"
          v-model.trim="keyword"
        />
        <button
          type="submit"
          class="border-2 border-black px-4 py-2 hover:bg-black hover:text-white"
        >
          Search
        </button>
      </div>
    </form>
  </div>
  <!-- END: SEARCH BAR -->
  <!-- BEGIN: RESULTS -->
  <div class="mb-6 flex flex-col px-4 md:mb-12 md:px-16">
    <div class="flex flex-row justify-between">
      <h1 v-if="isLoading" class="text-3xl">Searching...</h1>
      <div v-if="!isLoading">
        <h1 v-if="results?.length > 0">
          Found {{ results.length }} results for "{{ resultForKeyword }}"
        </h1>
        <div v-else>
          <div class="mb-4 text-3xl">
            No results for "{{ resultForKeyword }}"
          </div>
          <div class="flex gap-4">
            <NuxtLink
              class="text-blue-600 hover:underline"
              :to="{ name: 'request', query: { title: resultForKeyword } }"
            >
              Request this song
            </NuxtLink>
            or
            <NuxtLink
              class="text-blue-600 hover:underline"
              :to="{ name: 'submit', query: { title: resultForKeyword } }"
              >Submit your version</NuxtLink
            >
          </div>
        </div>
      </div>
    </div>
    <ul class="flex w-3/5 flex-col gap-2">
      <li
        v-for="(result, index) in results || []"
        :key="index"
        class="border-2 border-black p-4 hover:cursor-pointer hover:bg-black hover:text-white"
      >
        <div
          v-if="result.resultType === 'song'"
          @click="() => onSelectedSong(result)"
        >
          <div class="flex justify-between">
            <div class="md:text-2xl">{{ (result as Song).title }}</div>
            <div class="text-xs">Song</div>
          </div>
          <div class="md:text-xl">
            {{
              (result as Song)._artist.thaiName ||
              (result as Song)._artist.engName
            }}
          </div>
        </div>
        <div
          v-else-if="result.resultType === 'artist'"
          class="flex justify-between"
          @click="() => onSelectedArtist(result)"
        >
          <div class="md:text-2xl">
            {{ (result as Artist).engName || (result as Artist).thaiName }}
          </div>
          <div class="text-xs">Artist</div>
        </div>
      </li>
    </ul>
  </div>
  <!-- END: RESULTS -->
</template>
