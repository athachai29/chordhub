<script setup lang="ts">
import pkgJSON from "../package.json"
</script>

<template>
  <footer class="bg-gray-800 text-white p-6 flex justify-between">
    <span>Made with Love and Depression</span>
    <span>version {{ pkgJSON.version }}</span>
  </footer>
</template>
