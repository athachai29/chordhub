<script setup lang="ts">
const localePath = useLocalePath()

const title = ref("Home - ChordHub")

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
    path: localePath("/results"),
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
if (data.value?.user?.email) {
  gtag("set", "user_id", data.value?.user?.email)
}
</script>

<template>
  <form @submit.prevent="onSearch">
    <!-- BEGIN: LOGO -->
    <div class="mb-4 mt-80 flex justify-center lg:mb-4">
      <div class="select-none text-5xl font-semibold md:text-7xl">ChordHub</div>
    </div>
    <!-- END: LOGO -->
    <!-- BEGIN: SEARCH BAR -->
    <div class="mb-6 flex justify-center">
      <BaseSearchBar
        id="search-bar"
        class="w-11/12 md:w-8/12 lg:w-4/12"
        :placeholder="$t('page_home.placeholder_search_bar')"
        v-model.trim="keyword"
        @on-search="onSearch"
      />
    </div>
    <!-- END: SEARCH BAR -->
    <div class="flex justify-center">
      <BaseButton type="submit">{{ $t("page_home.button_search") }}</BaseButton>
      <BaseButton class="ml-2">{{ $t("page_home.button_trends") }}</BaseButton>
    </div>
  </form>
</template>

<style scoped></style>
