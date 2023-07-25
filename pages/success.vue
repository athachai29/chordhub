<script setup lang="ts">
definePageMeta({ auth: false })

/**
 * Google Analytics
 */
const gtag = useGtag()
gtag("set", "page_title", "Success")
</script>

<template>
  <div class="flex flex-col px-4 md:px-16 my-6 md:my-12 pt-16 md:pt-8">
    New sheet has been submited
    <br />
    Thank you for your time ❤️
  </div>
</template>
