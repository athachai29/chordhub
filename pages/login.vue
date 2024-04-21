<script setup lang="ts">
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline"

const localePath = useLocalePath()

const title = ref("Login - ChordHub")

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

// BEGIN: Password masking logic
const isPasswordMasked = ref(true)

const onToggleMaskChange = () => {
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

// BEGIN: Login logic
const form = ref({
  email: "",
  password: "",
})

const onLoginLoading = ref(false)
const onLogin = async () => {
  onLoginLoading.value = true

  /**
   * Google Analytics
   */
  gtag("event", "login", { method: "Credentials" })

  const credentials = {
    email: form.value.email,
    password: form.value.password,
    callbackUrl: (useRouter().options.history.state.back as string) || "/",
  }

  await useAuth().signIn("credentials", credentials)
  onLoginLoading.value = false
}

const onGoogleLoginLoading = ref(false)
const onLoginWithGoogle = async () => {
  onGoogleLoginLoading.value = true

  /**
   * Google Analytics
   */
  gtag("event", "login", { method: "Google" })

  const credentials = {
    callbackUrl: (useRouter().options.history.state.back as string) || "/",
  }

  await useAuth().signIn("google", credentials)
  onGoogleLoginLoading.value = false
}

const onFacebookLoginLoading = ref(false)
const onLoginWithFacebook = async () => {
  onFacebookLoginLoading.value = true

  /**
   * Google Analytics
   */
  gtag("event", "login", { method: "Facebook" })

  await useAuth().signIn("facebook")
  onFacebookLoginLoading.value = false
}
// END: Login logic

/**
 * Google Analytics
 */
const gtag = useGtag()
gtag("set", "page_title", "Login")
</script>

<template>
  <div class="flex h-screen flex-col">
    <main class="flex flex-grow flex-col justify-center px-6 py-12 lg:px-8">
      <h1 class="mt-10 text-center text-2xl">
        {{ $t("page_login.header_login") }}
      </h1>
      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" @submit.prevent="onLogin">
          <div>
            <div class="mt-2">
              <BaseInput
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                :placeholder="$t('general.placeholder_email')"
                v-model.trim="form.email"
              />
            </div>
          </div>
          <div>
            <div class="relative">
              <BaseInput
                id="password"
                name="password"
                type="password"
                autocomplete="password"
                required
                :placeholder="$t('general.placeholder_password')"
                v-model.trim="form.password"
              />
              <div
                class="absolute inset-y-0 right-0 flex items-center hover:cursor-pointer"
                @click="onToggleMaskChange"
              >
                <EyeIcon v-if="isPasswordMasked" class="mr-2 h-6 w-6" />
                <EyeSlashIcon v-else class="mr-2 h-6 w-6" />
              </div>
            </div>
            <div class="mt-1 text-right text-sm">
              <a href="#" class="font-semibold">{{
                $t("page_login.button_forgot_password")
              }}</a>
            </div>
          </div>
          <div>
            <BaseButton
              type="submit"
              :disabled="onLoginLoading"
              class="w-full"
              btn-style="primary"
            >
              {{
                onLoginLoading
                  ? $t("page_login.logging_in")
                  : $t("general.button_login")
              }}
            </BaseButton>
            <div
              v-if="useRoute().query.error === 'CredentialsSignin'"
              class="mt-2 text-right text-red-600"
            >
              {{ $t("page_login.message_email_or_password_incorrect") }}
            </div>
          </div>
          <div class="relative flex items-center py-5">
            <div class="flex-grow border-t"></div>
            <span class="mx-4 flex-shrink">{{
              $t("page_login.label_or_login_with")
            }}</span>
            <div class="flex-grow border-t"></div>
          </div>
          <div>
            <!-- Disabled facebook button for now -->
            <!-- <BaseButton
              id="login-facebook-button"
              class="mt-2 w-full"
              @click="() => onLoginWithFacebook()"
              :disabled="onFacebookLoginLoading"
            >
              {{
                onFacebookLoginLoading
                  ? "Logging in..."
                  : "Log in with Facebook"
              }}
            </BaseButton> -->
            <BaseButton
              id="login-google-button"
              class="mt-2 w-full"
              @click="() => onLoginWithGoogle()"
              :disabled="onGoogleLoginLoading"
            >
              {{
                onGoogleLoginLoading
                  ? $t("page_login.message_logging_in")
                  : $t("page_login.button_login_with", { provider: "Google" })
              }}
            </BaseButton>
          </div>
        </form>
        <div class="mt-10 text-center text-sm text-gray-500">
          <NuxtLink :to="localePath('/register')">{{
            $t("page_login.button_not_have_account")
          }}</NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped></style>
