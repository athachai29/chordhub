<script setup lang="ts">
useHead({
  title: "ChordHub",
  meta: [{ name: "description", content: "Any song you can play." }],
})

definePageMeta({ auth: false })

import { useRouter } from "vue-router"

const router = useRouter()
const { data } = useAuth()

// import { useKeywordStore } from "../store/keyword";

// const keywordStore = useKeywordStore();

const keyword = ref("")
// const keyword = ref(keywordStore.$state.keyword as string);

const onSearch = () => {
  if (keyword.value.trim() === "") return

  router.push({ name: "results", query: { search: keyword.value.trim() } })
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
      <h1 class="text-5xl">ChordHub</h1>
    </div>
    <div class="mb-4 flex justify-center">
      <input
        id="search-bar"
        type="text"
        class="placeholder-svg w-11/12 rounded-none border border-black bg-transparent px-4 py-2 focus:outline-none md:w-9/12 lg:w-1/2"
        placeholder="Search with Song or Artist"
        v-model.trim="keyword"
      />
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

<style scoped>
.placeholder-svg::placeholder {
  background-image: url("../assets/icons/search.svg");
  background-repeat: no-repeat;
  background-position: right center;
  padding-right: 2.5rem;
}
</style>
