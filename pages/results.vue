<script setup lang="ts">
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

const onFetch = async () => {
  const songs = await fetch(`/api/songs/search/?query=${keyword.value}`);

  results.value = (await songs.json()).data;
};

onMounted(async () => {
  onFetch();
});

const onSearch = () => {
  if (keyword.value.trim() === "") return;

  onFetch();
  resultForKeyword.value = keyword.value.trim();
};

const onSelected = (song: Song) => {
  // TODO call api for query result with incomming keyword
  // const { data } = await this.$axios.get(`/api/search/${this.keyword}`);
  // console.log(data);
  // keywordStore.setKeyword(keyword.value);
  router.push({ name: "song", query: { id: song._id } });
};
</script>

<template>
  <!-- BEGIN: SEARCH BAR -->
  <div class="flex px-16 mt-12">
    <form @submit.prevent="onSearch">
      <input
        id="search-bar"
        type="text"
        class="placeholder-svg bg-transparent px-4 py-2 border border-black mr-4"
        placeholder="Search with Song or Artist"
        v-model="keyword"
      />
      <button
        type="submit"
        class="px-4 py-2 hover:bg-black hover:text-white border-2 border-black"
      >
        Search
      </button>
    </form>
  </div>
  <!-- END: SEARCH BAR -->
  <!-- BEGIN: RESULTS -->
  <div class="flex flex-col px-16 mt-12">
    <div class="flex flex-row justify-between">
      <h1 class="text-3xl">Results for "{{ resultForKeyword }}"</h1>
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
