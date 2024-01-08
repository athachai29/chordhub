<script setup lang="ts">
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline"

const title = ref("ChordHub")

useSeoMeta({
  title: title,
  description: `${useRuntimeConfig().public.siteDescription}`,

  ogTitle: title,
  ogUrl: `${useRuntimeConfig().public.siteUrl}${useRoute().path}`,

  twitterTitle: title,
})

definePageMeta({ auth: false })

const { data } = useAuth()

// import { useKeywordStore } from "../store/keyword";

// const keywordStore = useKeywordStore();

const keyword = ref("")
// const keyword = ref(keywordStore.$state.keyword as string);

const onSearch = () => {
  if (keyword.value.trim() === "") return

  navigateTo({
    path: "/results",
    query: { search: keyword.value.trim() },
  })
}

// const onClaer = () => {
//   keyword.value = "";
// };

/**
 * Google Analytics
 */
const gtag = useGtag()
gtag("set", "page_title", "Home")
if (data.value?.user?.email) {
  gtag("set", "user_id", data.value?.user?.email)
}

// gtag("event", "screen_view", {
//   app_name: "ChordHub",
//   screen_name: "Search",
// })

// useTrackEvent("login", {
//   method: "Google",
// })
</script>

<template>
  <form @submit.prevent="onSearch">
    <div class="mb-2 mt-80 flex justify-center">
      <div class="select-none text-5xl">ChordHub</div>
    </div>
    <div class="mb-4 flex justify-center">
      <div class="w-11/12 lg:w-6/12">
        <div class="relative">
          <input
            id="search-bar"
            type="text"
            class="block w-full rounded-none border border-black px-4 py-2 focus:outline-none"
            placeholder="Search with Song or Artist"
            v-model.trim="keyword"
          />
          <div
            class="absolute inset-y-0 right-0 flex items-center hover:cursor-pointer"
          >
            <MagnifyingGlassIcon class="mr-4 h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-center">
      <button
        type="submit"
        class="border-2 border-black px-4 py-2 hover:bg-black hover:text-white"
      >
        Search
      </button>
      <!-- <button
        class="ml-2 border-2 border-black px-4 py-2 hover:bg-black hover:text-white"
      >
        Trends
      </button> -->
    </div>
  </form>
</template>

<style scoped></style>
