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
      <div class="w-1/3">
        <label for="title">{{ $t("general.label_title") }}</label>
        <BaseInput
          id="title"
          name="title"
          type="text"
          required
          v-model.trim="query.title"
        />
      </div>
      <div class="w-1/3">
        <label for="artist">{{ $t("general.label_artist") }}</label>
        <BaseInput
          id="artist"
          name="artist"
          type="text"
          required
          v-model.trim="query.artist"
        />
      </div>
      <div class="w-1/3">
        <label for="source">{{
          $t("general.label_source", { examples: "Youtube, Spotify" })
        }}</label>
        <BaseInput
          id="source"
          name="source"
          type="url"
          required
          v-model.trim="query.source"
        />
      </div>
      <div class="w-1/3">
        <label for="note">{{ $t("general.label_note") }}</label>
        <textarea
          class="w-full resize-none rounded-lg border-2 border-black px-4 py-2 focus:outline-none"
          name="note"
          rows="2"
          v-model="query.note"
        ></textarea>
      </div>
      <textarea
        v-if="!isPreview"
        class="mt-2 resize-none whitespace-nowrap rounded-lg border-2 border-black p-4 font-mono focus:outline-none"
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
        <BaseButton v-if="!isPreview" class="mr-2" @click="onPreview">
          {{ $t("page_submit.button_preview") }}
        </BaseButton>
        <BaseButton v-else class="mr-2" @click="() => (isPreview = !isPreview)">
          {{ $t("page_submit.button_edit") }}
        </BaseButton>
        <BaseButton type="submit">
          {{ $t("general.button_submit") }}
        </BaseButton>
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
