<script setup lang="ts">
import ogImage from "/og-image.webp"

useHead({
  title: "Request - ChordHub",
  meta: [
    { name: "description", content: "Any song you can play." },
    {
      property: "og:image",
      content: ogImage,
    },
  ],
})

const { data } = useAuth()

const route = useRoute()
const router = useRouter()

const title = ref(route.query.title as string)
const artist = ref("" as string)
const source = ref("" as string)
const note = ref("" as string)

const onSubmit = async () => {
  await useFetch("/api/songs/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: data.value.uid,
      title: title.value,
      artist: artist.value,
      source: source.value,
      note: note.value,
      type: "SONG_TITLE",
    }),
  })

  router.push({ name: "success" })
}

/**
 * Google Analytics
 */
const gtag = useGtag()
gtag("set", "page_title", "Request")
</script>

<template>
  <div class="my-6 flex flex-col px-4 pt-16 md:my-12 md:px-16 md:pt-8">
    <div class="text-2xl">Request new song</div>
    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <div>
        <label for="title">Title</label>
        <input
          class="w-full rounded-none border border-black px-4 py-2 focus:outline-none"
          type="text"
          name="title"
          v-model.trim="title"
          required
        />
      </div>
      <div>
        <label for="artist">Artist</label>
        <input
          class="w-full rounded-none border border-black px-4 py-2 focus:outline-none"
          type="text"
          name="artist"
          v-model.trim="artist"
          required
        />
      </div>
      <div>
        <label for="source">Source URL (eg. Youtube, Spotify)</label>
        <input
          class="w-full rounded-none border border-black px-4 py-2 focus:outline-none"
          type="url"
          name="source"
          v-model.trim="source"
        />
      </div>
      <div>
        <label for="note">Note</label>
        <textarea
          class="w-full resize-none border border-black px-4 py-2"
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
          Submit Request
        </button>
      </div>
    </form>
  </div>
</template>
