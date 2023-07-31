<script setup lang="ts">
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: "/",
  },
})

const form = ref({
  username: "",
  password: "",
  callbackUrl: (useRouter().options.history.state.back as string) || "/",
})

const onRegisterWithCredentials = async () => {
  /**
   * Google Analytics
   */
  gtag("event", "register", { method: "Credentials" })

  await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form.value),
  })

  await useAuth().signIn("credentials", form.value)

  useRouter().push("/")
}

const onRegisterWithGoogle = async () => {
  /**
   * Google Analytics
   */
  gtag("event", "register", { method: "Google" })
}

/**
 * Google Analytics
 */
const gtag = useGtag()
gtag("set", "page_title", "Login")
</script>

<template>
  <div class="flex h-screen flex-col">
    <main class="flex flex-grow flex-col justify-center px-6 py-12 lg:px-8">
      <h1 class="mt-10 text-center text-2xl">Create new account</h1>
      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" @submit.prevent="onRegisterWithCredentials">
          <div>
            <label for="email" class="block">Email</label>
            <div class="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full border border-black px-4 py-2 focus:outline-none"
                v-model="form.username"
                placeholder="Enter email"
              />
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between">
              <label
                for="password"
                class="block text-sm font-medium leading-6 text-gray-900"
                >Password</label
              >
            </div>
            <div class="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="block w-full border border-black px-4 py-2 focus:outline-none"
                v-model="form.password"
                placeholder="Enter password"
              />
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between">
              <label
                for="password"
                class="block text-sm font-medium leading-6 text-gray-900"
                >Confirm Password</label
              >
            </div>
            <div class="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="block w-full border border-black px-4 py-2 focus:outline-none"
                v-model="form.password"
                placeholder="Confirm your entered password"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              class="w-full border-2 border-black px-4 py-2 hover:bg-black hover:text-white"
            >
              Create account
            </button>
            <div
              v-if="useRoute().query.error"
              class="mt-2 text-right text-red-600"
            >
              Username or password is incorrect
            </div>
          </div>
          <div class="relative flex items-center py-5">
            <div class="flex-grow border-t"></div>
            <span class="mx-4 flex-shrink">or</span>
            <div class="flex-grow border-t"></div>
          </div>
          <div>
            <!-- <button
              type="submit"
              class="mt-2 w-full border-2 border-black px-4 py-2 hover:bg-[#3b5998] hover:text-white"
            >
              Continue with Facebook
            </button> -->
            <button
              class="mt-2 w-full border-2 border-black px-4 py-2 hover:bg-[#dd4b39] hover:text-white"
              @click="() => onRegisterWithGoogle()"
            >
              Continue with Google
            </button>
          </div>
        </form>
        <div class="mt-10 text-center text-sm text-gray-500">
          <NuxtLink to="/login">Already have an account? Login</NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped></style>