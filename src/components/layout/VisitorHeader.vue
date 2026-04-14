<template>
  <header class="sticky top-0 z-999 w-full bg-white border-b border-gray-200 dark:border-gray-800 dark:bg-gray-900">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <div class="flex items-center gap-8">
          <router-link to="/zoo/booking" class="flex items-center gap-2">
            <img src="/images/logo/logo-icon.svg" alt="Logo" class="h-8 w-8" />
            <span class="text-xl font-bold text-black dark:text-white hidden sm:block">ZOO TICKETING</span>
          </router-link>
        </div>

        <div class="flex items-center gap-4">
          <ThemeToggler />
          
          <div v-if="userInfo" class="flex items-center gap-3">
            <div class="hidden sm:block text-right">
              <p class="text-sm font-medium text-black dark:text-white">{{ userInfo.name }}</p>
              <p class="text-xs text-gray-500 capitalize leading-none">{{ userInfo.role }}</p>
            </div>
            <button 
              @click="handleLogout"
              class="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
            >
              Logout
            </button>
            <router-link 
              v-if="userInfo.role === 'admin'"
              to="/zoo/dashboard"
              class="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 transition-all font-bold tracking-wide"
            >
              Admin
            </router-link>
          </div>
          
          <router-link 
            v-else
            to="/signin"
            class="rounded-lg bg-brand-500 px-6 py-2 text-sm font-medium text-white hover:bg-opacity-90"
          >
            Sign In
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggler from '../common/ThemeToggler.vue'

const router = useRouter()
const userInfo = ref<any>(null)

onMounted(() => {
  const storedUser = localStorage.getItem('userInfo')
  if (storedUser) {
    userInfo.value = JSON.parse(storedUser)
  }
})

const handleLogout = () => {
  localStorage.removeItem('userInfo')
  userInfo.value = null
  router.push('/signin')
}
</script>
