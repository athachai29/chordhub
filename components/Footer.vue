<script setup lang="ts">
import pkgJSON from "../package.json"
</script>

<template>
  <footer class="text-black p-6 flex justify-between">
    <span class="flex items-center">
      <span class="mr-2">Made with Love and Depression</span>
      <span>
        <a href="https://www.buymeacoffee.com/athachai.m"
          ><img
            src="https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png"
            width="128px"
        /></a>
      </span>
    </span>
    <span>v{{ pkgJSON.version }}</span>
  </footer>
</template>
