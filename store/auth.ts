import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  actions: {
    async login(credentials: object) {
      const { data } = await useFetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      return data.value?.data.access_token;
    },
  },
});
