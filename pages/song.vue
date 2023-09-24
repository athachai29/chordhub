<script setup lang="ts">
import ogImage from "/og-image.webp"
import { HeartIcon } from "@heroicons/vue/24/outline"

useHead({
  title: "Song - ChordHub",
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

const route = useRoute()

const result = ref(null as Song)
const userProps = ref(null as UserProps)

const onFetch = async () => {
  const { data }: any = await useFetch(`/api/songs/${route.query.id}`)

  result.value = data.value.data
  result.value!.sheet = formatter(data.value.data.sheet)

  userProps.value = data.value.userProps
}

onFetch()

const formatter = (sheet: [string]) => {
  let newSheet = [] as string[]

  sheet.forEach((element) => {
    if (
      element.includes("INTRO") ||
      element.includes("INSTRUC") ||
      element.includes("INSTRU")
    ) {
      element = element.replaceAll("[", "").replaceAll("]", "")
    } else {
      element = element
        .replaceAll("][", "&nbsp;&nbsp;&nbsp;&nbsp;")
        .replaceAll("[", "<span class='chord'><span class='inner'>")
        .replaceAll("]", "</span></span>")
    }
    newSheet.push(element)
  })

  return newSheet
}

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
    <ul class="my-6 font-mono">
      <li v-for="(line, index) in result.sheet" :key="index">
        <div class="mb-4" v-html="line"></div>
      </li>
    </ul>
    <NuxtLink
      class="underline"
      :to="{ name: 'editor', query: { id: result.songId } }"
      >Found mistake?</NuxtLink
    >
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
  </div>
</template>

<style>
.chord {
  position: absolute;
}

.chord .inner {
  position: relative;
  top: -1.25em;
  font-family: "Roboto Mono", monospace;
}
</style>
