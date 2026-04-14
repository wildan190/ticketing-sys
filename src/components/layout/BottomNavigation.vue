<template>
  <nav class="fixed bottom-0 left-0 z-50 w-full bg-white/80 border-t border-gray-200 backdrop-blur-lg dark:bg-gray-900/80 dark:border-gray-800 pb-safe">
    <div class="mx-auto max-w-lg px-6 flex h-16 items-center justify-between">
      <router-link 
        v-for="item in navItems" 
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center justify-center gap-1 transition-all duration-200 relative group"
        :class="isActive(item.path) ? 'text-brand-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'"
      >
        <!-- Active Indicator Dot -->
        <span 
          v-if="isActive(item.path)"
          class="absolute -top-1 w-1 h-1 rounded-full bg-brand-500"
        ></span>

        <component :is="item.icon" :size="20" :stroke-width="isActive(item.path) ? 2.5 : 2" />
        <span class="text-[10px] font-bold uppercase tracking-wider">{{ item.name }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  Ticket, 
  History, 
  Map, 
  User as UserIcon 
} from 'lucide-vue-next'

const route = useRoute()

const navItems = computed(() => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null')
  return [
    { name: 'Pesan', path: '/zoo/booking', icon: Ticket },
    { name: 'Satwa', path: '/zoo/animals', icon: Map },
    { name: 'Tiket', path: '/user/orders', icon: History },
    { name: 'Akun', path: userInfo ? '/user/account' : '/signin', icon: UserIcon },
  ]
})

const isActive = (path: string) => {
  if (path === '/zoo/booking') {
    return route.path === '/zoo/booking' || route.path === '/'
  }
  return route.path === path
}
</script>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
