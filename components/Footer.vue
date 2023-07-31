<script setup lang="ts"></script>

<template>
  <footer class="flex items-center p-6 text-black">
    <div class="mr-2 text-xs md:text-base">With Love and Depression</div>
    <div>
      <a :href="useRuntimeConfig().buyMeACoffeeUrl" target="_blank"
        ><img
          src="https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png"
          width="128px"
      /></a>
    </div>
  </footer>
</template>
