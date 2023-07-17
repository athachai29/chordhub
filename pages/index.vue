<script setup lang="ts">
definePageMeta({ auth: false });

import { useRouter } from "vue-router";

const router = useRouter();

// import { useKeywordStore } from "../store/keyword";

// const keywordStore = useKeywordStore();

const keyword = ref("");
// const keyword = ref(keywordStore.$state.keyword as string);

const onSearch = () => {
  if (keyword.value.trim() === "") return;

  router.push({ name: "results", query: { search: keyword.value.trim() } });
};

// const onClaer = () => {
//   keyword.value = "";
// };
</script>

<template>
  <form @submit.prevent="onSearch">
    <div class="flex justify-center mb-2 mt-60">
      <h1 class="text-5xl">ChordHub</h1>
    </div>
    <div class="flex justify-center mb-4">
      <input
        id="search-bar"
        type="text"
        class="md:w-1/2 placeholder-svg bg-transparent px-4 py-2 border border-black focus:outline-none"
        placeholder="Search with Song or Artist"
        v-model="keyword"
      />
    </div>
    <div class="flex justify-center">
      <button
        type="submit"
        class="px-4 py-2 hover:bg-black hover:text-white border-2 border-black"
      >
        Search
      </button>
      <button
        class="px-4 py-2 hover:bg-black hover:text-white border-2 border-black ml-2"
      >
        Trends
      </button>
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
