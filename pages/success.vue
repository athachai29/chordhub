<script setup lang="ts">
definePageMeta({ auth: false })

/**
 * Google Analytics
 */
const gtag = useGtag()
gtag("set", "page_title", "Success")
</script>

<template>
  <div class="my-6 flex flex-col px-4 pt-16 md:my-12 md:px-16 md:pt-8">
    New sheet has been submited
    <br />
    Thank you for your time ❤️
  </div>
</template>
