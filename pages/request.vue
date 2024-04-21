<script setup lang="ts">
const { data } = useAuth()

const title = ref(useRoute().query.title as string)
const artist = ref("" as string)
const source = ref("" as string)
const note = ref("" as string)

useSeoMeta({
  title: title,
  description: `${useRuntimeConfig().public.siteDescription}`,

  ogTitle: title,
  ogUrl: `${useRuntimeConfig().public.siteUrl}${useRoute().path}`,

  twitterTitle: title,
})

const onSubmit = async () => {
  await useFetch("/api/songs/requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // @ts-ignore: It's an error from the next-auth package
      userId: data?.value?.id,
      title: title.value,
      artist: artist.value,
      source: source.value,
      note: note.value,
      type: "NEW_SONG",
    }),
  })

  useRouter().push({ name: "success" })
}

/**
 * Google Analytics
 */
const gtag = useGtag()
gtag("set", "page_title", "Request")
</script>

<template>
  <div class="my-6 flex flex-col px-4 pt-16 md:my-12 md:px-16 md:pt-8">
    <div class="text-2xl">{{ $t("page_request.header_request_new_song") }}</div>
    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <div class="w-1/3">
        <label for="title">{{ $t("general.label_title") }}</label>
        <BaseInput
          id="title"
          name="title"
          type="text"
          required
          v-model.trim="title"
        />
      </div>
      <div class="w-1/3">
        <label for="artist">{{ $t("general.label_artist") }}</label>
        <BaseInput
          id="artist"
          name="artist"
          type="text"
          required
          v-model.trim="artist"
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
          v-model.trim="source"
        />
      </div>
      <div class="w-1/3">
        <label for="note">{{ $t("general.label_note") }}</label>
        <textarea
          class="w-full resize-none rounded-lg border border-2 border-black px-4 py-2 focus:outline-none"
          name="note"
          rows="2"
          v-model.trim="note"
        ></textarea>
      </div>
      <div class="w-1/3 text-right">
        <BaseButton type="submit">
          {{ $t("general.button_submit") }}
        </BaseButton>
      </div>
    </form>
  </div>
</template>
