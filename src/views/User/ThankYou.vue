<script setup lang="ts">
import { ref, onMounted } from 'vue'
import VisitorLayout from '@/components/layout/VisitorLayout.vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

const verifying = ref(true)
const booking = ref<any>(null)
const verifyError = ref('')

const getAuthHeaders = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  return userInfo.token ? { Authorization: `Bearer ${userInfo.token}` } : {}
}

onMounted(async () => {
  // Midtrans passes order_id as a query param on redirect
  const order_id = route.query.order_id as string

  if (!order_id) {
    verifying.value = false
    return
  }

  try {
    const { data } = await axios.get(`/api/bookings/verify/${order_id}`, {
      headers: getAuthHeaders()
    })
    booking.value = data
  } catch (err: any) {
    verifyError.value = err.response?.data?.message || 'Gagal memverifikasi pembayaran'
  } finally {
    verifying.value = false
  }
})
</script>

<template>
  <VisitorLayout>
    <div class="mx-auto max-w-3xl py-20 px-4 sm:px-6 lg:px-8 text-center">
      <!-- verifying state -->
      <div v-if="verifying" class="bg-white dark:bg-boxdark rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-10">
        <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20 mb-6">
          <svg class="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Memverifikasi Pembayaran...</h1>
        <p class="text-gray-500 dark:text-gray-400">Mohon tunggu sebentar, kami sedang mengkonfirmasi pembayaran Anda.</p>
      </div>

      <!-- success state -->
      <div v-else-if="booking && booking.payment_status === 'paid'"
        class="bg-white dark:bg-boxdark rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-10">
        <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20 mb-6">
          <svg class="h-12 w-12 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">Pembayaran Berhasil!</h1>
        <p class="text-base text-gray-500 dark:text-gray-400 mb-1">Order ID: <span class="font-semibold text-black dark:text-white">{{ booking.order_id }}</span></p>
        <p class="text-base text-gray-500 dark:text-gray-400 mb-8">
          Tanggal Kunjungan: <span class="font-semibold text-black dark:text-white">{{ new Date(booking.visit_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            @click="router.push('/user/orders')"
            class="w-full sm:w-auto rounded-lg bg-brand-500 px-8 py-3 text-base font-medium text-white hover:bg-opacity-90 transition-colors shadow-1"
          >
            Lihat E-Ticket Saya
          </button>
          <button
            @click="router.push('/zoo/booking')"
            class="w-full sm:w-auto rounded-lg border border-stroke dark:border-strokedark bg-transparent px-8 py-3 text-base font-medium text-black dark:text-white hover:bg-opacity-5 transition-colors"
          >
            Pesan Lagi
          </button>
        </div>
      </div>

      <!-- pending/unverified state -->
      <div v-else
        class="bg-white dark:bg-boxdark rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-10">
        <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-500/20 mb-6">
          <svg class="h-12 w-12 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">Pembayaran Belum Terkonfirmasi</h1>
        <p class="text-lg text-gray-500 dark:text-gray-400 mb-2">{{ verifyError || 'Status pembayaran Anda masih diproses.' }}</p>
        <p class="text-sm text-gray-400 dark:text-gray-500 mb-8">Jika Anda sudah membayar, cek riwayat pesanan Anda dalam beberapa menit.</p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            @click="router.push('/user/orders')"
            class="w-full sm:w-auto rounded-lg bg-brand-500 px-8 py-3 text-base font-medium text-white hover:bg-opacity-90 transition-colors"
          >
            Cek Riwayat Pesanan
          </button>
          <button
            @click="router.push('/zoo/booking')"
            class="w-full sm:w-auto rounded-lg border border-stroke dark:border-strokedark bg-transparent px-8 py-3 text-base font-medium text-black dark:text-white transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  </VisitorLayout>
</template>
