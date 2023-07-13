<script setup lang="ts">
definePageMeta({ auth: false });

type Song = {
  _id: string;
  title: string;
  artist: string;
  sheet: string[];
  _artist: {
    thaiName: string;
    engName: string;
  };
};

const route = useRoute();
const router = useRouter();

const keyword = ref(route.query.search as string);
const resultForKeyword = ref(route.query.search as string);
const results = ref([] as Song[]);
const isLoading = ref(false);

const onFetch = async () => {
  isLoading.value = true;
  const songs = await fetch(`/api/songs/search/?query=${keyword.value}`);

  results.value = (await songs.json()).data;
  isLoading.value = false;
};

onMounted(async () => {
  onFetch();
});

const onSearch = () => {
  if (keyword.value.trim() === "") return;

  onFetch();
  router.push({ name: "results", query: { search: keyword.value.trim() } });
};

const onSelected = (song: Song) => {
  router.push({ name: "song", query: { id: song._id } });
};
</script>

<template>
  <!-- BEGIN: SEARCH BAR -->
  <div class="px-16 mt-12">
    <form @submit.prevent="onSearch">
      <div class="flex">
        <input
          id="search-bar"
          type="text"
          class="w-1/2 placeholder-svg bg-transparent px-4 py-2 border border-black mr-4"
          placeholder="Search with Song or Artist"
          v-model="keyword"
        />
        <button
          type="submit"
          class="px-4 py-2 hover:bg-black hover:text-white border-2 border-black"
        >
          Search
        </button>
      </div>
    </form>
  </div>
  <!-- END: SEARCH BAR -->
  <!-- BEGIN: RESULTS -->
  <div class="flex flex-col px-16 my-12">
    <div class="flex flex-row justify-between">
      <h1 v-if="isLoading" class="text-3xl">Searching...</h1>
      <div v-if="!isLoading">
        <h1 v-if="results.length > 0" class="text-3xl">
          Found {{ results.length }} songs for "{{ resultForKeyword }}"
        </h1>
        <h1 v-else class="text-3xl">No results for "{{ resultForKeyword }}"</h1>
      </div>
    </div>
    <ul>
      <li
        v-for="(result, index) in results"
        :key="index"
        class="flex flex-row justify-between mt-4 hover:bg-black p-4 hover:text-white border-2 border-black hover:cursor-pointer"
        @click="() => onSelected(result)"
      >
        <div class="flex flex-col">
          <h2 class="text-2xl">{{ result.title }}</h2>
          <h3 class="text-xl">
            {{ result._artist.thaiName || result._artist.engName }}
          </h3>
        </div>
      </li>
    </ul>
  </div>
  <!-- END: RESULTS -->
</template>
