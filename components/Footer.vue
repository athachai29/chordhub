<script setup lang="ts"></script>

<template>
  <footer class="flex items-center gap-4 p-6 text-black">
    <div class="truncate text-xs md:text-base">With Love and Depression</div>
    <div
      class="text-xs text-blue-600 underline visited:text-purple-600 hover:text-blue-800 md:text-base"
    >
      <a href="mailto: athachai.m@gmail.com">Contact</a>
    </div>
    <div
      class="text-xs text-blue-600 underline visited:text-purple-600 hover:text-blue-800 md:text-base"
    >
      <a href="https://www.reddit.com/r/chordhub/">Reddit</a>
    </div>
    <div>
      <a :href="useRuntimeConfig().public.buyMeACoffeeUrl" target="_blank"
        ><img
          src="https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png"
          width="128px"
      /></a>
    </div>
  </footer>
</template>
