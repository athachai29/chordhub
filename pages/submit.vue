<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const title = ref(route.query.title as string)
const artist = ref(route.query.artist as string)
const source = ref(route.query.source as string)
const note = ref(route.query.note as string)
const isPreview = ref(false)
const draftSheet = ref("" as string | undefined)
const previewSheet = ref([] as string[])

const onPreview = () => {
  previewSheet.value = formatter(draftSheet.value!.split("\n"))
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
  router.push({ name: "success" })
}
</script>

<template>
  <div class="flex flex-col px-16 my-12">
    <div class="text-2xl">Submit new song</div>
    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <div>
        <label for="title">Title</label>
        <input
          class="w-full px-4 py-2 border border-black focus:outline-none"
          type="text"
          name="title"
          v-model="title"
          required
        />
      </div>
      <div>
        <label for="artist">Artist</label>
        <input
          class="w-full px-4 py-2 border border-black focus:outline-none"
          type="text"
          name="artist"
          v-model="artist"
          required
        />
      </div>
      <div>
        <label for="source">Source URL (eg. Youtube, Spotify)</label>
        <input
          class="w-full px-4 py-2 border border-black focus:outline-none"
          type="url"
          name="source"
          v-model="source"
        />
      </div>
      <div>
        <label for="note">Note</label>
        <textarea
          class="w-full px-4 py-2 border border-black resize-none focus:outline-none"
          name="note"
          rows="2"
          v-model="note"
        ></textarea>
      </div>
      <textarea
        v-if="!isPreview"
        class="mt-2 p-4 border border-black resize-none font-mono whitespace-nowrap focus:outline-none"
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
      <div class="mt-2 text-right">
        <button
          v-if="!isPreview"
          class="px-4 py-2 hover:bg-black hover:text-white border-2 border-black mr-2"
          @click="onPreview"
        >
          Preview
        </button>
        <button
          v-else
          class="px-4 py-2 hover:bg-black hover:text-white border-2 border-black mr-2"
          @click="() => (isPreview = !isPreview)"
        >
          Edit
        </button>
        <button
          class="px-4 py-2 hover:bg-black hover:text-white border-2 border-black"
          @click="onSubmit"
        >
          Submit
        </button>
      </div>
    </form>
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
