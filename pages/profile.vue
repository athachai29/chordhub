<script setup lang="ts">
import ogImage from "/og-image.webp"
import { useAvatar } from "@/stores/avatar"

useHead({
  title: "Profile - ChordHub",
  meta: [
    { name: "description", content: "Any song you can play." },
    {
      property: "og:image",
      content: ogImage,
    },
  ],
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
    <img class="mt-2 w-24" :src="useAvatar().url" alt="User avatars" />
    <div>{{ useAuth().data.value?.user?.name }}</div>
  </div>
</template>
