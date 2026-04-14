<template>
  <VisitorLayout>
    <div class="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
      <!-- Profile Header Card -->
      <div class="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-gray-800 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 p-8 md:p-12 mb-8">
        <!-- Abstract Background Shapes -->
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl"></div>

        <div class="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <!-- Avatar Section -->
          <div class="relative group">
            <div class="h-32 w-32 md:h-40 md:w-40 rounded-full bg-gradient-to-br from-brand-500 to-blue-600 p-1 shadow-xl">
              <div class="h-full w-full rounded-full bg-white dark:bg-gray-800 p-1.5 overflow-hidden">
                <img 
                  v-if="userInfo.avatar" 
                  :src="userInfo.avatar" 
                  class="h-full w-full rounded-full object-cover"
                />
                <div v-else class="h-full w-full rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-brand-500">
                  <UserIcon :size="48" stroke-width="1.5" />
                </div>
              </div>
            </div>
            <button class="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-white dark:bg-gray-700 shadow-lg border border-gray-100 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:text-brand-500 transition-colors">
              <Camera :size="18" />
            </button>
          </div>

          <!-- User Basic Info -->
          <div class="flex-1 text-center md:text-left">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xs font-bold uppercase tracking-widest mb-4">
              <span class="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              {{ userInfo.role === 'admin' ? 'Administrator' : 'Pengguna Terverifikasi' }}
            </div>
            <h1 class="text-4xl font-black text-gray-900 dark:text-white mb-2 leading-none uppercase">
              {{ userInfo.name || 'User Name' }}
            </h1>
            <p class="text-lg text-gray-500 dark:text-gray-400 font-medium">
              {{ userInfo.email || 'user@example.com' }}
            </p>
            
            <div class="mt-8 flex flex-wrap justify-center md:justify-start gap-4">
               <router-link 
                 to="/user/orders"
                 class="flex items-center gap-3 px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-gray-200"
               >
                 <History :size="18" />
                 Lihat Tiket Saya
               </router-link>
               <button 
                 @click="handleLogout"
                 class="flex items-center gap-3 px-6 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 transition-all"
               >
                 <LogOut :size="18" />
                 Log Out
               </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Details Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Profile info -->
        <div class="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
           <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
             <Settings :size="20" class="text-brand-500" />
             Informasi Profil
           </h3>
           <div class="space-y-6">
              <div>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nama Lengkap</p>
                <p class="font-bold text-gray-800 dark:text-gray-200">{{ userInfo.name }}</p>
              </div>
              <div>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Alamat Email</p>
                <p class="font-bold text-gray-800 dark:text-gray-200">{{ userInfo.email }}</p>
              </div>
              <div>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Member Sejak</p>
                <p class="font-bold text-gray-800 dark:text-gray-200">14 April 2026</p>
              </div>
           </div>
        </div>

        <!-- Security / Stats -->
        <div class="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
           <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
             <Shield :size="20" class="text-brand-500" />
             Keamanan & Akun
           </h3>
           <div class="space-y-4">
              <button class="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 transition-all group">
                <span class="font-bold text-sm text-gray-700 dark:text-gray-300">Ubah Password</span>
                <ChevronRight :size="18" class="text-gray-400 group-hover:text-brand-500 transition-colors" />
              </button>
              <button class="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 transition-all group">
                <span class="font-bold text-sm text-gray-700 dark:text-gray-300">Pengaturan Notifikasi</span>
                <ChevronRight :size="18" class="text-gray-400 group-hover:text-brand-500 transition-colors" />
              </button>
              <button class="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 transition-all group">
                <span class="font-bold text-sm text-red-600">Hapus Akun</span>
                <ChevronRight :size="18" class="text-red-300" />
              </button>
           </div>
        </div>
      </div>
    </div>
  </VisitorLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import VisitorLayout from '@/components/layout/VisitorLayout.vue'
import { 
  User as UserIcon, 
  Camera, 
  LogOut, 
  History, 
  Settings, 
  Shield, 
  ChevronRight 
} from 'lucide-vue-next'

const router = useRouter()
const userInfo = ref<any>({})

onMounted(() => {
  const storedUser = localStorage.getItem('userInfo')
  if (storedUser) {
    userInfo.value = JSON.parse(storedUser)
  }
})

const handleLogout = () => {
  localStorage.removeItem('userInfo')
  router.push('/signin')
}
</script>
