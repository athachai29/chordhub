<script setup lang="ts">
const title = ref("Editor - ChordHub")

useSeoMeta({
  title: title,
  description: `${useRuntimeConfig().public.siteDescription}`,

  ogTitle: title,
  ogUrl: `${useRuntimeConfig().public.siteUrl}${useRoute().path}`,

  twitterTitle: title,
})

type Song = {
  _id: string
  songId: string
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

const result = ref(null as Song)
const isPreview = ref(false)
const draftSheet = ref("" as string | undefined)
const previewSheet = ref([] as string[])
const submitFailed = ref(false)

const onFetch = async () => {
  const { data }: any = await useFetch(`/api/songs/${useRoute().query.id}`)

  result.value = data.value.data
  draftSheet.value = result.value?.sheet.join("\n")
}

onFetch()

const onPreview = () => {
  if (!isPreview.value) {
    previewSheet.value = draftSheet.value!.split("\n")
  }
  isPreview.value = !isPreview.value
}

const onSaveDraft = async () => {
  // TODO: Save the user draft to the database
}

const onSubmit = async () => {
  // TODO: Send the request to an admin and wait for approval

  submitFailed.value = false
  // $fetch, not useFetch: Nuxt 4 reuses a cached successful useFetch with the
  // same key, so re-saving an earlier sheet would never reach the server.
  try {
    const res = await $fetch<{ success: boolean }>(
      `/api/songs/${result.value?.songId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          newSheet: draftSheet.value!.split("\n"),
        }),
      },
    )
    // "Song not found" is a 200 with success: false
    if (!res.success) {
      submitFailed.value = true
      return
    }
  } catch {
    // 401/403/400 throw
    submitFailed.value = true
    return
  }

  useRouter().push({ name: "success" })
}

/**
 * Google Analytics
 */
const { gtag } = useGtag()
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
        <BaseButton @click="onPreview">
          {{ $t("page_editor.button_editor_preview") }}
        </BaseButton>
      </div>
      <div class="flex gap-2">
        <BaseButton @click="onSaveDraft">
          {{ $t("page_editor.button_save_draft") }}
        </BaseButton>
        <BaseButton @click="onSubmit">
          {{ $t("general.button_submit") }}
        </BaseButton>
      </div>
    </div>
    <p v-if="submitFailed" class="mt-2 text-red-600">
      {{ $t("page_editor.message_submit_failed") }}
    </p>
    <textarea
      v-if="!isPreview"
      class="mt-2 resize-none whitespace-pre rounded-lg border-2 border-black p-4 font-mono"
      name="editor"
      id="editor"
      rows="20"
      v-model="draftSheet"
    ></textarea>
    <LayoutSheet v-else :rawSheet="previewSheet" />
  </div>
</template>

<style scoped></style>
