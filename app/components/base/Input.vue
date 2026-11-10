<script setup>
const props = defineProps(["placeholder"])
const model = defineModel()
</script>

<template>
  <input
    type="text"
    class="block w-full rounded-lg border border-2 border-black px-4 py-2 focus:outline-none"
    :placeholder="props.placeholder"
    v-model="model"
  />
</template>
