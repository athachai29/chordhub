import { defineStore } from "pinia"

export const useAvatar = defineStore("avatar", {
  state: () => ({
    url: `${useRuntimeConfig().public.dicebearApiUrl}?seed=${useAuth().data
      .value?.user?.name}`,
  }),
})
