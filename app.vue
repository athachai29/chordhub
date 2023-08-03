<script setup lang="ts">
const layout = "default"

console.log("node_env", process.env.NODE_ENV)
</script>

<template>
  <NuxtLayout :name="layout">
    <NuxtPage />
  </NuxtLayout>
</template>
