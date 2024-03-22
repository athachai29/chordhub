<script setup>
const props = defineProps(["placeholder", "type", "btnStyle"])

const classes = reactive({
  "bg-black text-white": props.btnStyle === "primary",
})
</script>

<template>
  <button
    :type="props.type || 'button'"
    class="rounded-lg border-2 border-black px-4 py-2 hover:bg-black hover:text-white"
    :class="classes"
  >
    <slot></slot>
  </button>
</template>
