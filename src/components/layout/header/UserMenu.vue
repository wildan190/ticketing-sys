<template>
  <div class="relative" ref="dropdownRef">
    <button
      class="flex items-center text-gray-700 dark:text-gray-400 focus:outline-none bg-gray-50 dark:bg-white/[0.03] px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
      @click.prevent="toggleDropdown"
    >
      <span class="block mr-1 font-bold text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">{{ userDisplayName }}</span>

      <ChevronDownIcon :class="{ 'rotate-180': dropdownOpen }" class="transition-transform duration-200" />
    </button>

    <!-- Dropdown Start -->
    <div
      v-if="dropdownOpen"
      class="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
    >
      <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-800 pb-3">
        <span class="block font-semibold text-gray-900 text-theme-sm dark:text-white">
          {{ userDisplayName }}
        </span>
        <span class="mt-0.5 block text-xs text-gray-400 dark:text-gray-500 truncate">
          {{ userEmail }}
        </span>
      </div>

      <ul class="flex flex-col gap-1 pt-3 pb-3 border-b border-gray-200 dark:border-gray-800">
        <li>
          <router-link
            to="/user/orders"
            class="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            @click="closeDropdown"
          >
            <ListIcon class="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
            Riwayat Pembelian
          </router-link>
        </li>
        <li>
          <router-link
            to="/zoo/settings"
            class="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            @click="closeDropdown"
          >
            <SettingsIcon class="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
            Pengaturan
          </router-link>
        </li>
      </ul>

      <button
        @click="signOut"
        class="flex w-full items-center gap-3 px-3 py-2 mt-2 font-medium text-red-600 rounded-lg group text-theme-sm hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
      >
        <LogoutIcon class="text-red-500 group-hover:text-red-600 dark:group-hover:text-red-400" />
        Log out
      </button>
    </div>
    <!-- Dropdown End -->
  </div>
</template>

<script setup>
import { ChevronDownIcon, LogoutIcon, SettingsIcon, ListIcon } from '@/icons'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const dropdownOpen = ref(false)
const dropdownRef = ref(null)
const userInfo = ref(null)

const userDisplayName = computed(() => userInfo.value?.name || 'User')
const userEmail = computed(() => userInfo.value?.email || 'user@example.com')

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const signOut = () => {
  localStorage.removeItem('userInfo')
  router.push('/signin')
  closeDropdown()
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  const storedUser = localStorage.getItem('userInfo')
  if (storedUser) {
    userInfo.value = JSON.parse(storedUser)
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

