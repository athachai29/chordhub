<script setup lang="ts">
import { useRouter } from "vue-router";
const { status, data, signOut } = useAuth();

const router = useRouter();

const onGoToLoginPage = () => {
  router.push("/login");
};
</script>

<template>
  <nav class="flex justify-between">
    <div class="m-2 text-4xl">
      <NuxtLink
        v-if="router.currentRoute.value.path !== '/'"
        class="font-bold"
        to="/"
        >ChordHub</NuxtLink
      >
    </div>
    <div class="flex m-2 items-center">
      <NuxtLink to="/profile">
        <div class="mr-4">{{ data?.user?.name }}</div>
      </NuxtLink>
      <button
        v-if="
          status === 'unauthenticated' &&
          router.currentRoute.value.path !== '/login'
        "
        class="px-4 py-2 hover:bg-black hover:text-white border-2 border-black"
        @click="onGoToLoginPage"
      >
        Log in
      </button>
      <button
        v-else-if="
          status === 'authenticated' &&
          router.currentRoute.value.path !== '/login'
        "
        class="px-4 py-2 hover:bg-black hover:text-white border-2 border-black"
        @click="() => signOut({ callbackUrl: '/' })"
      >
        Log out
      </button>
    </div>
  </nav>
</template>
