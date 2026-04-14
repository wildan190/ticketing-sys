<script setup lang="ts">
import VisitorLayout from '@/components/layout/VisitorLayout.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <VisitorLayout>
    <div class="mx-auto max-w-3xl py-20 px-4 sm:px-6 lg:px-8 text-center">
      <div class="bg-white dark:bg-boxdark rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-10">
        <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20 mb-6">
          <svg class="h-12 w-12 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">Pembayaran Gagal</h1>
        <p class="text-lg text-gray-500 dark:text-gray-400 mb-8">
          Mohon maaf, transaksi Anda tidak dapat diproses saat ini atau dibatalkan. Silakan coba melakukan pemesanan ulang.
        </p>
        
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            @click="router.push('/zoo/booking')"
            class="w-full sm:w-auto rounded-lg bg-brand-500 px-8 py-3 text-base font-medium text-white hover:bg-opacity-90 transition-colors shadow-1"
          >
            Pesan Ulang Tiket
          </button>
          <button 
            @click="router.push('/user/orders')"
            class="w-full sm:w-auto rounded-lg border border-stroke dark:border-strokedark bg-transparent px-8 py-3 text-base font-medium text-black dark:text-white hover:bg-opacity-5 transition-colors"
          >
            Cek Status Order
          </button>
        </div>
      </div>
    </div>
  </VisitorLayout>
</template>
