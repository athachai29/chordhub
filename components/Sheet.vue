<script setup lang="ts">
const props = defineProps(["rawSheet"])

import { IFormat, IIFormat, ZFormat } from "~/utils/sheet-formatter"

const iFormat = new IFormat()
const iiFormat = new IIFormat()
const zFormat = new ZFormat()

const formatter = (sheet: string[], format: any) => {
  return format.format(sheet)
}

// TODO: Select format from device screen
const sheet = ref(formatter(props.rawSheet, iFormat))
</script>

<template>
  <ul class="my-6 font-mono">
    <li v-for="(line, index) in sheet" :key="index">
      <div class="mb-4" v-html="line"></div>
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
  font-family: "Roboto Mono", monospace;
}
</style>
