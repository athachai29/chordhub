<script setup lang="ts">
const { data } = useAuth()

const totalRequest = ref(0)

onMounted(async () => {
  const response = await fetch(`/api/songs/requests/${data.value.uid}`)
  const result = await response.json()

  totalRequest.value = result.total
})
</script>

<template>
  <div class="px-16 mt-12 flex flex-col gap-4">
    <div class="text-2xl">Profile</div>
    <img class="w-24 mt-2" :src="data?.user?.image" />
    <div>{{ data?.user?.name }}</div>
    <div>Total request: {{ totalRequest }}</div>
  </div>
</template>
