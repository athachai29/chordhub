<script setup lang="ts">
import { isEmailValid, isPasswordValid } from "@/utils/validators"
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline"

const localePath = useLocalePath()

const gtag = useGtag()

const title = ref("Register - ChordHub")

useSeoMeta({
  title: title,
  description: `${useRuntimeConfig().public.siteDescription}`,

  ogTitle: title,
  ogUrl: `${useRuntimeConfig().public.siteUrl}${useRoute().path}`,

  twitterTitle: title,
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

// BEGIN: Password masking logic
const isPasswordMasked = ref(true)

const onTogglePasswordMaskChange = () => {
  const passwordInput = document.getElementById("password") as HTMLInputElement
  if (passwordInput.type === "password") {
    passwordInput.type = "text"
    isPasswordMasked.value = false
  } else {
    passwordInput.type = "password"
    isPasswordMasked.value = true
  }
}
// END: Password masking logic

// BEGIN: Confirm Password masking logic
const isConfirmPasswordMasked = ref(true)

const onToggleConfirmPasswordMaskChange = () => {
  const passwordInput = document.getElementById(
    "confirmPassword",
  ) as HTMLInputElement
  if (passwordInput.type === "password") {
    passwordInput.type = "text"
    isConfirmPasswordMasked.value = false
  } else {
    passwordInput.type = "password"
    isConfirmPasswordMasked.value = true
  }
}
// END: Password masking logic

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
  gtag("event", "register", { method: "Google" })
}

gtag("set", "page_title", "Login")
</script>

<template>
  <div class="flex h-screen flex-col">
    <main class="flex flex-grow flex-col justify-center px-6 py-12 lg:px-8">
      <h1 class="mt-10 text-center text-2xl">
        {{ $t("page_register.header_create_new_account") }}
      </h1>
      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" @submit.prevent="onRegisterWithCredentials">
          <div>
            <BaseInput
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              :placeholder="$t('general.placeholder_email')"
              v-model.trim="form.email"
              @blur="() => onEmailChecking()"
            />
            <div class="text-right text-xs text-red-600">
              {{ onValidateEmail }}
              {{ form.isEmailExist ? "Email already exists" : "" }}
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between"></div>
            <div>
              <div class="relative">
                <BaseInput
                  id="password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  :placeholder="$t('general.placeholder_password')"
                  v-model.trim="form.password"
                />
                <div
                  class="absolute inset-y-0 right-0 flex items-center hover:cursor-pointer"
                  @click="onTogglePasswordMaskChange()"
                >
                  <EyeIcon v-if="isPasswordMasked" class="mr-2 h-6 w-6" />
                  <EyeSlashIcon v-else class="mr-2 h-6 w-6" />
                </div>
              </div>
            </div>
            <div class="text-right text-xs text-red-600">
              {{ onValidatePassword }}
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between"></div>
            <div class="relative">
              <BaseInput
                id="confirmPassword"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                :placeholder="$t('page_register.placeholder_confirm_password')"
                v-model.trim="form.confirmPassword"
              />
              <div
                class="absolute inset-y-0 right-0 flex items-center hover:cursor-pointer"
                @click="onToggleConfirmPasswordMaskChange()"
              >
                <EyeIcon v-if="isConfirmPasswordMasked" class="mr-2 h-6 w-6" />
                <EyeSlashIcon v-else class="mr-2 h-6 w-6" />
              </div>
            </div>
            <div class="text-right text-xs text-red-600">
              {{ onConfirmPassword }}
            </div>
          </div>
          <div>
            <BaseButton type="submit" class="w-full" btn-style="primary">
              {{ $t("page_register.button_create_account") }}
            </BaseButton>
            <div
              v-if="useRoute().query.error"
              class="mt-2 text-right text-red-600"
            >
              {{ useRoute().query.error }}
            </div>
          </div>
          <div class="relative flex items-center py-5">
            <div class="flex-grow border-t"></div>
            <span class="mx-4 flex-shrink">{{
              $t("page_register.label_or_register_with")
            }}</span>
            <div class="flex-grow border-t"></div>
          </div>
          <div>
            <BaseButton
              id="register-google-button"
              class="mt-2 w-full"
              @click="() => onRegisterWithGoogle()"
            >
              {{
                $t("page_register.button_continue_with", { provider: "Google" })
              }}
            </BaseButton>
          </div>
        </form>
        <div class="mt-10 text-center text-sm text-gray-500">
          <NuxtLink :to="localePath('/login')">{{
            $t("page_register.link_already_have_account")
          }}</NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped></style>
