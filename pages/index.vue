<script setup lang="ts">
import { ref, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
// import { useKeywordStore } from "../store/keyword";

const { status, data, signOut } = useAuth();

const router = useRouter();

// const keywordStore = useKeywordStore();

// onBeforeMount(async () => {
//   const { data } = await axios("/api/hello");
//   console.log(data);
// });

// interface User {
//   name: string;
//   picture: {
//     data: {
//       url: string;
//     };
//   };
// }

const keyword = ref("");
// const keyword = ref(keywordStore.$state.keyword as string);

// const user = ref(this.$auth.user as unknown as User)
// const loggedIn = ref(this.$auth.loggedIn);

const onSearch = () => {
  // TODO call api for query result with incomming keyword
  // const { data } = await this.$axios.get(`/api/search/${this.keyword}`);
  // console.log(data);
  //   if (keyword.value !== "") {
  //     console.log(keyword.value);
  //     keywordStore.setKeyword(keyword.value);
  //     //   this.$router.push({ name: "result", params: { keyword: this.keyword } });
  //   }
};

// const onClaer = () => {
//   keyword.value = "";
// };

const onLogout = async () => {
  try {
    // await this.$auth.logout();
  } catch (err) {
    console.error(err);
  }

  // this.$router.go(0);
};

const onGoToLoginPage = () => {
  router.push("/login");
};
</script>

<template>
  <div class="flex flex-col h-screen">
    <nav class="mb-60">
      <div class="flex justify-between">
        <div class="m-2 text-4xl"></div>
        <div class="flex m-2 items-center">
          <div class="mr-4">{{ data?.user?.name }}</div>
          <button
            v-if="status === 'unauthenticated'"
            class="px-4 py-2 hover:bg-black hover:text-white border-2 border-black"
            @click="onGoToLoginPage"
          >
            Log in
          </button>
          <button
            v-else
            class="px-4 py-2 hover:bg-black hover:text-white border-2 border-black"
            @click="signOut"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
    <main class="flex flex-col flex-grow">
      <div class="flex justify-center mb-2">
        <h1 class="text-5xl">ChordHub</h1>
      </div>
      <div class="flex justify-center mb-4">
        <input
          id="search-bar"
          type="text"
          class="md:w-1/2 placeholder-svg bg-transparent px-4 py-2 border border-black"
          placeholder="Search with Song or Artist"
          v-model="keyword"
        />
      </div>
      <div class="flex justify-center">
        <button
          class="px-4 py-2 hover:bg-black hover:text-white border-2 border-black"
          @click="onSearch"
        >
          Search
        </button>
        <!-- <button
        class="px-4 py-2 hover:bg-black hover:text-white border-2 border-black ml-2"
      >
        Trends
      </button> -->
      </div>
    </main>
    <footer class="bg-gray-800 text-white p-6">
      Made with Love and Depression
    </footer>
  </div>
  <!-- <div>
    <b-container fluid="sm">
      <b-row style="height: 48px">
        <b-col class="text-right" v-if="loggedIn">
          <b-img :src="user.picture.data.url"></b-img>
          <b-dropdown variant="light" :text="user.name">
            <b-dropdown-item disabled>{{ user.name }}</b-dropdown-item>
            <b-dropdown-item href="/profile">Profile</b-dropdown-item>
            <b-dropdown-item @click="logout">Log out</b-dropdown-item>
          </b-dropdown>
        </b-col>
      </b-row>
    </b-container>
    <Footer></Footer>
  </div> -->
</template>

<style>
.placeholder-svg::placeholder {
  background-image: url("../assets/icons/search.svg");
  background-repeat: no-repeat;
  background-position: right center;
  padding-right: 2.5rem;
}
</style>
