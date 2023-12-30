<script setup lang="ts">
import ogImage from "/og-image.webp"
import { HeartIcon } from "@heroicons/vue/24/outline"

useHead({
  // FIXME: It's still not dynamic when redirect from results page
  titleTemplate() {
    if (result.value) {
      return `${result.value.title} - ChordHub`
    }

    return `Song - ChordHub`
  },
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
  _id: string
  title: string
  artist: string
  sheet: string[]
  _artist: {
    thaiName: string
    engName: string
  }
  params: {
    key: string
    ost: string
    capo: number
  }
  songId: string
} | null

type UserProps = {
  isFav: boolean
} | null

const result = ref(null as Song)
const userProps = ref(null as UserProps)

const onFetch = async () => {
  const { data }: any = await useFetch(`/api/songs/${useRoute().query.id}`)

  result.value = data.value.data
  result.value!.sheet = data.value.data.sheet

  userProps.value = data.value.userProps
}

onFetch()

const onAddToFav = async () => {
  await useFetch(`/api/users/favorites/${result.value?._id}`, {
    method: "PUT",
  })

  onFetch()
}

const onRemoveFromFav = async () => {
  await useFetch(`/api/users/favorites/${result.value?._id}`, {
    method: "DELETE",
  })

  onFetch()
}

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
    <div class="text-xl md:text-2xl">{{ result.title }}</div>
    <div>
      {{ result._artist.thaiName || result._artist.engName }}
    </div>
    <div class="mt-2">Key: {{ result.params.key }}</div>
    <div v-if="result.params.capo !== 0">Capo: {{ result.params.capo }}</div>
    <Sheet :rawSheet="result.sheet" />
    <NuxtLink
      class="underline"
      :to="{ name: 'editor', query: { id: result.songId } }"
      >Found mistake?</NuxtLink
    >
    <!-- Begin: Favorite Section -->
    <button
      v-if="!userProps!.isFav"
      @click="onAddToFav"
      class="flex gap-2 underline"
    >
      <div>Add to favorites</div>
      <div>
        <HeartIcon class="h-6 w-6" />
      </div>
    </button>
    <button v-else @click="onRemoveFromFav" class="flex gap-2 underline">
      <div>Remove from favorites</div>
      <div>
        <HeartIcon class="h-6 w-6 fill-current text-black" />
      </div>
    </button>
    <!-- End: Favorite Section -->
  </div>
  <!-- FIXME: Fix wanring in browser console (Hydration node mismatch) -->
</template>
