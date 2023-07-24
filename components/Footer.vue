<script setup lang="ts">
import pkgJSON from "../package.json"
</script>

<template>
  <footer class="text-black p-6 flex justify-between">
    <span>Made with Love and Depression</span>
    <span>v{{ pkgJSON.version }}</span>
  </footer>
</template>
