<script setup lang="ts">
import { useAvatar } from "@/stores/avatar"

const localePath = useLocalePath()

const { status, data } = useAuth()
const {
  currentRoute: {
    value: { path },
  },
} = useRouter()

const onGoToLoginPage = () => {
  navigateTo({
    path: localePath("/login"),
  })
}

// const menu = ref(null)

const avatar = useAvatar()
</script>

<template>
  <nav
    class="fixed left-0 top-0 z-10 flex w-full justify-between bg-black text-white"
  >
    <div class="p-4 text-4xl">
      <NuxtLink class="flex text-2xl font-semibold" :to="localePath('/')">
        <!-- TODO: Add the ChordHub logos here -->
        <!-- <img
          src="https://flowbite.com/docs/images/logo.svg"
          class="h-8 mr-3"
          alt="Flowbite Logo"
        /> -->
        <span>ChordHub</span>
      </NuxtLink>
    </div>
    <div class="m-2 flex items-center">
      <div v-if="status !== 'unauthenticated'" class="flex gap-2">
        <NuxtLink class="truncate" :to="localePath('/profile')">
          {{ data?.user?.name || data?.user?.email }}
        </NuxtLink>
        <img
          class="inline-block h-6 w-6 rounded-full bg-white"
          :src="avatar.url"
          alt="user avatars"
        />
      </div>
      <div class="border-2 border-black px-4 py-2">
        <button
          v-if="status === 'unauthenticated' && path !== '/login'"
          @click="onGoToLoginPage"
        >
          {{ $t("general.button_login") }}
        </button>
      </div>
    </div>
  </nav>

  <!-- <nav class="bg-black fixed w-full z-10 top-0 left-0">
    <div
      class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4"
    >
      <a href="https://flowbite.com/" class="flex items-center">
        <img
          src="https://flowbite.com/docs/images/logo.svg"
          class="h-8 mr-3"
          alt="Flowbite Logo"
        />
        <span
          class="self-center text-2xl font-semibold whitespace-nowrap text-white"
          >ChordHub</span
        >
      </a>
      <button
        type="button"
        class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm md:hidden focus:outline-none"
        @click="
          () => {
            console.log(menu)
            menu.classList.toggle('translate-x-0')
          }
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6 text-white"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>
      <div
        class="w-full md:block md:w-auto absolute inset-y-0 left-0 px-4 mt-16 md:mt-0 md:relative md:items-center md:justify-between"
      >
        <aside
          class="fixed top-0 left-0 w-64 h-screen -translate-x-full"
          ref="menu"
        >
          <div class="h-full p-8 overflow-y-auto bg-black text-white text-xl">
            <ul class="space-y-2 font-medium">
              <li>Profile</li>
              <li>Log out</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </nav> -->
</template>

<style scoped></style>
