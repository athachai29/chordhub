<script setup lang="ts">
const { signIn, status, data } = useAuth();
const router = useRouter();

definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: "/",
  },
});

const form = ref({
  username: "mala.ut.29@gmail.com",
  password: "password",
  callbackUrl: (router.options.history.state.back as string) || "/",
});

const onSubmit = async () => {
  try {
    // localStorage.setItem("token", token);

    await signIn("credentials", form.value);
  } catch (err) {
    console.error(err);
  }
};
</script>

<template>
  <div class="flex flex-col h-screen">
    <main class="flex flex-col flex-grow justify-center px-6 py-12 lg:px-8">
      <h1 class="mt-10 text-center text-2xl">Log in to your account</h1>
      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" @submit.prevent="onSubmit">
          <div>
            <label for="email" class="block">Email</label>
            <div class="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full px-4 py-2 border border-black focus:outline-none"
                v-model="form.username"
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
              <div class="text-sm">
                <a href="#" class="font-semibold">Forgot password?</a>
              </div>
            </div>
            <div class="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="block w-full px-4 py-2 border border-black focus:outline-none"
                v-model="form.password"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              class="px-4 py-2 hover:bg-black hover:text-white border-2 border-black w-full"
            >
              Log in
            </button>
          </div>
          <div class="relative flex py-5 items-center">
            <div class="flex-grow border-t"></div>
            <span class="flex-shrink mx-4">or Log in with</span>
            <div class="flex-grow border-t"></div>
          </div>
          <div>
            <button
              type="submit"
              class="px-4 py-2 hover:bg-[#3b5998] hover:text-white border-2 border-black w-full mt-2"
            >
              Facebook
            </button>
            <button
              type="submit"
              class="px-4 py-2 hover:bg-[#dd4b39] hover:text-white border-2 border-black w-full mt-2"
            >
              Google
            </button>
          </div>
        </form>
        <p class="mt-10 text-center text-sm text-gray-500">
          Not have an account?
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped></style>
