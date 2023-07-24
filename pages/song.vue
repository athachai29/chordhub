<script setup lang="ts">
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
} | null

const route = useRoute()

const result = ref(null as Song)

const onFetch = async () => {
  const song = await fetch(`/api/songs/${route.query.id}`)

  const songJson = (await song.json()).data
  result.value = songJson
  result.value!.sheet = formatter(songJson.sheet)
}

onMounted(async () => {
  onFetch()
})

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
</script>

<template>
  <div v-if="result" class="flex flex-col px-8 md:px-16 my-6 md:my-12">
    <div class="text-2xl">{{ result.title }}</div>
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
    <span>
      <NuxtLink
        class="hover:underline"
        :to="{ name: 'editor', query: { id: result._id } }"
        >Found mistake?</NuxtLink
      >
    </span>
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
