<script setup lang="ts">
const { data } = useAuth()

const route = useRoute()
const router = useRouter()

const title = ref(route.query.title as string)
const artist = ref("" as string)
const source = ref("" as string)
const note = ref("" as string)

const onSubmit = () => {
  fetch("/api/songs/request", {
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
</script>

<template>
  <div class="flex flex-col px-4 md:px-16 my-6 md:my-12 pt-16 md:pt-8">
    <div class="text-2xl">Request new song</div>
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
          class="w-full px-4 py-2 border border-black resize-none"
          name="note"
          rows="2"
          v-model="note"
        ></textarea>
      </div>
      <div class="text-right">
        <button
          type="submit"
          class="px-4 py-2 hover:bg-black hover:text-white border-2 border-black"
        >
          Submit Request
        </button>
      </div>
    </form>
  </div>
</template>
