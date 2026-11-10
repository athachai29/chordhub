import { defineStore } from "pinia"

export const useAvatar = defineStore("avatar", {
  state: () => {
    const { data } = useAuth()
    return {
      url: `${useRuntimeConfig().public.dicebearApiUrl}?seed=${
        data.value?.user?.name || data.value?.user?.email
      }`,
    }
  },
})
