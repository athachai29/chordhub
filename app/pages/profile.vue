<script setup lang="ts">
import { useAvatar } from "@/stores/avatar"

const title = ref("Profile - ChordHub")

useSeoMeta({
  title: title,
  description: `${useRuntimeConfig().public.siteDescription}`,

  ogTitle: title,
  ogUrl: `${useRuntimeConfig().public.siteUrl}${useRoute().path}`,

  twitterTitle: title,
})

const { status, data, signOut } = useAuth()
const router = useRouter()
const {
  currentRoute: {
    value: { path },
  },
} = router

/**
 * Google Analytics
 */
const { gtag } = useGtag()
gtag("set", "page_title", "Profile")

const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const availableLocales = computed(() => {
  return locales.value.filter((i) => i.code !== locale.value)
})
</script>

<template>
  <!-- TODO: ref https://stackoverflow.com/users/10487414/athachai?tab=profile -->
  <div class="my-6 flex flex-col px-4 pt-16 md:my-12 md:px-16 md:pt-8">
    <div class="text-2xl">{{ $t("page_profile.header_profile") }}</div>
    <div class="grid auto-cols-max grid-flow-col gap-4">
      <div class="rounded-md bg-gray-400">
        <img class="mt-2 w-24" :src="useAvatar().url" alt="User avatars" />
      </div>
      <div class="text-left">{{ data?.user?.name }}</div>
    </div>
    <div>{{ data?.user?.email }}</div>
    <div>
      <NuxtLink
        v-for="locale in availableLocales"
        :key="locale.code"
        :to="switchLocalePath(locale.code)"
      >
        Change Language to {{ locale.code }}
      </NuxtLink>
    </div>
    <div>
      <button
        class="text-red-500"
        v-if="status === 'authenticated' && path !== '/login'"
        @click="
          () =>
            signOut({
              callbackUrl: `${
                (router.options.history.state.current as string) || '/'
              }`,
            })
        "
      >
        {{ $t("component_header.button_logout") }}
      </button>
    </div>
  </div>
</template>
