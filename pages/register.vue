<script setup lang="ts">
import ogImage from "/og-image.webp"
import { isEmailValid, isPasswordValid } from "@/utils/validators"

useHead({
  title: "Register - ChordHub",
  meta: [
    { name: "description", content: "Any song you can play." },
    {
      property: "og:image",
      content: ogImage,
    },
  ],
})

definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: "/",
  },
})

const form = ref({
  email: "",
  password: "",
  confirmPassword: "",
  isEmailExist: false,
})

const onValidateEmail = computed(() => {
  return form.value.email && !isEmailValid(form.value.email)
    ? "Please enter a valid email address"
    : ""
})

const onEmailChecking = async () => {
  const res = await useFetch("/api/auth/check-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: form.value.email }),
  })

  form.value.isEmailExist = res.data.value?.data?.exists || false
}

const onValidatePassword = computed(() => {
  return form.value.password && !isPasswordValid(form.value.password)
    ? "Password must be at least 8 characters"
    : ""
})

const onConfirmPassword = computed(() => {
  return form.value.password !== form.value.confirmPassword &&
    form.value.confirmPassword
    ? "Passwords does not match"
    : ""
})

const onRegisterWithCredentials = async () => {
  if (
    !isEmailValid(form.value.email) ||
    !isPasswordValid(form.value.password) ||
    form.value.password !== form.value.confirmPassword
  ) {
    return
  }

  /**
   * Google Analytics
   */
  gtag("event", "register", { method: "Credentials" })

  const credentials = {
    email: form.value.email,
    password: form.value.password,
    callbackUrl: (useRouter().options.history.state.back as string) || "/",
  }

  await useFetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  })

  await useAuth().signIn("credentials", credentials)

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
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full rounded-none border border-black px-4 py-2 focus:outline-none"
                v-model.trim="form.email"
                placeholder="Email"
                @blur="() => onEmailChecking()"
              />
            </div>
            <div class="text-right text-xs text-red-600">
              {{ onValidateEmail }}
              {{ form.isEmailExist ? "Email already exists" : "" }}
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between"></div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="block w-full rounded-none border border-black px-4 py-2 focus:outline-none"
                v-model.trim="form.password"
                placeholder="Password"
              />
            </div>
            <div class="text-right text-xs text-red-600">
              {{ onValidatePassword }}
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between"></div>
            <div>
              <input
                id="confirmPassword"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="block w-full rounded-none border border-black px-4 py-2 focus:outline-none"
                v-model.trim="form.confirmPassword"
                placeholder="Confirm password"
              />
            </div>
            <div class="text-right text-xs text-red-600">
              {{ onConfirmPassword }}
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
              {{ useRoute().query.error }}
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
