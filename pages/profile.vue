<script setup lang="ts">
useHead({
  title: "Profile - ChordHub",
  meta: [{ name: "description", content: "Any song you can play." }],
})

const { data } = useAuth()

const totalRequest = ref(0)

onMounted(async () => {
  const { data }: any = await useFetch(`/api/songs/requests/${data.value.uid}`)
  const result = data.value.data

  totalRequest.value = result.total
})

/**
 * Google Analytics
 */
const gtag = useGtag()
gtag("set", "page_title", "Profile")
</script>

<template>
  <div class="my-6 flex flex-col px-4 pt-16 md:my-12 md:px-16 md:pt-8">
    <div class="text-2xl">Profile</div>
    <img class="mt-2 w-24" :src="data?.user?.image" />
    <div>{{ data?.user?.name }}</div>
    <div>Total request: {{ totalRequest }}</div>
  </div>
</template>
