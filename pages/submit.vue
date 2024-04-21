<script setup lang="ts">
const title = ref("Submit - ChordHub")

useSeoMeta({
  title: title,
  description: `${useRuntimeConfig().public.siteDescription}`,

  ogTitle: title,
  ogUrl: `${useRuntimeConfig().public.siteUrl}${useRoute().path}`,

  twitterTitle: title,
})

type Query = {
  title: string
  artist: string
  source: string
  note: string
}

const query = ref(useRoute().query as Query)

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
  useRouter().push({ name: "success" })
}

/**
 * Google Analytics
 */
const gtag = useGtag()
gtag("set", "page_title", "Submit")
</script>

<template>
  <div class="my-6 flex flex-col px-4 pt-16 md:my-12 md:px-16 md:pt-8">
    <div class="text-2xl">{{ $t("page_submit.header_submit_new_song") }}</div>
    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <div>
        <label for="title">{{ $t("general.label_title") }}</label>
        <input
          class="w-full rounded-none border border-black px-4 py-2 focus:outline-none"
          type="text"
          name="title"
          v-model.trim="query.title"
          required
        />
      </div>
      <div>
        <label for="artist">{{ $t("general.label_artist") }}</label>
        <input
          class="w-full rounded-none border border-black px-4 py-2 focus:outline-none"
          type="text"
          name="artist"
          v-model.trim="query.artist"
          required
        />
      </div>
      <div>
        <label for="source">{{
          $t("general.label_source", { examples: "Youtube, Spotify" })
        }}</label>
        <input
          class="w-full rounded-none border border-black px-4 py-2 focus:outline-none"
          type="url"
          name="source"
          v-model.trim="query.source"
        />
      </div>
      <div>
        <label for="note">{{ $t("general.label_note") }}</label>
        <textarea
          class="w-full resize-none border border-black px-4 py-2 focus:outline-none"
          name="note"
          rows="2"
          v-model="query.note"
        ></textarea>
      </div>
      <textarea
        v-if="!isPreview"
        class="mt-2 resize-none whitespace-nowrap border border-black p-4 font-mono focus:outline-none"
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
          class="mr-2 border-2 border-black px-4 py-2 hover:bg-black hover:text-white"
          @click="onPreview"
        >
          {{ $t("page_submit.button_preview") }}
        </button>
        <button
          v-else
          class="mr-2 border-2 border-black px-4 py-2 hover:bg-black hover:text-white"
          @click="() => (isPreview = !isPreview)"
        >
          {{ $t("page_submit.button_edit") }}
        </button>
        <button
          class="border-2 border-black px-4 py-2 hover:bg-black hover:text-white"
          @click="onSubmit"
        >
          {{ $t("general.button_submit") }}
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
}
</style>
