<script setup lang="ts">
useHead({
  title: "Editor - ChordHub",
  meta: [{ name: "description", content: "Any song you can play." }],
})

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
const router = useRouter()

const result = ref(null as Song)
const isPreview = ref(false)
const draftSheet = ref("" as string | undefined)
const previewSheet = ref([] as string[])

const onFetch = async () => {
  const { data }: any = await useFetch(`/api/songs/${route.query.id}`)

  result.value = data.value.data
  draftSheet.value = result.value?.sheet.join("\n")
}

onMounted(async () => {
  onFetch()
})

const onPreview = () => {
  if (!isPreview.value) {
    previewSheet.value = formatter(draftSheet.value!.split("\n"))
  }
  isPreview.value = !isPreview.value
}

const formatter = (sheet: string[]) => {
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

const onSubmit = async () => {
  await useFetch(`/api/songs/${result.value?._id}`, {
    method: "PUT",
    body: JSON.stringify({
      newSheet: draftSheet.value!.split("\n"),
    }),
  })

  router.push({ name: "success" })
}

/**
 * Google Analytics
 */
const gtag = useGtag()
gtag("set", "page_title", "Editor")
</script>

<template>
  <div
    v-if="result"
    class="my-6 flex flex-col px-4 pt-16 md:my-12 md:px-16 md:pt-8"
  >
    <div class="mb-4">
      <div class="text-2xl">{{ result.title }}</div>
      <div>
        {{ result._artist.thaiName || result._artist.engName }}
      </div>
    </div>
    <div class="flex justify-between">
      <div>
        <button
          class="mr-2 border-2 border-black px-4 py-2 hover:bg-black hover:text-white"
          @click="onPreview"
        >
          Edit / Preview
        </button>
      </div>
      <div class="flex gap-2">
        <button
          class="border-2 border-black px-4 py-2 hover:bg-black hover:text-white"
          @click="onSubmit"
        >
          Save
        </button>
        <button
          class="border-2 border-black px-4 py-2 hover:bg-black hover:text-white"
          @click="onSubmit"
        >
          Submit
        </button>
      </div>
    </div>
    <textarea
      v-if="!isPreview"
      class="mt-2 resize-none whitespace-nowrap border-2 border-black p-4 font-mono"
      name="editor"
      id="editor"
      rows="20"
      v-model="draftSheet"
    ></textarea>
    <ul v-else class="mt-6 font-mono">
      <li v-for="(line, index) in previewSheet" :key="index">
        <div class="mb-4" v-html="line"></div>
      </li>
    </ul>
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
