<script setup lang="ts">
const title = ref("Success - ChordHub")

useSeoMeta({
  title: title,
  description: `${useRuntimeConfig().public.siteDescription}`,

  ogTitle: title,
  ogUrl: `${useRuntimeConfig().public.siteUrl}${useRoute().path}`,

  twitterTitle: title,
})

definePageMeta({ auth: false })

/**
 * Google Analytics
 */
const gtag = useGtag()
gtag("set", "page_title", "Success")
</script>

<template>
  <div class="my-6 flex flex-col px-4 pt-16 md:my-12 md:px-16 md:pt-8">
    {{ $t("page_success.body_message1") }}
    <br />
    {{ $t("page_success.body_message2") }}
  </div>
</template>
