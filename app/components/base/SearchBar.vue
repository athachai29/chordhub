<script setup>
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline"

const props = defineProps(["placeholder"])
const model = defineModel()
</script>

<template>
  <div class="relative">
    <BaseInput
      :placeholder="props.placeholder"
      v-model.trim="model"
    ></BaseInput>
    <div
      class="absolute inset-y-0 right-0 flex items-center hover:cursor-pointer"
      @click="$emit('on-search')"
    >
      <MagnifyingGlassIcon class="mr-4 h-6 w-6" />
    </div>
  </div>
</template>
