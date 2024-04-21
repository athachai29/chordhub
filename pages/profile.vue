<script setup lang="ts">
import { useAvatar } from "@/stores/avatar"

const title = ref("Profile - ChordHub")

useSeoMeta({
  title: title,
  description: `${useRuntimeConfig().public.siteDescription}`,

  ogTitle: title,
  ogUrl: `${useRuntimeConfig().public.siteUrl}${useRoute().path}`,

  twitterTitle: title,
})

const { data } = useAuth()

/**
 * Google Analytics
 */
const gtag = useGtag()
gtag("set", "page_title", "Profile")
</script>

<template>
  <div class="my-6 flex flex-col px-4 pt-16 md:my-12 md:px-16 md:pt-8">
    <div class="text-2xl">{{ $t("page_profile.header_profile") }}</div>
    <img class="mt-2 w-24" :src="useAvatar().url" alt="User avatars" />
    <div>{{ data?.user?.name }}</div>
    <div>{{ data?.user?.email }}</div>
  </div>
</template>
