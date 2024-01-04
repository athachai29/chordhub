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
</script>

<template>
  <div class="flex h-screen flex-col">
    <Header></Header>
    <main class="flex flex-grow flex-col">
      <slot></slot>
    </main>
    <Footer></Footer>
  </div>
</template>
