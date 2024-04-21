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
      <div>
        <label for="title">{{ $t("general.label_title") }}</label>
        <input
          class="w-full rounded-none border border-black px-4 py-2 focus:outline-none"
          type="text"
          name="title"
          v-model.trim="title"
          required
        />
      </div>
      <div>
        <label for="artist">{{ $t("general.label_artist") }}</label>
        <input
          class="w-full rounded-none border border-black px-4 py-2 focus:outline-none"
          type="text"
          name="artist"
          v-model.trim="artist"
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
          v-model.trim="source"
        />
      </div>
      <div>
        <label for="note">{{ $t("general.label_note") }}</label>
        <textarea
          class="w-full resize-none rounded-none border border-black px-4 py-2 focus:outline-none"
          name="note"
          rows="2"
          v-model.trim="note"
        ></textarea>
      </div>
      <div class="text-right">
        <button
          type="submit"
          class="border-2 border-black px-4 py-2 hover:bg-black hover:text-white"
        >
          {{ $t("general.button_submit") }}
        </button>
      </div>
    </form>
  </div>
</template>
