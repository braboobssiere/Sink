<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value },
    })
    // After successful login, the cookie is set automatically.
    // Just redirect.
    await navigateTo('/dashboard')
  } catch (err: any) {
    error.value = err.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-1 items-center justify-center">
    <div class="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 class="text-2xl font-bold text-center mb-6">Admin Login</h1>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Username</label>
          <input
            v-model="username"
            type="text"
            required
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="loading"
          />
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="loading"
          />
        </div>
        <button
          type="submit"
          class="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50"
          :disabled="loading"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        <p v-if="error" class="mt-4 text-red-500 text-sm text-center">{{ error }}</p>
      </form>
    </div>
  </div>
</template>
