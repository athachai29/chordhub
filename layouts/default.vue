<script setup lang="ts">
import coverImage from "/cover.webp"

const description = ref(useRuntimeConfig().public.siteSocialNetworkDescription)

useSeoMeta({
  ogImage: coverImage,
  ogDescription: description,
  ogType: "website",
  ogLocale: "th_TH",
  ogLocaleAlternate: "en_US",

  twitterDescription: description,
  twitterCard: "summary_large_image",
  twitterImage: coverImage,
})

useHead({
  meta: [
    {
      name: "impact-site-verification",
      content: "d2390621-b3ff-4fe4-bc1a-34eb26ac279b",
    },
  ],
})
</script>

<template>
  <div class="flex h-screen flex-col">
    <LayoutHeader></LayoutHeader>
    <main class="flex flex-grow flex-col">
      <slot></slot>
    </main>
    <LayoutFooter></LayoutFooter>
  </div>
</template>
