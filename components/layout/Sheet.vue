<script setup lang="ts">
const props = defineProps(["rawSheet"])

import { IFormat, IIFormat, ZFormat } from "~/utils/sheet-formatter"

const iFormat = new IFormat()
const iiFormat = new IIFormat()
const zFormat = new ZFormat()

const formatter = (sheet: string[], format: any) => {
  return format.format(sheet)
}

const sheet = ref(formatter(props.rawSheet, iFormat))

onMounted(() => {
  if (window.innerWidth >= 768) {
    sheet.value = formatter(props.rawSheet, iiFormat)
  }
})
</script>

<template>
  <ul class="my-6 font-sans text-xl">
    <li v-for="(line, index) in sheet" :key="index">
      <div class="mb-8" v-html="line"></div>
    </li>
  </ul>
</template>

<style>
.chord {
  position: absolute;
}

.chord .inner {
  position: relative;
  top: -1.25em;
  left: -1.25em;
}
</style>
