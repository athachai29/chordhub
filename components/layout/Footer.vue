<script setup lang="ts"></script>

<template>
  <footer class="flex items-center gap-4 p-6 text-black">
    <div class="truncate text-xs md:text-base">
      {{ $t("component_footer.body_quote") }}
    </div>
    <div
      class="text-xs visited:text-purple-600 hover:text-blue-800 hover:underline md:text-base"
    >
      <a href="mailto: athachai.m@gmail.com">{{
        $t("component_footer.link_contact_us")
      }}</a>
    </div>
    <div
      class="text-xs visited:text-purple-600 hover:text-blue-800 hover:underline md:text-base"
    >
      <a href="https://www.reddit.com/r/chordhub/">{{
        $t("component_footer.link_reddit")
      }}</a>
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
