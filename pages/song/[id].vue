<script setup lang="ts">
import { HeartIcon } from "@heroicons/vue/24/outline"

definePageMeta({
  auth: false,
  validate: (route) => !!route.params.id,
})

const { data: result, refresh }: any = await useFetch(
  `/api/songs/${useRoute().params.id}`,
)

useSeoMeta({
  title: () => `${result.value.data.title} - ChordHub`,
  description: () =>
    `${result.value.data.title} ${result.value.data._artist.thaiName} ${
      result.value.data._artist.engName
    } | ${useRuntimeConfig().public.siteDescription}`,

  ogTitle: () => `${result.value.data.title} - ChordHub`,
  ogUrl: `${useRuntimeConfig().public.siteUrl}${useRoute().path}`,

  twitterTitle: () => `${result.value.data.title} - ChordHub`,
})

// BEGIN: Favorite Button Section
const onAddToFav = async () => {
  if (useAuth().status.value === "unauthenticated") {
    navigateTo("/login")
    return
  }

  await useFetch(`/api/users/favorites/${result.value.data._id}`, {
    method: "PUT",
  })

  refresh()
}

const onRemoveFromFav = async () => {
  await useFetch(`/api/users/favorites/${result.value.data._id}`, {
    method: "DELETE",
  })

  refresh()
}
// END: Favorite Button Section

/**
 * Google Analytics
 */
const gtag = useGtag()
gtag("set", "page_title", "Song")
</script>

<template>
  <div
    v-if="result"
    class="my-6 flex flex-col px-8 pt-16 md:my-12 md:px-16 md:pt-8"
  >
    <div class="text-xl md:text-2xl">{{ result.data.title }}</div>
    <div>
      {{ result.data._artist.thaiName || result.data._artist.engName }}
    </div>
    <div class="mt-2">Key: {{ result.data.params.key }}</div>
    <div v-if="result.data.params.capo !== 0">
      Capo: {{ result.data.params.capo }}
    </div>
    <Sheet :rawSheet="result.data.sheet" />
    <div class="flex flex-row gap-4">
      <!-- Begin: Favorite Section -->
      <div>
        <button
          v-show="!result.userProps.isFav"
          @click="onAddToFav"
          class="flex flex-row hover:underline"
        >
          <div>Add to favorites</div>
          <div>
            <HeartIcon class="h-6 w-6" />
          </div>
        </button>
        <button
          v-show="result.userProps.isFav"
          @click="onRemoveFromFav"
          class="flex flex-row hover:underline"
        >
          <div>Remove from favorites</div>
          <div>
            <HeartIcon class="h-6 w-6 fill-current text-black" />
          </div>
        </button>
      </div>
      <!-- End: Favorite Section -->
      <NuxtLink
        class="hover:underline"
        :to="{ name: 'editor', query: { id: result.data.songId } }"
        >Found mistake?</NuxtLink
      >
    </div>
  </div>
</template>
