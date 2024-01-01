import { defineStore } from "pinia"

export const useAvatar = defineStore("avatar", {
  state: () => ({
    url: `${useRuntimeConfig().dicebearApiUrl}?seed=${useAuth().data.value?.user
      ?.name}`,
  }),
})
